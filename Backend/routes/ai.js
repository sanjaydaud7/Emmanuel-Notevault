const express = require('express');
const rateLimit = require('express-rate-limit');
const { generateNotes } = require('../utils/openrouter');

const router = express.Router();

// Per-route rate limiter for AI requests
const aiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
});

router.post('/notes', aiLimiter, async(req, res, next) => {
    try {
        const { prompt } = req.body || {};

        if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Prompt is required and must be a non-empty string',
            });
        }

        if (prompt.length > 4000) {
            return res.status(413).json({
                success: false,
                message: 'Prompt too long. Please keep under 4000 characters.',
            });
        }

        const content = await generateNotes(prompt.trim());
        return res.json({ success: true, content });
    } catch (err) {
        next(err);
    }
});

module.exports = router;