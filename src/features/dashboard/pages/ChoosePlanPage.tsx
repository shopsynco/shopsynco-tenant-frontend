import { useState, useEffect, useMemo, useCallback } from "react";
import { Check } from "lucide-react";
import { fetchPlans, getPricingQuote, startPlanTrial } from "../../../api/mainapi/planapi";
import { useNavigate } from "react-router-dom";
import PlansPageHeader from "../components/PlansPageHeader";
import { canExitPlansToDashboard, markTenantSubscriptionActive } from "../../../utils/planFlow";
import { showError } from "../../../components/swalHelper";

interface BillingPeriodOption {
  months: number;
  discount_rate: number;
  monthly_price: number;
  total_price: number;
  label: string;
  badge?: string | null;
}

interface Plan {
  id: string | number;
  name: string;
  slug?: string;
  description?: string;
  highlights?: string[];
  base_monthly: number;
  billing_cycle: string;
  is_active: boolean;
  date_added: string;
  trial_days?: number;
  feature_store_discount_pct?: number;
  feature_store_trial_days?: number;
  variant?: "green" | "blue" | "yellow";
  /** From GET /api/tenants/pricing/options/ — drives billing period row when present */
  billing_periods?: BillingPeriodOption[];
}

function buildPlanFeatureLines(plan: Plan): string[] {
  let features: string[] = Array.isArray(plan.highlights)
    ? [...new Set(plan.highlights.map((line) => String(line).trim()).filter(Boolean))]
    : [];

  const discount = Number(plan.feature_store_discount_pct ?? 0);
  const fsTrialDays = Number(plan.feature_store_trial_days ?? 0);
  let benefitLine: string | null = null;
  if (discount > 0 && fsTrialDays > 0) {
    benefitLine = `${discount}% Feature Store discount · ${fsTrialDays}-day trials`;
  } else if (fsTrialDays > 0) {
    benefitLine = `${fsTrialDays}-day Feature Store trials`;
  }
  if (
    benefitLine &&
    !features.some((line) => line.toLowerCase().includes("feature store"))
  ) {
    features = [...features, benefitLine];
  }

  const planTrialDays = Number(plan.trial_days ?? 7);
  const trialLine = `${planTrialDays}-day free plan trial`;
  if (!features.some((line) => line.toLowerCase().includes("free plan trial"))) {
    features = [trialLine, ...features];
  }

  return features.length ? features : ["Standard support"];
}

const CARD_VARIANTS = {
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
} as const;

type CardVariant = keyof typeof CARD_VARIANTS;

function resolveCardVariant(
  raw: string | undefined,
  index: number
): CardVariant {
  if (raw === "green" || raw === "blue" || raw === "yellow") return raw;
  return index % 3 === 0 ? "green" : index % 3 === 1 ? "blue" : "yellow";
}

/** Left-to-right order on Choose Plan: Starter → Professional → Enterprise. */
function planTierSortIndex(name: string | undefined): number {
  const n = String(name ?? "")
    .trim()
    .toLowerCase();
  if (n.includes("starter")) return 0;
  if (n.includes("growth")) return 1;
  if (n.includes("pro") || n.includes("scale") || n.includes("enterprise")) return 2;
  return 50;
}

