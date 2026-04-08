import { useNavigate } from "react-router-dom";
import logo from "../../../assets/Name-Logo.png";

/**
 * Lightweight header for /plans — avoids tenant profile fetch that can fail
 * independently of plan selection (keeps the page from erroring on mount).
 */
export default function PlansPageHeader() {
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0">
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-3 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#719CBF]"
        aria-label="Back to dashboard"
      >
        <img src={logo} alt="ShopSynco" className="h-8" />
      </button>
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
        className="text-sm font-medium text-[#42739A] hover:text-[#6A9ECF] hover:underline"
      >
        Back to dashboard
      </button>
    </header>
  );
}
