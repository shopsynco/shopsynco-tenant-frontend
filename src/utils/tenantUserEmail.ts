import axiosInstance from "../store/refreshToken/tokenUtils";
import { decodeJwtPayload } from "../features/auth/utils/googleOAuth";
import { readTenantSlugFromAccessToken } from "./tenantStoreSlug";

const STORAGE_KEY = "user_email";

/** Read cached signup/login email from localStorage or JWT access token. */
export function readStoredTenantUserEmail(): string {
  try {
    const fromStorage = localStorage.getItem(STORAGE_KEY)?.trim();
    if (fromStorage) return fromStorage;
  } catch {
    /* ignore */
  }

  const token = localStorage.getItem("accessToken");
  if (!token) return "";

  const payload = decodeJwtPayload(token);
  const email =
    typeof payload?.email === "string" ? payload.email.trim() : "";
  return email;
}

export function persistTenantUserEmail(email: string): void {
  const trimmed = email.trim();
  if (!trimmed) return;
  try {
    localStorage.setItem(STORAGE_KEY, trimmed);
  } catch {
    /* ignore */
  }
}

/**
 * Resolve the authenticated tenant user's email for onboarding forms.
 * Order: cache → JWT → public session API → tenant profile API.
 */
export async function ensureTenantUserEmail(): Promise<string> {
  let email = readStoredTenantUserEmail();
  if (email) {
    persistTenantUserEmail(email);
    return email;
  }

  try {
    const res = await axiosInstance.get("api/tenants/auth/me/");
    email = String(res.data?.email || res.data?.user?.email || "").trim();
    if (email) {
      persistTenantUserEmail(email);
      return email;
    }
  } catch {
    /* fall through */
  }

  const slug =
    localStorage.getItem("store_slug")?.trim() ||
    readTenantSlugFromAccessToken() ||
    "";
  if (slug) {
    try {
      const res = await axiosInstance.get(`api/tenants/${slug}/auth/profile/`);
      email = String(res.data?.user?.email || "").trim();
      if (email) {
        persistTenantUserEmail(email);
        return email;
      }
    } catch {
      /* ignore */
    }
  }

  return "";
}
