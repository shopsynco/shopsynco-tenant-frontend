import axiosInstance from "../../store/refreshToken/tokenUtils";
import {
  applyTenantOnboardingFlags,
  resolvePostLoginNavigationPath,
  setPlansEntryFromCheckout,
  type TenantOnboardingFlags,
} from "../../utils/planFlow";
import { unpaidTenantEntryPath } from "../../utils/termsAcceptance";
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

/** After OAuth or token handoff — sync flags and hard-navigate to the right onboarding step. */
export async function completeTenantAuthAndRedirect(): Promise<void> {
  try {
    const session = await syncTenantPortalSession();
    if (!session.has_active_subscription) {
      setPlansEntryFromCheckout();
    }
    window.location.assign(resolvePostLoginNavigationPath(session));
  } catch {
    setPlansEntryFromCheckout();
    window.location.assign(unpaidTenantEntryPath());
  }
}
