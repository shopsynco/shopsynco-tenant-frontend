import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import bgImage from "../../../../assets/backgroundsuccess.png";
import shopLogo from "../../../../assets/Name-Logo.png";
import { CheckCircle } from "lucide-react";
import { markTenantSubscriptionActive } from "../../../../utils/planFlow";
import {
  SUPPORT_PHONE_DISPLAY,
  SUPPORT_PHONE_TEL,
} from "../../../../constants/supportContact";

type SuccessLocationState = {
  successType?: "trial" | "payment";
  trialDays?: number;
  trialEnd?: string;
  purchaseValue?: number;
  purchaseCurrency?: string;
};

function formatTrialEnd(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function PaymentSuccessPage() {
  const location = useLocation();
  const state = (location.state ?? {}) as SuccessLocationState;
  const isTrial = state.successType === "trial";
  const trialDays = state.trialDays ?? 7;
  const trialEndLabel = formatTrialEnd(state.trialEnd);

  useEffect(() => {
    markTenantSubscriptionActive();
  }, []);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center px-6 py-10"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute top-6 left-6">
        <img src={shopLogo} alt="ShopSynco" className="h-10 w-auto object-contain" />
      </div>

      <div className="relative z-10 w-[90%] max-w-md bg-gradient-to-r from-[#719CBF]/30 via-[#719CBF]/30 to-[#719CBF]/30 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div
            className={`w-16 h-16 flex items-center justify-center rounded-full ${
              isTrial ? "bg-emerald-100" : "bg-green-100"
            }`}
          >
            <CheckCircle
              className={`w-10 h-10 ${isTrial ? "text-emerald-600" : "text-green-500"}`}
            />
          </div>
        </div>

        {isTrial ? (
          <>
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">
              Free trial started!
            </h2>
            <p className="text-gray-600 mb-2">
              Your {trialDays}-day trial is active — no payment was taken.
            </p>
            {trialEndLabel ? (
              <p className="text-gray-500 text-sm mb-6">
                Trial ends on {trialEndLabel}. Set up your store now to get the most from
                ShopSynco.
              </p>
            ) : (
              <p className="text-gray-500 text-sm mb-6">
                Set up your store now to get the most from ShopSynco.
              </p>
            )}
          </>
        ) : (
          <>
            <h2 className="text-3xl font-semibold text-gray-800 mb-4">
              Payment successful!
            </h2>
            <p className="text-gray-600 mb-6">
              Great! Your journey begins here. Time to set up your store and make it shine.
            </p>
          </>
        )}

        <Link
          to="/setup-store"
          className="bg-blue-600 text-white py-3 px-6 rounded-full text-lg font-semibold hover:bg-blue-700 transition duration-300 inline-block"
        >
          Set Up My Store
        </Link>

        {isTrial && (
          <p className="mt-6 text-sm text-gray-600">
            Not sure what to do next? Call our support team at{" "}
            <a
              href={SUPPORT_PHONE_TEL}
              className="font-semibold text-emerald-700 hover:underline whitespace-nowrap"
            >
              {SUPPORT_PHONE_DISPLAY}
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
