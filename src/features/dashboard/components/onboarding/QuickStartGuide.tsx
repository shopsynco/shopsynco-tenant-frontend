import { CheckCircle2, Circle, Calendar, MessageCircle } from "lucide-react";
import { ONBOARDING_STEPS } from "../../../../lib/onboarding/stepDefinitions";
import {
  openWhatsAppChat,
  SETUP_CALL_MESSAGE,
  WHATSAPP_SUPPORT_MESSAGE,
} from "../../../../lib/onboarding/supportLinks";
import type { OnboardingProgressState } from "../../../../lib/onboarding/types";

type QuickStartGuideProps = {
  progress: OnboardingProgressState;
};

const QUICK_LABELS: Record<string, string> = {
  "upload-logo": "Logo Uploaded",
  "add-product": "First Product",
  "add-category": "Category",
  "customize-website": "Website Customized",
  "share-website": "Store Shared",
};

const helpLinkClass =
  "flex w-full items-center gap-2 text-left text-xs text-[#6A3CB1] hover:underline cursor-pointer";

export default function QuickStartGuide({ progress }: QuickStartGuideProps) {
  const { steps, loading } = progress;

  return (
    <div className="rounded-xl border border-[#E2DAFF] bg-white p-5 shadow-sm h-fit">
      <h3 className="text-sm font-semibold text-[#6A3CB1]">Quick Start Guide</h3>
      <p className="text-xs text-gray-500 mt-1">Track your launch checklist at a glance.</p>

      <ul className="mt-4 space-y-2.5">
        {ONBOARDING_STEPS.map((step) => {
          const done = steps[step.id];
          return (
            <li key={step.id} className="flex items-center gap-2.5 text-sm">
              {loading ? (
                <Circle size={16} className="text-gray-200 shrink-0" />
              ) : done ? (
                <CheckCircle2 size={16} className="text-green-600 shrink-0" />
              ) : (
                <Circle size={16} className="text-gray-300 shrink-0" />
              )}
              <span className={done ? "text-gray-700" : "text-gray-500"}>
                {QUICK_LABELS[step.id] ?? step.title}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 pt-4 border-t border-gray-100 space-y-2">
        <p className="text-xs font-semibold text-gray-700">Need help?</p>
        <button
          type="button"
          className={helpLinkClass}
          onClick={() => openWhatsAppChat(SETUP_CALL_MESSAGE)}
        >
          <Calendar size={14} />
          Book Free Setup Call
        </button>
        <button
          type="button"
          className={helpLinkClass}
          onClick={() => openWhatsAppChat(WHATSAPP_SUPPORT_MESSAGE)}
        >
          <MessageCircle size={14} />
          WhatsApp Support
        </button>
        {/* TODO: Re-enable when onboarding video is ready.
        <button type="button" className={helpLinkClass}>
          <PlayCircle size={14} />
          Watch 2-minute Video
        </button>
        */}
      </div>
    </div>
  );
}
