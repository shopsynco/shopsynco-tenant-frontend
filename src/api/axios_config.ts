// Environment configuration
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://stagingbackend.shopsynco.com/";
export const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || "https://stagingbackend.shopsynco.com/";

/**
 * Public tenant URL template. Use `{slug}` for subdomain hosts.
 * - Production example: https://{slug}.shopsynco.com
 * - Leave unset for staging / single-host: dashboard stays on this SPA (current origin).
 */
export const TENANT_STOREFRONT_URL_TEMPLATE = (
  import.meta.env.VITE_TENANT_STOREFRONT_URL_TEMPLATE as string | undefined
)?.trim() ?? "";

export type PostStoreSetupDashboard = {
  /** Shown in UI and copy-to-clipboard */
  displayUrl: string;
  /** In-app navigation when the dashboard is this SPA */
  sameOriginPath: string | null;
  /** Full URL when leaving this host (e.g. real tenant subdomain) */
  leaveAppHref: string | null;
};

/** Where the user should land after store setup (staging vs subdomain production). */
export function resolvePostStoreSetupDashboard(
  storeSlug: string | null
): PostStoreSetupDashboard {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const slug = storeSlug?.trim() || "";
  const template = TENANT_STOREFRONT_URL_TEMPLATE;

  if (template.includes("{slug}")) {
    const href = template.replace(/\{slug\}/gi, slug);
    if (origin && href.startsWith(origin)) {
      return {
        displayUrl: `${origin}/dashboard`,
        sameOriginPath: "/dashboard",
        leaveAppHref: null,
      };
    }
    return {
      displayUrl: href.replace(/\/$/, ""),
      sameOriginPath: null,
      leaveAppHref: href.replace(/\/$/, ""),
    };
  }

  if (template.length > 0) {
    const base = template.replace(/\/$/, "");
    const href = `${base}/dashboard`;
    if (origin && href.startsWith(origin)) {
      return {
        displayUrl: href,
        sameOriginPath: "/dashboard",
        leaveAppHref: null,
      };
    }
    return {
      displayUrl: href,
      sameOriginPath: null,
      leaveAppHref: href,
    };
  }

  return {
    displayUrl: `${origin}/dashboard`,
    sameOriginPath: "/dashboard",
    leaveAppHref: null,
  };
}