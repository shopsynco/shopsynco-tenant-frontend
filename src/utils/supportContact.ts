/**
 * Billing / subscription support — opens the user's mail client.
 * Override with `VITE_SUPPORT_EMAIL` in `.env` (e.g. `VITE_SUPPORT_EMAIL=help@example.com`).
 */
const DEFAULT_SUPPORT_EMAIL = "support@shopsynco.com";

export function getSupportEmail(): string {
  const fromEnv = (import.meta.env.VITE_SUPPORT_EMAIL as string | undefined)?.trim();
  return fromEnv || DEFAULT_SUPPORT_EMAIL;
}

/** `mailto:` URL with optional pre-filled subject. */
export function getSupportMailtoUrl(subject: string): string {
  const email = getSupportEmail();
  return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}

/** Opens default mail app for ShopSynco support (billing / invoices). */
export function openContactSupport(context: string): void {
  const subject =
    context.trim().length > 0
      ? `ShopSynco — ${context.trim()}`
      : "ShopSynco — Billing & subscription support";
  window.location.assign(getSupportMailtoUrl(subject));
}
