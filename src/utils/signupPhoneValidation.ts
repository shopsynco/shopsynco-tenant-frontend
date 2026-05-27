/** Matches backend tenants `_validate_and_normalize_signup_phone`: E.164 length 8–15 digits. */
export function isValidSignupPhone(raw: string): boolean {
  const s = raw.trim();
  if (!s) return false;
  const compact = s.replace(/[\s\-().]/g, '');
  const digits = compact.startsWith("+") ? compact.slice(1) : compact;
  if (!/^\d+$/.test(digits)) return false;
  return digits.length >= 8 && digits.length <= 15;
}

export const SIGNUP_PHONE_HINT =
  "Enter a valid phone number: 8–15 digits with optional + (include country code).";
