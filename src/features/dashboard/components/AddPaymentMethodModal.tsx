import { useState } from "react";
import { X } from "lucide-react";

import Swal from "sweetalert2";
import { addPaymentMethod } from "../../../api/payment/paymentapi";

interface ModalProps {
  onClose: () => void;
  onBack?: () => void;
}

const inputClass =
  "w-full px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6A3CB1] transition";

/* 💳 CARD MODAL */
export function AddCardModal({ onClose, onBack }: ModalProps) {
  const [form, setForm] = useState({
    holder_name: "",
    card_number: "",
    expiry_date: "",
    cvv: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payload = {
        type: "card",
        ...form,
      };
      const res = await addPaymentMethod(payload);
      Swal.fire("Success", "Payment method added successfully!", "success");
      console.log("✅ Response:", res);
      onClose();
    } catch (err: any) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to add payment method",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-[90%] sm:w-[600px] p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>

        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Add your card details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Card Holder Name
            </label>
            <input
              type="text"
              name="holder_name"
              value={form.holder_name}
              onChange={handleChange}
              className={inputClass}
              placeholder="Manoj Basker"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Card Number
            </label>
            <input
              type="text"
              name="card_number"
              value={form.card_number}
              onChange={handleChange}
              className={inputClass}
              placeholder="**** **** **** 4564"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Expiry Date
            </label>
            <input
              type="text"
              name="expiry_date"
              value={form.expiry_date}
              onChange={handleChange}
              className={inputClass}
              placeholder="MM/YY"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">CVV</label>
            <input
              type="password"
              name="cvv"
              value={form.cvv}
              onChange={handleChange}
              className={inputClass}
              placeholder="***"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6 gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="px-5 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Back
            </button>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 text-sm rounded-md bg-[#6A3CB1] text-white hover:bg-[#5a2ca0] disabled:opacity-70"
          >
            {loading ? "Saving..." : "Add & Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
