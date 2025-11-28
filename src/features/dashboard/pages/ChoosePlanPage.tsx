import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { fetchPlans, getPricingQuote } from "../../../api/mainapi/planapi";
import { useNavigate } from "react-router-dom";

interface Plan {
  id: string;
  name: string;
  price: number;
  billing_cycle: string;
  is_active: boolean;
  date_added: string;
  variant?: "purple" | "green" | "blue";
}

export default function ChoosePlanPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [billingPeriod, setBillingPeriod] = useState("48"); // default 48 to show save ribbon
  const [quoteData, setQuoteData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState<string>("");
  const [isCouponFieldVisible, setIsCouponFieldVisible] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  useEffect(() => {
    const getPlans = async () => {
      try {
        const fetched = await fetchPlans();
        // Guarantee at least 3 variants for visuals (if API returns <3, create placeholders)
        const base = fetched && fetched.length ? fetched : [
          { id: "starter", name: "Starter", price: 1899, billing_cycle: "month", is_active: true, date_added: "", variant: "green" },
          { id: "pro", name: "Professional", price: 4000, billing_cycle: "month", is_active: true, date_added: "", variant: "blue" },
          { id: "enterprise", name: "Enterprise", price: 9999, billing_cycle: "month", is_active: true, date_added: "", variant: "purple" },
        ];
        const withVariants = base.map((p: Plan, idx: number) => ({
          ...p,
          variant: p.variant || (idx % 3 === 0 ? "purple" : idx % 3 === 1 ? "green" : "blue"),
        }));
        setPlans(withVariants);
        if (withVariants.length > 0) setSelectedPlan(withVariants[0]);
      } catch (err) {
        console.error("Error fetching plans:", err);
      }
    };
    getPlans();
  }, []);

  useEffect(() => {
    if (!selectedPlan || !billingPeriod) return;
    const fetchQuote = async () => {
      setLoading(true);
      try {
        const q = await getPricingQuote(selectedPlan.id, billingPeriod, "India");
        setQuoteData(q);
      } catch (err) {
        console.error("Error fetching pricing quote:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuote();
  }, [selectedPlan, billingPeriod]);

  const handleApplyCoupon = () => {
    if (!quoteData) return;
    if (couponCode.trim().toUpperCase() === "DISCOUNT10") {
      const discount = quoteData.total * 0.1;
      setQuoteData({ ...quoteData, total: +(quoteData.total - discount).toFixed(2), discount });
      setError("");
    } else {
      setError("Invalid Coupon Code");
    }
  };

  const handlePaymentSubmit = () => {
    const planId = selectedPlan?.id || "";
    const months = billingPeriod;
    const country = "India";
    navigate(`/payment?plan_id=${planId}&months=${months}&country=${country}`);
  };

  // utility: accent color per variant
  const accentFor = (v?: Plan["variant"]) =>
    v === "purple" ? "#7658A0" : v === "green" ? "#1F9B46" : "#2B7BE3";

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start py-8 px-4 md:py-16 md:px-12">
      <div className="w-full max-w-6xl bg-white rounded-[20px] shadow-lg p-6 md:p-10 flex flex-col lg:flex-row gap-8 md:gap-10">
        {/* LEFT */}
        <div className="flex-1">
          {/* Header: Raleway 600 40/80 */}
          <h1
            className="font-raleway font-semibold text-[40px] leading-[80px] text-[#1E1E1E] mb-0"
            aria-label="Choose your plan"
          >
            Choose Your Plan
          </h1>

          {/* Subtext: Poppins 400 20/30 */}
          <p className="font-poppins font-normal text-[20px] leading-[30px] text-[#6E6E6E] mb-6 md:mb-8">
            Pick the plan and billing period that fit your business best.
          </p>

          {/* Top small preview cards - three visually distinct cards */}
          <div className="flex gap-4 mb-6">
            {/* map first three plans to small previews */}
            {plans.slice(0, 3).map((p) => {
              const accent = accentFor(p.variant);
              return (
                <div
                  key={`preview-${p.id}`}
                  className="flex-1 border rounded-[10px] p-4 bg-white shadow-sm"
                  style={{ borderColor: p.variant === "purple" ? "#F0E9F8" : p.variant === "green" ? "#E9F8F0" : "#E9F2FF" }}
                >
                  <div className={`text-[16px] font-poppins font-semibold`} style={{ color: accent }}>
                    ₹{p.price}
                    <span className="text-xs font-poppins font-normal text-[#6E6E6E] ml-2">/month</span>
                  </div>
                  <div className="text-sm font-poppins font-medium text-[#1E1E1E] mt-2">{p.name}</div>
                  <ul className="mt-3 space-y-1 text-xs text-[#6E6E6E]">
                    <li className="flex items-center gap-2">
                      <Check size={12} style={{ color: accent }} /> Up to 10 shops
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={12} style={{ color: accent }} /> Basic reports
                    </li>
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Plans grid - selectable */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
            {plans.map((plan) => {
              const isSelected = selectedPlan?.id === plan.id;
              const accent = accentFor(plan.variant);

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan)}
                  role="button"
                  className={`cursor-pointer p-5 sm:p-6 rounded-[10px] relative transition-shadow
                    ${isSelected ? "shadow-xl" : "shadow-sm"}
                    ${isSelected ? "border-[2px] border-[#7658A0]" : "border border-gray-200"}
                    bg-white`}
                >
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-[24px] font-poppins font-semibold text-[#1E1E1E]">
                        ₹{plan.price}
                        <span className="text-[14px] font-poppins font-normal text-[#6E6E6E] ml-2">/{plan.billing_cycle}</span>
                      </div>
                      <div className="text-[18px] font-poppins font-medium text-[#1E1E1E] mt-2">
                        {plan.name}
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      {isSelected && (
                        <span
                          className="text-[12px] font-poppins font-semibold px-3 py-1 rounded-full"
                          style={{ color: "#FFFFFF", backgroundColor: "#7658A0" }}
                        >
                          Selected
                        </span>
                      )}
                    </div>
                  </div>

                  <ul className="mt-4 space-y-2 text-sm text-[#4B4B4B]">
                    <li className="flex items-center gap-2">
                      <Check size={14} style={{ color: accent }} />
                      <span className="font-poppins text-[14px]">Active Plan</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} style={{ color: accent }} />
                      <span className="font-poppins text-[14px]">Standard support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check size={14} style={{ color: accent }} />
                      <span className="font-poppins text-[14px]">All core features</span>
                    </li>
                  </ul>

                  <a href="#" className="absolute bottom-3 right-4 text-xs font-poppins text-[#6E6E6E] hover:text-[#333]">
                    More info
                  </a>
                </div>
              );
            })}
          </div>

          {/* Billing period - styled boxes */}
          <h3 className="font-poppins font-medium text-[20px] leading-[30px] text-[#1E1E1E] mb-3">Select billing period</h3>

          <div className="space-y-3 md:space-y-4">
            {[
              { months: "48", price: 1699 },
              { months: "24", price: 1799 },
              { months: "12", price: 1899 },
            ].map((option) => {
              const active = billingPeriod === option.months;
              return (
                <label
                  key={option.months}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 sm:px-5 sm:py-4 cursor-pointer transition
                    ${active ? "border-[2px] border-[#7658A0] bg-white" : "border border-[#6E6E6E] bg-white"}
                    rounded-[10px]`}
                >
                  <div className="flex items-center gap-3 mb-1 sm:mb-0">
                    <input
                      type="radio"
                      name="billing"
                      checked={active}
                      onChange={() => setBillingPeriod(option.months)}
                      className="w-5 h-5 accent-[#7658A0]"
                    />
                    <div>
                      {/* 48 Months label: Poppins 500 24/50, color #7658A0 */}
                      <div
                        className="font-poppins"
                        style={{ fontWeight: 500, fontSize: "24px", lineHeight: "50px", color: "#7658A0" }}
                      >
                        {option.months} Months
                      </div>

                      {/* Save up to 30% for 48 */}
                      {option.months === "48" && (
                        <div className="inline-block text-xs font-poppins text-[#7658A0] bg-[#FFF7F0] px-2 py-1 rounded-full mt-1">
                          Save up to 30%
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="font-poppins font-semibold text-[24px] leading-[30px] text-[#1E1E1E]">
                    ₹{option.price}
                    <span className="text-xs text-[#6E6E6E] ml-2">/month</span>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* RIGHT - ORDER SUMMARY */}
        <div className="w-full lg:w-80 p-5 sm:p-6 flex flex-col justify-between">
          {/* summary card (bg rgba(174,132,235,0.05), rounded 20) */}
          <div className="rounded-[20px] p-4" style={{ background: "rgba(174,132,235,0.05)" }}>
            <h3 className="font-poppins font-semibold text-[32px] leading-[30px] text-[#000000] mb-3">
              Order Summary
            </h3>

            <div className="space-y-3 text-sm text-[#4B4B4B]">
              <div className="flex justify-between">
                <span className="font-poppins text-[20px] leading-[30px] text-[#000000]">Base Price</span>
                <span className="font-poppins text-[20px] leading-[30px] text-[#000000]">₹{quoteData?.base_price ?? "—"}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-poppins text-[20px] leading-[30px] text-[#000000]">Taxes & Fees</span>
                <span className="font-poppins text-[20px] leading-[30px] text-[#000000]">₹{quoteData?.taxes ?? "—"}</span>
              </div>

              {/* coupon */}
              <div className="mt-3">
                {!isCouponFieldVisible ? (
                  <div className="flex items-center justify-between">
                    <span className="font-poppins text-[20px] leading-[30px] text-[#6E6E6E]">Coupon Code</span>
                    <button onClick={() => setIsCouponFieldVisible(true)} className="text-[#7658A0] font-poppins font-medium">
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
                    <button onClick={handleApplyCoupon} className="px-3 py-2 rounded-[10px] bg-[#7658A0] text-white font-poppins font-semibold">
                      Apply
                    </button>
                  </div>
                )}
                {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
              </div>

              <div className="flex justify-between font-poppins font-medium text-[24px] leading-[30px] text-[#1E1E1E] mt-4">
                <span>Total Payable (yearly)</span>
                <span>₹{quoteData?.total ?? "—"}</span>
              </div>
            </div>
          </div>

          {/* terms box (bg rgba(174,132,235,0.05) rounded 20) */}
          <div className="mt-4 rounded-[20px] p-3" style={{ background: "rgba(174,132,235,0.05)" }}>
            <label className="flex items-start gap-3">
              <input type="checkbox" className="w-4 h-4 accent-[#7658A0] mt-1" />
              <div className="text-sm font-poppins text-[#4B4B4B]">
                By checking out, you agree with our <a href="#" className="text-[#7658A0] font-semibold">Terms & Conditions</a> and Privacy Policy.
              </div>
            </label>
          </div>

          {/* action buttons */}
          <div className="flex justify-between mt-6 gap-3">
            <button className="flex-1 py-3 rounded-[10px] bg-[#EEE9F5] text-[#1E1E1E] font-poppins font-semibold text-[16px] leading-[20px]">
              Cancel
            </button>

            <button
              onClick={handlePaymentSubmit}
              disabled={loading}
              className={`flex-1 py-3 rounded-[10px] font-poppins font-semibold text-[16px] leading-[20px] text-white transition ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#7658A0] hover:bg-[#5f3a86]"
              }`}
            >
              {loading ? "Processing..." : "Choose Payment Method"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
