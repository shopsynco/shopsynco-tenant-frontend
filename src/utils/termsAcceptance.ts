/**
 * Onboarding terms — unpaid tenants must scroll and agree before /plans.
 */

const ONBOARDING_TERMS_KEY = "tenant_onboarding_terms_accepted";

export function hasAcceptedOnboardingTerms(): boolean {
  try {
    return sessionStorage.getItem(ONBOARDING_TERMS_KEY) === "1";
  } catch {
    return false;
  }
}

export function markOnboardingTermsAccepted(): void {
  try {
    sessionStorage.setItem(ONBOARDING_TERMS_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function clearOnboardingTermsAcceptance(): void {
  try {
    sessionStorage.removeItem(ONBOARDING_TERMS_KEY);
  } catch {
    /* ignore */
  }
}

/** First route after login for users who have not paid yet. */
export function unpaidTenantEntryPath(): string {
  return hasAcceptedOnboardingTerms() ? "/plans" : "/onboarding/terms";
}
