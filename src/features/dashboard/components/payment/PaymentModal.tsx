import { useState } from "react";
import Swal from "sweetalert2";
import { submitPayment, verifyUpi, payWithUpi } from "../../../../api/payment/paymentapi";
import { ModalWrapper } from "../../../../components/ui/modalWrapper";

interface ModalProps {
  onClose: () => void;
  onBack?: () => void;
}

const inputClass =
  "w-full px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6A3CB1] transition";

/* 💳 CARD MODAL */
export function AddCardModal({ onClose, onBack }: ModalProps) {
  const [form, setForm] = useState({
    card_holder: "",
    card_last4: "",
    brand: "",
    exp_month: "",
    exp_year: "",
  });

  const [loading, setLoading] = useState(false);
  const subscriptionId = localStorage.getItem("subscription_id");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!subscriptionId) return Swal.fire("Error", "Missing subscription ID", "error");

    const payload = {
      subscription_id: subscriptionId,
      method: "credit_card" as const,
      card_holder: form.card_holder,
      card_last4: form.card_last4,
      brand: form.brand,
      exp_month: Number(form.exp_month),
      exp_year: Number(form.exp_year),
      cvv_present: true,
    };

    try {
      setLoading(true);
      const res = await submitPayment(payload);
      console.log("✅ Payment submitted:", res);
      Swal.fire("Success", "Card payment saved successfully!", "success");
      onClose();
    } catch (error: any) {
      Swal.fire("Error", error.response?.data?.message || "Failed to submit payment", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper title="Add your card details" onClose={onClose} width="w-[90%] sm:w-[600px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input name="card_holder" value={form.card_holder} onChange={handleChange} className={inputClass} placeholder="Card Holder Name" />
        <input name="card_last4" value={form.card_last4} onChange={handleChange} className={inputClass} placeholder="Last 4 digits" />
        <input name="brand" value={form.brand} onChange={handleChange} className={inputClass} placeholder="Brand (e.g. VISA)" />
        <input name="exp_month" value={form.exp_month} onChange={handleChange} className={inputClass} placeholder="Expiry Month (MM)" />
        <input name="exp_year" value={form.exp_year} onChange={handleChange} className={inputClass} placeholder="Expiry Year (YYYY)" />
      </div>

      <ModalFooter loading={loading} onBack={onBack} onSubmit={handleSubmit} />
    </ModalWrapper>
  );
}

/* 🏦 BANK MODAL */
export function AddBankModal({ onClose, onBack }: ModalProps) {
  const [form, setForm] = useState({
    account_holder: "",
    account_number: "",
    bank_name: "",
    branch_name: "",
    ifsc: "",
  });

  const [loading, setLoading] = useState(false);
  const subscriptionId = localStorage.getItem("subscription_id");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!subscriptionId) return Swal.fire("Error", "Missing subscription ID", "error");

    const payload = {
      subscription_id: subscriptionId,
      method: "bank_transfer" as const,
      account_holder: form.account_holder,
      account_number: form.account_number,
      bank_name: form.bank_name,
      branch_name: form.branch_name,
      ifsc: form.ifsc,
    };

    try {
      setLoading(true);
      const res = await submitPayment(payload);
      console.log("✅ Bank payment submitted:", res);
      Swal.fire("Success", "Bank details saved successfully!", "success");
      onClose();
    } catch (error: any) {
      Swal.fire("Error", error.response?.data?.message || "Bank payment submission failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper title="Add your bank account" onClose={onClose} width="w-[90%] sm:w-[600px]">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input name="account_holder" value={form.account_holder} onChange={handleChange} className={inputClass} placeholder="Account Holder Name" />
        <input name="bank_name" value={form.bank_name} onChange={handleChange} className={inputClass} placeholder="Bank Name" />
        <input name="account_number" value={form.account_number} onChange={handleChange} className={inputClass} placeholder="Account Number" />
        <input name="branch_name" value={form.branch_name} onChange={handleChange} className={inputClass} placeholder="Branch Name" />
        <input name="ifsc" value={form.ifsc} onChange={handleChange} className={inputClass} placeholder="IFSC Code" />
      </div>

      <ModalFooter loading={loading} onBack={onBack} onSubmit={handleSubmit} />
    </ModalWrapper>
  );
}

/* 📱 UPI MODAL */
export function AddUpiModal({ onClose, onBack }: ModalProps) {
  const [upiId, setUpiId] = useState("");
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const subscriptionId = localStorage.getItem("subscription_id");

  const handleVerify = async () => {
    try {
      setLoading(true);
      const res = await verifyUpi(upiId);
      console.log("✅ UPI verified:", res);
      Swal.fire("Success", "UPI verified successfully!", "success");
      setVerified(true);
    } catch (error: any) {
      Swal.fire("Error", error.response?.data?.message || "UPI verification failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!subscriptionId) return Swal.fire("Error", "Missing subscription ID", "error");

    const payload = {
      subscription_id: subscriptionId,
      method: "upi" as const,
      upi_id: upiId,
    };

    try {
      setLoading(true);
      const res = await payWithUpi(payload);
      console.log("✅ UPI payment submitted:", res);
      Swal.fire("Success", "UPI payment saved successfully!", "success");
      onClose();
    } catch (error: any) {
      Swal.fire("Error", error.response?.data?.message || "UPI payment failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper title="Add UPI ID" onClose={onClose} width="w-[90%] sm:w-[600px]">
      <label className="block text-sm text-gray-600 mb-1">Enter UPI ID</label>
      <div className="flex gap-3">
        <input
          type="text"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          placeholder="example@okaxis"
          className={`${inputClass} flex-1`}
        />
        <button
          onClick={handleVerify}
          disabled={loading || !upiId}
          className="px-4 py-2 rounded-md bg-[#E5E0FF] text-[#6A3CB1] font-medium hover:bg-[#dcd3fa] transition disabled:opacity-50"
        >
          {loading ? "..." : verified ? "Verified" : "Verify"}
        </button>
      </div>

      <ModalFooter loading={loading} onBack={onBack} onSubmit={handleSubmit} disabled={!verified} />
    </ModalWrapper>
  );
}

function ModalFooter({
  onBack,
  onSubmit,
  loading,
  disabled,
}: {
  onBack?: () => void;
  onSubmit: () => void;
  loading: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex justify-end mt-6 gap-3">
      {onBack && (
        <button onClick={onBack} className="px-5 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100">
          Back
        </button>
      )}
      <button
        onClick={onSubmit}
        disabled={loading || disabled}
        className="px-5 py-2 text-sm rounded-md bg-[#6A3CB1] text-white hover:bg-[#5a2ca0] disabled:opacity-50"
      >
        {loading ? "Saving..." : "Add & Save"}
      </button>
    </div>
  );
}
