import { useState, useEffect } from "react";
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
import { showError } from "../../../components/swalHelper";
import axios from "axios";

interface Feature {
  id: string;
  name: string;
  description: string;
  price: number;
  tag?: string;
}

export default function FeatureStorePage({
  onClose,
}: {
  onClose?: () => void;
}) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [stage, setStage] = useState<"list" | "checkout">("list");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // State to handle errors

  const navigate = useNavigate();

  const selectedFeatures = features.filter((f) => selected.includes(f.id));
  const subtotal = selectedFeatures.reduce((sum, f) => sum + f.price, 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  const handleClose = () => {
    if (onClose) onClose();
    else navigate(-1);
  };

  // ✅ Fetch features and user's existing selections
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null); // Reset any previous errors

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
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ✅ Toggle Add/Remove Feature (API integrated)
  const toggleSelect = async (id: string) => {
    try {
      setLoading(true);
      if (selected.includes(id)) {
        await removeFeature(id);
        setSelected((prev) => prev.filter((x) => x !== id));
      } else {
        await addFeature(id);
        setSelected((prev) => [...prev, id]);
      }

      // ...
    } catch (err: unknown) {
      // keep the unknown signature
      console.error("Feature update error:", err);

      // AxiosError guard
      const msg =
        (axios.isAxiosError(err) && (err.response?.data as any)?.error) ||
        (axios.isAxiosError(err) && (err.response?.data as any)?.detail) ||
        (err as Error)?.message || // plain JS error
        "Unable to update feature selection. Please try again.";

      showError("Update failed", msg);
    } finally {
      setLoading(false);
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
          {loading ? (
            <p className="text-center text-gray-500 mt-10">
              Loading features...
            </p>
          ) : error ? (
            <p className="text-center text-red-500 mt-10">{error}</p> // Error message
          ) : stage === "list" ? (
            <>
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
                    className="pl-10 border border-gray-300 rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-[#6A3CB1] outline-none"
                  />
                </div>

                {/* Category + Filter (same icon after text) --------------- */}
                <div className="flex gap-2 sm:ml-auto">
                  {/* Category */}
                  <div className="relative flex items-center border border-gray-300 rounded-lg px-3 py-2 text-sm text-[#7658A0B2] bg-white">
                    <span>All Category</span>
                    <Funnel
                      size={20}
                      className="ml-2 text-[#7658A0B2]"
                      style={{
                        margin: "0 auto",
                        flex: "none",
                        order: 1,
                        flexGrow: 0,
                      }}
                    />
                  </div>

                  {/* Filter */}
                  <div className="relative flex items-center border border-gray-300 rounded-lg px-3 py-2 text-sm text-[#7658A0B2] bg-white">
                    <span>Sort By: All</span>
                    <Funnel
                      size={20}
                      className="ml-2 text-[#7658A0B2]"
                      style={{
                        margin: "0 auto",
                        flex: "none",
                        order: 1,
                        flexGrow: 0,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {features.map((f) => {
                  const isAdded = selected.includes(f.id);
                  return (
                    <div
                      key={f.id}
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
                        <p className="font-semibold text-gray-800 text-sm">
                          ₹ {f.price}/mo
                        </p>

                        <button
                          onClick={() => toggleSelect(f.id)}
                          disabled={loading}
                          className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition ${
                            isAdded
                              ? "bg-green-50 text-green-600 border border-green-400"
                              : "bg-[#6A3CB1] text-white hover:bg-[#5b32a2]"
                          }`}
                        >
                          {isAdded ? (
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
              <div className="space-y-3 mb-6">
                {selectedFeatures.map((f) => (
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
                      ₹ {f.price}/mo
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 text-sm text-gray-700 space-y-1">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹ {subtotal}/mo</span>
                </div>
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span>₹ {gst.toFixed(0)}</span>
                </div>
                <div className="flex justify-between font-semibold text-base pt-1 border-t mt-2">
                  <span>Total</span>
                  <span>₹ {total.toFixed(0)}/mo</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* FOOTER */}
        <div className="border-t px-5 py-4 bg-gray-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {stage === "list" && (
            <div className="sticky bottom-0 left-0 right-0 z-10 w-full h-16 bg-white rounded-t-xl shadow-t-md flex items-center justify-between px-5">
              <p className="text-sm text-gray-700 flex items-center gap-2">
                <ShoppingCart size={16} className="text-[#6A3CB1]" />
                {selected.length} Features Selected ·{" "}
                <span className="font-semibold">
                  Total: ₹{total.toFixed(0)}/mo
                </span>
              </p>

              <button
                onClick={() => setStage("checkout")}
                disabled={selected.length === 0}
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
          )}
          {/* : (
            <>
              <button
                onClick={() => setStage("list")}
                className="text-sm text-[#6A3CB1] hover:underline"
              >
                ← Back to Features
              </button>
              <button
                className="bg-[#6A3CB1] text-white text-sm px-5 py-2 rounded-lg font-medium hover:bg-[#5b32a2] transition"
                onClick={() => navigate("/upgrade-payment")}
              >
                Pay & Activate
              </button>
            </>
          ) */}
        </div>
      </div>
    </div>
  );
}
