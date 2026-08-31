// client/src/utils/formatters.js

/**
 * Format currency in Indian Rupees (₹)
 * Uses Indian numbering system (Lakh, Crore)
 * 
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: INR)
 * @returns {string} Formatted currency string
 * 
 * @example
 * formatCurrency(50000) → "₹50,000"
 * formatCurrency(1500000) → "₹15,00,000" (15 Lakh)
 * formatCurrency(50000, 'USD') → "$50,000"
 */
export function formatCurrency(amount, currency = 'INR') {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return currency === 'INR' ? '₹0' : '$0';
  }

  const numAmount = Number(amount);

  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: numAmount % 1 === 0 ? 0 : 2,
      minimumFractionDigits: 0,
    }).format(numAmount);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: numAmount % 1 === 0 ? 0 : 2,
  }).format(numAmount);
}

/**
 * Format currency in short Indian format
 * 
 * @param {number} amount - Amount
 * @returns {string} Short format
 * 
 * @example
 * formatCurrencyShort(50000) → "₹50K"
 * formatCurrencyShort(1500000) → "₹15L"
 * formatCurrencyShort(10000000) → "₹1Cr"
 */
export function formatCurrencyShort(amount) {
  if (!amount || isNaN(amount)) return '₹0';

  const num = Number(amount);

  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2).replace(/\.00$/, '')}Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2).replace(/\.00$/, '')}L`;
  }
  if (num >= 1000) {
    return `₹${(num / 1000).toFixed(1).replace(/\.0$/, '')}K`;
  }
  return `₹${num}`;
}

/**
 * Format date in Indian format (DD Mon YYYY)
 * 
 * @example
 * formatDate('2026-08-31') → "31 Aug 2026"
 */
export function formatDate(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Format date with time (DD Mon YYYY, HH:MM AM/PM)
 * 
 * @example
 * formatDateTime('2026-08-31T14:30:00') → "31 Aug 2026, 2:30 PM"
 */
export function formatDateTime(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Format time only (HH:MM AM/PM)
 */
export function formatTime(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Relative time in Indian English
 * 
 * @example
 * timeAgo(new Date()) → "Just now"
 * timeAgo(5 mins ago) → "5m ago"
 * timeAgo(3 hours ago) → "3h ago"
 * timeAgo(2 days ago) → "2d ago"
 * timeAgo(2 months ago) → "2mo ago"
 * timeAgo(1 year ago) → "1y ago"
 */
export function timeAgo(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;

  return `${Math.floor(months / 12)}y ago`;
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text, length = 120) {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
}

/**
 * Format number with Indian comma separator
 * 
 * @example
 * formatNumber(50000) → "50,000"
 * formatNumber(1500000) → "15,00,000"
 */
export function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  return new Intl.NumberFormat('en-IN').format(Number(num));
}

/**
 * Format percentage
 * 
 * @example
 * formatPercent(5) → "5%"
 * formatPercent(4.567) → "4.57%"
 */
export function formatPercent(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
}

/**
 * Format INR in words (Indian system)
 * 
 * @example
 * amountToWords(50000) → "Fifty Thousand Rupees Only"
 */
export function amountToWords(amount) {
  if (!amount || isNaN(amount)) return 'Zero Rupees Only';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertTwoDigits(n) {
    if (n < 20) return ones[n];
    return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  }

  function convertThreeDigits(n) {
    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let result = '';
    if (hundred) result += ones[hundred] + ' Hundred';
    if (rest) result += (result ? ' ' : '') + convertTwoDigits(rest);
    return result;
  }

  const num = Math.round(Number(amount));
  
  if (num === 0) return 'Zero Rupees Only';

  const crore = Math.floor(num / 10000000);
  const lakh = Math.floor((num % 10000000) / 100000);
  const thousand = Math.floor((num % 100000) / 1000);
  const rest = num % 1000;

  let result = '';
  if (crore) result += convertTwoDigits(crore) + ' Crore';
  if (lakh) result += (result ? ' ' : '') + convertTwoDigits(lakh) + ' Lakh';
  if (thousand) result += (result ? ' ' : '') + convertTwoDigits(thousand) + ' Thousand';
  if (rest) result += (result ? ' ' : '') + convertThreeDigits(rest);

  return result + ' Rupees Only';
}

/**
 * Format GST invoice number
 * 
 * @example
 * formatInvoiceNumber(123) → "INV-2026-00123"
 */
export function formatInvoiceNumber(invoiceId) {
  const year = new Date().getFullYear();
  const padded = String(invoiceId).padStart(5, '0');
  return `INV-${year}-${padded}`;
}

/**
 * Format phone number in Indian format
 * 
 * @example
 * formatPhoneNumber('9876543210') → "+91 98765 43210"
 */
export function formatPhoneNumber(phone) {
  if (!phone) return '';
  
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  
  return phone;
}