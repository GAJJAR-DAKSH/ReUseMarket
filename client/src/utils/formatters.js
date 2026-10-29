/**
 * Format price in Indian Rupees (INR)
 */
export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  if (Number(amount) === 0) return 'Free';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format date nicely
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

/**
 * Format date with time
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(date);
};

/**
 * Time relative to now (e.g., '5 mins ago', 'yesterday')
 */
export const timeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
};

export const CATEGORIES = [
  'Books & Notes',
  'Electronics',
  'Hostel Essentials',
  'Furniture',
  'Clothing',
  'Stationery',
  'Sports Equipment',
  'Other'
];

export const LISTING_TYPES = [
  'For Sale',
  'Free Donation',
  'Exchange'
];

export const CONDITIONS = [
  'Brand New',
  'Like New',
  'Gently Used',
  'Fair',
  'Heavily Used'
];

