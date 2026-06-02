// Environment configuration
/** Resolve API base URL at call time (hostname wins over stale build env). */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();
    if (host === "tenant.shopsynco.com") {
      return "https://backend.shopsynco.com/";
    }
    if (host === "stagingtenant.shopsynco.com") {
      return "https://stagingbackend.shopsynco.com/";
    }
  }

  const fromEnv = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim();
  if (fromEnv) return fromEnv.endsWith("/") ? fromEnv : `${fromEnv}/`;

  return "https://stagingbackend.shopsynco.com/";
}

function resolveMediaBaseUrl(): string {
  const fromEnv = (import.meta.env.VITE_MEDIA_URL as string | undefined)?.trim();
  if (fromEnv) return fromEnv.endsWith("/") ? fromEnv : `${fromEnv}/`;
  return getApiBaseUrl();
}

export const BASE_URL = getApiBaseUrl();
export const MEDIA_URL = resolveMediaBaseUrl();

/**
 * Public tenant URL template. Use `{slug}` for subdomain hosts.
 * - Production example: https://{slug}.shopsynco.com
 * - Leave unset for staging / single-host: dashboard stays on this SPA (current origin).
 */
export const TENANT_STOREFRONT_URL_TEMPLATE = (
  import.meta.env.VITE_TENANT_STOREFRONT_URL_TEMPLATE as string | undefined
)?.trim() ?? "";

import {
  isInternalCheckoutSchemaSlug,
  platformDomainSuffix,
  readStorefrontHost,
  storefrontUrlFromHost,
} from "../utils/storefrontHost";

export type PostStoreSetupDashboard = {
  /** Merchant SaaS dashboard URL (Go to Dashboard) */
  displayUrl: string;
  /** Customer storefront URL */
  storefrontUrl: string;
  /** In-app navigation when the dashboard is this SPA */
  sameOriginPath: string | null;
  /** Full-page navigation when dashboard is on another host */
  leaveAppHref: string | null;
};

/** Where the user should land after store setup (merchant dashboard, not storefront). */
export function resolvePostStoreSetupDashboard(
  storeSlug: string | null
): PostStoreSetupDashboard {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const appOrigin = (resolveTenantAppOrigin() || origin).replace(/\/$/, "");
  const dashboardUrl = `${appOrigin}/dashboard`;
  const onSameOrigin =
    appOrigin.toLowerCase() === origin.replace(/\/$/, "").toLowerCase();

  const storefrontUrl = resolveTenantStorefrontUrl(storeSlug);

  return {
    displayUrl: dashboardUrl,
    storefrontUrl,
    sameOriginPath: onSameOrigin ? "/dashboard" : null,
    leaveAppHref: onSameOrigin ? null : dashboardUrl,
  };
}

/** Public storefront host for a tenant schema slug (e.g. acme → acme.shopsynco.com). */
export function defaultTenantHostFromSlug(slug: string): string {
  const s = (slug || "").trim().toLowerCase();
  if (!s) return "";
  const saved = readStorefrontHost();
  if (saved) return saved;
  if (isInternalCheckoutSchemaSlug(s)) return "";
  return `${s}.${platformDomainSuffix()}`;
}

export function resolveTenantStorefrontUrl(storeSlug: string | null): string {
  const saved = readStorefrontHost();
  if (saved) return storefrontUrlFromHost(saved);

  const slug = (storeSlug || "").trim().toLowerCase();
  if (!slug || isInternalCheckoutSchemaSlug(slug)) return "";

  const template = TENANT_STOREFRONT_URL_TEMPLATE;
  if (template.includes("{slug}")) {
    return template.replace(/\{slug\}/gi, slug).replace(/\/$/, "");
  }

  return `https://${slug}.${platformDomainSuffix()}`;
}

/**
 * Base URL for the tenant manager (ShopSynco SaaS dashboard) SPA.
 * Set VITE_TENANT_MANAGER_ORIGIN (no trailing slash). Falls back from API host on staging.
 */
export function resolveTenantManagerBaseUrl(): string {
  const fromEnv = (
    import.meta.env.VITE_TENANT_MANAGER_ORIGIN as string | undefined
  )?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const api = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  if (api.includes("stagingbackend.shopsynco.com")) {
    return "https://stagingmanager.shopsynco.com";
  }
  return "";
}

/**
 * Canonical origin for this tenant SaaS web app (login, email-verify, signup).
 * Use for full-page redirects so signup always lands on the correct Vite host.
 * Set VITE_TENANT_APP_ORIGIN (no trailing slash). With staging API, defaults to
 * https://stagingtenant.shopsynco.com; otherwise current window origin.
 */
export function resolveTenantAppOrigin(): string {
  const fromEnv = (
    import.meta.env.VITE_TENANT_APP_ORIGIN as string | undefined
  )?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  const api = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
  if (api.includes("stagingbackend.shopsynco.com")) {
    return "https://stagingtenant.shopsynco.com";
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "";
}

/** Full-page navigation to a path on the tenant app (e.g. /email-verify). */
export function redirectToTenantAppPath(path: string): void {
  if (typeof window === "undefined") return;
  const origin = resolveTenantAppOrigin();
  const p = path.startsWith("/") ? path : `/${path}`;
  window.location.assign(`${origin}${p}`);
}