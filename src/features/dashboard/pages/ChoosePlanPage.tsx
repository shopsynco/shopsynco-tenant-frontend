import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { fetchPlans, getPricingQuote } from "../../../api/mainapi/planapi";
import { useNavigate } from "react-router-dom";

interface Plan {
  id: string;
  name: string;
  base_monthly: number;
  billing_cycle: string;
  is_active: boolean;
  date_added: string;
  variant?: "green" | "blue" | "yellow";
}

/* ----------  tiny card component – keeps useState inside  ---------- */
const PlanCard = ({
  plan,
  isSelected,
  onSelect,
}: {
  plan: Plan;
  isSelected: boolean;
  onSelect: () => void;
}) => {
  const [showMore, setShowMore] = useState(false);
  const v = plan.variant ?? "yellow";
  const colors = {
    green: {
      accent: "#75AB66",
      shadow: "#75AB6682",
      text: "#75AB66",
      border: "#75AB66",
    },
    blue: {
      accent: "#5882A4",
      shadow: "#5882A482",
      text: "#5882A4",
      border: "#5882A4",
    },
    yellow: {
      accent: "#D19026",
      shadow: "#D1902682",
      text: "#D19026",
      border: "#D19026",
    },
  }[v];

  return (
    <div
      role="button"
      onClick={onSelect}
      className={`cursor-pointer p-5 sm:p-6 rounded-[10px] flex flex-col justify-between transition-all duration-200 ${
        isSelected ? "border-2" : "border"
      } bg-white`}
      style={{
        width: 255,
        height: 276,
        borderWidth: isSelected ? 4 : 3,
        borderColor: isSelected ? colors.border : colors.border, // ← same as card
        boxShadow: `2px 2px 25px 0px ${colors.shadow}`,
        transform: isSelected ? "scale(1.03)" : "scale(1)",
        transition: "transform .2s ease, border-width .2s ease",
        zIndex: isSelected ? 10 : 1,
      }}
    >
      {/* price */}
      <div className="flex items-baseline shrink-0">
        <div className="text-[32px] leading-[50px] font-poppins font-semibold text-[#1E1E1E]">
          ₹{plan.base_monthly}
        </div>
        <span className="ml-2 text-[16px] leading-[50px] font-poppins text-[#6E6E6E]">
          /{plan.billing_cycle}
        </span>
      </div>

      {/* name */}
      <div className="mt-2 px-4 py-1 shrink-0">
        <div
          className="font-poppins font-semibold text-xl truncate"
          style={{ color: colors.text }}
        >
          {plan.name}
        </div>
      </div>

      {/* features – expands/collapses */}
      <div className="mt-3 border-t border-gray-100 flex-1 min-h-0">
        <ul className="space-y-2 pt-3">
          {["Active Plan", "Standard support"].map((f) => (
            <li key={f} className="flex items-center gap-3">
              <Check size={12} style={{ color: colors.accent }} />
              <span className="font-poppins text-sm text-[#4B4B4B] truncate">
                {f}
              </span>
            </li>
          ))}
          {showMore &&
            [
              "All core features",
              "Free onboarding",
              "24×7 priority help-desk",
            ].map((f) => (
              <li key={f} className="flex items-center gap-3">
                <Check size={12} style={{ color: colors.accent }} />
                <span className="font-poppins text-sm text-[#4B4B4B] truncate">
                  {f}
                </span>
              </li>
            ))}
        </ul>
      </div>

      {/* more/less toggle */}
      <div className="mt-auto pt-3 border-t border-gray-100 shrink-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMore((s) => !s);
          }}
          className="text-xs font-poppins hover:underline flex items-center justify-end gap-1 w-full"
          style={{ color: colors.accent }}
        >
          {showMore ? "Less info" : "More info"}
          <svg width="12" height="12" fill="none">
            <path
              d="M4.5 9L7.5 6L4.5 3"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
