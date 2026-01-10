import React, { useState, useEffect } from 'react';
import '../styles/BrowseNotes.css';

// Remove local sampleNotes; add API base
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000';

// Helper: get first attachment
const getFirstAttachment = (note) => (Array.isArray(note.attachments) ? note.attachments[0] : null);

// Helper: insert Cloudinary transformation (e.g., fl_attachment) right after /upload/
const addCloudinaryTransformation = (url, transformation) => {
    const idx = url.indexOf('/upload/');
    if (idx === -1) return url;
    return url.slice(0, idx + 8) + transformation + '/' + url.slice(idx + 8);
};

// Helper: compute Cloudinary download URL with filename
const computeDownloadUrl = (attachment) => {
    if (!attachment?.url) return null;
    const name = attachment.original_filename
        ? (attachment.format ? `${attachment.original_filename}.${attachment.format}` : attachment.original_filename)
        : undefined;
    const t = name ? `fl_attachment:${encodeURIComponent(name)}` : 'fl_attachment';
    return addCloudinaryTransformation(attachment.url, t);
};

const BrowseNotes = () => {
    // State for search and filter
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedSubject, setSelectedSubject] = useState('All');
    const [notes, setNotes] = useState([]);
    const [filteredNotes, setFilteredNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // Categories with their subjects
    const categories = {
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
            const allSubjects = Object.values(categories)
                .flat()
                .filter(subject => subject !== undefined);
            return ['All', ...allSubjects];
        }
        return ['All', ...categories[category]];
    };

    // Current subjects based on selected category
    const subjects = getSubjectsForCategory(selectedCategory);

    // Initialize notes: fetch from backend
    useEffect(() => {
        setIsLoading(true);
        fetch(`${API_BASE}/api/notes`)
            .then(res => res.json())
            .then(data => {
                if (data?.success && Array.isArray(data.notes)) {
                    setNotes(data.notes);
                    setFilteredNotes(data.notes);
                } else {
                    setNotes([]);
                    setFilteredNotes([]);
                    console.error('Unexpected response', data);
                }
            })
            .catch(err => {
                console.error('Failed to fetch notes', err);
                setNotes([]);
                setFilteredNotes([]);
            })
            .finally(() => setIsLoading(false));
    }, []);

    // Filter notes based on search, category, and subject
    useEffect(() => {
        let filtered = [...notes];
        
        // Filter by category first
        if (selectedCategory !== 'All') {
            const categorySubjects = categories[selectedCategory];
            filtered = filtered.filter(note => categorySubjects.includes(note.subject));
        }
        
        // Filter by subject
        if (selectedSubject !== 'All') {
            filtered = filtered.filter(note => note.subject === selectedSubject);
        }
        
        // Filter by search query
        if (searchQuery.trim() !== '') {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(note => 
                note.title.toLowerCase().includes(query) ||
                note.description.toLowerCase().includes(query) ||
                note.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }
        
        setFilteredNotes(filtered);
    }, [searchQuery, selectedCategory, selectedSubject, notes, categories]);

    const handleSearch = (e) => {
        e.preventDefault();
        // Filtering is already handled by useEffect
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const handleCategoryChange = (e) => {
        const newCategory = e.target.value;
        setSelectedCategory(newCategory);
        // Reset subject when category changes
        setSelectedSubject('All');
    };

    const handleSubjectChange = (e) => {
        setSelectedSubject(e.target.value);
    };

    // Change: open Cloudinary URL in a new tab if available; fallback to backend redirect
    const viewNote = (note) => {
        const a = getFirstAttachment(note);
        if (a?.url) {
            window.open(a.url, '_blank', 'noopener,noreferrer');
            return;
        }
        const url = `${API_BASE}/api/notes/${note.id}/view`;
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    // Enhanced download function with better error handling
    const downloadNote = async (note) => {
        try {
            const a = getFirstAttachment(note);
            let url, filename;

            if (a?.url) {
                // Try direct Cloudinary download first
                url = a.url;
                filename = a.original_filename 
                    ? (a.format ? `${a.original_filename}.${a.format}` : a.original_filename)
                    : `${note.title}.${a.format || 'pdf'}`;
            } else {
                // Fallback to backend proxy
                url = `${API_BASE}/api/notes/${note.id}/download`;
                filename = `${note.title}.pdf`;
            }

            // Use fetch for better error handling
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': '*/*',
                }
            });

            if (!response.ok) {
                throw new Error(`Download failed: ${response.status}`);
            }

            // Get the blob and create download link
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            link.style.display = 'none';
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up the blob URL
            window.URL.revokeObjectURL(downloadUrl);
            
        } catch (error) {
            console.error('Download failed:', error);
            // Fallback: try opening in new tab as last resort
            const a = getFirstAttachment(note);
            if (a?.url) {
                window.open(a.url, '_blank', 'noopener,noreferrer');
            } else {
                alert('Download failed. Please try again later.');
            }
        }
    };

    return (
        <div className="browse-notes-container">
            <div className="container">
                {/* Search Filter Section */}
                <section className="search-filter-section">
                    <form className="search-filter-form" onSubmit={handleSearch}>
                        <div className="search-filter-grid">
                            <div className="search-input-wrapper">
                                <label htmlFor="search" className="form-label">
                                    Search Notes
                                </label>
                                <div className="search-input-container">
                                    <input
                                        id="search"
                                        type="text"
                                        placeholder="Search by title, content, or tags..."
                                        className="form-input search-input"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    {searchQuery && (
                                        <button 
                                            type="button" 
                                            className="clear-button"
                                            onClick={handleClearSearch}
                                        >
                                            <svg className="clear-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="category-filter-wrapper">
                                <label htmlFor="category" className="form-label">
                                    Filter by Category
                                </label>
                                <select 
                                    id="category" 
                                    className="form-select"
                                    value={selectedCategory}
                                    onChange={handleCategoryChange}
                                >
                                    {Object.keys(categories).map((category, index) => (
                                        <option key={index} value={category}>
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="subject-filter-wrapper">
                                <label htmlFor="subject" className="form-label">
                                    Filter by Subject
                                </label>
                                <select 
                                    id="subject" 
                                    className="form-select"
                                    value={selectedSubject}
                                    onChange={handleSubjectChange}
                                >
                                    {subjects.map((subject, index) => (
                                        <option key={index} value={subject}>
                                            {subject}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div className="submit-button-wrapper">
                            <button type="submit" className="submit-button">
                                <svg className="submit-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                Apply Filters
                            </button>
                        </div>
                    </form>
                </section>

                {/* Results Count */}
                <div className="results-count">
                    <p>
                        Found <span className="count-number">{filteredNotes.length}</span> note{filteredNotes.length !== 1 ? 's' : ''}
                        {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                        {selectedSubject !== 'All' && ` for ${selectedSubject}`}
                        {searchQuery && ` matching "${searchQuery}"`}
                    </p>
                </div>

                {/* Note Cards Section */}
                <section className="note-cards-section">
                    {isLoading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Loading notes...</p>
                        </div>
                    ) : filteredNotes.length > 0 ? (
                        <div className="note-cards-grid">
                            {filteredNotes.map(note => (
                                <div key={note.id} className="note-card">
                                    <div className="note-card-header">
                                        <div className="subject-badge">
                                            {note.subject}
                                        </div>
                                        <div className="note-rating">
                                            <svg className="star-icon" fill="currentColor" viewBox="0 0 20 20" width="16" height="16">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                            <span>{note.rating}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="note-card-content">
                                        <h3 className="note-title">{note.title}</h3>
                                        <p className="note-description">{note.description}</p>
                                        
                                        <div className="note-tags">
                                            {note.tags.map((tag, index) => (
                                                <span key={index} className="note-tag">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                        
                                        <div className="note-meta">
                                            <div className="meta-item">
                                                <svg className="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                <span>{note.uploader}</span>
                                            </div>
                                            <div className="meta-item">
                                                <svg className="meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span>{note.uploadDate}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="note-stats">
                                            <div className="stat-item">
                                                <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                <span>{note.views} views</span>
                                            </div>
                                            <div className="stat-item">
                                                <svg className="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                <span>{note.downloads} downloads</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="note-card-actions">
                                        <button 
                                            className="action-btn view-btn"
                                            onClick={() => viewNote(note)}
                                        >
                                            <svg className="action-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                            View
                                        </button>
                                        <button 
                                            className="action-btn download-btn"
                                            onClick={() => downloadNote(note)}
                                        >
                                            <span>Download</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <svg className="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" width="64" height="64">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h3>No notes found</h3>
                            <p>Try adjusting your search or filter criteria</p>
                            <button 
                                className="reset-btn"
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedCategory('All');
                                    setSelectedSubject('All');
                                }}
                            >
                                Reset Filters
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default BrowseNotes;