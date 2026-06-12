import { ensureTenantUserEmail, readStoredTenantUserEmail } from "../utils/tenantUserEmail";

/** Same pixel as tenant app index.html and marketing site. */
export const META_PIXEL_ID = "854120904427076";

declare global {
  interface Window {
    fbq?: (
      command: string,
      eventName: string,
      customData?: Record<string, unknown>,
      options?: Record<string, unknown>,
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

/** Advanced matching belongs on fbq('init'), not as a 4th arg to track(). */
function applyAdvancedMatchingInit(userData?: MetaPixelUserData) {
  if (!window.fbq) return;
  const matching = buildAdvancedMatchingParams(userData);
  if (matching) {
    window.fbq("init", META_PIXEL_ID, matching);
  }
}

function trackMetaPixelEvent(
  eventName: string,
  customData?: Record<string, unknown>,
  userData?: MetaPixelUserData,
) {
  if (!window.fbq) return;

  applyAdvancedMatchingInit(userData);

  if (customData && Object.keys(customData).length > 0) {
    window.fbq("track", eventName, customData);
    return;
  }
  window.fbq("track", eventName);
}

function trackMetaPixelCustomEvent(
  eventName: string,
  customData?: Record<string, unknown>,
  userData?: MetaPixelUserData,
) {
  if (!window.fbq) return;

  applyAdvancedMatchingInit(userData);

  if (customData && Object.keys(customData).length > 0) {
    window.fbq("trackCustom", eventName, customData);
    return;
  }
  window.fbq("trackCustom", eventName);
}

function sessionDedupeKey(prefix: string, suffix = ""): string {
  return `${prefix}${suffix ? `_${suffix}` : ""}`;
}

function hasSessionDedupe(key: string): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(sessionStorage.getItem(key));
}

function markSessionDedupe(key: string) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(key, "1");
}

export function trackMetaPixelPageView() {
  trackMetaPixelEvent("PageView");
}

export function trackMetaPixelCompleteRegistration(userData?: MetaPixelUserData) {
  const dedupeKey = sessionDedupeKey(
    "meta_pixel_complete_registration",
    userData?.em?.trim().toLowerCase() || "",
  );
  if (hasSessionDedupe(dedupeKey)) return;
  markSessionDedupe(dedupeKey);
  trackMetaPixelEvent("CompleteRegistration", undefined, userData);
}

/** Successful tenant login — Meta custom conversion event. */
export function trackMetaPixelShopSyncoLogin(userData?: MetaPixelUserData) {
  const dedupeKey = sessionDedupeKey(
    "meta_pixel_shop_synco_login",
    userData?.em?.trim().toLowerCase() || "",
  );
  if (hasSessionDedupe(dedupeKey)) return;
  markSessionDedupe(dedupeKey);
  trackMetaPixelCustomEvent("ShopSyncoLogin", {}, userData);
}

/** Merchant finished store provisioning — custom conversion event. */
export function trackMetaPixelStoreSetup(userData?: MetaPixelUserData) {
  const dedupeKey = sessionDedupeKey("meta_pixel_store_setup");
  if (hasSessionDedupe(dedupeKey)) return;
  markSessionDedupe(dedupeKey);
  trackMetaPixelCustomEvent("StoreSetup", {}, userData);
}

/** @deprecated Prefer trackMetaPixelStoreSetup for store-created milestone. */
export function trackMetaPixelLead(userData?: MetaPixelUserData) {
  trackMetaPixelStoreSetup(userData);
}

export function trackMetaPixelInitiateCheckout(
  value?: number,
  currency = "INR",
  userData?: MetaPixelUserData,
) {
  const payload: Record<string, unknown> = { currency };
  if (value != null && Number.isFinite(value) && value > 0) {
    payload.value = value;
  }
  trackMetaPixelEvent("InitiateCheckout", payload, userData);
}

/** Custom event for plan subscribe / pay-now intent (Meta custom conversion). */
export function trackMetaPixelSubscribedButtonClick(params?: {
  planId?: string;
  planName?: string;
  value?: number;
  currency?: string;
}) {
  const customData: Record<string, unknown> = {
    currency: params?.currency || "INR",
  };
  if (params?.planId) customData.content_ids = [String(params.planId)];
  if (params?.planName) customData.content_name = params.planName;
  if (params?.value != null && Number.isFinite(params.value) && params.value > 0) {
    customData.value = params.value;
  }
  trackMetaPixelCustomEvent("SubscribedButtonClick", customData);
}

export function trackMetaPixelPurchase(
  value: number,
  currency = "INR",
  userData?: MetaPixelUserData,
  dedupeKey?: string,
) {
  const key = dedupeKey || `meta_pixel_purchase_${value}_${currency}`;
  if (hasSessionDedupe(key)) return;
  markSessionDedupe(key);
  trackMetaPixelEvent(
    "Purchase",
    {
      value,
      currency,
    },
    userData,
  );
}

/** Verified subscription payment — Meta custom conversion event. */
export function trackMetaPixelPaymentSuccess(
  params?: {
    value?: number;
    currency?: string;
    dedupeKey?: string;
  },
  userData?: MetaPixelUserData,
) {
  const key = params?.dedupeKey || "meta_pixel_payment_success";
  if (hasSessionDedupe(key)) return;
  markSessionDedupe(key);

  const customData: Record<string, unknown> = {};
  const currency = String(params?.currency || "INR").toUpperCase();
  if (currency) customData.currency = currency;
  if (params?.value != null && Number.isFinite(params.value) && params.value > 0) {
    customData.value = params.value;
  }

  trackMetaPixelCustomEvent("PaymentSuccess", customData, userData);
}

/** Resolve email for logged-in purchase events. */
export async function resolveMetaPixelUserDataForPurchase(): Promise<MetaPixelUserData | undefined> {
  const cachedEmail = readStoredTenantUserEmail();
  const email = cachedEmail || (await ensureTenantUserEmail());
  if (!email) return undefined;
  return { em: email };
}
