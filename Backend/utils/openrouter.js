const https = require('https');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

function generateNotes(prompt) {
    if (!OPENROUTER_API_KEY) {
        throw new Error('Missing OPENROUTER_API_KEY environment variable');
    }
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
        throw new Error('Prompt must be a non-empty string');
    }

    const payload = {
        model: 'deepseek/deepseek-r1-0528:free',
        messages: [{
                role: 'system',
                content: 'You are an AI Notes Assistant. Generate comprehensive, accurate, and well-structured notes in Markdown. Use clear headings, bullet points, and concise summaries. Avoid hallucinations and state assumptions. If uncertain, say so plainly.',
            },
            { role: 'user', content: prompt.trim() },
        ],
        temperature: 0.3,
    };

    const dataString = JSON.stringify(payload);

    const options = {
        hostname: 'openrouter.ai',
        path: '/api/v1/chat/completions',
        method: 'POST',
        headers: {
            Authorization: `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
            'X-Title': process.env.APP_NAME || 'Emmanuel Notes',
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(dataString),
        },
    };

    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let raw = '';
            res.on('data', (chunk) => (raw += chunk));
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(raw);
                    if (parsed.error) {
                        return reject(
                            new Error(parsed.error.message || 'OpenRouter API error')
                        );
                    }
                    const content = parsed ? .choices ? .[0] ? .message ? .content;
                    if (!content) {
                        return reject(new Error('No content returned from OpenRouter'));
                    }
                    resolve(content);
                } catch (err) {
                    reject(err);
                }
            });
        });

        req.on('error', (err) => reject(err));
        req.write(dataString);
        req.end();
    });
}

module.exports = { generateNotes };