export default function ChoosePlanPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [billingPeriod, setBillingPeriod] = useState("48");
  const [quoteData, setQuoteData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isCouponFieldVisible, setIsCouponFieldVisible] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const getPlans = async () => {
      try {
        const fetched = await fetchPlans();
        const withVariants = (fetched || []).map((p: Plan, i: number) => ({
          ...p,
          variant:
            p.variant ??
            (i % 3 === 0 ? "green" : i % 3 === 1 ? "blue" : "yellow"),
        }));
        setPlans(withVariants);
        if (withVariants.length) setSelectedPlan(withVariants[0]);
      } catch {
        setPlans([]);
      }
    };
    getPlans();
  }, []);

  useEffect(() => {
    if (!selectedPlan || !billingPeriod) return;
    setLoading(true);
    getPricingQuote(selectedPlan.id, billingPeriod, "India")
      .then(setQuoteData)
      .finally(() => setLoading(false));
  }, [selectedPlan, billingPeriod]);

  const applyCoupon = () => {
    if (!quoteData) return;
    if (couponCode.trim().toUpperCase() === "DISCOUNT10") {
      const discount = quoteData.total * 0.1;
      setQuoteData({
        ...quoteData,
        total: +(quoteData.total - discount).toFixed(2),
        discount,
      });
      setError("");
    } else setError("Invalid Coupon Code");
  };

  const goPayment = () =>
    navigate(
      `/payment?plan_id=${selectedPlan?.id}&months=${billingPeriod}&country=India`
    );

  const sorted = [...plans].sort((a, b) => {
    const o = { green: 0, blue: 1, yellow: 2 };
    return (o[a.variant ?? "green"] || 0) - (o[b.variant ?? "green"] || 0);
  });

  return (
    <div className="w-screen h-screen bg-white flex justify-center items-start overflow-auto">
      {/* no padding here – content touches edges */}
      <div className="w-full max-w-7xl h-full flex flex-col lg:flex-row gap-0">
        {/* white panel now carries the padding */}
        <div className="flex-1 flex flex-col p-6 md:p-10">
          {/* LEFT - nudged left on large screens */}
          <div className="flex-1 flex flex-col pl-0">
            <h1 className="font-raleway font-semibold text-[40px] leading-[80px] text-[#1E1E1E]">
              Choose Your Plan
            </h1>
            <p className="font-poppins text-[20px] leading-[30px] text-[#6E6E6E] mb-6">
              Pick the plan and billing period that fit your business best.
            </p>

            {/* Cards – parent stays hook-safe */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start auto-rows-min">
              {sorted.map((plan) => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  isSelected={selectedPlan?.id === plan.id}
                  onSelect={() => setSelectedPlan(plan)}
                />
              ))}
            </div>

            {/* Billing period */}
            <div className="mt-auto pt-8">
              <h3 className="font-poppins font-medium text-[25px] leading-[30px] text-[#1E1E1E] mb-3">
                Select billing period
              </h3>
              <div className="space-y-3 md:space-y-4">
                {[
                  { m: "48", p: 1699, s: 30 },
                  { m: "24", p: 1799, s: 20 },
                  { m: "12", p: 1899, s: 0 },
                ].map((o) => {
                  const a = billingPeriod === o.m;
                  return (
                    <label
                      key={o.m}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 sm:px-5 sm:py-4 cursor-pointer rounded-[10px] border transition-all ${
                        a
                          ? "border-2 border-[#7658A0]"
                          : "border border-[#D1D1D1]"
                      } hover:border-[#7658A0] hover:border-opacity-50`}
                    >
                      <div className="flex items-center gap-3 mb-1 sm:mb-0">
                        <label className="relative flex items-center justify-center w-5 h-5 cursor-pointer">
                          <input
                            type="radio"
                            name="billing"
                            checked={a}
                            onChange={() => setBillingPeriod(o.m)}
                            className="opacity-0 w-0 h-0"
                          />
                          <span
                            className={`absolute inset-0 rounded-full border-2 transition ${
                              a ? "border-[#7658A0]" : "border-[#D1D1D1]"
                            }`}
                          />
                          {a && (
                            <span className="absolute w-2.5 h-2.5 rounded-full bg-[#7658A0]" />
                          )}
                        </label>
                        <div
                          className={`font-poppins font-medium text-[24px] leading-[50px] ${
                            a ? "text-[#7658A0]" : "text-black"
                          }`}
                        >
                          {o.m} Months
                        </div>
                        {o.s > 0 && (
                          <div
                            className="ml-2 inline-block text-xs font-poppins px-2 py-1 rounded-lg"
                            style={{
                              backgroundColor: "#7CB2E540",
                              color: "#5882A4",
                            }}
                          >
                            Save up to {o.s}%
                          </div>
                        )}
                      </div>
                      <div
                        className={`font-poppins font-semibold text-[24px] leading-[30px] ${
                          a ? "text-[#1E1E1E]" : "text-black"
                        }`}
                      >
                        ₹{o.p}
                        <span className="text-xs text-[#6E6E6E] ml-2">
                          /month
                        </span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="w-96 flex flex-col p-6 md:p-10 ">
          {/* RIGHT - wider order summary */}
          <div
            className="w-full lg:w-96 flex flex-col h-full rounded-[20px]"
            style={{ background: "#AE84EB0D" }} /* 5 % opacity */
          >
            {/* scrollable summary */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="rounded-[20px] p-4  flex-1 overflow-y-auto">
                <h3 className="font-poppins font-semibold text-[32px] leading-[30px] text-black my-6 mx-6">
                  Order Summary
                </h3>
                <div className="space-y-3 text-sm text-[#4B4B4B]">
                  <div className="flex justify-between">
                    <span className="font-poppins text-[20px] leading-[30px] text-black">
                      Base Price
                    </span>
                    <span className="font-poppins text-[20px] leading-[30px] text-black">
                      ₹{quoteData?.base_price ?? "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-poppins text-[20px] leading-[30px] text-black">
                      Taxes & Fees
                    </span>
                    <span className="font-poppins text-[20px] leading-[30px] text-black">
                      ₹{quoteData?.taxes ?? "—"}
                    </span>
                  </div>

                  {/* coupon */}
                  <div className="mt-3">
                    {!isCouponFieldVisible ? (
                      <div className="flex justify-between items-center">
                        <span className="font-poppins text-[20px] leading-[30px] text-black">
                          Coupon Code
                        </span>
                        <button
                          onClick={() => setIsCouponFieldVisible(true)}
                          className="text-[#7658A0] font-poppins font-medium hover:text-[#5f3a86]"
                        >
                          Add
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-3">
                        <input
                          type="text"
                          placeholder="Enter Coupon Code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          className="w-full px-3 py-2 border border-[#6E6E6E] rounded-[10px] placeholder-[#6E6E6E] text-[#1E1E1E] font-poppins"
                        />
                        <button
                          onClick={applyCoupon}
                          className="px-3 py-2 rounded-[10px] bg-[#7658A0] text-white font-poppins font-semibold hover:bg-[#5f3a86]"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                    {error && (
                      <p className="text-red-500 text-xs mt-2">{error}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* fixed footer – no inner white gaps, exact Figma sizes */}
            <div className="mt-8 space-y-4 shrink-0 px-6 pb-6">
              <div className="rounded-[20px] p-3 bg-transparent text-center">
                <label className="flex items-start gap-3 cursor-pointer">
                  <div className="text-sm font-poppins text-[#4B4B4B]">
                    By checking out, you agree with our
                    <br />
                    <a
                      href="#"
                      className="text-[#7658A0] font-semibold underline"
                    >
                      Terms of Service
                    </a>{" "}
                    and confirm that you have read our&nbsp;
                    <a
                      href="#"
                      className="text-[#7658A0] font-semibold underline"
                    >
                      Privacy Policy
                    </a>
                    .<br />
                    You can cancel recurring payments at any time.
                  </div>
                </label>
              </div>

              {/* buttons – transparent, parent tint continues underneath */}
              <div
                className="w-full max-w-[408px] lg:w-96 flex flex-col h-full rounded-[20px]"
                style={{ background: "#AE84EB0D" }}
              >
                <div className="flex justify-center">
                  <div className="flex gap-3">
                    {/* Cancel – 162 px (smaller) */}
                    <button
                      className="flex items-center justify-center rounded-[10px] bg-[#EEE9F5] text-[#1E1E1E] font-poppins font-semibold"
                      style={{
                        width: 162,
                        height: 56,
                        padding: "18px 52px",
                        gap: 10,
                      }}
                    >
                      Cancel
                    </button>

                    {/* Choose Payment – 246 px (wider) */}
                    <button
                      onClick={goPayment}
                      disabled={loading}
                      className="flex items-center justify-center rounded-[10px] bg-[#7658A0] text-white font-poppins font-semibold"
                      style={{
                        width: 162,
                        height: 56,
                        padding: "18px 52px",
                        gap: 10,
                      }}
                    >
                      {loading ? "Processing..." : "Next"}
                      {/* {loading ? "Processing..." : "Choose Payment Method"} */}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    // </div>
  );
}
