// server/src/utils/emailTemplates.js

// Welcome Email Template
export const welcomeEmailTemplate = (user) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          padding: 30px;
          background: #f9f9f9;
          border: 1px solid #e0e0e0;
          border-radius: 0 0 10px 10px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          color: #666;
          font-size: 12px;
        }
        .highlight {
          color: #667eea;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Welcome to Freelancer Marketplace! </h1>
      </div>
      <div class="content">
        <h2>Hi ${user.name},</h2>
        <p>Thank you for joining <span class="highlight">Freelancer Marketplace</span>!</p>
        <p>Your account has been created successfully as a <strong>${user.role}</strong>.</p>
        
        <h3>What's Next?</h3>
        <ul>
          <li>Complete your profile</li>
          <li>Explore available projects</li>
          <li>Connect with clients/freelancers</li>
          <li>Start your freelancing journey</li>
        </ul>
        
        <a href="${process.env.CLIENT_URL}/dashboard" class="button">Go to Dashboard</a>
        
        <p style="margin-top: 30px;">If you have any questions, feel free to contact our support team.</p>
      </div>
      <div class="footer">
        <p>© 2024 Freelancer Marketplace. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
};

// Password Reset Email Template
export const passwordResetTemplate = (user, resetLink) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: #ff6b6b;
          color: white;
          padding: 30px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .content {
          padding: 30px;
          background: #f9f9f9;
          border: 1px solid #e0e0e0;
          border-radius: 0 0 10px 10px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #ff6b6b;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Password Reset Request</h1>
      </div>
      <div class="content">
        <h2>Hi ${user.name},</h2>
        <p>We received a request to reset your password.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetLink}" class="button">Reset Password</a>
        <p style="margin-top: 20px;">This link will expire in 30 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    </body>
    </html>
  `;
};

// Project Notification Template
export const projectNotificationTemplate = (user, project, type) => {
  const messages = {
    new_proposal: `A new proposal has been submitted for your project`,
    proposal_accepted: `Your proposal has been accepted`,
    project_completed: `Your project has been completed`,
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .content {
          padding: 30px;
          background: #f9f9f9;
          border: 1px solid #e0e0e0;
          border-radius: 10px;
        }
        .notification {
          background: white;
          padding: 20px;
          border-radius: 5px;
          border-left: 4px solid #667eea;
        }
      </style>
    </head>
    <body>
      <div class="content">
        <h2>Hi ${user.name},</h2>
        <div class="notification">
          <p>${messages[type]}</p>
          <h3>Project: ${project.title}</h3>
        </div>
      </div>
    </body>
    </html>
  `;
};