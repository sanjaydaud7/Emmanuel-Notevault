import React, { useState } from 'react';
import '../styles/UploadNotes.css';

const UploadNotes = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subject: '',
        tags: '',
        noteContent: '',
        file: null,
        isPublic: true
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [dragActive, setDragActive] = useState(false);

    // Available subjects
    const subjects = [
        "Artificial Intelligence",
        "Art History",
        "Biology",
        "Chemistry",
        "Cloud Computing",
        "Data Management",
        "Development",
        "E-Commerce",
        "Economics",
        "Geography",
        "History",
        "Literature",
        "Mathematics",
        "Networking",
        "Philosophy",
        "Physics",
        "Programming",
        "Psychology",
        "Sociology",
        "Software Engineering",
        "Systems"
    ];

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                setErrors(prev => ({
                    ...prev,
                    file: 'File size must be less than 10MB'
                }));
                return;
            }

            // Validate file type
            const allowedTypes = [
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'text/plain',
                'application/vnd.ms-powerpoint',
                'application/vnd.openxmlformats-officedocument.presentationml.presentation'
            ];

            if (!allowedTypes.includes(file.type)) {
                setErrors(prev => ({
                    ...prev,
                    file: 'Only PDF, DOC, DOCX, TXT, PPT, and PPTX files are allowed'
                }));
                return;
            }

            setFormData(prev => ({
                ...prev,
                file: file
            }));

            if (errors.file) {
                setErrors(prev => ({
                    ...prev,
                    file: ''
                }));
            }
        }
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            const event = {
                target: {
                    files: [file]
                }
            };
            handleFileChange(event);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        } else if (formData.title.length < 3) {
            newErrors.title = 'Title must be at least 3 characters long';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.length < 10) {
            newErrors.description = 'Description must be at least 10 characters long';
        }

        if (!formData.subject) {
            newErrors.subject = 'Please select a subject';
        }

        if (!formData.tags.trim()) {
            newErrors.tags = 'At least one tag is required';
        }

        if (!formData.noteContent.trim() && !formData.file) {
            newErrors.noteContent = 'Please provide note content or upload a file';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setUploadProgress(0);

        try {
            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return prev;
                    }
                    return prev + 10;
                });
            }, 200);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            setUploadProgress(100);
            clearInterval(progressInterval);

            // Success notification
            alert('Note uploaded successfully!');
            
            // Reset form
            setFormData({
                title: '',
                description: '',
                subject: '',
                tags: '',
                noteContent: '',
                file: null,
                isPublic: true
            });

            // Reset file input
            const fileInput = document.getElementById('file-upload');
            if (fileInput) {
                fileInput.value = '';
            }

        } catch (error) {
            alert('Upload failed. Please try again.');
        } finally {
            setIsSubmitting(false);
            setUploadProgress(0);
        }
    };

    const removeFile = () => {
        setFormData(prev => ({
            ...prev,
            file: null
        }));
        const fileInput = document.getElementById('file-upload');
        if (fileInput) {
            fileInput.value = '';
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="upload-notes-container">
            <div className="container">
                <div className="upload-header">
                    <h1>Upload Notes</h1>
                    <p>Share your knowledge with the community</p>
                </div>

                <form onSubmit={handleSubmit} className="upload-form">
                    {/* Basic Information Section */}
                    <section className="form-section">
                        <h2>Basic Information</h2>
                        
                        <div className="form-group">
                            <label htmlFor="title" className="form-label required">
                                Note Title
                            </label>
                            <input
                                type="text"
                                id="title"
                                name="title"
                                className={`form-input ${errors.title ? 'error' : ''}`}
                                placeholder="Enter a descriptive title for your notes"
                                value={formData.title}
                                onChange={handleInputChange}
                                maxLength="100"
                            />
                            {errors.title && <span className="error-message">{errors.title}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="description" className="form-label required">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                className={`form-textarea ${errors.description ? 'error' : ''}`}
                                placeholder="Provide a brief description of what these notes cover"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows="4"
                                maxLength="500"
                            />
                            <div className="char-counter">
                                {formData.description.length}/500
                            </div>
                            {errors.description && <span className="error-message">{errors.description}</span>}
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="subject" className="form-label required">
                                    Subject
                                </label>
                                <select
                                    id="subject"
                                    name="subject"
                                    className={`form-select ${errors.subject ? 'error' : ''}`}
                                    value={formData.subject}
                                    onChange={handleInputChange}
                                >
                                    <option value="">Select a subject</option>
                                    {subjects.map((subject, index) => (
                                        <option key={index} value={subject}>
                                            {subject}
                                        </option>
                                    ))}
                                </select>
                                {errors.subject && <span className="error-message">{errors.subject}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="tags" className="form-label required">
                                    Tags
                                </label>
                                <input
                                    type="text"
                                    id="tags"
                                    name="tags"
                                    className={`form-input ${errors.tags ? 'error' : ''}`}
                                    placeholder="e.g., react, javascript, frontend (comma separated)"
                                    value={formData.tags}
                                    onChange={handleInputChange}
                                />
                                {errors.tags && <span className="error-message">{errors.tags}</span>}
                            </div>
                        </div>
                    </section>

                    {/* Content Section */}
                    <section className="form-section">
                        <h2>Note Content</h2>
                        
                        {/* File Upload */}
                        <div className="form-group">
                            <label className="form-label">
                                Upload File (Optional)
                            </label>
                            <div 
                                className={`file-upload-area ${dragActive ? 'drag-active' : ''} ${errors.file ? 'error' : ''}`}
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                            >
                                {formData.file ? (
                                    <div className="file-info">
                                        <div className="file-details">
                                            <svg className="file-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <div className="file-meta">
                                                <span className="file-name">{formData.file.name}</span>
                                                <span className="file-size">{formatFileSize(formData.file.size)}</span>
                                            </div>
                                        </div>
                                        <button 
                                            type="button" 
                                            className="remove-file-btn"
                                            onClick={removeFile}
                                        >
                                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ) : (
                                    <div className="upload-placeholder">
                                        <svg className="upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <p>Drag and drop your file here, or click to browse</p>
                                        <p className="upload-hint">PDF, DOC, DOCX, TXT, PPT, PPTX (Max 10MB)</p>
                                        <input
                                            type="file"
                                            id="file-upload"
                                            className="file-input"
                                            onChange={handleFileChange}
                                            accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                                        />
                                    </div>
                                )}
                            </div>
                            {errors.file && <span className="error-message">{errors.file}</span>}
                        </div>

                        {/* Text Content */}
                        <div className="form-group">
                            <label htmlFor="noteContent" className="form-label">
                                Note Content (Optional if file is provided)
                            </label>
                            <textarea
                                id="noteContent"
                                name="noteContent"
                                className={`form-textarea content-textarea ${errors.noteContent ? 'error' : ''}`}
                                placeholder="Write your notes content here..."
                                value={formData.noteContent}
                                onChange={handleInputChange}
                                rows="12"
                            />
                            {errors.noteContent && <span className="error-message">{errors.noteContent}</span>}
                        </div>
                    </section>

                    {/* Settings Section */}
                    <section className="form-section">
                        <h2>Sharing Settings</h2>
                        
                        <div className="form-group">
                            <div className="checkbox-group">
                                <input
                                    type="checkbox"
                                    id="isPublic"
                                    name="isPublic"
                                    className="form-checkbox"
                                    checked={formData.isPublic}
                                    onChange={handleInputChange}
                                />
                                <label htmlFor="isPublic" className="checkbox-label">
                                    Make this note publicly available
                                    <span className="checkbox-description">
                                        Other users will be able to view and download this note
                                    </span>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Submit Section */}
                    <section className="form-section">
                        {isSubmitting && (
                            <div className="progress-container">
                                <div className="progress-bar">
                                    <div 
                                        className="progress-fill" 
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                                <span className="progress-text">{uploadProgress}% uploaded</span>
                            </div>
                        )}

                        <div className="form-actions">
                            <button 
                                type="button" 
                                className="btn btn-secondary"
                                onClick={() => {
                                    if (window.confirm('Are you sure you want to cancel? All changes will be lost.')) {
                                        // Navigate back or reset form
                                        window.history.back();
                                    }
                                }}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="btn btn-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="spinner" fill="none" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
                                            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" opacity="0.75" />
                                        </svg>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <svg className="upload-submit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        Upload Notes
                                    </>
                                )}
                            </button>
                        </div>
                    </section>
                </form>
            </div>
        </div>
    );
};

export default UploadNotes;
