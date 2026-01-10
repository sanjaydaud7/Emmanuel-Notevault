import React, { useState } from 'react';
import AuthForm from './components/AuthForm';
import Navbar from './components/Navbar';
import Homepage from './components/Homepage';
import BrowseNotes from './components/BrowseNotes';
import UploadNotes from './components/UploadNotes';
import AiNotes from './components/AiNotes';
import Contact from './components/Contact';
import AdminUploadNotes from './components/AdminUploadNotes';
import ManageUsers from './components/ManageUsers';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
    const [showAuthForm, setShowAuthForm] = useState(false);
    const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
    const [showBrowseNotes, setShowBrowseNotes] = useState(false);
    const [showUploadNotes, setShowUploadNotes] = useState(false);
    const [showAiNotes, setShowAiNotes] = useState(false);
    const [showContact, setShowContact] = useState(false);
    const [showAdminUploadNotes, setShowAdminUploadNotes] = useState(false);
    const [showManageUsers, setShowManageUsers] = useState(false);
    const [showAdminDashboard, setShowAdminDashboard] = useState(false);

    const handleShowAuth = (mode) => {
        setAuthMode(mode);
        setShowAuthForm(true);
        setShowBrowseNotes(false);
        setShowUploadNotes(false);
        setShowAiNotes(false);
        setShowContact(false);
        setShowAdminUploadNotes(false);
        setShowManageUsers(false);
        setShowAdminDashboard(false);
    };

    const handleShowBrowseNotes = () => {
        setShowBrowseNotes(true);
        setShowAuthForm(false);
        setShowUploadNotes(false);
        setShowAiNotes(false);
        setShowContact(false);
        setShowAdminUploadNotes(false);
        setShowManageUsers(false);
        setShowAdminDashboard(false);
    };

    const handleShowUploadNotes = () => {
        setShowUploadNotes(true);
        setShowAuthForm(false);
        setShowBrowseNotes(false);
        setShowAiNotes(false);
        setShowContact(false);
        setShowAdminUploadNotes(false);
        setShowManageUsers(false);
        setShowAdminDashboard(false);
    };

    const handleShowAiNotes = () => {
        setShowAiNotes(true);
        setShowAuthForm(false);
        setShowBrowseNotes(false);
        setShowUploadNotes(false);
        setShowContact(false);
        setShowAdminUploadNotes(false);
        setShowManageUsers(false);
        setShowAdminDashboard(false);
    };

    const handleShowContact = () => {
        setShowContact(true);
        setShowAuthForm(false);
        setShowBrowseNotes(false);
        setShowUploadNotes(false);
        setShowAiNotes(false);
        setShowAdminUploadNotes(false);
        setShowManageUsers(false);
        setShowAdminDashboard(false);
    };

    const handleShowAdminUploadNotes = () => {
        setShowAdminUploadNotes(true);
        setShowAuthForm(false);
        setShowBrowseNotes(false);
        setShowUploadNotes(false);
        setShowAiNotes(false);
        setShowContact(false);
        setShowManageUsers(false);
        setShowAdminDashboard(false);
    };

    const handleShowManageUsers = () => {
        setShowManageUsers(true);
        setShowAuthForm(false);
        setShowBrowseNotes(false);
        setShowUploadNotes(false);
        setShowAiNotes(false);
        setShowContact(false);
        setShowAdminUploadNotes(false);
        setShowAdminDashboard(false);
    };

    const handleShowAdminDashboard = () => {
        setShowAdminDashboard(true);
        setShowAuthForm(false);
        setShowBrowseNotes(false);
        setShowUploadNotes(false);
        setShowAiNotes(false);
        setShowContact(false);
        setShowAdminUploadNotes(false);
        setShowManageUsers(false);
    };

    const handleBackToHome = () => {
        setShowBrowseNotes(false);
        setShowAuthForm(false);
        setShowUploadNotes(false);
        setShowAiNotes(false);
        setShowContact(false);
        setShowAdminUploadNotes(false);
        setShowManageUsers(false);
        setShowAdminDashboard(false);
    };

    // Determine current page for navbar highlighting
    const getCurrentPage = () => {
        if (showBrowseNotes) return 'browse';
        if (showUploadNotes) return 'upload';
        if (showAiNotes) return 'ainotes';
        if (showContact) return 'contact';
        if (showAuthForm) return 'auth';
        if (showAdminUploadNotes) return 'admin-upload';
        if (showManageUsers) return 'manage-users';
        if (showAdminDashboard) return 'admin-dashboard';
        return 'home';
    };

    return ( <
            div className = "App" >
            <
            Navbar onShowAuth = { handleShowAuth }
            onShowBrowseNotes = { handleShowBrowseNotes }
            onShowUploadNotes = { handleShowUploadNotes }
            onShowAiNotes = { handleShowAiNotes }
            onShowContact = { handleShowContact }
            onShowAdminUploadNotes = { handleShowAdminUploadNotes }
            onShowManageUsers = { handleShowManageUsers }
            onShowAdminDashboard = { handleShowAdminDashboard }
            onBackToHome = { handleBackToHome }
            currentPage = { getCurrentPage() }
            />

            {
                showAuthForm && ( <
                    AuthForm initialMode = { authMode }
                    onClose = {
                        () => setShowAuthForm(false)
                    }
                    />
                )
            }

            {
                showBrowseNotes && < BrowseNotes onBack = { handleBackToHome }
                />}

                {
                    showUploadNotes && < UploadNotes onBack = { handleBackToHome }
                    />}

                    { showAiNotes && < AiNotes / > }

                    { showContact && < Contact / > }

                    { showAdminUploadNotes && < AdminUploadNotes / > }

                    { showManageUsers && < ManageUsers / > }

                    { showAdminDashboard && < AdminDashboard / > }

                    {
                        !showAuthForm && !showBrowseNotes && !showUploadNotes && !showAiNotes && !showContact && !showAdminUploadNotes && !showManageUsers && !showAdminDashboard && ( <
                            Homepage onShowAuth = { handleShowAuth }
                            onShowBrowseNotes = { handleShowBrowseNotes }
                            onShowContact = { handleShowContact }
                            />
                        )
                    } <
                    /div>
                );
            }

            export default App;