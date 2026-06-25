import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import StoreShareActions from "./StoreShareActions";
import { ONBOARDING_STEPS } from "../../../../lib/onboarding/stepDefinitions";
import {
  trackOnboardingWizardOpened,
  trackOnboardingWizardSkipped,
  trackOnboardingStepClicked,
} from "../../../../lib/onboarding/analytics";
import { openManagerDashboardPath } from "../../../../lib/onboarding/managerNavigation";
import {
  dismissWizardPermanently,
  hideWizardForSession,
  isWizardHiddenForSession,
  isWizardPermanentlyDismissed,
} from "../../../../lib/onboarding/storage";
import type { OnboardingProgressState, OnboardingShareAction, OnboardingStepId } from "../../../../lib/onboarding/types";

type SetupWizardProps = {
  progress: OnboardingProgressState;
  onShareAction: (action: OnboardingShareAction) => void;
};

const WIZARD_COPY: Record<
  OnboardingStepId,
  { title: string; text: string; estimatedTime?: string }
> = {
  "upload-logo": {
    title: "Upload your logo",
    text: "Your logo helps customers recognize your brand.",
  },
  "add-product": {
    title: "Add your first product",
    text: "Customers cannot purchase until you add products.",
    estimatedTime: "2 minutes",
  },
  "add-category": {
    title: "Create a category",
    text: "Categories help customers find products easily.",
  },
  "customize-website": {
    title: "Customize your website",
    text: "Update banners, homepage content, and store information.",
  },
  "share-website": {
    title: "Share your website",
    text: "Your store is ready to share with customers.",
  },
};

function firstIncompleteIndex(steps: OnboardingProgressState["steps"]): number {
  const idx = ONBOARDING_STEPS.findIndex((s) => !steps[s.id]);
  return idx >= 0 ? idx : 0;
}

export default function SetupWizard({ progress, onShareAction }: SetupWizardProps) {
  const { steps, allComplete, storeUrl, loading } = progress;
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const hasAttemptedOpen = useRef(false);

  const currentStep = ONBOARDING_STEPS[stepIndex];
  const wizardCopy = currentStep ? WIZARD_COPY[currentStep.id] : null;
  const stepNumber = stepIndex + 1;
  const totalSteps = ONBOARDING_STEPS.length;

  useEffect(() => {
    if (loading || allComplete || hasAttemptedOpen.current) return;
    hasAttemptedOpen.current = true;

    if (isWizardPermanentlyDismissed() || isWizardHiddenForSession()) return;

    setStepIndex(firstIncompleteIndex(steps));
    setOpen(true);
    trackOnboardingWizardOpened();
  }, [loading, allComplete, steps]);

  const closeForSession = () => {
    hideWizardForSession();
    setOpen(false);
  };

  const handleSkip = () => {
    if (!currentStep) return;
    trackOnboardingWizardSkipped(currentStep.id);
    if (stepIndex < totalSteps - 1) {
      setStepIndex((i) => i + 1);
      return;
    }
    closeForSession();
  };

  const handleDontShowAgain = () => {
    dismissWizardPermanently();
    setOpen(false);
  };

  if (!open || !currentStep || !wizardCopy || allComplete) return null;

  const isShareStep = currentStep.id === "share-website";
  const progressPct = Math.round((stepNumber / totalSteps) * 100);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={closeForSession} aria-hidden />
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl z-10"
        role="dialog"
        aria-modal="true"
        aria-labelledby="setup-wizard-title"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6A3CB1]">
              Step {stepNumber} of {totalSteps}
            </p>
            <h2 id="setup-wizard-title" className="text-lg font-semibold text-gray-900 mt-1">
              {wizardCopy.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={closeForSession}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            aria-label="Close setup wizard"
          >
            <X size={18} />
          </button>
        </div>

        <div className="h-1.5 w-full rounded-full bg-[#F5F1FF] overflow-hidden mb-4">
          <div
            className="h-full rounded-full bg-[#6A3CB1] transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <p className="text-sm text-gray-600">{wizardCopy.text}</p>
        {wizardCopy.estimatedTime && (
          <p className="mt-2 text-xs text-gray-500">Estimated time: {wizardCopy.estimatedTime}</p>
        )}

        <div className="mt-6 flex flex-col gap-3">
          {isShareStep ? (
            <StoreShareActions storeUrl={storeUrl} onShareAction={onShareAction} />
          ) : (
            <button
              type="button"
              onClick={() => {
                trackOnboardingStepClicked(currentStep.id);
                closeForSession();
                openManagerDashboardPath(currentStep.managerPath);
              }}
              className="inline-flex w-full items-center justify-center rounded-lg bg-[#6A3CB1] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#5a32a0]"
            >
              {currentStep.buttonLabel}
            </button>
          )}

          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              Skip for now
            </button>
            <button
              type="button"
              onClick={handleDontShowAgain}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Don&apos;t show again
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
