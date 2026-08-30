// server/src/utils/emailTemplates.js

// ============ SHARED STYLES ============
const baseStyles = `
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background: #f4f4f5;
      padding: 20px;
    }
    .container {
      max-width: 520px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    .header {
      padding: 28px 32px;
      text-align: center;
      color: #ffffff;
    }
    .content {
      padding: 32px;
    }
    .footer {
      text-align: center;
      padding: 20px 32px;
      color: #71717a;
      font-size: 11px;
      border-top: 1px solid #f4f4f5;
    }
    .btn {
      display: inline-block;
      padding: 10px 24px;
      border-radius: 6px;
      text-decoration: none;
      font-weight: 600;
      font-size: 13px;
      margin: 16px 0;
    }
    .info-box {
      background: #fafafa;
      border-radius: 8px;
      padding: 16px;
      margin: 16px 0;
      text-align: center;
    }
    h2 { font-size: 18px; margin-bottom: 12px; }
    p { font-size: 13px; color: #52525b; margin-bottom: 8px; }
    .muted { color: #a1a1aa; font-size: 12px; }
  </style>
`;

const createEmail = (headerHtml, contentHtml, headerBg = '#4f46e5') => `
  <!DOCTYPE html>
  <html>
  <head>${baseStyles}</head>
  <body>
    <div class="container">
      <div class="header" style="background: ${headerBg};">${headerHtml}</div>
      <div class="content">${contentHtml}</div>
      <div class="footer">© ${new Date().getFullYear()} SkillHire. All rights reserved.</div>
    </div>
  </body>
  </html>
`;

// ============ WELCOME EMAIL ============
export const welcomeEmailTemplate = (user) => {
  return createEmail(
    `<h1 style="font-size:20px; margin:0;">Welcome to SkillHire</h1>`,
    `
      <h2>Hi ${user.name},</h2>
      <p>Your account has been created as a <strong>${user.role}</strong>.</p>
      <div class="info-box">
        <p style="margin:0; font-weight:600; color:#4f46e5;">Get started</p>
        <a href="${process.env.CLIENT_URL}/dashboard/${user.role}" class="btn" style="background:#4f46e5; color:#fff;">Go to Dashboard</a>
      </div>
      <p class="muted">Complete your profile to increase visibility.</p>
    `
  );
};

// ============ OTP EMAIL ============
export const otpEmailTemplate = (otp, purpose) => {
  const purposeText = {
    registration: 'complete your registration',
    login: 'login to your account',
    password_reset: 'reset your password',
    email_change_old: 'verify your current email',
    email_change_new: 'verify your new email',
  };

  return createEmail(
    `<h1 style="font-size:20px; margin:0;">Verification Code</h1>`,
    `
      <p style="text-align:center;">Use this code to ${purposeText[purpose] || 'verify'}:</p>
      <div class="info-box">
        <span style="font-size:32px; font-weight:700; letter-spacing:8px; color:#4f46e5;">${otp}</span>
      </div>
      <p class="muted" style="text-align:center;">Expires in 5 minutes.</p>
    `,
    '#4f46e5'
  );
};

// ============ PASSWORD RESET SUCCESS ============
export const passwordResetSuccessTemplate = (user) => {
  return createEmail(
    `<h1 style="font-size:20px; margin:0;">Password Reset</h1>`,
    `
      <h2>Hi ${user.name},</h2>
      <p>Your password has been changed successfully.</p>
      <p class="muted">If you didn't do this, contact support immediately.</p>
    `,
    '#10b981'
  );
};

// ============ PASSWORD CHANGE ============
export const passwordChangeTemplate = (user) => {
  return createEmail(
    `<h1 style="font-size:20px; margin:0;">Password Changed</h1>`,
    `
      <h2>Hi ${user.name},</h2>
      <p>Your password was changed successfully.</p>
      <p class="muted">If this wasn't you, reset your password immediately.</p>
    `,
    '#f59e0b'
  );
};

// ============ EMAIL CHANGE ============
export const emailChangeTemplate = (user, newEmail) => {
  return createEmail(
    `<h1 style="font-size:20px; margin:0;">Email Updated</h1>`,
    `
      <h2>Hi ${user.name},</h2>
      <p>Your email has been changed:</p>
      <div class="info-box">
        <p style="margin:0; color:#ef4444; text-decoration:line-through;">${user.email}</p>
        <p style="margin:4px 0;">↓</p>
        <p style="margin:0; font-weight:600; color:#10b981;">${newEmail}</p>
      </div>
    `,
    '#4f46e5'
  );
};

// ============ ACCOUNT LOCKED ============
export const accountLockedTemplate = (user, lockDuration) => {
  return createEmail(
    `<h1 style="font-size:20px; margin:0;">Account Locked</h1>`,
    `
      <h2>Hi ${user.name},</h2>
      <p>Your account is temporarily locked.</p>
      <div class="info-box">
        <p style="margin:0; font-weight:600;">Locked for ${lockDuration} minutes</p>
      </div>
      <p class="muted">Too many failed login attempts.</p>
    `,
    '#ef4444'
  );
};

// ============ PHONE VERIFIED ============
export const phoneVerifiedTemplate = (user, phone) => {
  return createEmail(
    `<h1 style="font-size:20px; margin:0;">Phone Verified</h1>`,
    `
      <h2>Hi ${user.name},</h2>
      <p>Your phone number has been verified:</p>
      <div class="info-box">
        <p style="margin:0; font-weight:600; color:#10b981;">${phone}</p>
      </div>
    `,
    '#10b981'
  );
};

// ============ PROJECT NOTIFICATION ============
export const projectNotificationTemplate = (user, project, type) => {
  const messages = {
    new_proposal: 'New proposal received',
    proposal_accepted: 'Proposal accepted',
    project_completed: 'Project completed',
  };

  return createEmail(
    `<h1 style="font-size:20px; margin:0;">${messages[type]}</h1>`,
    `
      <h2>${project.title}</h2>
      <p class="muted">${new Date().toLocaleDateString()}</p>
    `,
    '#4f46e5'
  );
};