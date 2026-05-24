import axiosInstance from "../store/refreshToken/tokenUtils";

/**
 * Read tenant_slug from JWT (set at login when user has a tenant).
 * Does not verify the signature — only for routing / API URL injection.
 */
export function readTenantSlugFromAccessToken(): string | null {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;
  try {
    const body = token.split(".")[1];
    if (!body) return null;
    const base64 = body.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded)) as Record<string, unknown>;
    const slug =
      (typeof payload.tenant_slug === "string" && payload.tenant_slug) ||
      (typeof payload.tenant_schema === "string" && payload.tenant_schema) ||
      null;
    const trimmed = slug?.trim();
    return trimmed || null;
  } catch {
    return null;
  }
}

/**
 * Resolve store slug for API URL injection.
 * JWT tenant_slug wins over stale localStorage (e.g. after shopping on another store).
 */
export function resolveTenantStoreSlugForApi(): string | null {
  const fromJwt = readTenantSlugFromAccessToken();
  const existing = localStorage.getItem("store_slug")?.trim() || "";
  if (fromJwt) {
    if (fromJwt !== existing) {
      localStorage.setItem("store_slug", fromJwt);
    }
    return fromJwt;
  }
  return existing || null;
}

/**
 * Ensure localStorage has store_slug so axios injects /api/tenants/<slug>/...
 * Order: JWT claim → existing slug → discover by email.
 */
export async function ensureTenantStoreSlugForApi(): Promise<string | null> {
  const fromJwt = resolveTenantStoreSlugForApi();
  if (fromJwt) return fromJwt;

  const email = localStorage.getItem("user_email")?.trim();
  if (!email) return null;

  try {
    const res = await axiosInstance.post("api/tenants/discover/", { email });
    const data = res.data as Record<string, unknown>;
    const nested =
      data.data && typeof data.data === "object"
        ? (data.data as Record<string, unknown>)
        : null;
    const slug =
      (typeof data.tenant_slug === "string" && data.tenant_slug) ||
      (typeof data.slug === "string" && data.slug) ||
      (nested && typeof nested.tenant_slug === "string" && nested.tenant_slug) ||
      null;
    if (slug && String(slug).trim()) {
      const s = String(slug).trim();
      localStorage.setItem("store_slug", s);
      return s;
    }
  } catch {
    /* discover is best-effort */
  }
  return null;
}
