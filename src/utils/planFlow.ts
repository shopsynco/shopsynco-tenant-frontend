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
