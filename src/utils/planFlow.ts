import { unpaidTenantEntryPath } from "./termsAcceptance";

/**
 * Controls whether /plans may navigate back to the dashboard.
 * First-time checkout (login → plans) must not skip payment by opening the dashboard.
 */

const SESSION_ALLOW_DASHBOARD_BACK = "plans_allow_dashboard_back";
const LOCAL_SUBSCRIPTION_ACTIVE = "tenant_subscription_active";

export function setPlansEntryFromCheckout(): void {
  try {
    sessionStorage.removeItem(SESSION_ALLOW_DASHBOARD_BACK);
  } catch {
    /* ignore */
  }
}

/** Call before navigate("/plans") from dashboard / upgrade / manage billing. */
export function setPlansEntryFromDashboard(): void {
  try {
    sessionStorage.setItem(SESSION_ALLOW_DASHBOARD_BACK, "1");
  } catch {
    /* ignore */
  }
}

export function canExitPlansToDashboard(): boolean {
  try {
    return (
      sessionStorage.getItem(SESSION_ALLOW_DASHBOARD_BACK) === "1" ||
      localStorage.getItem(LOCAL_SUBSCRIPTION_ACTIVE) === "1"
    );
  } catch {
    return false;
  }
}

/** Call after successful payment before redirecting to success / dashboard. */
export function markTenantSubscriptionActive(): void {
  try {
    localStorage.setItem(LOCAL_SUBSCRIPTION_ACTIVE, "1");
  } catch {
    /* ignore */
  }
}

export function clearPlanFlowFlags(): void {
  try {
    sessionStorage.removeItem(SESSION_ALLOW_DASHBOARD_BACK);
    localStorage.removeItem(LOCAL_SUBSCRIPTION_ACTIVE);
  } catch {
    /* ignore */
  }
}

/** Mirrors authSlice session keys — clear when store + contact onboarding is finished. */
const SESSION_REQUIRES_STORE_SETUP = "tenant_requires_store_setup";
const SESSION_STORE_SETUP_INCOMPLETE = "tenant_store_setup_incomplete";
const LOCAL_STORE_ONBOARDING_COMPLETE = "tenant_store_onboarding_complete";

/** Call when store setup is fully complete so PrivateRoute stops sending users back to /setup-store. */
export function markStoreOnboardingComplete(): void {
  try {
    sessionStorage.removeItem(SESSION_REQUIRES_STORE_SETUP);
    sessionStorage.removeItem(SESSION_STORE_SETUP_INCOMPLETE);
    localStorage.setItem(LOCAL_STORE_ONBOARDING_COMPLETE, "1");
  } catch {
    /* ignore */
  }
}

/** True when the tenant has finished store onboarding (local flags or live domain). */
export function resolveStoreSetupComplete(options?: { domain?: string }): boolean {
  try {
    if (localStorage.getItem(LOCAL_STORE_ONBOARDING_COMPLETE) === "1") {
      return true;
    }
    const domain = (options?.domain || "").trim();
    if (domain && domain !== "—") {
      return true;
    }
    if (sessionStorage.getItem(SESSION_STORE_SETUP_INCOMPLETE) === "1") {
      return false;
    }
    const slug = localStorage.getItem("store_slug")?.trim();
    return Boolean(slug);
  } catch {
    return false;
  }
}

export type TenantOnboardingFlags = {
  requires_store_setup?: boolean;
  has_active_subscription?: boolean;
  store_setup_incomplete?: boolean;
};

/** Route after password login, OAuth, or auth/me sync. */
export function resolvePostLoginNavigationPath(
  flags: TenantOnboardingFlags,
): string {
  if (!flags.has_active_subscription) {
    return unpaidTenantEntryPath();
  }
  if (flags.requires_store_setup) {
    return "/setup-store";
  }
  if (flags.store_setup_incomplete) {
    return "/setup-store-contact";
  }
  return "/dashboard";
}

/** Apply login / auth-me onboarding flags to localStorage + sessionStorage. */
export function applyTenantOnboardingFlags(
  flags: TenantOnboardingFlags,
  tenantSlug?: string | null,
): void {
  if (flags.has_active_subscription) {
    markTenantSubscriptionActive();
  } else {
    try {
      localStorage.removeItem(LOCAL_SUBSCRIPTION_ACTIVE);
    } catch {
      /* ignore */
    }
  }

  try {
    if (flags.requires_store_setup) {
      sessionStorage.setItem(SESSION_REQUIRES_STORE_SETUP, "1");
      localStorage.removeItem("store_slug");
    } else {
      sessionStorage.removeItem(SESSION_REQUIRES_STORE_SETUP);
      const slug = (tenantSlug || "").trim();
      if (slug) {
        localStorage.setItem("store_slug", slug);
      }
    }

    if (flags.store_setup_incomplete) {
      sessionStorage.setItem(SESSION_STORE_SETUP_INCOMPLETE, "1");
    } else {
      sessionStorage.removeItem(SESSION_STORE_SETUP_INCOMPLETE);
    }
  } catch {
    /* ignore */
  }
}
