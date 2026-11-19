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



// ============ PAYMENT SUCCESS (CLIENT) ============
export const paymentSuccessTemplate = (client, payment, contract) => {
  const platformFee = Math.round(payment.amount * 0.05);
  const gst = Math.round(platformFee * 0.18);

  return createEmail(
    `<h1 style="font-size:20px; margin:0;">Payment Successful</h1>`,
    `
      <h2>Hi ${client.name},</h2>
      <p>Your payment has been processed successfully.</p>
      <div class="info-box">
        <p style="margin:0; color:#71717a;">Project: <strong>${contract.projectId?.title || 'Project'}</strong></p>
        <p style="font-size:28px; font-weight:700; margin:8px 0; color:#10b981;">₹${payment.amount.toLocaleString('en-IN')}</p>
        <p style="margin:0; color:#71717a; font-size:12px;">Order ID: ${payment.orderId}</p>
      </div>
      <div class="info-box" style="background:#f0fdf4;">
        <p style="margin:0; font-size:12px;">Platform Fee (5%): ₹${platformFee.toLocaleString('en-IN')}</p>
        <p style="margin:4px 0; font-size:12px;">GST (18%): ₹${gst.toLocaleString('en-IN')}</p>
      </div>
      <p class="muted">Funds are held securely in escrow until you approve the work.</p>
      <a href="${process.env.CLIENT_URL}/dashboard/client/contracts/${contract._id}" class="btn" style="background:#10b981; color:#fff;">View Contract</a>
    `,
    '#10b981'
  );
};

// ============ CONTRACT CREATED (FREELANCER) ============
export const contractCreatedTemplate = (freelancer, contract) => {
  return createEmail(
    `<h1 style="font-size:20px; margin:0;">You Have Been Hired! 🎉</h1>`,
    `
      <h2>Hi ${freelancer.name},</h2>
      <p>Congratulations! A client has hired you for their project.</p>
      <div class="info-box">
        <p style="margin:0; color:#71717a;">Project: <strong>${contract.projectId?.title || 'Project'}</strong></p>
        <p style="font-size:28px; font-weight:700; margin:8px 0; color:#4f46e5;">₹${contract.amount.toLocaleString('en-IN')}</p>
        <p style="margin:0; color:#71717a; font-size:12px;">Deadline: ${new Date(contract.deadline).toLocaleDateString('en-IN')}</p>
      </div>
      <p class="muted">Start working on the project and submit your deliverables.</p>
      <a href="${process.env.CLIENT_URL}/dashboard/freelancer/contracts/${contract._id}" class="btn" style="background:#4f46e5; color:#fff;">View Contract</a>
    `,
    '#4f46e5'
  );
};

// ============ WORK SUBMITTED (CLIENT) ============
export const workSubmittedTemplate = (client, delivery) => {
  return createEmail(
    `<h1 style="font-size:20px; margin:0;">Work Submitted</h1>`,
    `
      <h2>Hi ${client.name},</h2>
      <p>Your freelancer has submitted work for review.</p>
      <div class="info-box">
        <p style="margin:0; font-weight:600;">${delivery.title || 'Work Submission'}</p>
        <p style="margin:8px 0; font-size:12px; color:#71717a;">${delivery.message || ''}</p>
      </div>
      <p class="muted">Review the work and either approve or request changes.</p>
      <a href="${process.env.CLIENT_URL}/dashboard/client/contracts/${delivery.contractId}" class="btn" style="background:#f59e0b; color:#fff;">Review Work</a>
    `,
    '#f59e0b'
  );
};

// ============ WORK ACCEPTED (FREELANCER) ============
export const workAcceptedTemplate = (freelancer, delivery, amount) => {
  return createEmail(
    `<h1 style="font-size:20px; margin:0;">Work Accepted! 💰</h1>`,
    `
      <h2>Hi ${freelancer.name},</h2>
      <p>Great news! Your work has been accepted by the client.</p>
      <div class="info-box">
        <p style="font-size:28px; font-weight:700; margin:8px 0; color:#10b981;">₹${amount.toLocaleString('en-IN')}</p>
        <p style="margin:0; color:#71717a; font-size:12px;">Released to your available balance</p>
      </div>
      <a href="${process.env.CLIENT_URL}/dashboard/freelancer/earnings" class="btn" style="background:#10b981; color:#fff;">View Earnings</a>
    `,
    '#10b981'
  );
};

// ============ PAYOUT SENT (FREELANCER) ============
export const payoutSentTemplate = (freelancer, payout) => {
  return createEmail(
    `<h1 style="font-size:20px; margin:0;">Payout Initiated</h1>`,
    `
      <h2>Hi ${freelancer.name},</h2>
      <p>Your withdrawal has been initiated.</p>
      <div class="info-box">
        <p style="font-size:28px; font-weight:700; margin:8px 0; color:#4f46e5;">₹${payout.amount.toLocaleString('en-IN')}</p>
        <p style="margin:0; color:#71717a; font-size:12px;">Payout ID: ${payout.id}</p>
        <p style="margin:4px 0; color:#71717a; font-size:12px;">Status: ${payout.status}</p>
      </div>
      <p class="muted">Funds will be transferred within 24-48 hours.</p>
      <a href="${process.env.CLIENT_URL}/dashboard/freelancer/earnings" class="btn" style="background:#4f46e5; color:#fff;">View Status</a>
    `,
    '#4f46e5'
  );
};

// ============ NEW REVIEW (FREELANCER) ============
export const reviewReceivedTemplate = (freelancer, review) => {
  const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
  
  return createEmail(
    `<h1 style="font-size:20px; margin:0;">New Review Received ⭐</h1>`,
    `
      <h2>Hi ${freelancer.name},</h2>
      <p>A client has left you a review.</p>
      <div class="info-box">
        <p style="font-size:24px; margin:0; color:#f59e0b;">${stars}</p>
        <p style="margin:8px 0; font-size:12px; color:#71717a;">${review.comment || 'No comment provided'}</p>
      </div>
      <a href="${process.env.CLIENT_URL}/dashboard/freelancer/reviews" class="btn" style="background:#f59e0b; color:#fff;">View Reviews</a>
    `,
    '#f59e0b'
  );
};