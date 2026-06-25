import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../../assets/Name-Logo.png";
import { canExitPlansToDashboard } from "../../../utils/planFlow";

/**
 * Lightweight header for /plans — avoids tenant profile fetch that can fail
 * independently of plan selection (keeps the page from erroring on mount).
 *
 * "Back to dashboard" only when the user opened plans from the dashboard/upgrade
 * or has already completed subscription (see planFlow.ts). First-time checkout
 * after login cannot skip payment via the dashboard.
 */
export default function PlansPageHeader() {
  const navigate = useNavigate();
  const allowDashboard = useMemo(() => canExitPlansToDashboard(), []);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0">
      {allowDashboard ? (
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-3 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#719CBF]"
          aria-label="Back to dashboard"
        >
          <img src={logo} alt="ShopSynco" className="h-8" />
        </button>
      ) : (
        <div className="flex items-center gap-3" aria-hidden>
          <img src={logo} alt="ShopSynco" className="h-8" />
        </div>
      )}
      {allowDashboard ? (
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
          className="text-sm font-medium text-[#42739A] hover:text-[#6A9ECF] hover:underline"
        >
          Back to dashboard
        </button>
      ) : (
        <p className="rounded-lg border border-[#E2DAFF] bg-[#F5F1FF] px-3 py-2 text-xs sm:text-sm font-semibold text-[#5A2D9D] max-w-[240px] sm:max-w-md text-right leading-snug">
          Complete plan and payment to access your dashboard.
        </p>
      )}
    </header>
  );
}
