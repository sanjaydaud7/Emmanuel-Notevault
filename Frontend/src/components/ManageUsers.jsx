import React, { useState, useEffect } from 'react';
import '../styles/ManageUsers.css';

const ManageUsers = () => {
    const [user, setUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage] = useState(10);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        // Check user permissions first
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            
            // Only allow admin and hr to access this component
            if (parsedUser.role !== 'admin' && parsedUser.role !== 'hr') {
                setError('Access denied. This feature is only available to admin and HR users.');
                setLoading(false);
                return;
            }
        }
        
        fetchUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, searchTerm, roleFilter, statusFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError('');
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError('Authentication required. Please login as admin.');
                return;
            }
            
            const response = await fetch(`${API_BASE_URL}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    setError('Access denied. Admin privileges required.');
                } else if (response.status === 403) {
                    setError('Insufficient permissions to manage users.');
                } else {
                    setError('Failed to fetch users. Please try again.');
                }
                return;
            }

            const data = await response.json();
            if (data.success && Array.isArray(data.data)) {
                setUsers(data.data);
            } else {
                setError('Invalid response format from server.');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let filtered = users;

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(user => 
                user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Role filter
        if (roleFilter !== 'all') {
            filtered = filtered.filter(user => user.role === roleFilter);
        }

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(user => 
                statusFilter === 'active' ? user.isActive : !user.isActive
            );
        }

        setFilteredUsers(filtered);
        setCurrentPage(1);
    };

    const handleDeleteUser = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to delete user');
            }

            setUsers(users.filter(user => user._id !== userId));
            setShowDeleteModal(false);
            setUserToDelete(null);
        } catch (error) {
            console.error('Error deleting user:', error);
            setError('Failed to delete user. Please try again.');
        }
    };

    const handleStatusToggle = async (userId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isActive: !currentStatus })
            });

            if (!response.ok) {
                throw new Error('Failed to update user status');
            }

            setUsers(users.map(user => 
                user._id === userId ? { ...user, isActive: !currentStatus } : user
            ));
        } catch (error) {
            console.error('Error updating user status:', error);
            setError('Failed to update user status. Please try again.');
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role: newRole })
            });

            if (!response.ok) {
                throw new Error('Failed to update user role');
            }

            setUsers(users.map(user => 
                user._id === userId ? { ...user, role: newRole } : user
            ));
        } catch (error) {
            console.error('Error updating user role:', error);
            setError('Failed to update user role. Please try again.');
        }
    };

    const handleSelectUser = (userId) => {
        setSelectedUsers(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSelectAll = () => {
        setSelectedUsers(
            selectedUsers.length === currentUsers.length 
                ? [] 
                : currentUsers.map(user => user._id)
        );
    };

    // Pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="manage-users-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading users...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="manage-users-container">
            <div className="container">
                {/* Header */}
                <div className="page-header">
                    <div className="header-content">
                        <h1>Manage Users</h1>
                        <p>View and manage all registered users</p>
                    </div>
                    <div className="header-actions">
                        <button className="export-btn" onClick={() => console.log('Export users')}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                                <polyline points="7,10 12,15 17,10"/>
                                <line x1="12" y1="15" x2="12" y2="3"/>
                            </svg>
                            Export
                        </button>
                        <button className="refresh-btn" onClick={fetchUsers}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="23,4 23,10 17,10"/>
                                <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
                            </svg>
                            Refresh
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="error-message">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="15" y1="9" x2="9" y2="15"/>
                            <line x1="9" y1="9" x2="15" y2="15"/>
                        </svg>
                        {error}
                    </div>
                )}

                {/* Filters */}
                <div className="filters-section">
                    <div className="filters-grid">
                        <div className="search-input-wrapper">
                            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="M21 21l-4.35-4.35"/>
                            </svg>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search users by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <select 
                            className="filter-select"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                        >
                            <option value="all">All Roles</option>
                            <option value="user">Users</option>
                            <option value="admin">Admins</option>
                        </select>

                        <select 
                            className="filter-select"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="results-info">
                        <p>Showing {currentUsers.length} of {filteredUsers.length} users</p>
                        {selectedUsers.length > 0 && (
                            <div className="selected-actions">
                                <span>{selectedUsers.length} selected</span>
                                <button className="bulk-action-btn delete">
                                    Delete Selected
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Users Table */}
                <div className="users-table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.length === currentUsers.length && currentUsers.length > 0}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Last Active</th>
                                <th>Notes</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentUsers.map(user => (
                                <tr key={user._id} className={selectedUsers.includes(user._id) ? 'selected' : ''}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user._id)}
                                            onChange={() => handleSelectUser(user._id)}
                                        />
                                    </td>
                                    <td>
                                        <div className="user-info">
                                            <div className="user-avatar">
                                                {user.firstName?.charAt(0) || 'U'}{user.lastName?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <div className="user-name">{user.firstName || 'Unknown'} {user.lastName || 'User'}</div>
                                                <div className="user-id">ID: {user._id?.slice(-8) || 'N/A'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{user.email || 'No email'}</td>
                                    <td>
                                        <select
                                            className={`role-select ${user.role || 'user'}`}
                                            value={user.role || 'user'}
                                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                        >
                                            <option value="user">User</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button
                                            className={`status-toggle ${(user.isActive !== false) ? 'active' : 'inactive'}`}
                                            onClick={() => handleStatusToggle(user._id, user.isActive !== false)}
                                        >
                                            {(user.isActive !== false) ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td>{user.createdAt ? formatDate(user.createdAt) : 'Unknown'}</td>
                                    <td>{user.lastLogin ? formatDate(user.lastLogin) : 'Never'}</td>
                                    <td>{user.notesCount || 0}</td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="action-btn view"
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowUserModal(true);
                                                }}
                                                title="View Details"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                                    <circle cx="12" cy="12" r="3"/>
                                                </svg>
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                onClick={() => {
                                                    setUserToDelete(user);
                                                    setShowDeleteModal(true);
                                                }}
                                                title="Delete User"
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3,6 5,6 21,6"/>
                                                    <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredUsers.length === 0 && !loading && (
                        <div className="empty-state">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            <h3>No users found</h3>
                            <p>No users match your current filters.</p>
                            <button className="reset-filters-btn" onClick={() => {
                                setSearchTerm('');
                                setRoleFilter('all');
                                setStatusFilter('all');
                            }}>
                                Reset Filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="pagination">
                        <button
                            className="pagination-btn"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                        >
                            Previous
                        </button>
                        
                        <div className="page-numbers">
                            {[...Array(totalPages)].map((_, index) => (
                                <button
                                    key={index + 1}
                                    className={`page-number ${currentPage === index + 1 ? 'active' : ''}`}
                                    onClick={() => setCurrentPage(index + 1)}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            className="pagination-btn"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(currentPage + 1)}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h3>Delete User</h3>
                        <p>Are you sure you want to delete <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong>?</p>
                        <p className="warning">This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button
                                className="cancel-btn"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setUserToDelete(null);
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="delete-btn"
                                onClick={() => handleDeleteUser(userToDelete._id)}
                            >
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* User Details Modal */}
            {showUserModal && selectedUser && (
                <div className="modal-overlay">
                    <div className="modal user-modal">
                        <div className="modal-header">
                            <h3>User Details</h3>
                            <button
                                className="close-btn"
                                onClick={() => {
                                    setShowUserModal(false);
                                    setSelectedUser(null);
                                }}
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>
                        <div className="user-details">
                            <div className="user-avatar large">
                                {selectedUser.firstName.charAt(0)}{selectedUser.lastName.charAt(0)}
                            </div>
                            <div className="user-info-grid">
                                <div className="info-item">
                                    <label>Full Name</label>
                                    <p>{selectedUser.firstName} {selectedUser.lastName}</p>
                                </div>
                                <div className="info-item">
                                    <label>Email</label>
                                    <p>{selectedUser.email}</p>
                                </div>
                                <div className="info-item">
                                    <label>Role</label>
                                    <p>{selectedUser.role}</p>
                                </div>
                                <div className="info-item">
                                    <label>Status</label>
                                    <p>{selectedUser.isActive ? 'Active' : 'Inactive'}</p>
                                </div>
                                <div className="info-item">
                                    <label>Member Since</label>
                                    <p>{formatDate(selectedUser.createdAt)}</p>
                                </div>
                                <div className="info-item">
                                    <label>Last Login</label>
                                    <p>{selectedUser.lastLogin ? formatDate(selectedUser.lastLogin) : 'Never'}</p>
                                </div>
                                <div className="info-item">
                                    <label>Total Notes</label>
                                    <p>{selectedUser.notesCount || 0}</p>
                                </div>
                                <div className="info-item">
                                    <label>User ID</label>
                                    <p>{selectedUser._id}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageUsers;
