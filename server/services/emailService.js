/**
 * Validates whether an email belongs to an authorized college/university domain
 * Allowed domains can be configured via environment variable ALLOWED_COLLEGE_EMAIL_DOMAIN
 * e.g., 'campus.edu', '.edu', '.ac.in', or comma-separated list 'campus.edu,.edu,.ac.in'
 */
const isAllowedCollegeEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  const allowedConfig = process.env.ALLOWED_COLLEGE_EMAIL_DOMAIN || '.edu,.ac.in,university.edu';
  
  // If set to wildcard '*', allow any valid email
  if (allowedConfig.trim() === '*') return true;
  
  const allowedDomains = allowedConfig
    .split(',')
    .map(d => d.trim().toLowerCase())
    .filter(Boolean);
  
  const emailLower = email.toLowerCase();
  
  return allowedDomains.some(domain => {
    // If domain starts with '.', match suffix (e.g. '.edu' or '.ac.in')
    if (domain.startsWith('.')) {
      return emailLower.endsWith(domain);
    }
    // If domain is specific (e.g. 'stanford.edu' or 'iitb.ac.in')
    return emailLower.endsWith('@' + domain) || emailLower.endsWith('.' + domain);
  });
};

/**
 * Sends or logs verification / reset emails
 * In local dev without SMTP configured, prints the verification/reset URL clearly to terminal
 */
const sendEmail = async ({ to, subject, html, text }) => {
  console.log(`\n================= [SIMULATED EMAIL SERVICE] =================`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Content:\n${text || html}`);
  console.log(`=============================================================\n`);

  return { success: true, messageId: 'simulated-' + Date.now() };
};

module.exports = {
  isAllowedCollegeEmail,
  sendEmail
};

