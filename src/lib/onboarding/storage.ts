const SHARE_KEY_PREFIX = "onboarding_store_shared";
const WIZARD_SESSION_KEY = "onboarding_wizard_hidden";
const WIZARD_PERMANENT_KEY_PREFIX = "onboarding_wizard_dismissed_permanent";

function tenantKey(prefix: string): string {
  const slug = (localStorage.getItem("store_slug") || "default").trim();
  return `${prefix}_${slug}`;
}

export function isStoreShareCompleted(): boolean {
  try {
    return localStorage.getItem(tenantKey(SHARE_KEY_PREFIX)) === "1";
  } catch {
    return false;
  }
}

export function markStoreShareCompleted(): void {
  try {
    localStorage.setItem(tenantKey(SHARE_KEY_PREFIX), "1");
  } catch {
    // ignore storage failures
  }
}

export function isWizardHiddenForSession(): boolean {
  try {
    return sessionStorage.getItem(WIZARD_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function hideWizardForSession(): void {
  try {
    sessionStorage.setItem(WIZARD_SESSION_KEY, "1");
  } catch {
    // ignore storage failures
  }
}

export function isWizardPermanentlyDismissed(): boolean {
  try {
    return localStorage.getItem(tenantKey(WIZARD_PERMANENT_KEY_PREFIX)) === "1";
  } catch {
    return false;
  }
}

export function dismissWizardPermanently(): void {
  try {
    localStorage.setItem(tenantKey(WIZARD_PERMANENT_KEY_PREFIX), "1");
  } catch {
    // ignore storage failures
  }
}
