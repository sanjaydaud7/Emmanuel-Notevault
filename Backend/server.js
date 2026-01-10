const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');

const { authenticateAdmin } = require('./middleware/auth');

// Add required libs for notes upload
const mongoose = require('mongoose');
let cloudinary;
try {
    cloudinary = require('cloudinary').v2;
} catch (e) {
    console.error('Cloudinary module not found. Install it with: npm i cloudinary');
}
const multer = require('multer');

const app = express();

// Connect to MongoDB
connectDB();

// Trust proxy for development (fixes rate limiting issues)
app.set('trust proxy', 1);

// Configure Cloudinary (reads CLOUDINARY_URL from env)
if (cloudinary) {
    cloudinary.config({ secure: true });
}

// Multer (memory storage) for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024, files: 10 } // 10MB per file, max 10 files
});

// Note schema inline
const NoteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    subject: { type: String, required: true },
    tags: [{ type: String }],
    content: { type: String, required: true },
    attachments: [{
        url: String,
        public_id: String,
        bytes: Number,
        format: String,
        original_filename: String
    }],
    visibility: { type: String, enum: ['public', 'private', 'restricted'], default: 'public' },
    category: { type: String, default: 'general' },
    uploader: { type: String, default: 'Admin' },
    uploadDate: { type: Date, default: Date.now },
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    rating: { type: Number, default: 0 }
}, { timestamps: true });
const Note = mongoose.models.Note || mongoose.model('Note', NoteSchema);

// Security middleware
app.use(helmet());

// Rate limiting - more lenient for development
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Higher limit for development
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for localhost in development
        if (process.env.NODE_ENV !== 'production' &&
            (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip.includes('localhost'))) {
            return true;
        }
        return false;
    }
});
app.use(limiter);

// Add a tighter rate limit for AI generation
const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10 // limit each IP to 10 requests per windowMs
});

// CORS configuration
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? ['https://your-frontend-domain.com'] : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', authRoutes);


// Development-only fallback API key (remove in production)
const DEFAULT_OPENROUTER_API_KEY = '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';

// Strip DeepSeek R1 reasoning (<think>...</think>) from content
const stripThink = (text = '') => text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

// Polyfill fetch for Node < 18 and ensure body is JSON string when using native fetch
const https = require('https');
// Add: http for non-https URLs and a small streaming helper
const http = require('http');
const streamRemoteToResponse = (url, res, filename) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, (fileRes) => {
        const contentType = fileRes.headers['content-type'] || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        if (filename) res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        fileRes.pipe(res);
        fileRes.on('end', () => res.end());
    }).on('error', (err) => {
        console.error('Download proxy error:', err);
        res.status(500).end('Failed to download');
    });
};
// Add: safeFetch (use native fetch if available; stringify JSON bodies)
const safeFetch = typeof fetch === 'function' ?
    (url, opts = {}) => {
        if (opts.body && typeof opts.body !== 'string') {
            opts.body = JSON.stringify(opts.body);
        }
        return fetch(url, opts);
    } :
    (url, { method = 'GET', headers = {}, body } = {}) => {
        return new Promise((resolve, reject) => {
            const { hostname, pathname, search } = new URL(url);
            const data = typeof body === 'string' ? body : body ? JSON.stringify(body) : undefined;
            const req = https.request({
                hostname,
                path: `${pathname}${search || ''}`,
                method,
                headers: {
                    ...headers,
                    ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {})
                }
            }, (res) => {
                let chunks = '';
                res.on('data', (c) => (chunks += c));
                res.on('end', () => {
                    resolve({
                        ok: res.statusCode >= 200 && res.statusCode < 300,
                        status: res.statusCode,
                        text: () => Promise.resolve(chunks),
                        json: () => Promise.resolve(chunks ? JSON.parse(chunks) : {})
                    });
                });
            });
            req.on('error', reject);
            if (data) req.write(data);
            req.end();
        });
    };

// AI notes generation endpoint
app.post('/api/ai/notes', aiLimiter, async(req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
            return res.status(400).json({ success: false, message: 'Prompt is required' });
        }

        const apiKey = process.env.OPENROUTER_API_KEY || DEFAULT_OPENROUTER_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ success: false, message: 'Missing OpenRouter API key. Set OPENROUTER_API_KEY in environment.' });
        }

        const headers = {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        };
        if (process.env.SITE_URL) headers['HTTP-Referer'] = process.env.SITE_URL;
        if (process.env.SITE_TITLE) headers['X-Title'] = process.env.SITE_TITLE;

        const response = await safeFetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers,
            body: {
                model: 'deepseek/deepseek-r1-0528:free',
                messages: [{
                        role: 'system',
                        content: 'You are an AI Notes Assistant. Produce clean, structured, concise notes in markdown with headings, bullets, and key takeaways.'
                    },
                    { role: 'user', content: prompt }
                ]
            }
        });

        const raw = await response.text();
        if (!response.ok) {
            console.error('OpenRouter error:', raw);
            return res.status(response.status).json({ success: false, message: 'OpenRouter error', detail: raw });
        }

        let data;
        try {
            data = JSON.parse(raw);
        } catch (e) {
            console.error('Parse error:', e, raw);
            return res.status(500).json({ success: false, message: 'Failed to parse OpenRouter response' });
        }

        // Extract content safely without optional chaining
        const content = (data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
        if (!content) {
            return res.status(502).json({ success: false, message: 'Empty response from model' });
        }
        return res.json({ success: true, content: stripThink(content) });
    } catch (error) {
        console.error('AI notes error:', error);
        return res.status(500).json({ success: false, message: 'Failed to generate notes', detail: error && error.message });
    }
});

