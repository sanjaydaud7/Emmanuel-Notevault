const jwt = require('jsonwebtoken');

const generateUserToken = (user) => {
    return jwt.sign({
            id: user._id,
            email: user.email,
            userType: 'user'
        },
        process.env.JWT_SECRET || 'your-jwt-secret', { expiresIn: '7d' }
    );
};

const generateAdminToken = (admin) => {
    return jwt.sign({
            id: admin._id,
            email: admin.email,
            userType: 'admin',
            permissions: admin.permissions
        },
        process.env.JWT_SECRET || 'your-jwt-secret', { expiresIn: '7d' }
    );
};

module.exports = {
    generateUserToken,
    generateAdminToken
};