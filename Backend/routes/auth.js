const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { generateUserToken, generateAdminToken } = require('../utils/jwt');
const { authenticateUser, authenticateAdmin } = require('../middleware/auth');
const { generateOTP, sendOTPEmail, sendWelcomeEmail, sendAdminOTPEmail, sendAdminWelcomeEmail } = require('../utils/emailService');

const router = express.Router();

// Validation middleware
const validateRegistration = [
    body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
    body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
    body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const validateAdminRegistration = [
    ...validateRegistration,
    body('password')
    .isLength({ min: 8 })
    .withMessage('Admin password must be at least 8 characters long'),
    body('role')
    .isIn(['admin', 'hr', 'faculty'])
    .withMessage('Role must be one of: admin, hr, faculty'),
    body('department')
    .if(body('role').equals('faculty'))
    .notEmpty()
    .withMessage('Department is required for faculty role')
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department cannot exceed 100 characters'),
    body('department')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Department cannot exceed 100 characters')
];

const validateLogin = [
    body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
    body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// User Registration - Send OTP
router.post('/user/register', validateRegistration, async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { firstName, lastName, email, password } = req.body;

        // Check if user already exists and is verified
        const existingUser = await User.findOne({ email });
        if (existingUser && existingUser.isEmailVerified) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists and is verified'
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        if (existingUser) {
            // Update existing unverified user
            existingUser.firstName = firstName;
            existingUser.lastName = lastName;
            existingUser.password = password;
            existingUser.emailOTP = otp;
            existingUser.otpExpires = otpExpires;
            await existingUser.save();
        } else {
            // Create new user
            const user = new User({
                firstName,
                lastName,
                email,
                password,
                emailOTP: otp,
                otpExpires: otpExpires
            });
            await user.save();
        }

        // Send OTP email
        try {
            await sendOTPEmail(email, otp, firstName);
            res.status(200).json({
                success: true,
                message: 'OTP sent to your email address. Please verify to complete registration.',
                data: {
                    email: email,
                    otpSent: true
                }
            });
        } catch (emailError) {
            console.error('Error sending OTP email:', emailError);
            res.status(500).json({
                success: false,
                message: 'Failed to send verification email. Please try again.'
            });
        }
    } catch (error) {
        console.error('User registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
});

// Verify OTP and Complete Registration
router.post('/user/verify-otp', [
    body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
    body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number')
], async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, otp } = req.body;

        // Find user with email and OTP
        const user = await User.findOne({
            email: email,
            emailOTP: otp,
            otpExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP. Please request a new one.'
            });
        }

        // Verify user and clear OTP
        user.isEmailVerified = true;
        user.emailOTP = null;
        user.otpExpires = null;
        await user.save();

        // Send welcome email
        try {
            await sendWelcomeEmail(email, user.firstName);
        } catch (emailError) {
            console.log('Welcome email failed, but registration completed:', emailError.message);
        }

        // Generate token
        const token = generateUserToken(user);

        res.status(201).json({
            success: true,
            message: 'Email verified successfully! Registration completed.',
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    fullName: user.fullName,
                    isEmailVerified: user.isEmailVerified
                },
                token
            }
        });
    } catch (error) {
        console.error('OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during verification'
        });
    }
});

// Resend OTP
router.post('/user/resend-otp', [
    body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email')
], async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email } = req.body;

        // Find unverified user
        const user = await User.findOne({
            email: email,
            isEmailVerified: false
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'No pending registration found for this email.'
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        user.emailOTP = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // Send OTP email
        try {
            await sendOTPEmail(email, otp, user.firstName);
            res.status(200).json({
                success: true,
                message: 'New OTP sent to your email address.',
                data: {
                    email: email,
                    otpSent: true
                }
            });
        } catch (emailError) {
            console.error('Error sending OTP email:', emailError);
            res.status(500).json({
                success: false,
                message: 'Failed to send verification email. Please try again.'
            });
        }
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while resending OTP'
        });
    }
});

// User Login
router.post('/user/login', validateLogin, async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find user and include password for comparison
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email address to login. Check your inbox for the verification code.',
                requiresVerification: true,
                email: user.email
            });
        }

        // Update login info
        user.lastLogin = new Date();
        user.loginCount += 1;
        await user.save();

        // Generate token
        const token = generateUserToken(user);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    fullName: user.fullName,
                    lastLogin: user.lastLogin,
                    loginCount: user.loginCount
                },
                token
            }
        });
    } catch (error) {
        console.error('User login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
});

