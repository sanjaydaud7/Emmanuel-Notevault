import React from 'react';
import '../styles/TermsOfService.css';

const TermsOfService = () => {
  return (
    <div className="tos">
      <header className="tos-header">
        <h1>Terms of Service</h1>
        <p>Effective date: January 1, 2025</p>
      </header>

      <section className="tos-section">
        <h2>1. Acceptance of Terms</h2>
        <p>By accessing or using Emmanuel NoteVault, you agree to these Terms of Service and our Privacy Policy.</p>
      </section>

      <section className="tos-section">
        <h2>2. Use of the Service</h2>
        <p>You agree to use the service in compliance with applicable laws and not to misuse or attempt to disrupt the platform.</p>
      </section>

      <section className="tos-section">
        <h2>3. Accounts and Security</h2>
        <p>You are responsible for safeguarding your account credentials and for all activities under your account.</p>
      </section>

      <section className="tos-section">
        <h2>4. User Content</h2>
        <p>You retain ownership of content you upload. You grant us a limited license to store and process your content to provide the service.</p>
      </section>

      <section className="tos-section">
        <h2>5. Privacy</h2>
        <p>We process personal data as described in our Privacy Policy. Do not upload sensitive data unless necessary.</p>
      </section>

      <section className="tos-section">
        <h2>6. Prohibited Activities</h2>
        <ul className="tos-list">
          <li>Reverse engineering or interfering with the service.</li>
          <li>Uploading malicious code or violating others’ rights.</li>
          <li>Using the service for unlawful purposes.</li>
        </ul>
      </section>

      <section className="tos-section">
        <h2>7. Termination</h2>
        <p>We may suspend or terminate access for violations of these terms or for security reasons.</p>
      </section>

      <section className="tos-section">
        <h2>8. Disclaimer of Warranties</h2>
        <p>The service is provided “as is” without warranties of any kind.</p>
      </section>

      <section className="tos-section">
        <h2>9. Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, Emmanuel NoteVault is not liable for indirect or consequential damages.</p>
      </section>

      <section className="tos-section">
        <h2>10. Changes to Terms</h2>
        <p>We may update these terms. Continued use after changes constitutes acceptance.</p>
      </section>

      <section className="tos-section">
        <h2>11. Contact</h2>
        <p>For questions, contact support@emmanueltech.com.</p>
      </section>
    </div>
  );
};

export default TermsOfService;
