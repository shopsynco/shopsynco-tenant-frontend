/** Same default measurement ID as shopsynco-website. */
export const DEFAULT_GA_ID = "G-EJYWGL1X7G";

/** Reject Vercel placeholder values like "VITE_GA_ID". */
export function resolveGaId(): string {
  const raw = (import.meta.env.VITE_GA_ID as string | undefined)?.trim();
  if (!raw || raw === "VITE_GA_ID" || !/^G-[A-Z0-9]+$/.test(raw)) {
    return DEFAULT_GA_ID;
  }
  return raw;
}

export const GA_MEASUREMENT_ID = resolveGaId();

export type GoogleAnalyticsUserData = {
  em?: string;
  ph?: string;
  fn?: string;
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let initialized = false;

export function initGoogleAnalytics() {
  const id = GA_MEASUREMENT_ID;
  if (!id || initialized || typeof document === "undefined") return;

  initialized = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag("js", new Date());

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
}

export function trackGoogleAnalyticsPageView(pagePath: string) {
  initGoogleAnalytics();
  const id = GA_MEASUREMENT_ID;
  if (!id || !window.gtag) return;
  window.gtag("config", id, { page_path: pagePath });
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

function trackGoogleAnalyticsEvent(
  eventName: string,
  params?: Record<string, unknown>,
  dedupeKey?: string,
) {
  initGoogleAnalytics();
  if (!window.gtag) return;
  if (dedupeKey) {
    if (hasSessionDedupe(dedupeKey)) return;
    markSessionDedupe(dedupeKey);
  }
  window.gtag("event", eventName, params);
}

function userSuffix(userData?: GoogleAnalyticsUserData): string {
  return userData?.em?.trim().toLowerCase() || "";
}

export function trackGoogleAnalyticsCompleteRegistration(
  userData?: GoogleAnalyticsUserData,
) {
  const suffix = userSuffix(userData);
  const params = {
    method: "tenant_signup",
    ...(userData?.fn ? { first_name: userData.fn } : {}),
  };
  trackGoogleAnalyticsEvent(
    "complete_registration",
    params,
    sessionDedupeKey("ga_complete_registration", suffix),
  );
  trackGoogleAnalyticsEvent(
    "sign_up",
    params,
    sessionDedupeKey("ga_sign_up", suffix),
  );
}

export function trackGoogleAnalyticsShopSyncoLogin(userData?: GoogleAnalyticsUserData) {
  const suffix = userSuffix(userData);
  trackGoogleAnalyticsEvent(
    "shop_synco_login",
    { method: "tenant_login" },
    sessionDedupeKey("ga_shop_synco_login", suffix),
  );
  trackGoogleAnalyticsEvent(
    "login",
    { method: "tenant_login" },
    sessionDedupeKey("ga_login", suffix),
  );
}

export function trackGoogleAnalyticsStoreSetup(userData?: GoogleAnalyticsUserData) {
  trackGoogleAnalyticsEvent(
    "store_setup",
    { funnel_step: "store_created" },
    sessionDedupeKey("ga_store_setup", userSuffix(userData)),
  );
}

export function trackGoogleAnalyticsInitiateCheckout(
  value?: number,
  currency = "INR",
) {
  const params: Record<string, unknown> = { currency };
  if (value != null && Number.isFinite(value) && value > 0) {
    params.value = value;
  }
  trackGoogleAnalyticsEvent("begin_checkout", params);
  trackGoogleAnalyticsEvent("initiate_checkout", params);
}

export function trackGoogleAnalyticsSubscribedButtonClick(params?: {
  planId?: string;
  planName?: string;
  value?: number;
  currency?: string;
}) {
  const eventParams: Record<string, unknown> = {
    currency: params?.currency || "INR",
  };
  if (params?.planId) eventParams.plan_id = String(params.planId);
  if (params?.planName) eventParams.plan_name = params.planName;
  if (params?.value != null && Number.isFinite(params.value) && params.value > 0) {
    eventParams.value = params.value;
  }
  trackGoogleAnalyticsEvent("subscribed_button_click", eventParams);
}

export function trackGoogleAnalyticsPaymentSuccess(params?: {
  value?: number;
  currency?: string;
  dedupeKey?: string;
}) {
  const key = params?.dedupeKey || "ga_payment_success";
  if (hasSessionDedupe(key)) return;
  markSessionDedupe(key);

  const eventParams: Record<string, unknown> = {
    currency: String(params?.currency || "INR").toUpperCase(),
  };
  if (params?.value != null && Number.isFinite(params.value) && params.value > 0) {
    eventParams.value = params.value;
  }

  trackGoogleAnalyticsEvent("payment_success", eventParams);
  trackGoogleAnalyticsEvent("purchase", eventParams);
}