// Notes upload endpoint: saves note to MongoDB and uploads files to Cloudinary
app.post('/api/notes', upload.array('attachments', 10), async(req, res) => {
    try {
        const { title, description, subject, tags, content, visibility, category } = req.body;

        // Validation
        if (!title || !title.trim()) return res.status(400).json({ success: false, message: 'Title is required' });
        if (!description || !description.trim()) return res.status(400).json({ success: false, message: 'Description is required' });
        if (!subject || !subject.trim()) return res.status(400).json({ success: false, message: 'Subject is required' });
        if (!content || !content.trim()) return res.status(400).json({ success: false, message: 'Content is required' });

        const processedTags = (tags || '')
            .split(',')
            .map(t => t.trim())
            .filter(Boolean);
        if (processedTags.length > 10) {
            return res.status(400).json({ success: false, message: 'Maximum 10 tags allowed' });
        }

        // Upload attachments to Cloudinary
        const files = req.files || [];
        let attachments = [];
        if (files.length) {
            if (!cloudinary) {
                return res.status(500).json({
                    success: false,
                    message: 'File upload requires Cloudinary. Install dependency: npm i cloudinary'
                });
            }
            attachments = await Promise.all(
                files.map(
                    file =>
                    new Promise((resolve, reject) => {
                        const stream = cloudinary.uploader.upload_stream({
                                folder: 'notevault/attachments',
                                resource_type: 'auto'
                            },
                            (error, result) => {
                                if (error) return reject(error);
                                resolve({
                                    url: result.secure_url,
                                    public_id: result.public_id,
                                    bytes: result.bytes,
                                    format: result.format,
                                    original_filename: result.original_filename
                                });
                            }
                        );
                        stream.end(file.buffer);
                    })
                )
            );
        }

        // Save note in MongoDB
        const note = await Note.create({
            title: title.trim(),
            description: description.trim(),
            subject: subject.trim(),
            tags: processedTags,
            content: content.trim(),
            attachments,
            visibility: visibility || 'public',
            category: category || 'general',
            uploader: 'Admin',
            uploadDate: new Date()
        });

        return res.status(201).json({ success: true, note });
    } catch (error) {
        console.error('Create note error:', error);
        return res.status(500).json({ success: false, message: 'Failed to create note' });
    }
});

// Add: fetch notes from MongoDB
app.get('/api/notes', async(req, res) => {
    try {
        const { q, subject } = req.query;
        const filter = {};
        if (subject && subject !== 'All') filter.subject = subject;
        if (q && q.trim()) {
            const regex = new RegExp(q.trim(), 'i');
            filter.$or = [
                { title: regex },
                { description: regex },
                { tags: regex }
            ];
        }

        const notes = await Note.find(filter).sort({ createdAt: -1 }).limit(200).lean();
        const result = notes.map(n => ({
            id: String(n._id),
            title: n.title,
            description: n.description,
            subject: n.subject,
            tags: Array.isArray(n.tags) ? n.tags : [],
            uploadDate: n.uploadDate ? new Date(n.uploadDate).toISOString().slice(0, 10) : '',
            uploader: n.uploader || 'Admin',
            views: n.views || 0,
            downloads: n.downloads || 0,
            rating: n.rating || 0,
            // Add: attachments with minimal fields for client logic
            attachments: Array.isArray(n.attachments) ? n.attachments.map(a => ({
                url: a.url,
                public_id: a.public_id,
                bytes: a.bytes,
                format: a.format,
                original_filename: a.original_filename
            })) : []
        }));

        return res.json({ success: true, notes: result });
    } catch (error) {
        console.error('Fetch notes error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch notes' });
    }
});

