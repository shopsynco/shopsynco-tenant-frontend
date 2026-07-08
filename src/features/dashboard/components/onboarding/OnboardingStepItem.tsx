import { CheckCircle2, Circle } from "lucide-react";
import StoreShareActions from "./StoreShareActions";
import { openManagerDashboardPath } from "../../../../lib/onboarding/managerNavigation";
import { resolveCustomizeWebsitePath } from "../../../../lib/onboarding/routes";
import type { OnboardingStepDefinition, OnboardingShareAction } from "../../../../lib/onboarding/types";

type OnboardingStepItemProps = {
  step: OnboardingStepDefinition;
  completed: boolean;
  isNext: boolean;
  storeUrl: string;
  hasSavedContentStyles: boolean;
  onStepClick?: (stepId: OnboardingStepDefinition["id"]) => void;
  onShareAction?: (action: OnboardingShareAction) => void;
};

export default function OnboardingStepItem({
  step,
  completed,
  isNext,
  storeUrl,
  hasSavedContentStyles,
  onStepClick,
  onShareAction,
}: OnboardingStepItemProps) {
  const isShareStep = step.id === "share-website";
  const destination =
    step.id === "customize-website"
      ? resolveCustomizeWebsitePath(hasSavedContentStyles)
      : step.managerPath;

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        isNext
          ? "border-[#6A3CB1] bg-[#F5F1FF] shadow-sm"
          : completed
            ? "border-green-100 bg-green-50/40"
            : "border-gray-100 bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {completed ? (
            <CheckCircle2 className="text-green-600" size={20} />
          ) : (
            <Circle className={isNext ? "text-[#6A3CB1]" : "text-gray-300"} size={20} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-gray-900">{step.title}</h4>
            {isNext && !completed && (
              <span className="rounded-full bg-[#6A3CB1] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                Next step
              </span>
            )}
            {step.estimatedTime && !completed && (
              <span className="text-[11px] text-gray-500">~{step.estimatedTime}</span>
            )}
          </div>
          <p className="mt-1 text-xs sm:text-sm text-gray-600">{step.description}</p>

          {!completed && (
            <div className="mt-3">
              {isShareStep ? (
                <StoreShareActions storeUrl={storeUrl} onShareAction={onShareAction} compact />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onStepClick?.(step.id);
                    openManagerDashboardPath(destination);
                  }}
                  className="inline-flex items-center justify-center rounded-lg bg-[#6A3CB1] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-[#5a32a0] transition-colors"
                >
                  {step.buttonLabel}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
