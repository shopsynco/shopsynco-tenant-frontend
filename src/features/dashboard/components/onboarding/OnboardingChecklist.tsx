import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import OnboardingStepItem from "./OnboardingStepItem";
import StoreShareActions from "./StoreShareActions";
import { ONBOARDING_STEPS } from "../../../../lib/onboarding/stepDefinitions";
import {
  trackOnboardingCardViewed,
  trackOnboardingCompleted,
  trackOnboardingStepClicked,
} from "../../../../lib/onboarding/analytics";
import type { OnboardingProgressState, OnboardingShareAction } from "../../../../lib/onboarding/types";

type OnboardingChecklistProps = {
  progress: OnboardingProgressState;
  onShareAction: (action: OnboardingShareAction) => void;
};

export default function OnboardingChecklist({ progress, onShareAction }: OnboardingChecklistProps) {
  const { steps, completedCount, totalCount, allComplete, nextIncompleteStepId, storeUrl, loading, error } =
    progress;

  useEffect(() => {
    trackOnboardingCardViewed();
  }, []);

  useEffect(() => {
    if (allComplete) trackOnboardingCompleted();
  }, [allComplete]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#E2DAFF] bg-white p-8 shadow-sm flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#6A3CB1]" aria-hidden />
        <p className="text-sm text-gray-600">Loading your setup progress...</p>
      </div>
    );
  }

  if (allComplete) {
    return (
      <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-white p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
          Your store is ready to share 🎉
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Customers can now visit your online store and place orders.
        </p>
        {storeUrl && (
          <p className="mt-3 text-sm font-medium text-[#6A3CB1] break-all">{storeUrl}</p>
        )}
        <StoreShareActions storeUrl={storeUrl} onShareAction={onShareAction} />
      </div>
    );
  }

  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="rounded-2xl border border-[#E2DAFF] bg-white p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
            Let&apos;s make your store live 🚀
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Complete these simple steps to start selling through your own online store.
          </p>
        </div>
        <div className="text-sm font-semibold text-[#6A3CB1] whitespace-nowrap">
          {completedCount} of {totalCount} completed
        </div>
      </div>

      <div className="mt-4">
        <div className="h-2 w-full rounded-full bg-[#F5F1FF] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#7CB2E5] to-[#6A3CB1] transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {error && (
        <p className="mt-3 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <div className="mt-5 space-y-3">
        {ONBOARDING_STEPS.map((step) => (
          <OnboardingStepItem
            key={step.id}
            step={step}
            completed={steps[step.id]}
            isNext={step.id === nextIncompleteStepId}
            storeUrl={storeUrl}
            onStepClick={trackOnboardingStepClicked}
            onShareAction={onShareAction}
          />
        ))}
      </div>
    </div>
  );
}
