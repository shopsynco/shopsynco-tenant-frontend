import { getApiBaseUrl } from "../api/axios_config";

/** Public ShopSynco marketing website (shopsynco.com). */
export function resolveMarketingWebsiteUrl(): string {
  const fromEnv = (
    import.meta.env.VITE_MARKETING_WEBSITE_URL as string | undefined
  )?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");

  if (typeof window !== "undefined") {
    const host = window.location.hostname.toLowerCase();
    if (host === "tenant.shopsynco.com" || host === "manager.shopsynco.com") {
      return "https://www.shopsynco.com";
    }
    if (host.includes("staging")) {
      return "https://staging.shopsynco.com";
    }
  }

  const api = getApiBaseUrl().replace(/\/$/, "");
  if (api.includes("stagingbackend.shopsynco.com")) {
    return "https://staging.shopsynco.com";
  }

  return "https://www.shopsynco.com";
}