// Get single note by ID with complete details
app.get('/api/notes/:id', async(req, res) => {
    try {
        const note = await Note.findById(req.params.id).lean();
        if (!note) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }

        const result = {
            id: String(note._id),
            title: note.title,
            description: note.description,
            subject: note.subject,
            tags: Array.isArray(note.tags) ? note.tags : [],
            content: note.content,
            category: note.category || 'general',
            visibility: note.visibility || 'public',
            uploader: note.uploader || 'Admin',
            uploadDate: note.uploadDate ? new Date(note.uploadDate).toISOString().slice(0, 10) : '',
            views: note.views || 0,
            downloads: note.downloads || 0,
            rating: note.rating || 0,
            attachments: Array.isArray(note.attachments) ? note.attachments.map(a => ({
                url: a.url,
                public_id: a.public_id,
                bytes: a.bytes,
                format: a.format,
                original_filename: a.original_filename
            })) : []
        };

        return res.json({ success: true, note: result });
    } catch (error) {
        console.error('Get note error:', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch note' });
    }
});

// Add: view first attachment (opens inline)
app.get('/api/notes/:id/view', async(req, res) => {
    try {
        const note = await Note.findById(req.params.id).lean();
        const a = note && note.attachments && note.attachments[0];
        if (!a || !a.url) return res.status(404).json({ success: false, message: 'No attachment found' });
        return res.redirect(a.url);
    } catch (error) {
        console.error('View note error:', error);
        return res.status(500).json({ success: false, message: 'Failed to open attachment' });
    }
});

// Add: force download of first attachment (proxy stream with filename)
app.get('/api/notes/:id/download', async(req, res) => {
    try {
        const note = await Note.findById(req.params.id).lean();
        const a = note && note.attachments && note.attachments[0];
        if (!a || !a.url) return res.status(404).json({ success: false, message: 'No attachment found' });
        const filename = a.original_filename ? `${a.original_filename}${a.format ? '.' + a.format : ''}` : 'attachment';
        streamRemoteToResponse(a.url, res, filename);
    } catch (error) {
        console.error('Download note error:', error);
        return res.status(500).json({ success: false, message: 'Failed to download attachment' });
    }
});

// Update note by ID
app.put('/api/notes/:id', upload.array('attachments', 10), async(req, res) => {
    try {
        const noteId = req.params.id;
        const {
            title,
            description,
            subject,
            tags,
            content,
            visibility,
            category,
            existingAttachments
        } = req.body;

        // Find the existing note
        const existingNote = await Note.findById(noteId);
        if (!existingNote) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }

        // Prepare update data
        const updateData = {
            title,
            description,
            subject,
            content,
            visibility,
            category
        };

        // Handle tags (convert comma-separated string to array)
        if (tags) {
            updateData.tags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
        }

        // Handle attachments
        let finalAttachments = [];

        // Add existing attachments that weren't removed
        if (existingAttachments) {
            try {
                const parsedExisting = JSON.parse(existingAttachments);
                if (Array.isArray(parsedExisting)) {
                    finalAttachments = parsedExisting;
                }
            } catch (e) {
                console.warn('Error parsing existing attachments:', e);
            }
        }

        // Handle new attachments if provided
        if (req.files && req.files.length > 0) {
            const attachmentPromises = req.files.map(file => {
                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream({
                            resource_type: 'auto',
                            folder: 'note-attachments',
                            public_id: `${Date.now()}_${file.originalname}`
                        },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve({
                                url: result.secure_url,
                                public_id: result.public_id,
                                bytes: result.bytes,
                                format: result.format,
                                original_filename: file.originalname
                            });
                        }
                    );
                    uploadStream.end(file.buffer);
                });
            });

            try {
                const newAttachments = await Promise.all(attachmentPromises);
                // Add new attachments to existing ones
                finalAttachments = [...finalAttachments, ...newAttachments];
            } catch (uploadError) {
                console.error('File upload error:', uploadError);
                return res.status(500).json({ success: false, message: 'File upload failed' });
            }
        }

        // Set final attachments
        updateData.attachments = finalAttachments;

        // Update the note
        const updatedNote = await Note.findByIdAndUpdate(noteId, updateData, { new: true });

        return res.json({
            success: true,
            message: 'Note updated successfully',
            note: updatedNote
        });
    } catch (error) {
        console.error('Update note error:', error);
        return res.status(500).json({ success: false, message: 'Failed to update note' });
    }
});

// Delete note by ID
app.delete('/api/notes/:id', async(req, res) => {
    try {
        const noteId = req.params.id;

        // Find the note to get attachment public_ids for cleanup
        const note = await Note.findById(noteId);
        if (!note) {
            return res.status(404).json({ success: false, message: 'Note not found' });
        }

        // Delete attachments from Cloudinary
        if (note.attachments && note.attachments.length > 0) {
            const deletePromises = note.attachments.map(attachment => {
                if (attachment.public_id) {
                    return cloudinary.uploader.destroy(attachment.public_id);
                }
                return Promise.resolve();
            });

            try {
                await Promise.all(deletePromises);
            } catch (cloudinaryError) {
                console.error('Error deleting attachments from Cloudinary:', cloudinaryError);
                // Continue with note deletion even if attachment deletion fails
            }
        }

        // Delete the note from database
        await Note.findByIdAndDelete(noteId);

        return res.json({
            success: true,
            message: 'Note deleted successfully'
        });
    } catch (error) {
        console.error('Delete note error:', error);
        return res.status(500).json({ success: false, message: 'Failed to delete note' });
    }
});