/** Card accent per tier (matches design: green / blue / gold). */
function variantForPlanName(
  name: string | undefined,
  fallbackIndex: number
): CardVariant {
  const n = String(name ?? "")
    .trim()
    .toLowerCase();
  if (n.includes("starter")) return "green";
  if (n.includes("growth")) return "blue";
  if (n.includes("pro") || n.includes("scale") || n.includes("enterprise")) return "yellow";
  return resolveCardVariant(undefined, fallbackIndex);
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
  const v: CardVariant =
    plan.variant === "green" ||
    plan.variant === "blue" ||
    plan.variant === "yellow"
      ? plan.variant
      : "yellow";
  const colors = CARD_VARIANTS[v];
  const featureLines = buildPlanFeatureLines(plan);
  const visibleFeatures = showMore ? featureLines : featureLines.slice(0, 2);
  const canExpand = featureLines.length > 2;

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
          ₹
          {plan.base_monthly != null && !Number.isNaN(Number(plan.base_monthly))
            ? Number(plan.base_monthly).toLocaleString("en-IN")
            : "—"}
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
          {visibleFeatures.map((f) => (
            <li key={f} className="flex items-start gap-3">
              <Check
                size={12}
                style={{ color: colors.accent }}
                className="mt-1 shrink-0"
              />
              <span className="font-poppins text-sm text-[#4B4B4B] leading-snug">
                {f}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* more/less toggle */}
      {canExpand ? (
        <div className="mt-auto pt-3 border-t border-gray-100 shrink-0">
          <button
            type="button"
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
      ) : null}
    </div>
  );
};

/* ------------------------------------------------------------------ */
export default function ChoosePlanPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [billingPeriod, setBillingPeriod] = useState("");
  const [quoteData, setQuoteData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [isCouponFieldVisible, setIsCouponFieldVisible] = useState(false);
  const [error, setError] = useState("");
  const [plansError, setPlansError] = useState<string | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [startingTrial, setStartingTrial] = useState(false);

  const navigate = useNavigate();
  const allowDashboardExit = useMemo(() => canExitPlansToDashboard(), []);

  const handlePlanStepBack = useCallback(() => {
    if (allowDashboardExit) {
      navigate("/dashboard");
    } else {
      navigate(-1);
    }
  }, [allowDashboardExit, navigate]);

  useEffect(() => {
    const getPlans = async () => {
      try {
        setPlansError(null);
        const fetched = await fetchPlans();
        const list = (Array.isArray(fetched) ? fetched : []) as Plan[];

        // Remove duplicate plans (same display name) returned by mixed/legacy payloads.
        const byName = new Map<string, Plan>();
        for (const item of list) {
          const key = String(item?.name ?? "").trim().toLowerCase();
          if (!key) continue;
          const existing = byName.get(key);
          if (!existing) {
            byName.set(key, item);
            continue;
          }
          // Prefer monthly entry if both monthly/yearly variants exist for same plan name.
          if (
            existing.billing_cycle !== "monthly" &&
            item.billing_cycle === "monthly"
          ) {
            byName.set(key, item);
          }
        }

        const deduped = Array.from(byName.values());
        deduped.sort((a, b) => {
          const diff = planTierSortIndex(a.name) - planTierSortIndex(b.name);
          if (diff !== 0) return diff;
          return String(a.name).localeCompare(String(b.name));
        });
        const withVariants = deduped.map((p, i) => ({
          ...p,
          variant: variantForPlanName(p.name, i),
        }));
        setPlans(withVariants);
        if (withVariants.length) {
          const first = withVariants[0];
          setSelectedPlan(first);
          const bp = first.billing_periods?.[0]?.months;
          if (bp != null) setBillingPeriod(String(bp));
        } else {
          setPlansError("No plans are available right now. Please try again later.");
        }
      } catch {
        setPlans([]);
        setPlansError("Could not load plans. Please refresh or try again.");
      }
    };
    getPlans();
  }, []);

  useEffect(() => {
    if (!selectedPlan || !billingPeriod) return;
    setQuoteError(null);
    setLoading(true);
    getPricingQuote(String(selectedPlan.id), billingPeriod, "India")
      .then(setQuoteData)
      .catch(() => {
        setQuoteData(null);
        setQuoteError("Could not load pricing for this selection.");
      })
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

  const goPayment = () => {
    if (!selectedPlan?.id) return;
    setError("");
    navigate(
      `/payment?plan_id=${encodeURIComponent(String(selectedPlan.id))}&months=${encodeURIComponent(billingPeriod)}&country=${encodeURIComponent("India")}`
    );
  };

  const trialDays = selectedPlan?.trial_days ?? 7;

  const goFreeTrial = async () => {
    if (!selectedPlan?.id) return;
    setError("");
    setStartingTrial(true);
    try {
      const result = await startPlanTrial(String(selectedPlan.id));
      markTenantSubscriptionActive();
      if (result.subscription?.id) {
        localStorage.setItem("subscription_id", String(result.subscription.id));
      }
      navigate("/payment-success", {
        state: {
          successType: "trial",
          trialDays: result.trial_days,
          trialEnd: result.trial_end,
        },
      });
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: string } } })?.response?.data;
      showError("Trial unavailable", data?.error || "Could not start your free trial.");
    } finally {
      setStartingTrial(false);
    }
  };

  const sortedPlans = useMemo(() => {
    return [...plans].sort((a, b) => {
      const diff = planTierSortIndex(a.name) - planTierSortIndex(b.name);
      if (diff !== 0) return diff;
      return String(a.name).localeCompare(String(b.name));
    });
  }, [plans]);

  const billingChoices = useMemo(() => {
    if (selectedPlan?.billing_periods?.length) {
      return selectedPlan.billing_periods.map((bp) => ({
        m: String(bp.months),
        p: bp.monthly_price,
        s: Math.round((bp.discount_rate || 0) * 100),
        label: bp.label,
        badge: bp.badge,
      }));
    }
    if (!selectedPlan?.base_monthly || Number.isNaN(Number(selectedPlan.base_monthly))) {
      return [];
    }
    return [{ m: "12", p: Number(selectedPlan.base_monthly), s: 0, label: "12 Months", badge: null }];
  }, [selectedPlan]);

  useEffect(() => {
    if (!billingChoices.length) return;
    if (!billingChoices.some((o) => o.m === billingPeriod)) {
      setBillingPeriod(billingChoices[0].m);
    }
  }, [billingChoices, billingPeriod]);

  const quoteTaxes =
    quoteData?.taxes ?? quoteData?.taxes_and_fees ?? quoteData?.tax;
  const selectedMonths = Number(billingPeriod || 0);
  const selectedMonthly = billingChoices.find((o) => o.m === billingPeriod)?.p;
  const fallbackBasePrice =
    selectedMonthly != null && selectedMonths > 0
      ? Number(selectedMonthly) * selectedMonths
      : selectedPlan?.base_monthly != null && selectedMonths > 0
      ? Number(selectedPlan.base_monthly) * selectedMonths
      : null;
  const basePrice =
    quoteData?.base_price != null ? Number(quoteData.base_price) : fallbackBasePrice;
  const totalPayable =
    quoteData?.total != null
      ? Number(quoteData.total)
      : basePrice != null
      ? Number(basePrice) + Number(quoteTaxes ?? 0) - Number(quoteData?.discount ?? 0)
      : null;

  return (
    <div className="min-h-screen w-full bg-white flex flex-col">
      <PlansPageHeader />
      <div className="w-full flex-1 flex justify-center items-start overflow-auto px-2 sm:px-4">
      <div className="w-full max-w-7xl min-h-0 flex flex-col lg:flex-row gap-0 py-6">
        {/* white panel now carries the padding */}
        <div className="flex-1 flex flex-col p-6 md:p-10">
          {/* LEFT - nudged left on large screens */}
          <div className="flex-1 flex flex-col pl-0">
            <h1 className="font-raleway font-semibold text-[40px] leading-[80px] text-[#1E1E1E]">
              Choose Your Plan
            </h1>
            <p className="font-poppins text-[20px] leading-[30px] text-[#6E6E6E] mb-6">
              Pick the plan that fits your business — every plan includes a{" "}
              <strong>{trialDays}-day free trial</strong>, no payment required to start.
            </p>

            {plansError && (
              <p className="text-red-600 text-sm mb-4" role="alert">
                {plansError}
              </p>
            )}
            {quoteError && (
              <p className="text-amber-700 text-sm mb-4" role="status">
                {quoteError}
              </p>
            )}

            {/* Cards – parent stays hook-safe */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-start auto-rows-min">
              {sortedPlans.length > 0 ? (
                sortedPlans.map((plan) => (
                  <PlanCard
                    key={String(plan.id ?? plan.name)}
                    plan={plan}
                    isSelected={String(selectedPlan?.id) === String(plan.id)}
                    onSelect={() => setSelectedPlan(plan)}
                  />
                ))
              ) : (
                <div className="col-span-full rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 font-poppins">
                  No plans available to display right now. Please retry in a few
                  seconds.
                </div>
              )}
            </div>

            {/* Billing period */}
            <div className="mt-auto pt-8">
              <h3 className="font-poppins font-medium text-[25px] leading-[30px] text-[#1E1E1E] mb-3">
                Select billing period
              </h3>
              <div
                className="space-y-3 md:space-y-4"
                role="radiogroup"
                aria-label="Billing period"
              >
                {billingChoices.map((o) => {
                  const a = billingPeriod === o.m;
                  return (
                    <div
                      key={o.m}
                      role="radio"
                      aria-checked={a}
                      tabIndex={0}
                      onClick={() => setBillingPeriod(o.m)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setBillingPeriod(o.m);
                        }
                      }}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 sm:px-5 sm:py-4 cursor-pointer rounded-[10px] border transition-all ${
                        a
                          ? "border-2 border-[#7658A0]"
                          : "border border-[#D1D1D1]"
                      } hover:border-[#7658A0] hover:border-opacity-50`}
                    >
                      <div className="flex items-center gap-3 mb-1 sm:mb-0">
                        <span className="relative flex items-center justify-center w-5 h-5 shrink-0 pointer-events-none">
                          <span
                            className={`absolute inset-0 rounded-full border-2 transition ${
                              a ? "border-[#7658A0]" : "border-[#D1D1D1]"
                            }`}
                          />
                          {a && (
                            <span className="absolute w-2.5 h-2.5 rounded-full bg-[#7658A0]" />
                          )}
                        </span>
                        <div
                          className={`font-poppins font-medium text-[24px] leading-[50px] ${
                            a ? "text-[#7658A0]" : "text-black"
                          }`}
                        >
                          {o.label || (o.m === "1" ? "1 Month" : `${o.m} Months`)}
                        </div>
                        {(o.badge || o.s > 0) && (
                          <div
                            className="ml-2 inline-block text-xs font-poppins px-2 py-1 rounded-lg"
                            style={{
                              backgroundColor: "#7CB2E540",
                              color: "#5882A4",
                            }}
                          >
                            {o.badge || `Save up to ${o.s}%`}
                          </div>
                        )}
                      </div>
                      <div
                        className={`font-poppins font-semibold text-[24px] leading-[30px] ${
                          a ? "text-[#1E1E1E]" : "text-black"
                        }`}
                      >
                        ₹{o.p != null && !Number.isNaN(Number(o.p)) ? o.p : "—"}
                        <span className="text-xs text-[#6E6E6E] ml-2">
                          /month
                        </span>
                      </div>
                    </div>
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
                      ₹
                      {basePrice != null && !Number.isNaN(basePrice)
                        ? basePrice.toLocaleString("en-IN")
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-poppins text-[20px] leading-[30px] text-black">
                      Taxes & Fees
                    </span>
                    <span className="font-poppins text-[20px] leading-[30px] text-black">
                      ₹
                      {quoteTaxes != null && !Number.isNaN(Number(quoteTaxes))
                        ? Number(quoteTaxes).toLocaleString("en-IN")
                        : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#E2D9F0]">
                    <span className="font-poppins text-[24px] leading-[30px] text-black font-semibold">
                      Total Payable
                    </span>
                    <span className="font-poppins text-[24px] leading-[30px] text-black font-semibold">
                      ₹
                      {totalPayable != null && !Number.isNaN(totalPayable)
                        ? totalPayable.toLocaleString("en-IN")
                        : "—"}
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
              {/* buttons – transparent, parent tint continues underneath */}
              <div
                className="w-full max-w-[408px] lg:w-96 flex flex-col h-full rounded-[20px]"
                style={{ background: "#AE84EB0D" }}
              >
                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={goFreeTrial}
                    disabled={startingTrial || loading || !selectedPlan?.id}
                    className="flex items-center justify-center rounded-[10px] bg-[#75AB66] text-white font-poppins font-semibold disabled:opacity-50 w-full max-w-[408px]"
                    style={{ height: 56, padding: "18px 32px" }}
                  >
                    {startingTrial
                      ? "Starting trial..."
                      : `Start ${trialDays}-day free trial`}
                  </button>
                  <div className="flex gap-3">
                    {/* Cancel – 162 px (smaller) */}
                    <button
                      type="button"
                      onClick={handlePlanStepBack}
                      className="flex items-center justify-center rounded-[10px] bg-[#EEE9F5] text-[#1E1E1E] font-poppins font-semibold"
                      style={{
                        width: 162,
                        height: 56,
                        padding: "18px 52px",
                        gap: 10,
                      }}
                    >
                      {allowDashboardExit ? "Cancel" : "Back"}
                    </button>

                    {/* Pay now */}
                    <button
                      type="button"
                      onClick={goPayment}
                      disabled={loading || !selectedPlan?.id}
                      className="flex items-center justify-center rounded-[10px] bg-[#7658A0] text-white font-poppins font-semibold disabled:opacity-50"
                      style={{
                        width: 162,
                        height: 56,
                        padding: "18px 52px",
                        gap: 10,
                      }}
                    >
                      {loading ? "Processing..." : "Pay now"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
