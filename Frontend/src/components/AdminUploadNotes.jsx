import React, { useState, useRef, useEffect, useCallback } from 'react';
import '../styles/AdminUploadNotes.css';

const AdminUploadNotes = () => {
    const [user, setUser] = useState(null);
    
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        tags: '',
        content: '',
        attachments: [],
        visibility: 'public',
        category: 'general'
    });

    const [selectedCategory, setSelectedCategory] = useState('All');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const [errors, setErrors] = useState({});
    
    // New states for managing notes
    const [notes, setNotes] = useState([]);
    const [isLoadingNotes, setIsLoadingNotes] = useState(false);
    const [editingNote, setEditingNote] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterSubject, setFilterSubject] = useState('All');
    const [existingAttachments, setExistingAttachments] = useState([]);
    const [isLoadingNoteDetails, setIsLoadingNoteDetails] = useState(false);

    // Add a ref for the file input
    const fileInputRef = useRef(null);

    // Check user role on component mount
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    // Categories with their subjects
    const subjectCategories = {
        "All": [],
        "Computer Science & IT": [
            "Artificial Intelligence",
            "Cloud Computing",
            "Data Management", 
            "Data Science",
            "Development",
            "Machine Learning",
            "Networking",
            "Programming",
            "Software Engineering",
            "Systems",
            "Cybersecurity",
            "Web Development",
            "Mobile Development",
            "Database Management"
        ],
        "Engineering & Technology": [
            "Mechanical Engineering",
            "Electrical Engineering", 
            "Civil Engineering",
            "Chemical Engineering",
            "Electronics & Communication",
            "Automobile Engineering",
            "Aerospace Engineering",
            "Biotechnology",
            "Environmental Engineering",
            "Industrial Engineering",
            "Petroleum Engineering",
            "Mining Engineering"
        ],
        "Medical & Health Sciences": [
            "Medicine",
            "Dentistry", 
            "Pharmacy",
            "Nursing",
            "Physiotherapy",
            "Ayurveda",
            "Homeopathy",
            "Unani Medicine",
            "Veterinary Science",
            "Medical Laboratory Technology",
            "Radiology",
            "Anatomy",
            "Pathology"
        ],
        "Commerce & Management": [
            "Business Administration",
            "Accounting",
            "Finance",
            "Marketing",
            "Human Resources",
            "Economics",
            "E-Commerce",
            "Banking",
            "Insurance",
            "Taxation",
            "Cost Accounting",
            "Company Law",
            "Business Law"
        ],
        "Pure Sciences": [
            "Physics",
            "Chemistry", 
            "Mathematics",
            "Biology",
            "Statistics",
            "Botany",
            "Zoology",
            "Microbiology",
            "Biochemistry",
            "Environmental Science",
            "Geology",
            "Astronomy"
        ],
        "Arts & Humanities": [
            "English Literature",
            "Hindi Literature",
            "History",
            "Political Science",
            "Philosophy",
            "Sanskrit",
            "Linguistics",
            "Fine Arts",
            "Music",
            "Dance",
            "Theatre Arts",
            "Archaeology",
            "Cultural Studies"
        ],
        "Social Sciences": [
            "Psychology",
            "Sociology", 
            "Anthropology",
            "Geography",
            "Public Administration",
            "Social Work",
            "International Relations",
            "Criminology",
            "Women Studies",
            "Rural Studies",
            "Urban Planning"
        ],
        "Law & Legal Studies": [
            "Constitutional Law",
            "Criminal Law",
            "Civil Law",
            "Corporate Law",
            "International Law",
            "Property Law",
            "Family Law",
            "Labor Law",
            "Environmental Law",
            "Intellectual Property Law"
        ],
        "Agriculture & Life Sciences": [
            "Agriculture",
            "Horticulture", 
            "Forestry",
            "Fisheries",
            "Animal Husbandry",
            "Dairy Science",
            "Agricultural Engineering",
            "Food Technology",
            "Soil Science",
            "Plant Pathology",
            "Entomology"
        ],
        "Education & Teaching": [
            "Education",
            "Elementary Education",
            "Secondary Education",
            "Physical Education",
            "Special Education",
            "Educational Psychology",
            "Curriculum Studies",
            "Educational Technology",
            "Adult Education"
        ],
        "Architecture & Design": [
            "Architecture", 
            "Interior Design",
            "Fashion Design",
            "Graphic Design",
            "Industrial Design",
            "Landscape Architecture",
            "Urban Design",
            "Product Design"
        ],
        "Mass Communication & Media": [
            "Journalism",
            "Mass Communication",
            "Advertising", 
            "Public Relations",
            "Film Studies",
            "Television Production",
            "Digital Media",
            "Photography"
        ]
    };

    // Get all subjects for the selected category
    const getSubjectsForCategory = (category) => {
        if (category === 'All') {
            const allSubjects = Object.values(subjectCategories)
                .flat()
                .filter(subject => subject !== undefined);
            return allSubjects;
        }
        return subjectCategories[category] || [];
    };

    // Current subjects based on selected category
    const subjects = getSubjectsForCategory(selectedCategory);

    const categories = [
        "general",
        "tutorial",
        "reference",
        "study-guide",
        "assignment",
        "project",
        "research"
    ];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleCategoryChange = (e) => {
        const newCategory = e.target.value;
        setSelectedCategory(newCategory);
        // Reset subject when category changes
        setFormData(prev => ({
            ...prev,
            subject: ''
        }));
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        const validFiles = files.filter(file => {
            const validTypes = ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB limit
        });

        setFormData(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...validFiles]
        }));
    };

    // Remove existing attachment
    const removeExistingAttachment = (index) => {
        setExistingAttachments(prev => prev.filter((_, i) => i !== index));
    };

    const removeAttachment = (index) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (!formData.subject) {
            newErrors.subject = 'Subject is required';
        }

        if (!formData.content.trim()) {
            newErrors.content = 'Content is required';
        }

        if (formData.tags && formData.tags.split(',').length > 10) {
            newErrors.tags = 'Maximum 10 tags allowed';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        // If editing, use update handler
        if (editingNote) {
            return handleUpdateNote(e);
        }

        setIsSubmitting(true);
        setSubmitMessage('');

        try {
            const fd = new FormData();
            fd.append('title', formData.title);
            fd.append('description', formData.description);
            fd.append('subject', formData.subject);
            fd.append('tags', formData.tags); // backend will process to array
            fd.append('content', formData.content);
            fd.append('visibility', formData.visibility);
            fd.append('category', formData.category);

            formData.attachments.forEach((file) => {
                fd.append('attachments', file, file.name);
            });

            const res = await fetch('http://localhost:5000/api/notes', {
                method: 'POST',
                body: fd
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.message || 'Upload failed');
            }

            setSubmitMessage('Note uploaded successfully!');
            setFormData({
                title: '',
                description: '',
                subject: '',
                tags: '',
                content: '',
                attachments: [],
                visibility: 'public',
                category: 'general'
            });
            fetchNotes(); // Refresh the notes list
        } catch (error) {
            setSubmitMessage('Error uploading note. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDraft = () => {
        const draftData = {
            ...formData,
            savedAt: new Date().toISOString()
        };
        localStorage.setItem('noteDraft', JSON.stringify(draftData));
        setSubmitMessage('Draft saved successfully!');
    };

    const loadDraft = () => {
        const draft = localStorage.getItem('noteDraft');
        if (draft) {
            const draftData = JSON.parse(draft);
            setFormData(draftData);
            setSubmitMessage('Draft loaded successfully!');
        }
    };

    // Fetch notes from backend
    const fetchNotes = useCallback(async () => {
        setIsLoadingNotes(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery.trim()) params.append('q', searchQuery.trim());
            if (filterSubject && filterSubject !== 'All') params.append('subject', filterSubject);
            
            const response = await fetch(`http://localhost:5000/api/notes?${params.toString()}`);
            const data = await response.json();
            
            if (data.success) {
                setNotes(data.notes);
            } else {
                console.error('Failed to fetch notes:', data.message);
            }
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            setIsLoadingNotes(false);
        }
    }, [searchQuery, filterSubject]);

    // Load notes on component mount
    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    // Reload notes when search query or filter changes
    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            fetchNotes();
        }, 500);
        
        return () => clearTimeout(delayedSearch);
    }, [fetchNotes]);

    // Edit note function
    const handleEditNote = async (note) => {
        setIsLoadingNoteDetails(true);
        try {
            // Fetch complete note details
            const response = await fetch(`http://localhost:5000/api/notes/${note.id}`);
            const data = await response.json();
            
            if (data.success) {
                const fullNote = data.note;
                setEditingNote(fullNote);
                setFormData({
                    title: fullNote.title,
                    description: fullNote.description,
                    subject: fullNote.subject,
                    tags: Array.isArray(fullNote.tags) ? fullNote.tags.join(', ') : '',
                    content: fullNote.content || '',
                    attachments: [], // New attachments to be uploaded
                    visibility: fullNote.visibility || 'public',
                    category: fullNote.category || 'general'
                });
                
                // Set existing attachments
                setExistingAttachments(fullNote.attachments || []);
                
                // Set the appropriate category for the subject
                const categoryForSubject = Object.keys(subjectCategories).find(cat => 
                    subjectCategories[cat].includes(fullNote.subject)
                );
                if (categoryForSubject) {
                    setSelectedCategory(categoryForSubject);
                }
            } else {
                setSubmitMessage('Error loading note details. Please try again.');
            }
        } catch (error) {
            console.error('Error fetching note details:', error);
            setSubmitMessage('Error loading note details. Please try again.');
        } finally {
            setIsLoadingNoteDetails(false);
        }
        
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Cancel editing
    const cancelEdit = () => {
        setEditingNote(null);
        setExistingAttachments([]);
        setFormData({
            title: '',
            description: '',
            subject: '',
            tags: '',
            content: '',
            attachments: [],
            visibility: 'public',
            category: 'general'
        });
        setSelectedCategory('All');
    };

    // Update note function
    const handleUpdateNote = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        setSubmitMessage('');

        try {
            const fd = new FormData();
            fd.append('title', formData.title);
            fd.append('description', formData.description);
            fd.append('subject', formData.subject);
            fd.append('tags', formData.tags);
            fd.append('content', formData.content);
            fd.append('visibility', formData.visibility);
            fd.append('category', formData.category);
            
            // Include existing attachments that weren't removed
            fd.append('existingAttachments', JSON.stringify(existingAttachments));

            // Add new attachment files
            formData.attachments.forEach((file) => {
                fd.append('attachments', file, file.name);
            });

            const response = await fetch(`http://localhost:5000/api/notes/${editingNote.id}`, {
                method: 'PUT',
                body: fd
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Update failed');
            }

            setSubmitMessage('Note updated successfully!');
            cancelEdit();
            fetchNotes(); // Refresh the notes list
        } catch (error) {
            setSubmitMessage('Error updating note. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete note function
    const handleDeleteNote = async (noteId) => {
        if (!window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/notes/${noteId}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (response.ok && data.success) {
                fetchNotes(); // Refresh the notes list
                setSubmitMessage('Note deleted successfully!');
                // If we're editing the deleted note, cancel editing
                if (editingNote && editingNote.id === noteId) {
                    cancelEdit();
                }
            } else {
                throw new Error(data.message || 'Delete failed');
            }
        } catch (error) {
            setSubmitMessage('Error deleting note. Please try again.');
        }
    };

    return (
        <div className="admin-upload-container">
            <div className="container">
                <div className="upload-header">
                    <h1>{editingNote ? 'Edit Note' : (user?.role === 'faculty' ? 'Upload New Note' : 'Manage Notes')}</h1>
                    <p>{editingNote ? 'Update your note information' : (user?.role === 'faculty' ? 'Create and share educational content with students' : 'Upload new notes or manage existing content')}</p>
                    {editingNote && (
                        <div className="edit-notice">
                            <span>Editing: {editingNote.title}</span>
                            <button type="button" className="cancel-edit-btn" onClick={cancelEdit}>
                                Cancel Edit
                            </button>
                        </div>
                    )}
                    {isLoadingNoteDetails && (
                        <div className="loading-notice">
                            <div className="loading-spinner small"></div>
                            <span>Loading note details...</span>
                        </div>
                    )}
                </div>

                <div className="upload-content">
                    <form onSubmit={handleSubmit} className="upload-form">
                        {/* Basic Information */}
                        <div className="form-section">
                            <h2>Basic Information</h2>
                            
                            <div className="form-group">
                                <label htmlFor="title" className="form-label">
                                    Note Title *
                                </label>
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    className={`form-input ${errors.title ? 'error' : ''}`}
                                    placeholder="Enter a descriptive title for your note"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                />
                                {errors.title && <span className="error-text">{errors.title}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="description" className="form-label">
                                    Description *
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    className={`form-textarea ${errors.description ? 'error' : ''}`}
                                    placeholder="Provide a brief description of what this note covers"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows="3"
                                />
                                {errors.description && <span className="error-text">{errors.description}</span>}
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="subjectCategory" className="form-label">
                                        Subject Category *
                                    </label>
                                    <select
                                        id="subjectCategory"
                                        name="subjectCategory"
                                        className="form-select"
                                        value={selectedCategory}
                                        onChange={handleCategoryChange}
                                    >
                                        {Object.keys(subjectCategories).map((category, index) => (
                                            <option key={index} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="subject" className="form-label">
                                        Subject *
                                    </label>
                                    <select
                                        id="subject"
                                        name="subject"
                                        className={`form-select ${errors.subject ? 'error' : ''}`}
                                        value={formData.subject}
                                        onChange={handleInputChange}
                                        disabled={selectedCategory === 'All'}
                                    >
                                        <option value="">{selectedCategory === 'All' ? 'Select a category first' : 'Select a subject'}</option>
                                        {subjects.map((subject, index) => (
                                            <option key={index} value={subject}>
                                                {subject}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.subject && <span className="error-text">{errors.subject}</span>}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="category" className="form-label">
                                    Note Type
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    className="form-select"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                >
                                    {categories.map((category, index) => (
                                        <option key={index} value={category}>
                                            {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="tags" className="form-label">
                                    Tags (comma-separated)
                                </label>
                                <input
                                    id="tags"
                                    name="tags"
                                    type="text"
                                    className={`form-input ${errors.tags ? 'error' : ''}`}
                                    placeholder="e.g., React, JavaScript, Frontend Development"
                                    value={formData.tags}
                                    onChange={handleInputChange}
                                />
                                {errors.tags && <span className="error-text">{errors.tags}</span>}
                                <small className="form-hint">Add relevant tags to help users find your note</small>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="form-section">
                            <h2>Note Content</h2>
                            
                            <div className="form-group">
                                <label htmlFor="content" className="form-label">
                                    Content *
                                </label>
                                <textarea
                                    id="content"
                                    name="content"
                                    className={`form-textarea content-textarea ${errors.content ? 'error' : ''}`}
                                    placeholder="Write your note content here..."
                                    value={formData.content}
                                    onChange={handleInputChange}
                                    rows="15"
                                />
                                {errors.content && <span className="error-text">{errors.content}</span>}
                            </div>
                        </div>

                        {/* File Attachments */}
                        <div className="form-section">
                            <h2>File Attachments</h2>
                            
                            <div className="form-group">
                                <label htmlFor="attachments" className="form-label">
                                    Upload Files
                                </label>
                                <div
                                    className="file-upload-area"
                                    role="button"
                                    tabIndex="0"
                                    onClick={() => fileInputRef.current?.click()}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            fileInputRef.current?.click();
                                        }
                                    }}
                                    aria-label="Open file picker to upload attachments"
                                >
                                    <input
                                        id="attachments"
                                        name="attachments"
                                        type="file"
                                        className="file-input"
                                        multiple
                                        accept=".pdf,.txt,.doc,.docx"
                                        onChange={handleFileUpload}
                                        ref={fileInputRef}
                                    />
                                    <div className="file-upload-content">
                                        <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="32" height="32">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <p>Click to upload files or drag and drop</p>
                                        <small>PDF, DOC, DOCX, TXT files up to 10MB</small>
                                    </div>
                                </div>
                                
                                {/* Existing Attachments (when editing) */}
                                {editingNote && existingAttachments.length > 0 && (
                                    <div className="existing-attachments">
                                        <h4>Current Attachments:</h4>
                                        {existingAttachments.map((attachment, index) => (
                                            <div key={index} className="attachment-item existing">
                                                <svg className="file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span className="file-name">
                                                    {attachment.original_filename}
                                                    {attachment.format ? `.${attachment.format}` : ''}
                                                </span>
                                                <span className="file-size">
                                                    ({(attachment.bytes / 1024 / 1024).toFixed(2)} MB)
                                                </span>
                                                <div className="attachment-actions">
                                                    <a 
                                                        href={attachment.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="view-attachment-btn"
                                                        title="View attachment"
                                                    >
                                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </a>
                                                    <button
                                                        type="button"
                                                        className="remove-file-btn"
                                                        onClick={() => removeExistingAttachment(index)}
                                                        title="Remove attachment"
                                                    >
                                                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {/* New Attachments */}
                                {formData.attachments.length > 0 && (
                                    <div className="attachment-list">
                                        <h4>{editingNote ? 'New Attachments:' : 'Uploaded Files:'}</h4>
                                        {formData.attachments.map((file, index) => (
                                            <div key={index} className="attachment-item">
                                                <svg className="file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                <span className="file-name">{file.name}</span>
                                                <span className="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                                                <button
                                                    type="button"
                                                    className="remove-file-btn"
                                                    onClick={() => removeAttachment(index)}
                                                >
                                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Settings */}
                        <div className="form-section">
                            <h2>Settings</h2>
                            
                            <div className="form-group">
                                <label htmlFor="visibility" className="form-label">
                                    Visibility
                                </label>
                                <select
                                    id="visibility"
                                    name="visibility"
                                    className="form-select"
                                    value={formData.visibility}
                                    onChange={handleInputChange}
                                >
                                    <option value="public">Public - Visible to all users</option>
                                    <option value="private">Private - Only visible to you</option>
                                    <option value="restricted">Restricted - Visible to specific users</option>
                                </select>
                            </div>
                        </div>

                        {/* Submit Message */}
                        {submitMessage && (
                            <div className={`submit-message ${submitMessage.includes('Error') ? 'error' : 'success'}`}>
                                {submitMessage}
                            </div>
                        )}

                        {/* Form Actions */}
                        <div className="form-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={handleDraft}
                                disabled={isSubmitting}
                            >
                                Save as Draft
                            </button>
                            
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={loadDraft}
                                disabled={isSubmitting}
                            >
                                Load Draft
                            </button>
                            
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="loading-spinner small"></div>
                                        {editingNote ? 'Updating...' : 'Uploading...'}
                                    </>
                                ) : (
                                    editingNote ? 'Update Note' : 'Upload Note'
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Preview Section */}
                    <div className="preview-section">
                        <h2>Preview</h2>
                        <div className="note-preview-card">
                            <div className="preview-header">
                                <div className="subject-badge">
                                    {formData.subject || 'Subject'}
                                </div>
                            </div>
                            
                            <div className="preview-content">
                                <h3 className="preview-title">
                                    {formData.title || 'Note Title'}
                                </h3>
                                <p className="preview-description">
                                    {formData.description || 'Note description will appear here...'}
                                </p>
                                
                                {formData.tags && (
                                    <div className="preview-tags">
                                        {formData.tags.split(',').map((tag, index) => (
                                            <span key={index} className="preview-tag">
                                                #{tag.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                
                                <div className="preview-meta">
                                    <span>Category: {formData.category}</span>
                                    <span>Visibility: {formData.visibility}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes Management Section - Only for Admin */}
                {user?.role === 'admin' && (
                    <div className="notes-management-section">
                        <div className="notes-management-header">
                            <h2>Manage Existing Notes</h2>
                            <p>Edit, update, or delete your uploaded notes</p>
                        </div>

                        {/* Search and Filter */}
                        <div className="notes-filters">
                            <div className="search-bar">
                                <input
                                    type="text"
                                    placeholder="Search notes by title, description, or tags..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                            <div className="filter-select">
                                <select
                                    value={filterSubject}
                                    onChange={(e) => setFilterSubject(e.target.value)}
                                    className="form-select"
                                >
                                    <option value="All">All Subjects</option>
                                    {Object.values(subjectCategories)
                                        .flat()
                                        .filter(subject => subject !== undefined)
                                        .sort()
                                        .map((subject, index) => (
                                            <option key={index} value={subject}>
                                                {subject}
                                            </option>
                                        ))}
                                </select>
                            </div>
                        </div>

                        {/* Notes List */}
                        <div className="notes-list">
                            {isLoadingNotes ? (
                                <div className="loading-container">
                                    <div className="loading-spinner"></div>
                                    <p>Loading notes...</p>
                                </div>
                            ) : notes.length === 0 ? (
                                <div className="no-notes">
                                    <p>No notes found{searchQuery || filterSubject !== 'All' ? ' matching your criteria' : ''}.</p>
                                    {searchQuery || filterSubject !== 'All' ? (
                                        <button 
                                            onClick={() => {
                                                setSearchQuery('');
                                                setFilterSubject('All');
                                            }}
                                            className="btn btn-outline"
                                        >
                                            Clear filters
                                        </button>
                                    ) : null}
                                </div>
                            ) : (
                                <div className="notes-grid">
                                    {notes.map((note) => (
                                        <div key={note.id} className={`note-card ${editingNote?.id === note.id ? 'editing' : ''}`}>
                                            <div className="note-header">
                                                <div className="subject-badge">
                                                    {note.subject}
                                                </div>
                                                <div className="note-actions">
                                                    <button
                                                        onClick={() => handleEditNote(note)}
                                                        className="btn btn-sm btn-outline"
                                                        disabled={editingNote?.id === note.id}
                                                    >
                                                        {editingNote?.id === note.id ? 'Editing' : 'Edit'}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteNote(note.id)}
                                                        className="btn btn-sm btn-danger"
                                                        disabled={isSubmitting}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                            
                                            <div className="note-content">
                                                <h3 className="note-title">{note.title}</h3>
                                                <p className="note-description">{note.description}</p>
                                                
                                                {note.tags && note.tags.length > 0 && (
                                                    <div className="note-tags">
                                                        {note.tags.map((tag, index) => (
                                                            <span key={index} className="note-tag">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                
                                                <div className="note-meta">
                                                    <div className="meta-item">
                                                        <span>Category: {note.category || 'general'}</span>
                                                    </div>
                                                    <div className="meta-item">
                                                        <span>Visibility: {note.visibility || 'public'}</span>
                                                    </div>
                                                    <div className="meta-item">
                                                        <span>Upload Date: {note.uploadDate ? new Date(note.uploadDate).toLocaleDateString() : 'Unknown'}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="note-stats">
                                                    <div className="stat-item">
                                                        <span>👁️ {note.views || 0} views</span>
                                                    </div>
                                                    <div className="stat-item">
                                                        <span>📥 {note.downloads || 0} downloads</span>
                                                    </div>
                                                    {note.attachments && note.attachments.length > 0 && (
                                                        <div className="stat-item">
                                                            <span>📎 {note.attachments.length} file{note.attachments.length > 1 ? 's' : ''}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUploadNotes;
