import React, { useState } from 'react';
import '../styles/Homepage.css';
import HelpCenter from './HelpCenter';
import TermsOfService from './TermsOfService';

function Homepage({ onShowAuth, onShowContact, onShowPrivacyPolicy }) {
    const features = [
        {
            icon: '📝',
            title: 'Smart Note Taking',
            description: 'Create, edit, and organize your notes with our intuitive interface.'
        },
        {
            icon: '🔍',
            title: 'Advanced Search',
            description: 'Find any note instantly with our powerful search functionality.'
        },
        {
            icon: '📂',
            title: 'Organization',
            description: 'Categorize and tag your notes for better organization.'
        },
        {
            icon: '☁️',
            title: 'Cloud Sync',
            description: 'Access your notes from anywhere with automatic cloud synchronization.'
        },
        {
            icon: '🔒',
            title: 'Secure & Private',
            description: 'Your notes are encrypted and protected with top-level security.'
        },
        {
            icon: '📱',
            title: 'Cross Platform',
            description: 'Works seamlessly across all your devices - desktop, tablet, and mobile.'
        }
    ];

    const [showHelpCenter, setShowHelpCenter] = useState(false);
    const [showTerms, setShowTerms] = useState(false);

    if (showHelpCenter) return <HelpCenter />;
    if (showTerms) return <TermsOfService />;

    return (
        <div className="homepage">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Welcome to Emmanuel NoteVault</h1>
                    <p className="hero-subtitle">Your Personal Digital Note-Taking Companion</p>
                    <p className="hero-description">
                        Transform the way you capture, organize, and access your thoughts. 
                        Emmanuel NoteVault is designed to be your ultimate productivity partner, 
                        helping you stay organized and never lose an important idea again.
                    </p>
                    <div className="hero-actions">
                        <button 
                            className="btn btn-primary"
                            onClick={() => onShowAuth('signup')}
                        >
                            Get Started Free
                        </button>
                        <button 
                            className="btn btn-secondary"
                            onClick={() => onShowAuth('login')}
                        >
                            Sign In
                        </button>
                    </div>
                </div>
                <div className="hero-image">
                    <div className="note-preview">
                        <div className="note-header">
                            <div className="note-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                        <div className="note-content">
                            <div className="note-line"></div>
                            <div className="note-line short"></div>
                            <div className="note-line"></div>
                            <div className="note-line medium"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <h2 className="section-title">Why Choose Emmanuel NoteVault?</h2>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card">
                                <div className="feature-icon">{feature.icon}</div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="stat-number">10K+</div>
                            <div className="stat-label">Active Users</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">1M+</div>
                            <div className="stat-label">Notes Created</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">99.9%</div>
                            <div className="stat-label">Uptime</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">24/7</div>
                            <div className="stat-label">Support</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2>Ready to Get Organized?</h2>
                        <p>Join thousands of users who have already transformed their note-taking experience.</p>
                        <button 
                            className="btn btn-primary btn-large"
                            onClick={() => onShowAuth('signup')}
                        >
                            Start Your Journey Today
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-section">
                            <h4>Emmanuel NoteVault</h4>
                            <p>Making note-taking simple and powerful.</p>
                        </div>
                        <div className="footer-section">
                            <h4>Features</h4>
                            <ul>
                                <li>Note Management</li>
                                <li>Search & Filter</li>
                                <li>Cloud Sync</li>
                                <li>Mobile Access</li>
                            </ul>
                        </div>
                        <div className="footer-section">
                            <h4>Support</h4>
                            <ul>
                                <li>
                                    <button 
                                        className="footer-link" 
                                        onClick={() => setShowHelpCenter(true)}
                                        style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
                                    >
                                        Help Center
                                    </button>
                                </li>
                                <li>
                                    <button 
                                        className="footer-link" 
                                        onClick={onShowContact}
                                        style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
                                    >
                                        Contact Us
                                    </button>
                                </li>
                                <li>
                                    <button 
                                        className="footer-link" 
                                        onClick={() => setShowTerms(true)}
                                        style={{ background: 'none', border: 'none', padding: 0, color: 'inherit', textDecoration: 'underline', cursor: 'pointer' }}
                                    >
                                        Terms of Service
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2025 Emmanuel NoteVault. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default Homepage;