// server/src/utils/sendEmail.js
import nodemailer from 'nodemailer';

/**
 * Send email using Nodemailer
 * @param {Object} options - Email options
 * @param {string} options.email - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML email body
 * @param {Array} options.attachments - Array of attachments
 * @param {string} options.cc - CC recipient 
 * @param {string} options.bcc - BCC recipient 
 * @returns {Promise<Object>} Nodemailer info object
 */
export const sendEmail = async (options) => {
  try {
    // Validate required fields
    if (!options.email || !options.subject || !options.html) {
      throw new Error('Email, subject, and html are required');
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      // Connection timeout
      connectionTimeout: 10000,
      // Greeting timeout
      greetingTimeout: 10000,
      // Socket timeout
      socketTimeout: 15000,
    });

    // Verify transporter connection
    if (process.env.NODE_ENV === 'development') {
      await transporter.verify();
      console.log('SMTP connection verified');
    }

    // Build mail options
    const mailOptions = {
      from: `${process.env.WEB_NAME || 'Freelancer Marketplace'} <${process.env.EMAIL_FROM || process.env.SMTP_USER}>`,
      to: options.email,
      cc: options.cc || undefined,
      bcc: options.bcc || undefined,
      subject: options.subject,
      html: options.html,
      text: options.text || undefined, // Plain text fallback
      attachments: options.attachments || [],
      headers: {
        'X-Priority': options.priority || '3', // 1=High, 3=Normal, 5=Low
        'X-Mailer': 'SkillHire Mailer',
      },
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);

    if (process.env.NODE_ENV === 'development') {
      console.log('   Email sent:', info.messageId);
      console.log('   To:', options.email);
      console.log('   Subject:', options.subject);
    }

    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
      accepted: info.accepted,
      rejected: info.rejected,
    };
  } catch (error) {
    console.error('   Email sending failed:');
    console.error('   Error:', error.message);
    console.error('   To:', options?.email);
    console.error('   Subject:', options?.subject);

    // Don't throw — let the caller decide
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Send email in background (non-blocking)
 * @param {Object} options - Email options
 * @returns {Promise<void>}
 */
export const sendEmailAsync = async (options) => {
  try {
    await sendEmail(options);
  } catch (error) {
    // Silent fail — don't crash the main flow
    console.error('Background email failed:', error.message);
  }
};

/**
 * Send bulk emails
 * @param {Array} recipients - Array of email options
 * @returns {Promise<Array>} Results array
 */
export const sendBulkEmails = async (recipients) => {
  const results = [];

  for (const recipient of recipients) {
    const result = await sendEmail(recipient);
    results.push(result);
  }

  return results;
};

export default sendEmail;