// Admin-only: Dashboard data
app.get('/api/admin/dashboard', authenticateAdmin, async(req, res) => {
    try {
        const { timeframe = '7days' } = req.query;

        // Calculate date ranges based on timeframe
        let dateFilter = {};
        const now = new Date();

        switch (timeframe) {
            case '7days':
                dateFilter.createdAt = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
                break;
            case '30days':
                dateFilter.createdAt = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
                break;
            case '90days':
                dateFilter.createdAt = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
                break;
            case '1year':
                dateFilter.createdAt = { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) };
                break;
            default:
                // Default to last 7 days
                dateFilter.createdAt = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        }

        // Get total counts
        const [totalUsers, totalNotes] = await Promise.all([
            mongoose.model('User').countDocuments(),
            Note.countDocuments()
        ]);

        // Get new users this month
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const newUsersThisMonth = await mongoose.model('User').countDocuments({
            createdAt: { $gte: thisMonthStart }
        });

        // Get notes uploaded this week
        const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const notesUploadedThisWeek = await Note.countDocuments({
            createdAt: { $gte: thisWeekStart }
        });

        // Get total downloads (sum of download counts for all notes)
        const notesWithDownloads = await Note.aggregate([
            { $group: { _id: null, totalDownloads: { $sum: '$downloads' } } }
        ]);
        const totalDownloads = notesWithDownloads.length > 0 ? notesWithDownloads[0].totalDownloads : 0;

        // Get popular subjects
        const popularSubjects = await Note.aggregate([
            { $group: { _id: '$subject', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
            { $project: { name: '$_id', count: 1, _id: 0 } }
        ]);

        // Get recent activity (notes uploaded in selected timeframe)
        const recentNotes = await Note.find(dateFilter)
            .sort({ createdAt: -1 })
            .limit(15)
            .select('title uploader createdAt')
            .lean();

        // Get recent users (users registered in selected timeframe)
        const recentUsers = await mongoose.model('User').find(dateFilter)
            .sort({ createdAt: -1 })
            .limit(10)
            .select('email firstName lastName createdAt')
            .lean();

        // Combine and format recent activity
        const recentActivity = [
            ...recentNotes.map(note => ({
                action: 'note_uploaded',
                timestamp: note.createdAt,
                details: {
                    title: note.title,
                    uploader: note.uploader || 'Unknown'
                }
            })),
            ...recentUsers.map(user => ({
                action: 'user_registered',
                timestamp: user.createdAt,
                details: {
                    email: user.email,
                    name: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : user.email
                }
            }))
        ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 15);

        const dashboardData = {
            totalUsers,
            totalNotes,
            totalDownloads,
            newUsersThisMonth,
            notesUploadedThisWeek,
            popularSubjects,
            recentActivity
        };

        return res.json(dashboardData);

    } catch (error) {
        console.error('Dashboard data error:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data'
        });
    }
});

// Admin-only: Get all users
app.get('/api/admin/users', authenticateAdmin, async(req, res) => {
    try {
        const users = await mongoose.model('User').find({}, '-password').sort({ createdAt: -1 }).lean();

        const usersWithStats = users.map(user => ({
            ...user,
            notesCount: 0, // Could be enhanced to count actual user notes
            role: 'user' // Default role for regular users
        }));

        return res.json({
            success: true,
            data: usersWithStats
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch users'
        });
    }
});

// Admin-only: Delete user
app.delete('/api/admin/users/:id', authenticateAdmin, async(req, res) => {
    try {
        const userId = req.params.id;
        const user = await mongoose.model('User').findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete user'
        });
    }
});

// Admin-only: Update user status
app.patch('/api/admin/users/:id/status', authenticateAdmin, async(req, res) => {
    try {
        const userId = req.params.id;
        const { isActive } = req.body;

        const user = await mongoose.model('User').findByIdAndUpdate(
            userId, { isActive }, { new: true, select: '-password' }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error updating user status:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update user status'
        });
    }
});

// Admin-only: Update user role
app.patch('/api/admin/users/:id/role', authenticateAdmin, async(req, res) => {
    try {
        const userId = req.params.id;
        const { role } = req.body;

        // For this simple implementation, we'll add a role field to users
        const user = await mongoose.model('User').findByIdAndUpdate(
            userId, { role }, { new: true, select: '-password' }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error updating user role:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to update user role'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);

    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully');
    process.exit(0);
});