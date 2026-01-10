const nodemailer = require('nodemailer');

// Create transporter using Gmail
const createTransporter = () => {
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async(email, otp, name) => {
    try {
        const transporter = createTransporter();

        // Test the connection first
        await transporter.verify();
        console.log('SMTP connection verified successfully');

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email Verification - Emmanuel NoteVault</title>
                <style>
                    /* Reset styles */
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f5f5f5;
                        margin: 0;
                        padding: 0;
                    }
                    
                    /* Email container */
                    .email-wrapper {
                        width: 100%;
                        background-color: #f5f5f5;
                        padding: 20px 0;
                    }
                    
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }
                    
                    /* Header */
                    .header {
                        background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                        color: white;
                        padding: 30px 20px;
                        text-align: center;
                    }
                    
                    .header h1 {
                        font-size: 24px;
                        font-weight: 700;
                        margin-bottom: 8px;
                    }
                    
                    .header h2 {
                        font-size: 18px;
                        font-weight: 400;
                        opacity: 0.9;
                    }
                    
                    /* Content */
                    .content {
                        padding: 30px;
                    }
                    
                    .content h3 {
                        font-size: 20px;
                        color: #333;
                        margin-bottom: 20px;
                    }
                    
                    .content p {
                        font-size: 16px;
                        color: #555;
                        margin-bottom: 15px;
                    }
                    
                    /* OTP Box */
                    .otp-box {
                        background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
                        color: white;
                        padding: 20px;
                        margin: 25px 0;
                        text-align: center;
                        border-radius: 8px;
                        font-size: 28px;
                        font-weight: bold;
                        letter-spacing: 4px;
                        border: 2px solid #e3f2fd;
                    }
                    
                    /* Warning box */
                    .warning {
                        background-color: #fff3cd;
                        border: 1px solid #ffeaa7;
                        border-radius: 6px;
                        padding: 15px;
                        margin: 20px 0;
                        color: #856404;
                        font-weight: 600;
                    }
                    
                    /* Footer */
                    .footer {
                        text-align: center;
                        padding: 20px;
                        background-color: #f8f9fa;
                        color: #666;
                        font-size: 14px;
                        border-top: 1px solid #e9ecef;
                    }
                    
                    /* Responsive Design */
                    @media only screen and (max-width: 600px) {
                        .email-wrapper {
                            padding: 10px;
                        }
                        
                        .container {
                            margin: 0 10px;
                            border-radius: 0;
                        }
                        
                        .header {
                            padding: 25px 15px;
                        }
                        
                        .header h1 {
                            font-size: 22px;
                        }
                        
                        .header h2 {
                            font-size: 16px;
                        }
                        
                        .content {
                            padding: 20px 15px;
                        }
                        
                        .content h3 {
                            font-size: 18px;
                        }
                        
                        .content p {
                            font-size: 15px;
                        }
                        
                        .otp-box {
                            padding: 18px 15px;
                            font-size: 24px;
                            letter-spacing: 3px;
                            margin: 20px 0;
                        }
                        
                        .warning {
                            padding: 12px;
                            font-size: 14px;
                        }
                        
                        .footer {
                            padding: 15px;
                            font-size: 13px;
                        }
                    }
                    
                    /* Dark mode support */
                    @media (prefers-color-scheme: dark) {
                        .container {
                            background-color: #1a1a1a;
                        }
                        
                        .content {
                            color: #e0e0e0;
                        }
                        
                        .content h3 {
                            color: #ffffff;
                        }
                        
                        .content p {
                            color: #cccccc;
                        }
                        
                        .footer {
                            background-color: #2a2a2a;
                            color: #aaaaaa;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="email-wrapper">
                    <div class="container">
                        <div class="header">
                            <h1>📓 Emmanuel NoteVault</h1>
                            <h2>Email Verification</h2>
                        </div>
                        <div class="content">
                            <h3>Hello ${name},</h3>
                            <p>Thank you for registering with Emmanuel NoteVault! To complete your registration, please verify your email address using the OTP below:</p>
                            
                            <div class="otp-box">
                                ${otp}
                            </div>
                            
                            <p>This OTP is valid for <strong>10 minutes</strong> from the time it was sent.</p>
                            
                            <p>If you didn't request this verification, please ignore this email.</p>
                            
                            <div class="warning">
                                ⚠️ Do not share this OTP with anyone for security reasons.
                            </div>
                        </div>
                        <div class="footer">
                            <p>Best regards,<br><strong>Emmanuel NoteVault Team</strong></p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: 'Email Verification - Emmanuel NoteVault',
            html: htmlContent
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('OTP email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };

    } catch (error) {
        console.error('Detailed email error:', {
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response
        });
        throw new Error(`Failed to send OTP email: ${error.message}`);
    }
};

// Send welcome email after successful verification
const sendWelcomeEmail = async(email, name) => {
    const transporter = createTransporter();

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Emmanuel NoteVault</title>
            <style>
                /* Reset styles */
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f5f5f5;
                    margin: 0;
                    padding: 0;
                }
                
                /* Email container */
                .email-wrapper {
                    width: 100%;
                    background-color: #f5f5f5;
                    padding: 20px 0;
                }
                
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                
                /* Header */
                .header {
                    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
                    color: white;
                    padding: 30px 20px;
                    text-align: center;
                }
                
                .header h1 {
                    font-size: 26px;
                    font-weight: 700;
                    margin-bottom: 5px;
                }
                
                /* Content */
                .content {
                    padding: 30px;
                }
                
                .content h3 {
                    font-size: 20px;
                    color: #333;
                    margin-bottom: 20px;
                }
                
                .content p {
                    font-size: 16px;
                    color: #555;
                    margin-bottom: 15px;
                }
                
                /* Success box */
                .success {
                    background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
                    color: #155724;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid #28a745;
                    font-weight: 600;
                }
                
                /* Features list */
                .content ul {
                    margin: 15px 0;
                    padding-left: 20px;
                }
                
                .content li {
                    font-size: 16px;
                    color: #555;
                    margin-bottom: 8px;
                }
                
                /* Footer */
                .footer {
                    text-align: center;
                    padding: 20px;
                    background-color: #f8f9fa;
                    color: #666;
                    font-size: 14px;
                    border-top: 1px solid #e9ecef;
                }
                
                /* Responsive Design */
                @media only screen and (max-width: 600px) {
                    .email-wrapper {
                        padding: 10px;
                    }
                    
                    .container {
                        margin: 0 10px;
                        border-radius: 0;
                    }
                    
                    .header {
                        padding: 25px 15px;
                    }
                    
                    .header h1 {
                        font-size: 22px;
                    }
                    
                    .content {
                        padding: 20px 15px;
                    }
                    
                    .content h3 {
                        font-size: 18px;
                    }
                    
                    .content p, .content li {
                        font-size: 15px;
                    }
                    
                    .success {
                        padding: 15px;
                        font-size: 15px;
                    }
                    
                    .footer {
                        padding: 15px;
                        font-size: 13px;
                    }
                }
                
                /* Dark mode support */
                @media (prefers-color-scheme: dark) {
                    .container {
                        background-color: #1a1a1a;
                    }
                    
                    .content {
                        color: #e0e0e0;
                    }
                    
                    .content h3 {
                        color: #ffffff;
                    }
                    
                    .content p, .content li {
                        color: #cccccc;
                    }
                    
                    .footer {
                        background-color: #2a2a2a;
                        color: #aaaaaa;
                    }
                }
            </style>
        </head>
        <body>
            <div class="email-wrapper">
                <div class="container">
                    <div class="header">
                        <h1>🎉 Welcome to Emmanuel NoteVault!</h1>
                    </div>
                    <div class="content">
                        <h3>Hello ${name},</h3>
                        
                        <div class="success">
                            ✅ Your email has been successfully verified!
                        </div>
                        
                        <p>Welcome to Emmanuel NoteVault! Your account is now active and ready to use.</p>
                        
                        <p>You can now:</p>
                        <ul>
                            <li>Browse and download notes</li>
                            <li>Upload your own study materials</li>
                            <li>Use AI-powered note generation</li>
                            <li>Connect with other students</li>
                        </ul>
                        
                        <p>We're excited to have you as part of our learning community!</p>
                    </div>
                    <div class="footer">
                        <p>Happy studying!<br><strong>Emmanuel NoteVault Team</strong></p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Welcome to Emmanuel NoteVault!',
        html: htmlContent
    };

    try {
        const result = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        // Don't throw error for welcome email as it's not critical
        return { success: false, error: error.message };
    }
};

