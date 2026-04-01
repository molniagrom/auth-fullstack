export function normalizeEmail(email: string | undefined) {
  return email?.trim().toLowerCase() ?? '';
}

export function isValidEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}

export function createVerificationCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export function cryptoRandomId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
