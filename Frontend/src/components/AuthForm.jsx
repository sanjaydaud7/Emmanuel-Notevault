import React, { useState, useEffect } from 'react';
import '../styles/AuthForm.css';

const AuthForm = ({ initialMode = 'login', onClose, onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(initialMode === 'login');
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [showOTPVerification, setShowOTPVerification] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [otpSentEmail, setOtpSentEmail] = useState('');

    useEffect(() => {
        setIsLogin(initialMode === 'login');
    }, [initialMode]);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: '',
        department: '',
        otp: ''
    });
    const [rememberMe, setRememberMe] = useState(false);

    // API base URL - adjust this to match your backend
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setShowOTPVerification(false);
        setOtpSentEmail('');
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: '',
            department: '',
            otp: ''
        });
    };

    const toggleAdminMode = () => {
        setIsAdminMode(!isAdminMode);
        setIsLogin(true); // Default to login when switching to admin mode
        setError('');
        setShowOTPVerification(false);
        setOtpSentEmail('');
        setFormData({
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            role: '',
            department: '',
            otp: ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');
        
        // If showing OTP verification form, handle OTP verification
        if (showOTPVerification) {
            return await handleOTPVerification();
        }
        
        // Client-side validation
        if (!isLogin && formData.password !== formData.confirmPassword) {
            setError("Passwords don't match!");
            setLoading(false);
            return;
        }

        if (!formData.email || !formData.password) {
            setError('Email and password are required');
            setLoading(false);
            return;
        }

        if (!isLogin && (!formData.firstName || !formData.lastName)) {
            setError('First name and last name are required for registration');
            setLoading(false);
            return;
        }

        if (!isLogin && isAdminMode && !formData.role) {
            setError('Role is required for admin registration');
            setLoading(false);
            return;
        }

        if (!isLogin && isAdminMode && formData.role === 'faculty' && !formData.department) {
            setError('Department is required for faculty role');
            setLoading(false);
            return;
        }

        if (formData.password.length < (isAdminMode ? 8 : 6)) {
            setError(`Password must be at least ${isAdminMode ? 8 : 6} characters long`);
            setLoading(false);
            return;
        }

        try {
            // Determine API endpoint
            let endpoint;
            if (isAdminMode) {
                endpoint = isLogin ? `${API_BASE_URL}/auth/admin/login` : `${API_BASE_URL}/auth/admin/register`;
            } else {
                endpoint = isLogin ? `${API_BASE_URL}/auth/user/login` : `${API_BASE_URL}/auth/user/register`;
            }

            // Prepare request body
            const requestBody = {
                email: formData.email,
                password: formData.password
            };

            // Add additional fields for registration
            if (!isLogin) {
                requestBody.firstName = formData.firstName;
                requestBody.lastName = formData.lastName;
                
                if (isAdminMode) {
                    requestBody.role = formData.role;
                    if (formData.role === 'faculty' && formData.department) {
                        requestBody.department = formData.department;
                    }
                }
            }

            // Make API request
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (!response.ok) {
                // Handle special cases
                if (data.requiresVerification) {
                    // User/Admin tried to login but needs email verification
                    setError(data.message);
                    if (data.isAdmin) {
                        // Switch to admin mode if not already
                        setIsAdminMode(true);
                    }
                    return;
                } else if (data.errors && Array.isArray(data.errors)) {
                    // Validation errors
                    setError(data.errors.map(err => err.msg).join(', '));
                } else {
                    setError(data.message || 'An error occurred. Please try again.');
                }
                return;
            }

            // Handle different responses
            if (!isLogin && data.data && data.data.otpSent) {
                // Both user and admin registration with OTP
                setOtpSentEmail(formData.email);
                setShowOTPVerification(true);
                if (isAdminMode) {
                    setSuccessMessage(`Admin OTP sent to your email for ${data.data.role.toUpperCase()} registration. Please verify to complete setup.`);
                } else {
                    setSuccessMessage('Please check your email for the verification code.');
                }
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
            } else {
                // Login success
                await handleAuthSuccess(data);
            }

        } catch (error) {
            console.error('Authentication error:', error);
            if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                setError('Unable to connect to server. Please check your internet connection.');
            } else {
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOTPVerification = async () => {
        if (!formData.otp || formData.otp.length !== 6) {
            setError('Please enter a valid 6-digit OTP');
            setLoading(false);
            return;
        }

        try {
            // Determine endpoint based on admin mode
            const endpoint = isAdminMode ? 
                `${API_BASE_URL}/auth/admin/verify-otp` : 
                `${API_BASE_URL}/auth/user/verify-otp`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: otpSentEmail,
                    otp: formData.otp
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Invalid or expired OTP');
                return;
            }

            // Verification successful
            await handleAuthSuccess(data);

        } catch (error) {
            console.error('OTP verification error:', error);
            setError('An error occurred during verification. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setLoading(true);
        setError('');

        try {
            // Determine endpoint based on admin mode
            const endpoint = isAdminMode ? 
                `${API_BASE_URL}/auth/admin/resend-otp` : 
                `${API_BASE_URL}/auth/user/resend-otp`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: otpSentEmail
                })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Failed to resend OTP');
                return;
            }

            const message = isAdminMode ? 
                'New admin OTP sent to your email!' : 
                'New OTP sent to your email!';
            setSuccessMessage(message);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);

        } catch (error) {
            console.error('Resend OTP error:', error);
            setError('An error occurred while resending OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAuthSuccess = async (data) => {
        const { user, admin, token } = data.data;
        const userData = user || admin;
        const isAdmin = !!(isAdminMode || admin);

        // Store authentication data in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('isAdmin', isAdmin.toString());

        // Show success message
        let message;
        if (isAdminMode || admin) {
            if (showOTPVerification) {
                const roleText = userData.role ? userData.role.toUpperCase() : 'ADMIN';
                message = `${roleText} account verified! Welcome to the admin panel!`;
            } else {
                message = isLogin ? 'Admin login successful!' : 'Admin account created successfully!';
            }
        } else {
            message = showOTPVerification ? 'Email verified! Welcome to NoteVault!' : 
                      (isLogin ? 'Login successful!' : 'Account created successfully!');
        }
        setSuccessMessage(message);
        setShowSuccess(true);

        // Call success callback with user data and token
        if (onAuthSuccess) {
            onAuthSuccess(userData, token);
        }

        // Auto-hide success message and close modal after delay
        setTimeout(() => {
            setShowSuccess(false);
            if (onClose) {
                onClose();
            }
            
            // Trigger authentication state change event
            window.dispatchEvent(new CustomEvent('authStateChanged', { 
                detail: { 
                    isAuthenticated: true, 
                    user: userData, 
                    isAdmin: isAdmin,
                    token: token 
                } 
            }));
            
        }, 2000);
    };

    return (
        <div className="auth-container">
            {/* Success Toast Notification */}
            {showSuccess && (
                <div className="success-toast">
                    <div className="toast-content">
                        <svg className="success-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{successMessage}</span>
                    </div>
                </div>
            )}

            <div className={`auth-card ${isAdminMode ? 'admin-mode' : ''}`}>
                {/* Admin Toggle Button */}
                <button 
                    type="button" 
                    className="admin-toggle-btn" 
                    onClick={toggleAdminMode}
                    disabled={loading}
                >
                    {isAdminMode ? (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            User Login
                        </>
                    ) : (
                        <>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"></path>
                                <path d="M9 12l2 2 4-4"></path>
                            </svg>
                            Admin Login
                        </>
                    )}
                </button>

                {/* Logo */}
                <div className="auth-header">
                    <div className="auth-logo">
                        <span className="logo-icon">{isAdminMode ? '🛡️' : '📓'}</span>
                        <span>NoteVault {isAdminMode && 'Admin'}</span>
                    </div>
                    <h2>
                        {isAdminMode 
                            ? (isLogin ? 'Admin Access' : 'Create Admin Account')
                            : (isLogin ? 'Welcome Back' : 'Create Account')
                        }
                    </h2>
                    <p className="auth-subtitle">
                        {isAdminMode 
                            ? (isLogin 
                                ? 'Sign in with your administrator credentials'
                                : 'Create a new administrator account'
                              )
                            : (isLogin 
                                ? 'Sign in to access your notes and AI features'
                                : 'Join NoteVault to start organizing your study notes'
                            )
                        }
                    </p>
                </div>

                {/* Display error message */}
                {error && (
                    <div className="error-message" style={{
                        color: '#e74c3c',
                        background: '#fadbd8',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        marginBottom: '15px',
                        textAlign: 'center',
                        fontSize: '14px',
                        border: '1px solid #f1948a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                    }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="15" y1="9" x2="9" y2="15"></line>
                            <line x1="9" y1="9" x2="15" y2="15"></line>
                        </svg>
                        {error}
                    </div>
                )}

                {/* Social Login Options - Hide for admin */}
                {!isAdminMode && (
                    <>
                        <div className="social-auth">
                            <button className="social-btn google-btn" type="button">
                                <svg className="social-icon" viewBox="0 0 24 24" width="20" height="20">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                Continue with Google
                            </button>
                            
                            <button className="social-btn github-btn" type="button">
                                <svg className="social-icon" viewBox="0 0 24 24" width="20" height="20">
                                    <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                                Continue with GitHub
                            </button>
                        </div>

                        <div className="divider">
                            <span>OR</span>
                        </div>
                    </>
                )}

                {/* Form */}
                <form className="auth-form" onSubmit={handleSubmit}>
                    {showOTPVerification ? (
                        // OTP Verification Form
                        <>
                            <div className="otp-verification-section">
                                <div className="otp-header">
                                    <div className="verification-icon">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                            <polyline points="22,6 12,13 2,6"></polyline>
                                        </svg>
                                    </div>
                                    <h3>{isAdminMode ? '🛡️ Admin Verification' : 'Check Your Email'}</h3>
                                    <p>
                                        {isAdminMode 
                                            ? 'We sent a 6-digit admin verification code to:' 
                                            : 'We sent a 6-digit verification code to:'
                                        }
                                    </p>
                                    <strong>{otpSentEmail}</strong>
                                    {isAdminMode && (
                                        <div className="admin-notice">
                                            <p><small>⚠️ Administrative account verification required</small></p>
                                        </div>
                                    )}
                                </div>

                                <div className="form-group otp-group">
                                    <label htmlFor="otp">Verification Code</label>
                                    <input
                                        type="text"
                                        id="otp"
                                        name="otp"
                                        value={formData.otp}
                                        onChange={handleInputChange}
                                        placeholder="Enter 6-digit code"
                                        maxLength="6"
                                        pattern="[0-9]{6}"
                                        className="otp-input"
                                        required
                                        disabled={loading}
                                        autoComplete="one-time-code"
                                    />
                                    <div className="input-icon">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                            <circle cx="12" cy="16" r="1"></circle>
                                        </svg>
                                    </div>
                                </div>

                                <div className="otp-actions">
                                    <button
                                        type="button"
                                        className="resend-btn"
                                        onClick={handleResendOTP}
                                        disabled={loading}
                                    >
                                        Resend Code
                                    </button>
                                    <button
                                        type="button"
                                        className="back-btn"
                                        onClick={() => {
                                            setShowOTPVerification(false);
                                            setFormData(prev => ({ ...prev, otp: '' }));
                                        }}
                                        disabled={loading}
                                    >
                                        Back to Registration
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        // Regular Form Fields
                        <>
                    {!isLogin && (
                        <>
                            <div className="form-group">
                                <label htmlFor="firstName">First Name</label>
                                <input
                                    type="text"
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    placeholder="Enter your first name"
                                    required
                                    disabled={loading}
                                />
                                <div className="input-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="lastName">Last Name</label>
                                <input
                                    type="text"
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    placeholder="Enter your last name"
                                    required
                                    disabled={loading}
                                />
                                <div className="input-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                                        <circle cx="12" cy="7" r="4"></circle>
                                    </svg>
                                </div>
                            </div>

                            {isAdminMode && (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="role">Role</label>
                                        <select
                                            id="role"
                                            name="role"
                                            className="role-select"
                                            value={formData.role}
                                            onChange={handleInputChange}
                                            required
                                            disabled={loading}
                                        >
                                            <option value="">Select Role</option>
                                            <option value="admin">Admin</option>
                                            <option value="hr">HR</option>
                                            <option value="faculty">Faculty</option>
                                        </select>
                                        <div className="input-icon">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"></path>
                                                <path d="M9 12l2 2 4-4"></path>
                                            </svg>
                                        </div>
                                    </div>

                                    {formData.role === 'faculty' && (
                                        <div className="form-group">
                                            <label htmlFor="department">Department</label>
                                            <select
                                                id="department"
                                                name="department"
                                                className="department-select"
                                                value={formData.department}
                                                onChange={handleInputChange}
                                                required
                                                disabled={loading}
                                            >
                                                <option value="">Select Department</option>
                                                <option value="Computer Science">Computer Science</option>
                                                <option value="Information Technology">Information Technology</option>
                                                <option value="Electronics Engineering">Electronics Engineering</option>
                                                <option value="Mechanical Engineering">Mechanical Engineering</option>
                                                <option value="Civil Engineering">Civil Engineering</option>
                                                <option value="Business Administration">Business Administration</option>
                                                <option value="Mathematics">Mathematics</option>
                                                <option value="Physics">Physics</option>
                                                <option value="Chemistry">Chemistry</option>
                                                <option value="Biology">Biology</option>
                                                <option value="English">English</option>
                                                <option value="History">History</option>
                                                <option value="Psychology">Psychology</option>
                                                <option value="Economics">Economics</option>
                                                <option value="Other">Other</option>
                                            </select>
                                            <div className="input-icon">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M3 21h18l-9-18-9 18z"></path>
                                                    <path d="M12 9v4"></path>
                                                    <path d="M12 17h.01"></path>
                                                </svg>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">{isAdminMode ? 'Admin Email' : 'Email Address'}</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder={isAdminMode ? "Enter admin email" : "Enter your email"}
                            required
                            disabled={loading}
                        />
                        <div className="input-icon">
                            {isAdminMode ? (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"></path>
                                </svg>
                            ) : (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">{isAdminMode ? 'Admin Password' : 'Password'}</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder={isAdminMode ? "Enter admin password (min 8 chars)" : "Enter your password (min 6 chars)"}
                            required
                            minLength={isAdminMode ? 8 : 6}
                            disabled={loading}
                        />
                        <div className="input-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0110 0v4"></path>
                            </svg>
                        </div>
                    </div>

                    {!isLogin && (
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Confirm your password"
                                required
                                minLength={isAdminMode ? 8 : 6}
                                disabled={loading}
                            />
                            <div className="input-icon">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 11-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                            </div>
                        </div>
                    )}
                        </>
                    )}

                    {isLogin && (
                        <div className="form-options">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    disabled={loading}
                                />
                                <span className="checkmark"></span>
                                Remember me
                            </label>
                            {!isAdminMode && (
                                <a href="/forgot-password" className="forgot-password">
                                    Forgot password?
                                </a>
                            )}
                        </div>
                    )}

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? (
                            <span>
                                {showOTPVerification ? 'Verifying...' :
                                 isAdminMode 
                                    ? (isLogin ? 'Signing In...' : 'Creating Admin Account...')
                                    : (isLogin ? 'Signing In...' : 'Sending Verification...')
                                }
                                <svg className="spinner" width="20" height="20" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="3" fill="currentColor">
                                        <animate attributeName="r" values="3;5;3" dur="1s" repeatCount="indefinite"/>
                                        <animate attributeName="opacity" values="1;0.5;1" dur="1s" repeatCount="indefinite"/>
                                    </circle>
                                </svg>
                            </span>
                        ) : (
                            <span>
                                {showOTPVerification ? 'Verify Email' :
                                 isAdminMode 
                                    ? (isLogin ? 'Admin Sign In' : 'Create Admin Account')
                                    : (isLogin ? 'Sign In' : 'Create Account')
                                }
                                <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </span>
                        )}
                    </button>
                </form>

                {/* Toggle Auth Mode */}
                <div className="auth-toggle">
                    {isLogin ? 
                        (isAdminMode ? "Need to create an admin account?" : "Don't have an account?") : 
                        (isAdminMode ? "Already have an admin account?" : "Already have an account?")
                    }
                    <button type="button" className="toggle-btn" onClick={toggleAuthMode} disabled={loading}>
                        {isLogin ? 
                            (isAdminMode ? 'Create Admin Account' : 'Sign Up') : 
                            (isAdminMode ? 'Admin Sign In' : 'Sign In')
                        }
                    </button>
                </div>

                {/* Terms and Conditions */}
                {!isLogin && (
                    <p className="terms">
                        By creating an account, you agree to our{' '}
                        <a href="/terms">Terms of Service</a> and{' '}
                        <a href="/privacy">Privacy Policy</a>
                        {isAdminMode && (
                            <span> and <a href="/admin-terms">Administrator Guidelines</a></span>
                        )}
                    </p>
                )}
            </div>
        </div>
    );
};

export default AuthForm;