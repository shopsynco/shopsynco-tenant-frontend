import { X } from "lucide-react";

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
  return (
    <ModalWrapper onClose={onClose} title="Edit your card details">
      <input placeholder="Card Holder Name" className="w-full border rounded-lg px-4 py-2 mb-3" />
      <input placeholder="Card Number" className="w-full border rounded-lg px-4 py-2 mb-3" />
      <div className="flex gap-3 mb-3">
        <input placeholder="Expiry Date" className="flex-1 border rounded-lg px-4 py-2" />
        <input placeholder="CVV" className="flex-1 border rounded-lg px-4 py-2" />
      </div>
      <button className="w-full bg-[#6A3CB1] text-white py-3 rounded-lg">Save Changes</button>
    </ModalWrapper>
  );
}

/* -------------------------- BANK MODAL -------------------------- */
export function EditBankModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalWrapper onClose={onClose} title="Edit your bank account">
      <input placeholder="Account Holder Name" className="w-full border rounded-lg px-4 py-2 mb-3" />
      <input placeholder="Account Number" className="w-full border rounded-lg px-4 py-2 mb-3" />
      <input placeholder="Re-enter Account Number" className="w-full border rounded-lg px-4 py-2 mb-3" />
      <input placeholder="Bank Name" className="w-full border rounded-lg px-4 py-2 mb-3" />
      <input placeholder="IFSC Code" className="w-full border rounded-lg px-4 py-2 mb-3" />
      <button className="w-full bg-[#6A3CB1] text-white py-3 rounded-lg">Save Changes</button>
    </ModalWrapper>
  );
}

/* --------------------------- UPI MODAL --------------------------- */
export function EditUpiModal({ onClose }: { onClose: () => void }) {
  return (
    <ModalWrapper onClose={onClose} title="Edit UPI ID">
      <input placeholder="Enter UPI ID" className="w-full border rounded-lg px-4 py-2 mb-4" />
      <button className="w-full bg-[#6A3CB1] text-white py-3 rounded-lg">Save Changes</button>
    </ModalWrapper>
  );
}