// Send Admin OTP email
const sendAdminOTPEmail = async(email, otp, name, role) => {
    try {
        const transporter = createTransporter();

        // Test the connection first
        await transporter.verify();
        console.log('SMTP connection verified successfully');

        const roleColors = {
            admin: '#dc3545',
            hr: '#28a745',
            faculty: '#6f42c1'
        };

        const roleColor = roleColors[role] || '#007bff';

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Admin Account Verification - Emmanuel NoteVault</title>
                <style>
                    /* Reset styles */
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f5f5f5;
                        margin: 0;
                        padding: 0;
                    }
                    
                    /* Email container */
                    .email-wrapper {
                        width: 100%;
                        background-color: #f5f5f5;
                        padding: 20px 0;
                    }
                    
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        border-left: 4px solid ${roleColor};
                    }
                    
                    /* Header */
                    .header {
                        background: linear-gradient(135deg, ${roleColor} 0%, ${roleColor}dd 100%);
                        color: white;
                        padding: 30px 20px;
                        text-align: center;
                    }
                    
                    .header h1 {
                        font-size: 24px;
                        font-weight: 700;
                        margin-bottom: 8px;
                    }
                    
                    .header h2 {
                        font-size: 18px;
                        font-weight: 400;
                        opacity: 0.9;
                    }
                    
                    /* Content */
                    .content {
                        padding: 30px;
                    }
                    
                    .content h3 {
                        font-size: 20px;
                        color: #333;
                        margin-bottom: 20px;
                    }
                    
                    .content p {
                        font-size: 16px;
                        color: #555;
                        margin-bottom: 15px;
                    }
                    
                    /* Role badge */
                    .role-badge {
                        background: linear-gradient(135deg, ${roleColor} 0%, ${roleColor}dd 100%);
                        color: white;
                        padding: 6px 12px;
                        border-radius: 20px;
                        font-size: 13px;
                        text-transform: uppercase;
                        font-weight: bold;
                        letter-spacing: 0.5px;
                        display: inline-block;
                    }
                    
                    /* OTP Box */
                    .otp-box {
                        background: linear-gradient(135deg, ${roleColor} 0%, ${roleColor}dd 100%);
                        color: white;
                        padding: 20px;
                        margin: 25px 0;
                        text-align: center;
                        border-radius: 8px;
                        font-size: 28px;
                        font-weight: bold;
                        letter-spacing: 4px;
                        border: 2px solid ${roleColor}33;
                    }
                    
                    /* Warning box */
                    .warning {
                        background-color: #fff3cd;
                        border: 1px solid #ffeaa7;
                        border-radius: 6px;
                        padding: 15px;
                        margin: 20px 0;
                        color: #856404;
                        font-weight: 600;
                    }
                    
                    /* Footer */
                    .footer {
                        text-align: center;
                        padding: 20px;
                        background-color: #f8f9fa;
                        color: #666;
                        font-size: 14px;
                        border-top: 1px solid #e9ecef;
                    }
                    
                    /* Responsive Design */
                    @media only screen and (max-width: 600px) {
                        .email-wrapper {
                            padding: 10px;
                        }
                        
                        .container {
                            margin: 0 10px;
                            border-radius: 0;
                        }
                        
                        .header {
                            padding: 25px 15px;
                        }
                        
                        .header h1 {
                            font-size: 22px;
                        }
                        
                        .header h2 {
                            font-size: 16px;
                        }
                        
                        .content {
                            padding: 20px 15px;
                        }
                        
                        .content h3 {
                            font-size: 18px;
                        }
                        
                        .content p {
                            font-size: 15px;
                        }
                        
                        .role-badge {
                            font-size: 11px;
                            padding: 5px 10px;
                        }
                        
                        .otp-box {
                            padding: 18px 15px;
                            font-size: 24px;
                            letter-spacing: 3px;
                            margin: 20px 0;
                        }
                        
                        .warning {
                            padding: 12px;
                            font-size: 14px;
                        }
                        
                        .footer {
                            padding: 15px;
                            font-size: 13px;
                        }
                    }
                    
                    /* Dark mode support */
                    @media (prefers-color-scheme: dark) {
                        .container {
                            background-color: #1a1a1a;
                        }
                        
                        .content {
                            color: #e0e0e0;
                        }
                        
                        .content h3 {
                            color: #ffffff;
                        }
                        
                        .content p {
                            color: #cccccc;
                        }
                        
                        .footer {
                            background-color: #2a2a2a;
                            color: #aaaaaa;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="email-wrapper">
                    <div class="container">
                        <div class="header">
                            <h1>🛡️ Emmanuel NoteVault Admin</h1>
                            <h2>Admin Account Verification</h2>
                        </div>
                        <div class="content">
                            <h3>Hello ${name},</h3>
                            <p>Welcome to Emmanuel NoteVault Admin Portal! You are registering as: <span class="role-badge">${role.toUpperCase()}</span></p>
                            <p>To complete your admin account setup, please verify your email address using the OTP below:</p>
                            
                            <div class="otp-box">
                                ${otp}
                            </div>
                            
                            <p>This OTP is valid for <strong>10 minutes</strong> from the time it was sent.</p>
                            
                            <p><strong>Important:</strong> This is an administrative account with elevated privileges. Please ensure this registration was authorized by your system administrator.</p>
                            
                            <div class="warning">
                                ⚠️ Do not share this OTP with anyone. If you did not request this account, please contact your system administrator immediately.
                            </div>
                        </div>
                        <div class="footer">
                            <p>Best regards,<br><strong>Emmanuel NoteVault Admin Team</strong></p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Admin Account Verification - ${role.toUpperCase()} - Emmanuel NoteVault`,
            html: htmlContent
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Admin OTP email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };

    } catch (error) {
        console.error('Detailed admin email error:', {
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response
        });
        throw new Error(`Failed to send admin OTP email: ${error.message}`);
    }
};

// Send admin welcome email after successful verification
const sendAdminWelcomeEmail = async(email, name, role, department) => {
        const transporter = createTransporter();

        const roleColors = {
            admin: '#dc3545',
            hr: '#28a745',
            faculty: '#6f42c1'
        };

        const roleColor = roleColors[role] || '#007bff';

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Emmanuel NoteVault Admin - ${role.toUpperCase()}</title>
            <style>
                /* Reset styles */
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    background-color: #f5f5f5;
                    margin: 0;
                    padding: 0;
                }
                
                /* Email container */
                .email-wrapper {
                    width: 100%;
                    background-color: #f5f5f5;
                    padding: 20px 0;
                }
                
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    border-left: 4px solid ${roleColor};
                }
                
                /* Header */
                .header {
                    background: linear-gradient(135deg, ${roleColor} 0%, ${roleColor}dd 100%);
                    color: white;
                    padding: 30px 20px;
                    text-align: center;
                }
                
                .header h1 {
                    font-size: 26px;
                    font-weight: 700;
                    margin-bottom: 5px;
                }
                
                /* Content */
                .content {
                    padding: 30px;
                }
                
                .content h3 {
                    font-size: 20px;
                    color: #333;
                    margin-bottom: 20px;
                }
                
                .content p {
                    font-size: 16px;
                    color: #555;
                    margin-bottom: 15px;
                }
                
                /* Success box */
                .success {
                    background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
                    color: #155724;
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid #28a745;
                    font-weight: 600;
                }
                
                /* Role info box */
                .role-info {
                    background: linear-gradient(135deg, #e9ecef 0%, #f8f9fa 100%);
                    padding: 20px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid ${roleColor};
                }
                
                .role-info h4 {
                    color: ${roleColor};
                    margin-bottom: 12px;
                    font-size: 18px;
                }
                
                .role-info p {
                    margin-bottom: 8px;
                    color: #333;
                }
                
                /* Features list */
                .content ul {
                    margin: 15px 0;
                    padding-left: 20px;
                }
                
                .content li {
                    font-size: 16px;
                    color: #555;
                    margin-bottom: 8px;
                }
                
                /* Footer */
                .footer {
                    text-align: center;
                    padding: 20px;
                    background-color: #f8f9fa;
                    color: #666;
                    font-size: 14px;
                    border-top: 1px solid #e9ecef;
                }
                
                /* Responsive Design */
                @media only screen and (max-width: 600px) {
                    .email-wrapper {
                        padding: 10px;
                    }
                    
                    .container {
                        margin: 0 10px;
                        border-radius: 0;
                    }
                    
                    .header {
                        padding: 25px 15px;
                    }
                    
                    .header h1 {
                        font-size: 22px;
                    }
                    
                    .content {
                        padding: 20px 15px;
                    }
                    
                    .content h3 {
                        font-size: 18px;
                    }
                    
                    .content p, .content li {
                        font-size: 15px;
                    }
                    
                    .success, .role-info {
                        padding: 15px;
                    }
                    
                    .role-info h4 {
                        font-size: 16px;
                    }
                    
                    .footer {
                        padding: 15px;
                        font-size: 13px;
                    }
                }
                
                /* Dark mode support */
                @media (prefers-color-scheme: dark) {
                    .container {
                        background-color: #1a1a1a;
                    }
                    
                    .content {
                        color: #e0e0e0;
                    }
                    
                    .content h3 {
                        color: #ffffff;
                    }
                    
                    .content p, .content li {
                        color: #cccccc;
                    }
                    
                    .role-info {
                        background: linear-gradient(135deg, #2a2a2a 0%, #3a3a3a 100%);
                    }
                    
                    .role-info p {
                        color: #e0e0e0;
                    }
                    
                    .footer {
                        background-color: #2a2a2a;
                        color: #aaaaaa;
                    }
                }
            </style>
        </head>
        <body>
            <div class="email-wrapper">
                <div class="container">
                    <div class="header">
                        <h1>🎉 Welcome to Emmanuel NoteVault Admin!</h1>
                    </div>
                    <div class="content">
                        <h3>Hello ${name},</h3>
                        
                        <div class="success">
                            ✅ Your admin account has been successfully verified!
                        </div>
                        
                        <div class="role-info">
                            <h4>Your Account Details:</h4>
                            <p><strong>Role:</strong> ${role.charAt(0).toUpperCase() + role.slice(1)}</p>
                            ${department ? `<p><strong>Department:</strong> ${department}</p>` : ''}
                            <p><strong>Email:</strong> ${email}</p>
                        </div>
                        
                        <p>Welcome to the Emmanuel NoteVault administrative team! Your account is now active and ready to use.</p>
                        
                        <p>As a ${role}, you can now:</p>
                        <ul>
                            ${role === 'admin' ? '<li>Manage system settings and configurations</li><li>Oversee all user accounts and content</li><li>Access comprehensive analytics and reports</li>' : ''}
                            ${role === 'hr' ? '<li>Manage user accounts and permissions</li><li>View user activity reports</li><li>Handle user-related administrative tasks</li>' : ''}
                            ${role === 'faculty' ? '<li>Upload and manage educational content</li><li>Monitor student engagement</li><li>Access department-specific analytics</li>' : ''}
                            <li>Access the admin dashboard</li>
                            <li>Collaborate with other administrators</li>
                        </ul>
                        
                        <p><strong>Important:</strong> Please remember to maintain the confidentiality and security of your admin credentials.</p>
                    </div>
                    <div class="footer">
                        <p>Welcome to the team!<br><strong>Emmanuel NoteVault Admin Team</strong></p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: `Welcome to Emmanuel NoteVault Admin - ${role.toUpperCase()}`,
        html: htmlContent
    };

    try {
        const result = await transporter.sendMail(mailOptions);
        console.log('Admin welcome email sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Error sending admin welcome email:', error);
        // Don't throw error for welcome email as it's not critical
        return { success: false, error: error.message };
    }
};

module.exports = {
    generateOTP,
    sendOTPEmail,
    sendWelcomeEmail,
    sendAdminOTPEmail,
    sendAdminWelcomeEmail
};