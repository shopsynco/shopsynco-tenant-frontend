import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
}

export default function AddPaymentModal({ onClose }: Props) {
  const [step, setStep] = useState<"choose" | "form">("choose");
  const [method, setMethod] = useState<"credit" | "bank" | "upi" | null>(null);

  const handleSelect = (selected: "credit" | "bank" | "upi") => {
    setMethod(selected);
    setStep("form");
  };

  const handleBack = () => {
    setStep("choose");
    setMethod(null);
  };

  const title =
    method === "credit"
      ? "Add Credit/Debit Card"
      : method === "bank"
      ? "Add Bank Transfer Details"
      : method === "upi"
      ? "Add UPI Payment ID"
      : "Add Payment Method";

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[90%] sm:w-[500px] p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-800 mb-5">
          {title}
        </h3>

        {/* STEP 1: Choose Payment Method */}
        {step === "choose" && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { name: "Credit/Debit Card", key: "credit", icon: "💳" },
              { name: "Bank Transfer", key: "bank", icon: "🏦" },
              { name: "UPI Payment", key: "upi", icon: "📱" },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => handleSelect(m.key as any)}
                className="flex flex-col items-center justify-center border border-gray-200 rounded-lg p-5 hover:border-[#6A3CB1] hover:bg-purple-50 transition"
              >
                <span className="text-3xl">{m.icon}</span>
                <span className="mt-2 text-sm font-medium text-gray-700">
                  {m.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* STEP 2: Payment Form */}
        {step === "form" && method && (
          <div className="space-y-3">
            <button
              onClick={handleBack}
              className="text-sm text-[#6A3CB1] hover:underline mb-2"
            >
              ← Back to Methods
            </button>

            {method === "credit" && (
              <>
                <input
                  type="text"
                  placeholder="Card Holder Name"
                  className="input-style"
                />
                <input
                  type="text"
                  placeholder="Card Number"
                  className="input-style"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Expiry (MM/YY)" className="input-style" />
                  <input placeholder="CVV" className="input-style" />
                </div>
                <button className="w-full mt-3 bg-[#6A3CB1] text-white py-2 rounded-md hover:bg-[#5b32a2] transition">
                  Save Card
                </button>
              </>
            )}

            {method === "bank" && (
              <>
                <input
                  placeholder="Account Holder Name"
                  className="input-style"
                />
                <input placeholder="Bank Name" className="input-style" />
                <input placeholder="Account Number" className="input-style" />
                <input placeholder="IFSC Code" className="input-style" />
                <button className="w-full mt-3 bg-[#6A3CB1] text-white py-2 rounded-md hover:bg-[#5b32a2] transition">
                  Save Bank Details
                </button>
              </>
            )}

            {method === "upi" && (
              <>
                <input
                  placeholder="Enter your UPI ID (example@okaxis)"
                  className="input-style"
                />
                <button className="w-full mt-3 bg-[#6A3CB1] text-white py-2 rounded-md hover:bg-[#5b32a2] transition">
                  Save UPI ID
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
