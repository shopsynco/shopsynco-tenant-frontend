import { ensureTenantUserEmail, readStoredTenantUserEmail } from "../utils/tenantUserEmail";

declare global {
  interface Window {
    fbq?: (
      command: string,
      eventName: string,
      customData?: Record<string, unknown>,
      advancedMatching?: Record<string, string>,
    ) => void;
  }
}

export type MetaPixelUserData = {
  em?: string;
  ph?: string;
  fn?: string;
};

function normalizeMetaPixelEmail(email: string): string | undefined {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !normalized.includes("@")) return undefined;
  return normalized;
}

/** Meta expects E.164 digits only (no +). */
function normalizeMetaPixelPhone(raw: string): string | undefined {
  const compact = raw.trim().replace(/[\s\-().]/g, "");
  const digits = compact.startsWith("+") ? compact.slice(1) : compact;
  if (!/^\d{8,15}$/.test(digits)) return undefined;
  return digits;
}

function buildAdvancedMatchingParams(
  userData?: MetaPixelUserData,
): Record<string, string> | undefined {
  if (!userData) return undefined;

  const out: Record<string, string> = {};
  if (userData.em) {
    const em = normalizeMetaPixelEmail(userData.em);
    if (em) out.em = em;
  }
  if (userData.ph) {
    const ph = normalizeMetaPixelPhone(userData.ph);
    if (ph) out.ph = ph;
  }
  if (userData.fn) {
    const fn = userData.fn.trim().toLowerCase();
    if (fn) out.fn = fn;
  }

  return Object.keys(out).length ? out : undefined;
}

function trackMetaPixelEvent(
  eventName: string,
  customData?: Record<string, unknown>,
  userData?: MetaPixelUserData,
) {
  if (!window.fbq) return;

  const matching = buildAdvancedMatchingParams(userData);
  if (matching) {
    window.fbq("track", eventName, customData ?? {}, matching);
    return;
  }
  if (customData) {
    window.fbq("track", eventName, customData);
    return;
  }
  window.fbq("track", eventName);
}

export function trackMetaPixelPageView() {
  trackMetaPixelEvent("PageView");
}

export function trackMetaPixelCompleteRegistration(userData?: MetaPixelUserData) {
  trackMetaPixelEvent("CompleteRegistration", {}, userData);
}

export function trackMetaPixelPurchase(
  value: number,
  currency = "INR",
  userData?: MetaPixelUserData,
) {
  trackMetaPixelEvent(
    "Purchase",
    {
      value,
      currency,
    },
    userData,
  );
}

/** Resolve email for logged-in purchase events. */
export async function resolveMetaPixelUserDataForPurchase(): Promise<MetaPixelUserData | undefined> {
  const cachedEmail = readStoredTenantUserEmail();
  const email = cachedEmail || (await ensureTenantUserEmail());
  if (!email) return undefined;
  return { em: email };
}
