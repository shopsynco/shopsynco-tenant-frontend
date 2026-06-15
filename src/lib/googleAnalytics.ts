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
  const id = GA_MEASUREMENT_ID;
  if (!id || !window.gtag) return;
  window.gtag("config", id, { page_path: pagePath });
}
