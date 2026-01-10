const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
        enum: ['admin', 'hr', 'faculty'],
        default: 'admin'
    },
    department: {
        type: String,
        default: null,
        maxlength: [100, 'Department cannot exceed 100 characters']
    },
    permissions: [{
        type: String,
        enum: ['content_management', 'user_management', 'analytics', 'system_admin']
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailOTP: {
        type: String,
        default: null
    },
    otpExpires: {
        type: Date,
        default: null
    },
    lastLogin: {
        type: Date,
        default: null
    },
    loginCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    collection: 'admins'
});

// Index for email for faster queries
adminSchema.index({ email: 1 });

// Hash password before saving
adminSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
adminSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Check permissions method
adminSchema.methods.hasPermission = function(permission) {
    return this.permissions.includes(permission) || this.permissions.includes('system_admin');
};

// Get full name
adminSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Transform output
adminSchema.methods.toJSON = function() {
    const admin = this.toObject();
    delete admin.password;
    delete admin.__v;
    return admin;
};

module.exports = mongoose.model('Admin', adminSchema);