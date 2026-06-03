import axiosInstance from "../../store/refreshToken/tokenUtils";
import {
  applyTenantOnboardingFlags,
  type TenantOnboardingFlags,
} from "../../utils/planFlow";
import { readTenantSlugFromAccessToken } from "../../utils/tenantStoreSlug";

export type TenantAuthSession = TenantOnboardingFlags & {
  email?: string;
  tenant_slug?: string | null;
};

/** Re-sync onboarding flags from backend (after reload or stale logout state). */
export async function syncTenantPortalSession(): Promise<TenantAuthSession> {
  const { data } = await axiosInstance.get<TenantAuthSession>(
    "api/tenants/auth/me/",
  );
  const slug =
    (typeof data?.tenant_slug === "string" && data.tenant_slug.trim()) ||
    readTenantSlugFromAccessToken() ||
    null;
  applyTenantOnboardingFlags(data, slug);
  return data;
}