// Admin Registration - Send OTP
router.post('/admin/register', validateAdminRegistration, async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { firstName, lastName, email, password, role, department, permissions } = req.body;

        // Check if admin already exists and is verified
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin && existingAdmin.isEmailVerified) {
            return res.status(409).json({
                success: false,
                message: 'Admin with this email already exists and is verified'
            });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        if (existingAdmin) {
            // Update existing unverified admin
            existingAdmin.firstName = firstName;
            existingAdmin.lastName = lastName;
            existingAdmin.password = password;
            existingAdmin.role = role;
            existingAdmin.department = role === 'faculty' ? department : null;
            existingAdmin.permissions = permissions || ['content_management'];
            existingAdmin.emailOTP = otp;
            existingAdmin.otpExpires = otpExpires;
            await existingAdmin.save();
        } else {
            // Create new admin
            const admin = new Admin({
                firstName,
                lastName,
                email,
                password,
                role,
                department: role === 'faculty' ? department : null,
                permissions: permissions || ['content_management'],
                emailOTP: otp,
                otpExpires: otpExpires
            });
            await admin.save();
        }

        // Send OTP email
        try {
            await sendAdminOTPEmail(email, otp, firstName, role);
            res.status(200).json({
                success: true,
                message: 'Admin registration initiated. OTP sent to your email address. Please verify to complete registration.',
                data: {
                    email: email,
                    role: role,
                    otpSent: true
                }
            });
        } catch (emailError) {
            console.error('Error sending admin OTP email:', emailError);
            res.status(500).json({
                success: false,
                message: 'Failed to send verification email. Please try again.'
            });
        }
    } catch (error) {
        console.error('Admin registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
});

// Verify Admin OTP and Complete Registration
router.post('/admin/verify-otp', [
    body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
    body('otp')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number')
], async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, otp } = req.body;

        // Find admin with email and OTP
        const admin = await Admin.findOne({
            email: email,
            emailOTP: otp,
            otpExpires: { $gt: Date.now() }
        });

        if (!admin) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP. Please request a new one.'
            });
        }

        // Verify admin and clear OTP
        admin.isEmailVerified = true;
        admin.emailOTP = null;
        admin.otpExpires = null;
        await admin.save();

        // Send welcome email
        try {
            await sendAdminWelcomeEmail(email, admin.firstName, admin.role, admin.department);
        } catch (emailError) {
            console.log('Admin welcome email failed, but registration completed:', emailError.message);
        }

        // Generate token
        const token = generateAdminToken(admin);

        res.status(201).json({
            success: true,
            message: 'Email verified successfully! Admin registration completed.',
            data: {
                admin: {
                    id: admin._id,
                    firstName: admin.firstName,
                    lastName: admin.lastName,
                    email: admin.email,
                    fullName: admin.fullName,
                    role: admin.role,
                    department: admin.department,
                    permissions: admin.permissions,
                    isEmailVerified: admin.isEmailVerified
                },
                token
            }
        });
    } catch (error) {
        console.error('Admin OTP verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during verification'
        });
    }
});

// Resend Admin OTP
router.post('/admin/resend-otp', [
    body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email')
], async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email } = req.body;

        // Find unverified admin
        const admin = await Admin.findOne({
            email: email,
            isEmailVerified: false
        });

        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'No pending admin registration found for this email.'
            });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        admin.emailOTP = otp;
        admin.otpExpires = otpExpires;
        await admin.save();

        // Send OTP email
        try {
            await sendAdminOTPEmail(email, otp, admin.firstName, admin.role);
            res.status(200).json({
                success: true,
                message: 'New admin OTP sent to your email address.',
                data: {
                    email: email,
                    role: admin.role,
                    otpSent: true
                }
            });
        } catch (emailError) {
            console.error('Error sending admin OTP email:', emailError);
            res.status(500).json({
                success: false,
                message: 'Failed to send verification email. Please try again.'
            });
        }
    } catch (error) {
        console.error('Resend admin OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while resending OTP'
        });
    }
});

// Admin Login
router.post('/admin/login', validateLogin, async(req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { email, password } = req.body;

        // Find admin and include password for comparison
        const admin = await Admin.findOne({ email, isActive: true }).select('+password');
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check password
        const isPasswordValid = await admin.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if email is verified
        if (!admin.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email address to login. Check your inbox for the verification code.',
                requiresVerification: true,
                email: admin.email,
                isAdmin: true,
                role: admin.role
            });
        }

        // Update login info
        admin.lastLogin = new Date();
        admin.loginCount += 1;
        await admin.save();

        // Generate token
        const token = generateAdminToken(admin);

        res.json({
            success: true,
            message: 'Admin login successful',
            data: {
                admin: {
                    id: admin._id,
                    firstName: admin.firstName,
                    lastName: admin.lastName,
                    email: admin.email,
                    fullName: admin.fullName,
                    role: admin.role,
                    department: admin.department,
                    permissions: admin.permissions,
                    lastLogin: admin.lastLogin,
                    loginCount: admin.loginCount
                },
                token
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
});

// Get current user profile
router.get('/user/me', authenticateUser, async(req, res) => {
    try {
        res.json({
            success: true,
            data: {
                user: req.user
            }
        });
    } catch (error) {
        console.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Get current admin profile
router.get('/admin/me', authenticateAdmin, async(req, res) => {
    try {
        res.json({
            success: true,
            data: {
                admin: req.admin
            }
        });
    } catch (error) {
        console.error('Get admin profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

module.exports = router;