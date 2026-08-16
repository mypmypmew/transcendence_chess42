const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function passwordMeetsPolicy(password) {
  if (typeof password !== 'string') {
    return false;
  }

  const policy = {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    specialCharacter: /[^A-Za-z0-9\s]/.test(password),
  };

  return Object.values(policy).every(Boolean);
}

function normalizeEmail(email) {
  return String(email).trim().toLowerCase();
}

function validateRegisterInput({ username, email, password }) {
  const errors = [];

  if (typeof username !== 'string' || !USERNAME_RE.test(username.trim())) {
    errors.push('username must be 3-20 characters: letters, numbers, underscore');
  }
  if (typeof email !== 'string' || !EMAIL_RE.test(normalizeEmail(email))) {
    errors.push('email must be a valid email address');
  }
  if (!passwordMeetsPolicy(password)) {
    errors.push('password must be at least 8 characters and include an uppercase letter, number, and special character');
  }

  return errors;
}

function validateLoginInput({ email, password }) {
  const errors = [];

  if (typeof email !== 'string' || email.trim() === '') {
    errors.push('email is required');
  }
  if (typeof password !== 'string' || password === '') {
    errors.push('password is required');
  }

  return errors;
}

module.exports = {
  normalizeEmail,
  validateRegisterInput,
  validateLoginInput,
};