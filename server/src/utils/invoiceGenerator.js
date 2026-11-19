// server/src/utils/invoiceGenerator.js
import PDFDocument from 'pdfkit';

/**
 * Generate PDF invoice
 * @param {Object} payment - Payment object
 * @param {Object} client - Client user
 * @param {Object} contract - Contract object
 * @returns {Promise<Buffer>} PDF buffer
 */
export const generateInvoicePDF = async (payment, client, contract) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      // Company header
      doc.fontSize(22).font('Helvetica-Bold').text('Freelancer Marketplace', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text('GST Tax Invoice', { align: 'center' });
      doc.moveDown();

      // Invoice meta
      const invoiceNo = `INV-${payment._id.toString().slice(-8).toUpperCase()}`;
      doc.fontSize(9).text(`Invoice No: ${invoiceNo}`);
      doc.text(`Date: ${new Date(payment.createdAt).toLocaleDateString('en-IN')}`);
      doc.text(`Order ID: ${payment.orderId || 'N/A'}`);
      doc.moveDown();

      // Bill To
      doc.font('Helvetica-Bold').text('Bill To:');
      doc.font('Helvetica').text(client.name || 'Client');
      doc.text(client.email || '');
      doc.moveDown();

      // Amount details
      const platformFee = Math.round(payment.amount * 0.05);
      const gst = Math.round(platformFee * 0.18);
      const total = payment.amount + gst;

      doc.font('Helvetica-Bold').text('Payment Details:');
      doc.moveDown(0.5);

      const tableTop = doc.y;
      doc.font('Helvetica').text('Description', 50, tableTop);
      doc.text('Amount', 400, tableTop);
      doc.moveDown(0.5);

      doc.text('Project Payment', 50);
      doc.text(`Rs. ${payment.amount.toLocaleString('en-IN')}`, 400);
      doc.text('Platform Fee (5%)', 50);
      doc.text(`Rs. ${platformFee.toLocaleString('en-IN')}`, 400);
      doc.text('GST (18%)', 50);
      doc.text(`Rs. ${gst.toLocaleString('en-IN')}`, 400);
      doc.moveDown(0.5);

      doc.font('Helvetica-Bold').text('Total', 50);
      doc.text(`Rs. ${total.toLocaleString('en-IN')}`, 400);
      doc.moveDown();

      doc.fontSize(8).font('Helvetica').text('This is a computer generated invoice. No signature required.', { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};