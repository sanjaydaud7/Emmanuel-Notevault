import React, { useState, useEffect } from 'react';
import '../styles/Navbar.css';

const Navbar = ({ onShowAuth, onShowBrowseNotes, onShowUploadNotes, onShowAiNotes, onBackToHome, onShowAdminUploadNotes, onShowManageUsers, onShowAdminDashboard, currentPage }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Check authentication status on component mount
    useEffect(() => {
        checkAuthStatus();
        
        // Listen for authentication state changes
        const handleAuthStateChange = (event) => {
            if (event.detail) {
                // Handle authentication event data
                const { isAuthenticated, user: userData, isAdmin, token } = event.detail;
                if (isAuthenticated && userData && token) {
                    setIsAuthenticated(true);
                    setUser({ ...userData, isAdmin });
                }
            } else {
                // Fallback to checking localStorage
                checkAuthStatus();
            }
        };
        
        window.addEventListener('authStateChanged', handleAuthStateChange);
        
        return () => {
            window.removeEventListener('authStateChanged', handleAuthStateChange);
        };
    }, []);

    const checkAuthStatus = () => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        
        if (token && userData) {
            setIsAuthenticated(true);
            const user = JSON.parse(userData);
            setUser({ ...user, isAdmin });
        } else {
            setIsAuthenticated(false);
            setUser(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('isAdmin');
        setIsAuthenticated(false);
        setUser(null);
        setShowProfileMenu(false);
        onBackToHome(); // Navigate back to home after logout
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleProfileMenu = () => {
        setShowProfileMenu(!showProfileMenu);
    };

    const handleNavClick = (page) => {
        setIsMenuOpen(false); // Close mobile menu on navigation
        
        if (page === 'home') {
            onBackToHome();
        } else if (page === 'browse') {
            onShowBrowseNotes();
        } else if (page === 'upload') {
            onShowUploadNotes();
        } else if (page === 'ainotes') {
            onShowAiNotes();
        }
    };

    // Helper function to get user display name
    const getUserDisplayName = () => {
        if (!user) return 'User';
        return user.firstName || user.username || user.email?.split('@')[0] || 'User';
    };

    // Helper function to get user initials for avatar
    const getUserInitials = () => {
        if (!user) return 'U';
        
        if (user.firstName && user.lastName) {
            return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
        } else if (user.firstName) {
            return user.firstName.charAt(0).toUpperCase();
        } else if (user.username) {
            return user.username.charAt(0).toUpperCase();
        } else if (user.email) {
            return user.email.charAt(0).toUpperCase();
        }
        return 'U';
    };

    return (
        <header className="navbar">
            <div className="nav-container">
                {/* Logo */}
                <button onClick={() => handleNavClick('home')} className="logo" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <span className="logo-icon">📓</span>
                    <span>Emmanuel NoteVault</span>
                </button>

                {/* Desktop Navigation Links */}
                <nav className={`nav-links ${isMenuOpen ? 'mobile-open' : ''}`}>
                    <button 
                        onClick={() => handleNavClick('home')} 
                        className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Home
                    </button>
                    <button 
                        onClick={() => handleNavClick('browse')} 
                        className={`nav-link ${currentPage === 'browse' ? 'active' : ''}`}
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Browse Notes
                    </button>
                    <button 
                        onClick={() => handleNavClick('upload')} 
                        className={`nav-link ${currentPage === 'upload' ? 'active' : ''}`}
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload Note
                    </button>
                    <button 
                        onClick={() => handleNavClick('ainotes')} 
                        className={`nav-link ${currentPage === 'ainotes' ? 'active' : ''}`}
                        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-2a4 4 0 00-4-4H4m16 0h-1a4 4 0 00-4 4v2M12 6a4 4 0 100 8 4 4 0 000-8z" />
                        </svg>
                        AI Notes
                    </button>
                </nav>

                {/* Auth Buttons or Profile Icon */}
                <div className={`auth-links ${isMenuOpen ? 'mobile-open' : ''}`}>
                    {isAuthenticated ? (
                        <div className="profile-section">
                            <button 
                                className="profile-btn"
                                onClick={toggleProfileMenu}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    padding: '8px',
                                    borderRadius: '8px',
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                <div style={{
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: user?.isAdmin 
                                        ? 'linear-gradient(45deg, #f59e0b 0%, #d97706 100%)'
                                        : 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'white',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    border: user?.isAdmin ? '2px solid #f59e0b' : 'none'
                                }}>
                                    {getUserInitials()}
                                </div>
                                <span style={{ color: 'white', fontSize: '16px' }}>
                                    {getUserDisplayName()}
                                </span>
                                <svg 
                                    style={{ 
                                        width: '16px', 
                                        height: '16px', 
                                        transition: 'transform 0.2s',
                                        transform: showProfileMenu ? 'rotate(180deg)' : 'rotate(0deg)'
                                    }} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Profile Dropdown Menu */}
                            {showProfileMenu && (
                                <div className="profile-menu" style={{
                                    position: 'absolute',
                                    top: '100%',
                                    right: '0',
                                    background: 'white',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    border: '1px solid #e1e5e9',
                                    minWidth: user?.isAdmin ? '280px' : '200px',
                                    zIndex: 1000,
                                    marginTop: '8px'
                                }}>
                                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #e1e5e9' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                                            {getUserDisplayName()}
                                            {user?.isAdmin && (
                                                <span style={{ 
                                                    marginLeft: '8px', 
                                                    padding: '2px 6px', 
                                                    background: user?.role === 'admin' ? '#f59e0b' : user?.role === 'hr' ? '#10b981' : '#6366f1', 
                                                    color: 'white', 
                                                    fontSize: '10px', 
                                                    borderRadius: '4px' 
                                                }}>
                                                    {user?.role?.toUpperCase() || 'ADMIN'}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ color: '#666', fontSize: '12px' }}>{user?.email}</div>
                                        {user?.isAdmin && user?.department && (
                                            <div style={{ 
                                                color: '#888', 
                                                fontSize: '11px', 
                                                marginTop: '2px' 
                                            }}>
                                                {user.department}
                                            </div>
                                        )}
                                        {user?.isAdmin && (
                                            <div style={{ 
                                                color: '#f59e0b', 
                                                fontSize: '11px', 
                                                fontWeight: '500', 
                                                marginTop: '4px' 
                                            }}>
                                                Administrator Panel
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Role-specific menu items */}
                                    {user?.isAdmin && (
                                        <>
                                            <div style={{ padding: '8px 0', borderBottom: '1px solid #e1e5e9' }}>
                                                <div style={{ 
                                                    padding: '8px 16px', 
                                                    fontSize: '12px', 
                                                    color: '#888', 
                                                    fontWeight: '600', 
                                                    textTransform: 'uppercase' 
                                                }}>
                                                    {user?.role === 'faculty' ? 'Faculty Functions' : user?.role === 'hr' ? 'HR Functions' : 'Admin Functions'}
                                                </div>
                                                
                                                {user?.role === 'admin' && (
                                                    <button 
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px 16px',
                                                            border: 'none',
                                                            background: 'none',
                                                            textAlign: 'left',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            fontSize: '14px',
                                                            color: '#333'
                                                        }}
                                                        onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                                                        onMouseLeave={(e) => e.target.style.background = 'none'}
                                                        onClick={() => {
                                                            setShowProfileMenu(false);
                                                            onShowAdminDashboard();
                                                        }}
                                                    >
                                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                        </svg>
                                                        Admin Dashboard
                                                    </button>
                                                )}
                                                
                                                {(user?.role === 'admin' || user?.role === 'faculty') && (
                                                    <button 
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px 16px',
                                                            border: 'none',
                                                            background: 'none',
                                                            textAlign: 'left',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            fontSize: '14px',
                                                            color: '#333'
                                                        }}
                                                        onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                                                        onMouseLeave={(e) => e.target.style.background = 'none'}
                                                        onClick={() => {
                                                            setShowProfileMenu(false);
                                                            onShowAdminUploadNotes();
                                                        }}
                                                    >
                                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                        {user?.role === 'faculty' ? 'Upload Notes' : 'Manage Notes'}
                                                    </button>
                                                )}
                                                
                                                {(user?.role === 'admin' || user?.role === 'hr') && (
                                                    <button 
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px 16px',
                                                            border: 'none',
                                                            background: 'none',
                                                            textAlign: 'left',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            fontSize: '14px',
                                                            color: '#333'
                                                        }}
                                                        onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                                                        onMouseLeave={(e) => e.target.style.background = 'none'}
                                                        onClick={() => {
                                                            setShowProfileMenu(false);
                                                            onShowManageUsers();
                                                        }}
                                                    >
                                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                                        </svg>
                                                        Manage Users
                                                    </button>
                                                )}
                                                
                                                {(user?.role === 'admin' || user?.role === 'hr') && (
                                                    <button 
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px 16px',
                                                            border: 'none',
                                                            background: 'none',
                                                            textAlign: 'left',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            fontSize: '14px',
                                                            color: '#333'
                                                        }}
                                                        onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                                                        onMouseLeave={(e) => e.target.style.background = 'none'}
                                                        onClick={() => {
                                                            setShowProfileMenu(false);
                                                            // Navigate to analytics
                                                        }}
                                                    >
                                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                        </svg>
                                                        Analytics
                                                    </button>
                                                )}
                                                
                                                {(user?.role === 'admin' || user?.role === 'hr') && (
                                                    <button 
                                                        style={{
                                                            width: '100%',
                                                            padding: '10px 16px',
                                                            border: 'none',
                                                            background: 'none',
                                                            textAlign: 'left',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '8px',
                                                            fontSize: '14px',
                                                            color: '#333'
                                                        }}
                                                        onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                                                        onMouseLeave={(e) => e.target.style.background = 'none'}
                                                        onClick={() => {
                                                            setShowProfileMenu(false);
                                                            // Navigate to system settings
                                                        }}
                                                    >
                                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        System Settings
                                                    </button>
                                                )}
                                            </div>
                                        </>
                                    )}
                                    
                                    {/* Regular user options */}
                                    <button 
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            border: 'none',
                                            background: 'none',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '14px'
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                                        onMouseLeave={(e) => e.target.style.background = 'none'}
                                        onClick={() => {
                                            setShowProfileMenu(false);
                                            // Add profile settings navigation here
                                        }}
                                    >
                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Profile Settings
                                    </button>
                                    
                                    {!user?.isAdmin && (
                                        <button 
                                            style={{
                                                width: '100%',
                                                padding: '12px 16px',
                                                border: 'none',
                                                background: 'none',
                                                textAlign: 'left',
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                fontSize: '14px'
                                            }}
                                            onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                                            onMouseLeave={(e) => e.target.style.background = 'none'}
                                            onClick={() => {
                                                setShowProfileMenu(false);
                                                // Navigate to my notes
                                            }}
                                        >
                                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            My Notes
                                        </button>
                                    )}
                                    
                                    <button 
                                        style={{
                                            width: '100%',
                                            padding: '12px 16px',
                                            border: 'none',
                                            background: 'none',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '14px',
                                            color: '#e74c3c',
                                            borderTop: '1px solid #e1e5e9'
                                        }}
                                        onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
                                        onMouseLeave={(e) => e.target.style.background = 'none'}
                                        onClick={handleLogout}
                                    >
                                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <button 
                                onClick={() => onShowAuth('login')} 
                                className="auth-btn auth-btn-outline"
                            >
                                <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                                Login
                            </button>
                            <button 
                                onClick={() => onShowAuth('signup')} 
                                className="auth-btn auth-btn-primary"
                            >
                                <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                Sign Up
                            </button>
                        </>
                    )}
                </div>

                {/* Mobile Menu Toggle */}
                <button className="mobile-menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
                    <span className={`bar ${isMenuOpen ? 'bar1-active' : ''}`}></span>
                    <span className={`bar ${isMenuOpen ? 'bar2-active' : ''}`}></span>
                    <span className={`bar ${isMenuOpen ? 'bar3-active' : ''}`}></span>
                </button>
            </div>

            {/* Close profile menu when clicking outside */}
            {showProfileMenu && (
                <div 
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 999
                    }}
                    onClick={() => setShowProfileMenu(false)}
                />
            )}
        </header>
    );
};

export default Navbar;