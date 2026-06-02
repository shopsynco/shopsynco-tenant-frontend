import { useState, useEffect, useMemo } from "react";
import {
  ArrowLeft,
  X,
  ShoppingCart,
  Search,
  Funnel,
  Check,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import {
  getFeatureStore,
  addFeature,
  removeFeature,
  getMyFeatures,
} from "../../../api/mainapi/featureapi";
import { showError, showSuccess } from "../../../components/swalHelper";
import { setPlansEntryFromDashboard } from "../../../utils/planFlow";
import axios from "axios";

interface Feature {
  id: string | number;
  name: string;
  description: string;
  price: number;
  discounted_price?: string | number;
  discount_pct_applied?: number;
  is_included?: boolean;
  tag?: string;
  category?: string;
  billing_cycle?: string;
  created_at?: string;
}

interface PlanBenefits {
  feature_store_discount_pct: number;
  feature_store_trial_days: number;
}

export default function FeatureStorePage({
  onClose,
}: {
  onClose?: () => void;
}) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [stage, setStage] = useState<"list" | "checkout">("list");
  const [initialLoading, setInitialLoading] = useState(true);
  const [updatingFeatureIds, setUpdatingFeatureIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<
    "default" | "name_asc" | "name_desc" | "price_low_high" | "price_high_low"
  >("default");
  const [planBenefits, setPlanBenefits] = useState<PlanBenefits | null>(null);
  const [planName, setPlanName] = useState<string | null>(null);
  const [taxPercentage, setTaxPercentage] = useState(0);

  const navigate = useNavigate();
  const getFeatureId = (id: string | number) => String(id);

  const priceNum = (p: unknown) => {
    const n = Number(p);
    return Number.isFinite(n) ? n : 0;
  };

  /** Same basis as card prices: plan discount applied, excl. GST. */
  const featureMonthlyPrice = (f: Feature) =>
    priceNum(f.discounted_price ?? f.price);

  const selectedFeatures = features.filter((f) =>
    selected.includes(getFeatureId(f.id))
  );
  const billableSelectedFeatures = selectedFeatures.filter(
    (f) => !f.is_included,
  );
  const subtotal = billableSelectedFeatures.reduce(
    (sum, f) => sum + featureMonthlyPrice(f),
    0,
  );
  const taxRate = taxPercentage / 100;
  const gst = subtotal * taxRate;
  const totalInclGst = subtotal + gst;
  const hasTax = taxPercentage > 0;

  const categoryOptions = useMemo(() => {
    const categories = Array.from(
      new Set(
        features
          .map((f) => (f.category || "").trim())
          .filter((c): c is string => Boolean(c))
      )
    ).sort((a, b) => a.localeCompare(b));
    return ["all", ...categories];
  }, [features]);

  const filteredFeatures = useMemo(() => {
    let next = [...features];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      next = next.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.description || "").toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== "all") {
      next = next.filter((f) => (f.category || "").trim() === selectedCategory);
    }

    switch (sortBy) {
      case "name_asc":
        next.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name_desc":
        next.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "price_low_high":
        next.sort(
          (a, b) => featureMonthlyPrice(a) - featureMonthlyPrice(b),
        );
        break;
      case "price_high_low":
        next.sort(
          (a, b) => featureMonthlyPrice(b) - featureMonthlyPrice(a),
        );
        break;
      default:
        break;
    }

    return next;
  }, [features, searchTerm, selectedCategory, sortBy]);

  const handleClose = () => {
    if (onClose) onClose();
    else navigate(-1);
  };

  const handleConfirmCheckout = () => {
    if (billableSelectedFeatures.length === 0) return;

    const trialDays = planBenefits?.feature_store_trial_days ?? 7;
    const featureNames = billableSelectedFeatures.map((f) => f.name).join(", ");
    const trialLine =
      trialDays > 0
        ? `Your ${trialDays}-day free trial is active. Billing of ₹${totalInclGst.toFixed(0)}/mo starts after the trial unless you remove the add-on.`
        : `Your selected add-ons are now active on your plan.`;

    showSuccess(
      "Add-ons activated",
      `${featureNames} ${billableSelectedFeatures.length === 1 ? "is" : "are"} ready to use. ${trialLine}`,
      () => handleClose(),
    );
  };

  // ✅ Fetch features and user's existing selections
  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true);
        setError(null);

        const [allFeatures, myFeaturesResp] = await Promise.all([
          getFeatureStore(),
          getMyFeatures(),
        ]);

        // --- normalize allFeatures into an array ---
        if (Array.isArray(allFeatures)) {
          setFeatures(allFeatures);
        } else if (
          allFeatures?.features &&
          Array.isArray(allFeatures.features)
        ) {
          setFeatures(allFeatures.features);
          if (allFeatures.plan_benefits) {
            setPlanBenefits(allFeatures.plan_benefits as PlanBenefits);
          }
          if (allFeatures.plan_name) {
            setPlanName(String(allFeatures.plan_name));
          }
          if (allFeatures.tax_percentage != null) {
            const pct = Number(allFeatures.tax_percentage);
            setTaxPercentage(Number.isFinite(pct) && pct >= 0 ? pct : 0);
          }
        } else if (allFeatures?.data && Array.isArray(allFeatures.data)) {
          setFeatures(allFeatures.data);
        } else {
          setFeatures([]);
          console.warn("Unexpected allFeatures shape:", allFeatures);
        }

        // --- normalize myFeatures into an array of ids ---
        let selectedIds: string[] = [];

        if (Array.isArray(myFeaturesResp)) {
          // direct array of feature objects
          selectedIds = myFeaturesResp.map((f: any) => String(f.id));
        } else if (
          myFeaturesResp?.features &&
          Array.isArray(myFeaturesResp.features)
        ) {
          selectedIds = myFeaturesResp.features.map((f: any) => String(f.id));
        } else if (myFeaturesResp?.data && Array.isArray(myFeaturesResp.data)) {
          selectedIds = myFeaturesResp.data.map((f: any) => String(f.id));
        } else if (myFeaturesResp?.ids && Array.isArray(myFeaturesResp.ids)) {
          // sometimes API returns just ids
          selectedIds = myFeaturesResp.ids.map((id: any) => String(id));
        } else {
          // last fallback: if API returned a single object (maybe a feature)
          if (
            myFeaturesResp &&
            typeof myFeaturesResp === "object" &&
            myFeaturesResp.id
          ) {
            selectedIds = [String((myFeaturesResp as any).id)];
          } else {
            console.warn("Unexpected myFeatures shape:", myFeaturesResp);
          }
        }

        setSelected(selectedIds);
      } catch (err) {
        console.error("Error loading feature store:", err);
        setError("Failed to load feature store data.");
      } finally {
        setInitialLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ Toggle Add/Remove Feature (API integrated)
  const toggleSelect = async (id: string | number) => {
    const normalizedId = getFeatureId(id);
    const isRemoving = selected.includes(normalizedId);
    const previousSelected = selected;

    setUpdatingFeatureIds((prev) => new Set(prev).add(normalizedId));
    setSelected((prev) =>
      isRemoving
        ? prev.filter((x) => x !== normalizedId)
        : [...prev, normalizedId],
    );

    try {
      if (isRemoving) {
        await removeFeature(normalizedId);
      } else {
        await addFeature(normalizedId);
      }
    } catch (err: unknown) {
      setSelected(previousSelected);
      console.error("Feature update error:", err);

      const data = axios.isAxiosError(err)
        ? (err.response?.data as Record<string, unknown> | undefined)
        : undefined;
      const errLower =
        typeof data?.error === "string" ? data.error.toLowerCase() : "";
      const requiresSubscription =
        data?.requires_subscription === true ||
        errLower.includes("no active subscription") ||
        errLower.includes("select a plan first");

      const msg =
        (typeof data?.error === "string" && data.error) ||
        (typeof data?.detail === "string" && data.detail) ||
        (err as Error)?.message ||
        "Unable to update feature selection. Please try again.";

      showError(
        "Update failed",
        msg,
        requiresSubscription
          ? () => {
              onClose?.();
              setPlansEntryFromDashboard();
              navigate("/plans");
            }
          : undefined
      );
    } finally {
      setUpdatingFeatureIds((prev) => {
        const next = new Set(prev);
        next.delete(normalizedId);
        return next;
      });
    }
  };

  return (
    <div className="lg:fixed lg:inset-0 lg:bg-black/40 lg:flex lg:items-center lg:justify-center p-0 lg:p-4 z-50">
      <div className="bg-white rounded-none lg:rounded-2xl shadow-xl w-full lg:max-w-5xl lg:max-h-[90vh] overflow-hidden flex flex-col h-screen lg:h-auto flex-1">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#6A3CB1] to-[#8C7BFF] text-white flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            {stage === "checkout" ? (
              <button
                onClick={() => setStage("list")}
                className="p-1 hover:bg-white/10 rounded"
              >
                <ArrowLeft size={22} />
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="lg:hidden p-1 hover:bg-white/10 rounded"
              >
                <ArrowLeft size={22} />
              </button>
            )}
            <h2 className="text-lg font-semibold text-white">Feature Store</h2>
          </div>
          <button
            onClick={handleClose}
            className="hidden lg:block hover:bg-white/20 rounded-full p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-5 lg:px-6 py-5">
          {initialLoading ? (
            <p className="text-center text-gray-500 mt-10">
              Loading features...
            </p>
          ) : error ? (
            <p className="text-center text-red-500 mt-10">{error}</p> // Error message
          ) : stage === "list" ? (
            <>
              {planBenefits && (
                <div className="mb-4 rounded-lg border border-[#E8DFFB] bg-[#F9F6FF] px-4 py-3 text-sm text-[#4B3F72]">
                  {planName ? (
                    <p className="font-medium mb-1">{planName} plan benefits</p>
                  ) : null}
                  <p>
                    {planBenefits.feature_store_discount_pct > 0
                      ? `${planBenefits.feature_store_discount_pct}% off Feature Store add-ons · `
                      : ""}
                    {planBenefits.feature_store_trial_days}-day free trials on paid add-ons
                  </p>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                {/* Search -------------------------------------------------- */}
                <div className="relative w-full sm:w-1/2">
                  <Search
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7658A0B2]"
                  />
                  <input
                    type="text"
                    placeholder="Search feature"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-[#6A3CB1] outline-none"
                  />
                </div>

                {/* Category + Filter (same icon after text) --------------- */}
                <div className="flex gap-2 sm:ml-auto">
                  {/* Category */}
                  <div className="relative flex items-center border border-gray-300 rounded-lg px-3 py-2 text-sm text-[#7658A0B2] bg-white">
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-transparent outline-none pr-6 appearance-none cursor-pointer"
                      aria-label="Filter by category"
                    >
                      {categoryOptions.map((category) => (
                        <option key={category} value={category}>
                          {category === "all" ? "All Category" : category}
                        </option>
                      ))}
                    </select>
                    <Funnel size={20} className="ml-2 text-[#7658A0B2]" />
                  </div>

                  {/* Filter */}
                  <div className="relative flex items-center border border-gray-300 rounded-lg px-3 py-2 text-sm text-[#7658A0B2] bg-white">
                    <select
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(
                          e.target.value as
                            | "default"
                            | "name_asc"
                            | "name_desc"
                            | "price_low_high"
                            | "price_high_low"
                        )
                      }
                      className="bg-transparent outline-none pr-6 appearance-none cursor-pointer"
                      aria-label="Sort features"
                    >
                      <option value="default">Sort By: Default</option>
                      <option value="name_asc">Name: A-Z</option>
                      <option value="name_desc">Name: Z-A</option>
                      <option value="price_low_high">Price: Low to High</option>
                      <option value="price_high_low">Price: High to Low</option>
                    </select>
                    <Funnel size={20} className="ml-2 text-[#7658A0B2]" />
                  </div>
                </div>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredFeatures.length === 0 && (
                  <div className="col-span-full text-center text-gray-500 py-10">
                    No features match your search/filter.
                  </div>
                )}
                {filteredFeatures.map((f) => {
                  const fid = getFeatureId(f.id);
                  const isAdded = selected.includes(fid);
                  const includedInPlan = Boolean(f.is_included);
                  const displayPrice = featureMonthlyPrice(f);
                  const listPrice = priceNum(f.price);
                  const showStrike =
                    f.discounted_price != null && displayPrice < listPrice;
                  const isUpdating = updatingFeatureIds.has(fid);
                  return (
                    <div
                      key={fid}
                      className={`rounded-xl p-4 transition bg-white ${
                        isAdded
                          ? "border border-[#22c55e]" // green border when added
                          : "border border-transparent bg-[#7658A00D]" // 5% purple tint, no border
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-800 text-sm">
                          {f.name}
                        </h3>
                        {f.tag && (
                          <span
                            className={`text-[10px] px-2 py-[2px] rounded-md ${
                              f.tag === "New"
                                ? "bg-green-50 text-green-600"
                                : "bg-[#F5F1FF] text-[#6A3CB1]"
                            }`}
                          >
                            {f.tag}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-500 mb-3 leading-snug">
                        {f.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div>
                          {showStrike && (
                            <p className="text-[11px] text-gray-400 line-through">
                              ₹ {listPrice}/mo
                            </p>
                          )}
                          <p className="font-semibold text-gray-800 text-sm">
                            ₹ {displayPrice}/mo
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => void toggleSelect(fid)}
                          disabled={isUpdating || includedInPlan}
                          className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition ${
                            includedInPlan
                              ? "bg-gray-100 text-gray-500 border border-gray-200 cursor-not-allowed"
                              : isAdded
                              ? "bg-green-50 text-green-600 border border-green-400"
                              : "bg-[#6A3CB1] text-white hover:bg-[#5b32a2]"
                          } ${isUpdating ? "opacity-60 cursor-wait" : ""}`}
                        >
                          {includedInPlan ? (
                            "Included"
                          ) : isUpdating ? (
                            "..."
                          ) : isAdded ? (
                            <>
                              <Check size={14} />
                              Added
                            </>
                          ) : (
                            <>
                              <Plus  size={14} />
                              <ShoppingCart size={14} />
                              Add
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <h3 className="font-semibold text-gray-800 mb-4">
                Confirm Your Add-Ons
              </h3>
              {planBenefits && planBenefits.feature_store_trial_days > 0 ? (
                <p className="mb-4 rounded-lg border border-[#E8DFFB] bg-[#F9F6FF] px-4 py-3 text-sm text-[#4B3F72]">
                  Paid add-ons include a {planBenefits.feature_store_trial_days}-day free
                  trial. You can use them immediately; payment is only required after the
                  trial ends.
                </p>
              ) : null}
              <div className="space-y-3 mb-6">
                {billableSelectedFeatures.map((f) => (
                  <div
                    key={f.id}
                    className="flex justify-between items-center border border-gray-200 rounded-lg px-4 py-2"
                  >
                    <div>
                      <p className="font-medium text-gray-700 text-sm">
                        {f.name}
                      </p>
                      <p className="text-xs text-gray-500">{f.description}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800">
                      ₹ {featureMonthlyPrice(f)}/mo
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 text-sm text-gray-700 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹ {subtotal}/mo</span>
                </div>
                {hasTax ? (
                  <div className="flex justify-between">
                    <span>GST ({taxPercentage}%)</span>
                    <span>₹ {gst.toFixed(0)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between font-semibold text-base pt-1 border-t mt-2">
                  <span>{hasTax ? "Total (incl. GST)" : "Total"}</span>
                  <span>₹ {totalInclGst.toFixed(0)}/mo</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="border-t px-5 py-4 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {stage === "list" ? (
            <div className="sticky bottom-0 left-0 right-0 z-10 w-full h-16 bg-white rounded-t-xl shadow-t-md flex items-center justify-between px-5">
              <p className="text-sm text-gray-700 flex items-center gap-2">
                <ShoppingCart size={16} className="text-[#6A3CB1]" />
                {billableSelectedFeatures.length} Features Selected ·{" "}
                <span className="font-semibold">
                  Total: ₹{(hasTax ? subtotal : totalInclGst).toFixed(0)}/mo
                </span>
                {hasTax ? (
                  <span className="text-xs text-gray-500">(excl. GST)</span>
                ) : null}
              </p>

              <button
                type="button"
                onClick={() => setStage("checkout")}
                disabled={billableSelectedFeatures.length === 0}
                className="flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  width: 220,
                  height: 40,
                  borderRadius: 10,
                  background:
                    "linear-gradient(90deg, #AE84EB 0%, #7CB2E5 100%)",
                }}
              >
                Proceed to Checkout
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <button
                type="button"
                onClick={() => setStage("list")}
                className="text-sm text-[#6A3CB1] hover:underline text-left"
              >
                ← Back to Features
              </button>
              <button
                type="button"
                onClick={handleConfirmCheckout}
                disabled={billableSelectedFeatures.length === 0 || updatingFeatureIds.size > 0}
                className="flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-sm font-medium text-white transition disabled:opacity-50 disabled:cursor-not-allowed sm:ml-auto"
                style={{
                  minWidth: 220,
                  height: 40,
                  borderRadius: 10,
                  background:
                    "linear-gradient(90deg, #AE84EB 0%, #7CB2E5 100%)",
                }}
              >
                Confirm &amp; Activate
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
