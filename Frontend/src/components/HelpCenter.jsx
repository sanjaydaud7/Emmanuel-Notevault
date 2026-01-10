import React from 'react';
import '../styles/HelpCenter.css';

const HelpCenter = () => {
  const faqs = [
    {
      q: 'How do I create a new note?',
      a: 'Go to Upload Note from the navigation, fill in the details, and click Save. Your note will appear in Browse Notes.'
    },
    {
      q: 'How does AI Notes work?',
      a: 'AI Notes helps summarize and organize content. Open AI Notes from the navbar and follow the prompts to generate insights from your notes.'
    },
    {
      q: 'Is my data secure?',
      a: 'Yes. We use industry-standard encryption and secure authentication. Never share your credentials and always log out on public devices.'
    },
    {
      q: 'Can I access my notes on mobile?',
      a: 'Absolutely. Emmanuel NoteVault works across desktop and mobile browsers.'
    }
  ];

  return (
    <div className="help-center">
      <div className="hc-header">
        <h1>Help Center</h1>
        <p>Guides, FAQs, and support to get you going</p>
      </div>

      <div className="hc-sections">
        <section className="hc-card">
          <h2>Getting Started</h2>
          <ul className="hc-list">
            <li>Create an account via Sign Up on the homepage.</li>
            <li>Use Upload Note to add your first note.</li>
            <li>Browse Notes to search, filter, and manage notes.</li>
            <li>Try AI Notes to summarize and organize content.</li>
          </ul>
        </section>

        <section className="hc-card">
          <h2>FAQs</h2>
          <div className="hc-faqs">
            {faqs.map((item, idx) => (
              <div key={idx} className="hc-faq">
                <div className="hc-faq-q">{item.q}</div>
                <div className="hc-faq-a">{item.a}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="hc-card">
          <h2>Troubleshooting</h2>
          <ul className="hc-list">
            <li>If notes don’t appear, refresh and check your network.</li>
            <li>Clear browser cache if you encounter odd UI behavior.</li>
            <li>Ensure you are logged in; re-authenticate if token expired.</li>
            <li>Contact support if issues persist.</li>
          </ul>
        </section>

        <section className="hc-card">
          <h2>Support</h2>
          <div className="hc-support">
            <div className="hc-support-item">
              <span className="hc-support-label">Email:</span>
              <span>support@emmanueltech.com</span>
            </div>
            <div className="hc-support-item">
              <span className="hc-support-label">Phone:</span>
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="hc-support-item">
              <span className="hc-support-label">Hours:</span>
              <span>Mon–Fri, 9:00 AM – 6:00 PM</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HelpCenter;
