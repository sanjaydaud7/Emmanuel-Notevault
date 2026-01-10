const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Get auth token from localStorage
const getAuthToken = () => {
    return localStorage.getItem('token');
};

// Check if user is authenticated
export const isAuthenticated = () => {
    const token = getAuthToken();
    const user = localStorage.getItem('user');
    return !!(token && user);
};

// Check if user is admin
export const isAdmin = () => {
    return localStorage.getItem('isAdmin') === 'true';
};

// Get current user data
export const getCurrentUser = () => {
    try {
        const userString = localStorage.getItem('user');
        return userString ? JSON.parse(userString) : null;
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
};

// Make authenticated API request
export const apiRequest = async(endpoint, options = {}) => {
    const token = getAuthToken();

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        // Handle unauthorized responses
        if (response.status === 401) {
            // Token expired or invalid
            logout();
            window.location.href = '/login';
            throw new Error('Authentication expired. Please login again.');
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        throw error;
    }
};

// Auth API functions
export const authAPI = {
    // User registration
    registerUser: (userData) =>
        apiRequest('/auth/user/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        }),

    // User login
    loginUser: (credentials) =>
        apiRequest('/auth/user/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        }),

    // Admin registration
    registerAdmin: (adminData) =>
        apiRequest('/auth/admin/register', {
            method: 'POST',
            body: JSON.stringify(adminData),
        }),

    // Admin login
    loginAdmin: (credentials) =>
        apiRequest('/auth/admin/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        }),

    // Get current user profile
    getUserProfile: () =>
        apiRequest('/auth/user/me'),

    // Get current admin profile
    getAdminProfile: () =>
        apiRequest('/auth/admin/me'),
};

// Logout function
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('adminRole');
    localStorage.removeItem('rememberMe');

    // Dispatch event to update navbar and other components
    window.dispatchEvent(new Event('authStateChanged'));
};

// Check token validity on app load
export const validateToken = async() => {
    if (!isAuthenticated()) {
        return false;
    }

    try {
        if (isAdmin()) {
            await authAPI.getAdminProfile();
        } else {
            await authAPI.getUserProfile();
        }
        return true;
    } catch (error) {
        console.error('Token validation failed:', error);
        logout();
        return false;
    }
};

export default {
    apiRequest,
    authAPI,
    isAuthenticated,
    isAdmin,
    getCurrentUser,
    logout,
    validateToken,
};