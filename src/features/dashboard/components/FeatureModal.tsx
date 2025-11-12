import { useState } from "react";
import { ArrowLeft, X, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Feature {
  id: string;
  name: string;
  description: string;
  price: number;
  tag?: string;
}

const featuresData: Feature[] = [
  { id: "1", name: "Customer Loyalty Program", description: "Reward your repeat customers automatically.", price: 199, tag: "Popular" },
  { id: "2", name: "Discount & Coupon Engine", description: "Create flexible discount rules and coupons.", price: 99, tag: "Popular" },
  { id: "3", name: "Advanced Analytics", description: "Get deep insights into your customer behavior.", price: 99, tag: "Popular" },
  { id: "4", name: "WhatsApp Chat Support", description: "Connect with customers directly via WhatsApp.", price: 149 },
  { id: "5", name: "Email Campaigns", description: "Create and send beautiful email campaigns.", price: 149 },
  { id: "6", name: "AI Product Descriptions", description: "Generate compelling product descriptions with AI.", price: 299, tag: "New" },
];

export default function FeatureStorePage({ onClose }: { onClose?: () => void }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [stage, setStage] = useState<"list" | "checkout">("list");
  const navigate = useNavigate();

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectedFeatures = featuresData.filter((f) => selected.includes(f.id));
  const subtotal = selectedFeatures.reduce((sum, f) => sum + f.price, 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  // ✅ Unified close handler
  const handleClose = () => {
    if (onClose) onClose(); // for modal (desktop)
    else navigate(-1); // for page (mobile)
  };

  return (
    <div className="lg:fixed lg:inset-0 lg:bg-black/40 lg:flex lg:items-center lg:justify-center p-0 lg:p-4 z-50">
      {/* Modal (Desktop) / Full page (Mobile) */}
      <div className="bg-white rounded-none lg:rounded-2xl shadow-xl w-full lg:max-w-5xl lg:max-h-[90vh] overflow-hidden flex flex-col h-screen lg:h-auto">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-[#8C7BFF] to-[#6A3CB1] text-white flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2">
            {/* Mobile Back */}
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
            <h2 className="text-lg font-semibold">Feature Store</h2>
          </div>

          {/* Desktop Close */}
          <button
            onClick={handleClose}
            className="hidden lg:block hover:bg-white/20 rounded-full p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto px-5 lg:px-6 py-5">
          {stage === "list" ? (
            <>
              {/* Search + Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <input
                  type="text"
                  placeholder="Search feature"
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full sm:w-1/2 focus:ring-2 focus:ring-[#6A3CB1] outline-none"
                />
                <div className="flex gap-2 sm:ml-auto">
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600">
                    <option>All Category</option>
                  </select>
                  <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600">
                    <option>Sort By: All</option>
                  </select>
                </div>
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuresData.map((f) => {
                  const isAdded = selected.includes(f.id);
                  return (
                    <div
                      key={f.id}
                      className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition bg-white"
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
                          className={`flex items-center justify-center gap-1 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium transition ${
                            isAdded
                              ? "bg-green-50 text-green-600 border border-green-400"
                              : "bg-[#6A3CB1] text-white hover:bg-[#5b32a2]"
                          }`}
                        >
                          <ShoppingCart size={14} />
                          {isAdded ? "Added" : "Add"}
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
          {stage === "list" ? (
            <>
              <p className="text-sm text-gray-700 flex items-center gap-2">
                <ShoppingCart size={16} className="text-[#6A3CB1]" />
                {selected.length} Features Selected •{" "}
                <span className="font-semibold">
                  Total: ₹{subtotal}/month
                </span>
              </p>
              <button
                disabled={selected.length === 0}
                onClick={() => setStage("checkout")}
                className={`px-5 py-2 rounded-lg font-medium text-sm transition ${
                  selected.length === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-[#6A3CB1] text-white hover:bg-[#5b32a2]"
                }`}
              >
                {selected.length === 0
                  ? "Select Features"
                  : "Proceed to Checkout"}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setStage("list")}
                className="text-sm text-[#6A3CB1] hover:underline"
              >
                ← Back to Features
              </button>
              <button className="bg-[#6A3CB1] text-white text-sm px-5 py-2 rounded-lg font-medium hover:bg-[#5b32a2] transition"
              onClick={()=>navigate("/upgrade-payment")}>
                Pay & Activate
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
