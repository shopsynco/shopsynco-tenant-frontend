import { X } from "lucide-react";
import { useState } from "react";
import { updateCardDetails } from "../../../../api/payment/paymentapi";

/* ------------------------ SHARED WRAPPER ------------------------ */
export function ModalWrapper({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-xl w-[480px] p-8 relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
        <h2 className="text-xl font-semibold mb-4 text-[#4A5C74]">{title}</h2>
        {children}
      </div>
    </div>
  );
}

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
      alert("Please fill in all fields.");
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
      alert("Card details updated successfully!");
      onClose();
    } catch (error) {
      alert("Failed to update card.");
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
}: {
  onClose: () => void;
  onEditCard: () => void;
  onDeleteCard: () => void;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-xl w-[480px] p-8 relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-4 text-[#4A5C74]">
          Card details
        </h2>

        <div className="flex items-center gap-3 mb-6">
          {/* Card Logo */}
          <img
            src="/path/to/visa-icon.png" // Replace with actual card logo (e.g., VISA, MasterCard)
            alt="VISA"
            className="w-10 h-10"
          />
          <div>
            <p className="font-semibold text-gray-800">VISA</p>
            <p className="text-sm text-gray-500">**** **** **** 4526</p>
          </div>
        </div>

        {/* Expiry Date and Cardholder Name */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">Expiry Date: 06/26</p>
          <p className="text-sm text-gray-600">Cardholder: Manoj Boskar</p>
        </div>

        {/* Edit and Delete Buttons */}
        <div className="flex gap-4 justify-between">
          <button
            onClick={() => {
              onEditCard(); // Call the onEditCard function when Edit is clicked
              onClose(); // Close the modal after the edit action
            }}
            className="px-4 py-2 bg-[#6A3CB1] text-white rounded-lg hover:bg-[#5b32a2] transition"
          >
            Edit
          </button>
          <button
            onClick={() => {
              onDeleteCard(); // Call the onDeleteCard function when Delete is clicked
              onClose(); // Close the modal after the delete action
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
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
          onClick={() => {
            alert(`${type} payment method deleted!`);
            onClose();
          }}
        >
          Delete
        </button>
      </div>
    </ModalWrapper>
  );
}
