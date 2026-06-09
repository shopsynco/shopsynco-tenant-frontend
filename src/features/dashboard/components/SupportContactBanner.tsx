import { Phone, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_PHONE_TEL,
} from "../../../constants/supportContact";

type SupportContactBannerProps = {
  variant?: "trial" | "default";
  showSetupCta?: boolean;
};

export default function SupportContactBanner({
  variant = "default",
  showSetupCta = false,
}: SupportContactBannerProps) {
  const isTrial = variant === "trial";

  return (
    <div
      className={`rounded-xl border px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
        isTrial
          ? "border-emerald-200 bg-emerald-50"
          : "border-[#E2DAFF] bg-[#F5F1FF]"
      }`}
      role="region"
      aria-label="Support contact"
    >
      <div className="flex gap-3 min-w-0">
        <div
          className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            isTrial ? "bg-emerald-100" : "bg-white"
          }`}
        >
          <Phone
            size={20}
            className={isTrial ? "text-emerald-700" : "text-[#6A3CB1]"}
            aria-hidden
          />
        </div>
        <div className="min-w-0">
          <p
            className={`text-sm font-semibold ${
              isTrial ? "text-emerald-950" : "text-gray-900"
            }`}
          >
            {isTrial ? "New to ShopSynco? Here's what to do next" : "Need help?"}
          </p>
          {isTrial ? (
            <ol className="mt-2 text-sm text-emerald-900/90 list-decimal list-inside space-y-1">
              <li>Set up your store and add your business details</li>
              <li>Add products and customize your storefront</li>
              <li>
                Call us anytime at{" "}
                <a
                  href={SUPPORT_PHONE_TEL}
                  className="font-semibold text-emerald-800 hover:underline whitespace-nowrap"
                >
                  {SUPPORT_PHONE_DISPLAY}
                </a>
              </li>
            </ol>
          ) : (
            <p className="text-sm text-gray-600 mt-1">
              Our support team is here to help. Call{" "}
              <a
                href={SUPPORT_PHONE_TEL}
                className="font-semibold text-[#6A3CB1] hover:underline whitespace-nowrap"
              >
                {SUPPORT_PHONE_DISPLAY}
              </a>
            </p>
          )}
        </div>
      </div>

      {showSetupCta && (
        <Link
          to="/setup-store"
          className={`shrink-0 inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors ${
            isTrial
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "bg-[#6A3CB1] hover:bg-[#5a32a0]"
          }`}
        >
          Set up store
          <ArrowRight size={16} aria-hidden />
        </Link>
      )}
    </div>
  );
}
