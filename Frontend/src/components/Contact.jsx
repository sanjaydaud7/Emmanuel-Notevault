import React, { useState } from 'react';
import '../styles/Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission logic here
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    });
  };

  return (
    <div className="contact-container">
      <div className="contact-header">
        <h1>Contact Us</h1>
        <p>Get in touch with us for any inquiries or support</p>
      </div>

      <div className="contact-content">
        <div className="company-info">
          <div className="info-section">
            <h2>Company Information</h2>
            <div className="company-details">
              <h3>Emmanuel Tech Solutions</h3>
              <p>Leading provider of innovative technology solutions and software development services.</p>
            </div>
          </div>

          <div className="info-section">
            <h3>Contact Details</h3>
            <div className="contact-item">
              <i className="icon-phone"></i>
              <div>
                <strong>Phone:</strong>
                <p>+1 (555) 123-4567</p>
                <p>+1 (555) 987-6543</p>
              </div>
            </div>
            
            <div className="contact-item">
              <i className="icon-email"></i>
              <div>
                <strong>Email:</strong>
                <p>info@emmanueltech.com</p>
                <p>support@emmanueltech.com</p>
              </div>
            </div>

            <div className="contact-item">
              <i className="icon-location"></i>
              <div>
                <strong>Address:</strong>
                <p>123 Technology Drive</p>
                <p>Innovation District</p>
                <p>San Francisco, CA 94105</p>
                <p>United States</p>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h3>Business Hours</h3>
            <div className="hours">
              <p><strong>Monday - Friday:</strong> 9:00 AM - 6:00 PM</p>
              <p><strong>Saturday:</strong> 10:00 AM - 4:00 PM</p>
              <p><strong>Sunday:</strong> Closed</p>
            </div>
          </div>

          <div className="info-section">
            <h3>Follow Us</h3>
            <div className="social-links">
              <a href="#" className="social-link">
                <i className="icon-linkedin"></i> LinkedIn
              </a>
              <a href="#" className="social-link">
                <i className="icon-twitter"></i> Twitter
              </a>
              <a href="#" className="social-link">
                <i className="icon-facebook"></i> Facebook
              </a>
              <a href="#" className="social-link">
                <i className="icon-instagram"></i> Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="contact-form-section">
          <h2>Send us a Message</h2>
          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="subject">Subject *</label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="support">Technical Support</option>
                  <option value="sales">Sales</option>
                  <option value="partnership">Partnership</option>
                  <option value="career">Career Opportunities</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                rows="6"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Please describe your inquiry or message..."
                required
              ></textarea>
            </div>

            <button type="submit" className="submit-btn">
              Send Message
            </button>
          </form>
        </div>
      </div>

      <div className="map-section">
        <h2>Find Us</h2>
        <div className="map-placeholder">
          <p>Interactive map would be integrated here</p>
          <p>📍 123 Technology Drive, San Francisco, CA 94105</p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
