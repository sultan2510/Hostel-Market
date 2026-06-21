// Shared validation rules used by both CompleteProfile (signup) and
// EditProfile (account settings), so the rule only lives in one place.

/**
 * Pakistani mobile numbers are 11 digits total when written locally
 * (0 + 3 + 9 digits, e.g. 03001234567), or the +92 international form.
 * Returns true if valid.
 */
export function isValidPakistaniPhone(rawValue) {
  const cleaned = rawValue.trim().replace(/[\s-]/g, '');
  const localPattern = /^03\d{9}$/; // 11 digits: 03XXXXXXXXX
  const intlPattern = /^\+923\d{9}$/; // +92 3XXXXXXXXX
  return localPattern.test(cleaned) || intlPattern.test(cleaned);
}

export const PHONE_VALIDATION_ERROR =
  'Phone number must be exactly 11 digits, starting with 03 (e.g. 03001234567).';