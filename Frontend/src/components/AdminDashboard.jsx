import React, { useState, useEffect } from 'react';
import '../styles/AdminDashboard.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AdminDashboard = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalNotes: 0,
        totalDownloads: 0,
        newUsersThisMonth: 0,
        notesUploadedThisWeek: 0,
        popularSubjects: [],
        recentActivity: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedTimeframe, setSelectedTimeframe] = useState('7days');

    useEffect(() => {
        // Check user permissions first
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            
            // Only allow admin to access this component
            if (parsedUser.role !== 'admin') {
                setError('Access denied. This feature is only available to admin users.');
                setLoading(false);
                return;
            }
        }
        
        fetchDashboardData();
    }, [selectedTimeframe]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError('Authentication required');
                return;
            }

            const response = await fetch(`${API_BASE_URL}/admin/dashboard?timeframe=${selectedTimeframe}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch dashboard data');
            }

            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getActivityIcon = (action) => {
        switch (action) {
            case 'user_registered':
                return (
                    <svg className="activity-icon" fill="none" stroke="#10b981" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                );
            case 'note_uploaded':
                return (
                    <svg className="activity-icon" fill="none" stroke="#3b82f6" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                );
            case 'note_downloaded':
                return (
                    <svg className="activity-icon" fill="none" stroke="#f59e0b" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    </svg>
                );
            case 'user_login':
                return (
                    <svg className="activity-icon" fill="none" stroke="#8b5cf6" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                );
            default:
                return (
                    <svg className="activity-icon" fill="none" stroke="#6b7280" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    const getActivityText = (activity) => {
        switch (activity.action) {
            case 'user_registered':
                return `New user registered: ${activity.details?.email || 'Unknown'}`;
            case 'note_uploaded':
                return `Note uploaded: "${activity.details?.title || 'Untitled'}" by ${activity.details?.uploader || 'Unknown'}`;
            case 'note_downloaded':
                return `Note downloaded: "${activity.details?.title || 'Untitled'}" by ${activity.details?.user || 'Unknown'}`;
            case 'user_login':
                return `User logged in: ${activity.details?.email || 'Unknown'}`;
            default:
                return activity.description || 'Unknown activity';
        }
    };

    if (loading) {
        return (
            <div className="admin-dashboard">
                <div className="dashboard-header">
                    <h1>Admin Dashboard</h1>
                    <div className="loading-spinner">
                        <div className="spinner"></div>
                        <span>Loading dashboard data...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-dashboard">
                <div className="dashboard-header">
                    <h1>Admin Dashboard</h1>
                    <div className="error-message">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="24" height="24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                        <button onClick={fetchDashboardData} className="retry-btn">Retry</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <div className="header-content">
                    <h1>
                        <svg className="dashboard-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Admin Dashboard
                    </h1>
                    <p>Overview and analytics for Emmanuel NoteVault</p>
                </div>
                <div className="dashboard-controls">
                    <select 
                        value={selectedTimeframe} 
                        onChange={(e) => setSelectedTimeframe(e.target.value)}
                        className="timeframe-select"
                    >
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="90days">Last 90 Days</option>
                        <option value="1year">Last Year</option>
                    </select>
                    <button onClick={fetchDashboardData} className="refresh-btn">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon users-icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <h3>{stats.totalUsers.toLocaleString()}</h3>
                        <p>Total Users</p>
                        <span className="stat-change">+{stats.newUsersThisMonth} this month</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon notes-icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <h3>{stats.totalNotes.toLocaleString()}</h3>
                        <p>Total Notes</p>
                        <span className="stat-change">+{stats.notesUploadedThisWeek} this week</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon downloads-icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <h3>{stats.totalDownloads.toLocaleString()}</h3>
                        <p>Total Downloads</p>
                        <span className="stat-change">Active engagement</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon engagement-icon">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <div className="stat-content">
                        <h3>{stats.totalDownloads > 0 ? (stats.totalDownloads / stats.totalNotes).toFixed(1) : '0.0'}</h3>
                        <p>Avg Downloads per Note</p>
                        <span className="stat-change">Engagement metric</span>
                    </div>
                </div>
            </div>

            {/* Charts and Analytics Section */}
            <div className="dashboard-content">
                <div className="content-row">
                    {/* Popular Subjects */}
                    <div className="dashboard-card">
                        <h2>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            Popular Subjects
                        </h2>
                        <div className="subjects-list">
                            {stats.popularSubjects.length > 0 ? (
                                stats.popularSubjects.slice(0, 10).map((subject, index) => (
                                    <div key={index} className="subject-item">
                                        <div className="subject-info">
                                            <span className="subject-name">{subject.name}</span>
                                            <span className="subject-count">{subject.count} notes</span>
                                        </div>
                                        <div className="subject-progress">
                                            <div 
                                                className="progress-bar" 
                                                style={{ 
                                                    width: `${(subject.count / stats.popularSubjects[0]?.count * 100) || 0}%` 
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="48" height="48">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p>No subject data available yet</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="dashboard-card activity-card">
                        <h2>
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Recent Activity
                        </h2>
                        <div className="activity-list">
                            {stats.recentActivity.length > 0 ? (
                                stats.recentActivity.slice(0, 15).map((activity, index) => (
                                    <div key={index} className="activity-item">
                                        <div className="activity-icon-container">
                                            {getActivityIcon(activity.action)}
                                        </div>
                                        <div className="activity-content">
                                            <p className="activity-text">{getActivityText(activity)}</p>
                                            <span className="activity-time">{formatDate(activity.timestamp)}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="empty-state">
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="48" height="48">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p>No recent activity</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h2>Admin Actions</h2>
                <div className="actions-grid">
                    <button className="action-btn" onClick={() => window.location.href = '#manage-notes'}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>Manage All Notes</span>
                        <small>View, edit, and delete notes</small>
                    </button>

                    <button className="action-btn" onClick={() => window.location.href = '#manage-users'}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        <span>User Management</span>
                        <small>Add, edit, or remove users</small>
                    </button>

                    <button className="action-btn" onClick={() => window.location.href = '#upload-notes'}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>Upload Notes</span>
                        <small>Add new study materials</small>
                    </button>

                    <button className="action-btn" onClick={() => setSelectedTimeframe('90days')}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span>Analytics Report</span>
                        <small>Generate detailed reports</small>
                    </button>

                    <button className="action-btn" onClick={() => window.location.href = '#backup'}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>Database Backup</span>
                        <small>Export and backup data</small>
                    </button>

                    <button className="action-btn" onClick={() => window.location.href = '#system-logs'}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span>System Logs</span>
                        <small>View application logs</small>
                    </button>

                    <button className="action-btn" onClick={() => window.location.href = '#notifications'}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5v-5zM11 19H6a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v4M11 7h8m-8 4h3" />
                        </svg>
                        <span>Send Notifications</span>
                        <small>Broadcast to all users</small>
                    </button>

                    <button className="action-btn" onClick={() => window.location.href = '#maintenance'}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>System Settings</span>
                        <small>Configure application</small>
                    </button>
                </div>
            </div>

            {/* System Health Section */}
            <div className="system-health">
                <h2>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    System Health
                </h2>
                <div className="health-grid">
                    <div className="health-item">
                        <div className="health-status online">
                            <div className="status-dot"></div>
                            <span>Database</span>
                        </div>
                        <span className="health-value">Online</span>
                    </div>
                    <div className="health-item">
                        <div className="health-status online">
                            <div className="status-dot"></div>
                            <span>API Server</span>
                        </div>
                        <span className="health-value">Healthy</span>
                    </div>
                    <div className="health-item">
                        <div className="health-status online">
                            <div className="status-dot"></div>
                            <span>File Storage</span>
                        </div>
                        <span className="health-value">Available</span>
                    </div>
                    <div className="health-item">
                        <div className="health-status warning">
                            <div className="status-dot"></div>
                            <span>Memory Usage</span>
                        </div>
                        <span className="health-value">78%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;