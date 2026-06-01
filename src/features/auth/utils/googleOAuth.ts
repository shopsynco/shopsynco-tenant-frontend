import { BASE_URL } from "../../../api/axios_config";

/** Decode a JWT payload (base64url) without verifying its signature. */
export function decodeJwtPayload(
  token: string
): Record<string, unknown> | null {
  const raw = (token || "").trim();
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length < 2) return null;
  try {
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64 + "=".repeat((4 - (b64.length % 4 || 4)) % 4);
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Start tenant Google OAuth: fetch JSON from backend, then redirect to Google.
 * Do not navigate the browser to the API URL directly (that shows DRF JSON).
 */
export async function startTenantGoogleOAuth(
  callbackPath: string
): Promise<void> {
  const callbackReturn = `${window.location.origin}${callbackPath}`;
  const initUrl =
    `${BASE_URL}api/user/auth/google/login/?flow=tenant` +
    `&return_to=${encodeURIComponent(callbackReturn)}`;

  const response = await fetch(initUrl, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  const data = (await response.json().catch(() => ({}))) as {
    redirect_url?: string;
    detail?: string;
    message?: string;
  };

  if (!response.ok) {
    throw new Error(
      data?.detail || data?.message || "Failed to start Google sign-in."
    );
  }

  const redirectUrl = (data?.redirect_url || "").trim();
  if (!redirectUrl) {
    throw new Error("Google redirect URL was not returned by the server.");
  }

  window.location.assign(redirectUrl);
}

export function oauthErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case "tenant_signup_required":
    case "google_customer_account_conflict":
      return (
        "This email is linked to a shopper account on another store. " +
        "Use Sign up below to create your own store — you can keep using this email when shopping elsewhere."
      );
    case "google_tenant_not_found":
      return (
        "We couldn't find a store owner account for this email. " +
        "Sign up to create a store, or use the correct account."
      );
    case "google_auth_failed":
      return "Google sign-in failed. Please try again or use email and password.";
    default:
      return "We couldn't complete Google sign-in. Please try again.";
  }
}

/** OAuth callback error codes that should send the user to tenant signup. */
export const TENANT_SIGNUP_OAUTH_ERRORS = new Set([
  "tenant_signup_required",
  "google_customer_account_conflict",
  "google_tenant_not_found",
]);

export function isTenantSignupOAuthError(errorCode: string): boolean {
  return TENANT_SIGNUP_OAUTH_ERRORS.has((errorCode || "").trim());
}

export function tenantSignupPath(email?: string): string {
  const trimmed = (email || "").trim();
  return trimmed
    ? `/email-verify?email=${encodeURIComponent(trimmed)}`
    : "/email-verify";
}
