import { useState } from "react";
import Swal from "sweetalert2";
import { updateCardDetails } from "../../../../api/payment/paymentapi";
import { ModalWrapper } from "../../../../components/ui/modalWrapper";

/* -------------------------- CARD MODAL -------------------------- */
export function EditCardModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    card_holder_name: "",
    card_number: "",
    exp_month: "",
    exp_year: "",
    cvv: "",
    card_brand: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    const {
      card_holder_name,
      card_number,
      exp_month,
      exp_year,
      cvv,
      card_brand,
    } = form;
    if (
      !card_holder_name ||
      !card_number ||
      !exp_month ||
      !exp_year ||
      !cvv ||
      !card_brand
    ) {
      Swal.fire("Validation Error", "Please fill in all fields.", "warning");
      return;
    }

    const payload = {
      card_holder_name,
      card_number,
      exp_month: Number(exp_month),
      exp_year: Number(exp_year),
      cvv,
      card_brand,
    };

    try {
      setLoading(true);
      await updateCardDetails(payload); // API call
      await Swal.fire("Success", "Card details updated successfully!", "success");
      onClose();
    } catch (error) {
      Swal.fire("Error", "Failed to update card.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper onClose={onClose} title="Edit your card details">
      <input
        name="card_holder_name"
        value={form.card_holder_name}
        onChange={handleChange}
        placeholder="Card Holder Name"
        className="w-full border rounded-lg px-4 py-2 mb-3"
      />
      <input
        name="card_number"
        value={form.card_number}
        onChange={handleChange}
        placeholder="Card Number"
        className="w-full border rounded-lg px-4 py-2 mb-3"
      />
      <div className="flex gap-3 mb-3">
        <input
          name="exp_month"
          value={form.exp_month}
          onChange={handleChange}
          placeholder="Expiry Month"
          className="flex-1 border rounded-lg px-4 py-2"
        />
        <input
          name="exp_year"
          value={form.exp_year}
          onChange={handleChange}
          placeholder="Expiry Year"
          className="flex-1 border rounded-lg px-4 py-2"
        />
      </div>
      <div className="mb-3">
        <input
          name="cvv"
          value={form.cvv}
          onChange={handleChange}
          placeholder="CVV"
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>
      <div className="mb-3">
        <input
          name="card_brand"
          value={form.card_brand}
          onChange={handleChange}
          placeholder="Card Brand"
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>
      <button
        onClick={handleSubmit}
        className="w-full bg-[#6A3CB1] text-white py-3 rounded-lg"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </ModalWrapper>
  );
}

/* -------------------------- BANK MODAL -------------------------- */
export function EditBankModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalWrapper onClose={onClose} title="Edit your bank account">
      <input
        placeholder="Account Holder Name"
        className="w-full border rounded-lg px-4 py-2 mb-3"
      />
      <input
        placeholder="Account Number"
        className="w-full border rounded-lg px-4 py-2 mb-3"
      />
      <input
        placeholder="Re-enter Account Number"
        className="w-full border rounded-lg px-4 py-2 mb-3"
      />
      <input
        placeholder="Bank Name"
        className="w-full border rounded-lg px-4 py-2 mb-3"
      />
      <input
        placeholder="IFSC Code"
        className="w-full border rounded-lg px-4 py-2 mb-3"
      />
      <button className="w-full bg-[#6A3CB1] text-white py-3 rounded-lg">
        Save Changes
      </button>
    </ModalWrapper>
  );
}

/* --------------------------- UPI MODAL --------------------------- */
export function EditUpiModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalWrapper onClose={onClose} title="Edit UPI ID">
      <input
        placeholder="Enter UPI ID"
        className="w-full border rounded-lg px-4 py-2 mb-4"
      />
      <button className="w-full bg-[#6A3CB1] text-white py-3 rounded-lg">
        Save Changes
      </button>
    </ModalWrapper>
  );
}

// Modal wrapper to show card details
export function ViewCardModal({
  onClose,
  onEditCard,
  onDeleteCard,
  cardDetails,
}: {
  onClose: () => void;
  onEditCard: () => void;
  onDeleteCard: () => void;
  cardDetails?: {
    card_brand: string;
    card_last4: string;
    exp_month: string;
    exp_year: string;
    card_holder_name: string;
  } | null;
}) {
  if (!cardDetails) {
    return (
      <ModalWrapper title="Card Details" onClose={onClose}>
        <p className="text-gray-600">No card details available.</p>
      </ModalWrapper>
    );
  }

  return (
    <ModalWrapper title="Card Details" onClose={onClose}>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
          <span className="text-xs font-semibold text-gray-600">{cardDetails.card_brand}</span>
        </div>
        <div>
          <p className="font-semibold text-gray-800">{cardDetails.card_brand}</p>
          <p className="text-sm text-gray-500">**** **** **** {cardDetails.card_last4}</p>
        </div>
      </div>

      {/* Expiry Date and Cardholder Name */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Expiry Date: {cardDetails.exp_month}/{cardDetails.exp_year.slice(-2)}
        </p>
        <p className="text-sm text-gray-600">Cardholder: {cardDetails.card_holder_name || "N/A"}</p>
      </div>

      {/* Edit and Delete Buttons */}
      <div className="flex gap-4 justify-between">
        <button
          onClick={() => {
            onEditCard();
            onClose();
          }}
          className="px-4 py-2 bg-[#6A3CB1] text-white rounded-lg hover:bg-[#5b32a2] transition"
        >
          Edit
        </button>
        <button
          onClick={() => {
            onDeleteCard();
            onClose();
          }}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition"
        >
          Delete
        </button>
      </div>
    </ModalWrapper>
  );
}

// Modal for deleting payment method
export function DeleteModal({
  type,
  onClose,
}: {
  type: string;
  onClose: () => void;
}) {
  return (
    <ModalWrapper onClose={onClose} title={`Delete ${type} Payment Method`}>
      <p>Are you sure you want to delete this {type} payment method?</p>
      <div className="flex justify-end gap-2">
        <button className="text-[#6A3CB1]" onClick={onClose}>
          Cancel
        </button>
        <button
          className="bg-red-600 text-white px-4 py-2 rounded-lg"
          onClick={async () => {
            await Swal.fire("Deleted!", `${type} payment method deleted!`, "success");
            onClose();
          }}
        >
          Delete
        </button>
      </div>
    </ModalWrapper>
  );
}
