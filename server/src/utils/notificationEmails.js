// server/src/utils/notificationEmails.js
import { sendEmail } from './sendEmail.js';
import {
  paymentSuccessTemplate,
  contractCreatedTemplate,
  workSubmittedTemplate,
  workAcceptedTemplate,
  payoutSentTemplate,
  reviewReceivedTemplate,
} from './emailTemplates.js';
import { generateInvoicePDF } from './invoiceGenerator.js';

// Helper to safely send email without crashing
const safeSendEmail = async (options) => {
  try {
    await sendEmail(options);
  } catch (error) {
    console.error('Email notification failed:', error.message);
  }
};

// ============ PAYMENT SUCCESS ============
export const sendPaymentSuccessEmail = async (client, payment, contract) => {
  try {
    const html = paymentSuccessTemplate(client, payment, contract);
    const pdfBuffer = await generateInvoicePDF(payment, client, contract);

    await safeSendEmail({
      email: client.email,
      subject: 'Payment Successful - Escrow Funded',
      html,
      attachments: [{
        filename: `INV-${payment._id.toString().slice(-8).toUpperCase()}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      }],
    });
  } catch (error) {
    console.error('Payment email failed:', error.message);
  }
};

// ============ CONTRACT CREATED ============
export const sendContractCreatedEmail = async (freelancer, contract) => {
  try {
    const html = contractCreatedTemplate(freelancer, contract);
    await safeSendEmail({
      email: freelancer.email,
      subject: 'You Have Been Hired!',
      html,
    });
  } catch (error) {
    console.error('Contract email failed:', error.message);
  }
};

// ============ WORK SUBMITTED ============
export const sendWorkSubmittedEmail = async (client, delivery) => {
  try {
    const html = workSubmittedTemplate(client, delivery);
    await safeSendEmail({
      email: client.email,
      subject: 'Work Submitted - Review Required',
      html,
    });
  } catch (error) {
    console.error('Work submitted email failed:', error.message);
  }
};

// ============ WORK ACCEPTED ============
export const sendWorkAcceptedEmail = async (freelancer, delivery, amount) => {
  try {
    const html = workAcceptedTemplate(freelancer, delivery, amount);
    await safeSendEmail({
      email: freelancer.email,
      subject: 'Work Accepted - Payment Released',
      html,
    });
  } catch (error) {
    console.error('Work accepted email failed:', error.message);
  }
};

// ============ PAYOUT SENT ============
export const sendPayoutSentEmail = async (freelancer, payout) => {
  try {
    const html = payoutSentTemplate(freelancer, payout);
    await safeSendEmail({
      email: freelancer.email,
      subject: 'Payout Initiated',
      html,
    });
  } catch (error) {
    console.error('Payout email failed:', error.message);
  }
};

// ============ REVIEW RECEIVED ============
export const sendReviewReceivedEmail = async (freelancer, review) => {
  try {
    const html = reviewReceivedTemplate(freelancer, review);
    await safeSendEmail({
      email: freelancer.email,
      subject: 'New Review Received',
      html,
    });
  } catch (error) {
    console.error('Review email failed:', error.message);
  }
};