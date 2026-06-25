import type { OnboardingShareAction, OnboardingStepId } from "./types";

type OnboardingEvent =
  | "onboarding_card_viewed"
  | "onboarding_step_clicked"
  | "onboarding_step_completed"
  | "onboarding_wizard_opened"
  | "onboarding_wizard_skipped"
  | "onboarding_store_link_copied"
  | "onboarding_store_opened"
  | "onboarding_whatsapp_shared"
  | "onboarding_completed";

function track(event: OnboardingEvent, payload?: Record<string, unknown>): void {
  if (import.meta.env.DEV) {
    console.debug("[tenant onboarding analytics]", event, payload ?? {});
  }

  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", event, {
      event_category: "tenant_onboarding",
      ...payload,
    });
  }
}

export function trackOnboardingCardViewed(): void {
  track("onboarding_card_viewed");
}

export function trackOnboardingStepClicked(stepId: OnboardingStepId): void {
  track("onboarding_step_clicked", { step_id: stepId });
}

export function trackOnboardingStepCompleted(stepId: OnboardingStepId): void {
  track("onboarding_step_completed", { step_id: stepId });
}

export function trackOnboardingWizardOpened(): void {
  track("onboarding_wizard_opened");
}

export function trackOnboardingWizardSkipped(stepId: OnboardingStepId): void {
  track("onboarding_wizard_skipped", { step_id: stepId });
}

export function trackOnboardingShareAction(action: OnboardingShareAction): void {
  if (action === "copy") track("onboarding_store_link_copied");
  if (action === "open") track("onboarding_store_opened");
  if (action === "whatsapp") track("onboarding_whatsapp_shared");
}

export function trackOnboardingCompleted(): void {
  track("onboarding_completed");
}
