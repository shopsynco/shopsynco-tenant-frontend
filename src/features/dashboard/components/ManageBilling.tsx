import { useState, useEffect } from "react";
import { Plus, CreditCard, X, Eye, Edit, Trash2 } from "lucide-react";
import Header from "./dashboardHeader"; // Assuming this is your header component
import {
  DeleteModal,
  EditCardModal,
  EditBankModal,
  EditUpiModal,
  ModalWrapper,
  ViewCardModal,
} from "./payment/EditPaymentMethod";
import AddPaymentMethodModal from "./payment/AddPaymentMethodModal";
import {
  AddBankModal,
  AddCardModal,
  AddUpiModal,
} from "./payment/PaymentModal";
import { getCardDetails } from "../../../api/payment/paymentapi"; // Correct API import

// Fake card data (for testing purposes)
const fakeCardDetails = {
  card_brand: "VISA",
  card_last4: "4526",
  exp_month: "09",
  exp_year: "2026",
  card_holder_name: "Manoj Boskar",
};

type PaymentModalType =
  | "add"
  | "editCard"
  | "editBank"
  | "editUPI"
  | "addCard"
  | "addBank"
  | "addUpi"
  | "viewCard"
  | "viewBank"
  | "viewUpi"
  | "deleteCard"
  | "deleteBank"
  | "deleteUpi"
  | null;

export default function ManageBillingPage() {
  const [activeModal, setActiveModal] = useState<PaymentModalType>(null);
  const [cardDetails, setCardDetails] = useState<any | null>(fakeCardDetails); // Set fake card details
  const [loading, setLoading] = useState<boolean>(false); // Set loading to false for mock data

  // Handle modal closure
  const closeModal = () => setActiveModal(null);

  // Function to handle the delete action
  const handleDelete = (type: string) => {
    // Handle the deletion based on the type (card, bank, or UPI)
    alert(`Delete ${type} payment method`);
    // Add your delete logic here (e.g., API call)
    closeModal();
  };

  // Function to handle edit actions
  const handleEdit = (type: string) => {
    // Handle the edit action (edit card, bank or UPI)
    alert(`Edit ${type} payment method`);
    // Add your edit logic here (e.g., API call)
    closeModal();
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <p className="text-sm text-gray-500 mb-2">
          Dashboard <span className="mx-1">›</span> Manage Billing
        </p>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">
            Manage Billing
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          {/* Left section */}
          <div className="space-y-8">
            {/* Billing period */}
            <div className="rounded-2xl border border-[#E5E0FA] bg-[#F6F3FF] p-6">
              <p className="text-base font-semibold text-[#6A3CB1]">
                Billing Period:{" "}
                <span className="font-medium text-[#6A3CB1]">Yearly</span>
              </p>
              <div className="flex items-center gap-2 mt-2 text-gray-600 text-sm">
                <X size={15} className="text-[#6A3CB1]" />
                <span>Next Renewal: Aug 25, 2026</span>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl border border-[#E8E4F7] shadow-sm p-6 space-y-5">
              <h3 className="text-base font-semibold text-[#6A3CB1]">
                Payment Method
              </h3>

              {loading ? (
                <div>Loading card details...</div>
              ) : cardDetails ? (
                <div className="flex items-center justify-between bg-[#F9F8FF] border border-[#E9E4FB] rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    {/* Card Type and Last 4 Digits */}
                    <div className="flex gap-2 items-center">
                      <CreditCard size={28} className="text-green-600" />
                      <p className="font-semibold text-gray-800">
                        {cardDetails.card_brand} **** {cardDetails.card_last4}
                      </p>
                    </div>
                  </div>

                  {/* Cardholder's Name */}
                  <div className="text-gray-800 font-semibold">
                    {cardDetails.card_holder_name}
                  </div>

                  {/* Action Icons */}
                  <div className="flex items-center gap-3">
                    {/* View Card Button */}
                    <button
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => setActiveModal("viewCard")}
                    >
                      <Eye size={20} />
                    </button>

                    {/* Edit Card Button */}
                    <button
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => setActiveModal("editCard")}
                    >
                      <Edit size={20} />
                    </button>

                    {/* Delete Card Button */}
                    <button
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => setActiveModal("deleteCard")}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <div>No card details available</div>
              )}

              <div className="pt-2 text-sm text-gray-700 border-t border-gray-200">
                <p className="font-medium mt-3">Manoj Boskar</p>
                <p className="text-xs mt-1 text-gray-500 leading-relaxed">
                  Gandhi Nagar road, Kadavanthra, Kochi, Kerala 682020
                </p>
                <button className="text-[#6A3CB1] text-xs font-medium mt-2 hover:underline">
                  Edit Billing Address
                </button>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setActiveModal("add")} // Open "Add Payment Method" modal
                  className="flex items-center gap-2 bg-[#6A3CB1] text-white text-sm px-5 py-2.5 rounded-lg hover:bg-[#5b32a2] transition"
                >
                  <Plus size={16} /> Add Payment Method
                </button>
              </div>
            </div>
          </div>

          {/* Right section - billing history */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#E8E4F7] shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-[#6A3CB1]">
                  Billing History
                </h3>
                <button className="text-sm font-medium text-[#6A3CB1] hover:underline">
                  View All
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>Aug 25, 2025</span>
                  <span>₹1899</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Aug 25, 2024</span>
                  <span>₹1899</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#E8E4F7] bg-white p-6 text-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[#6A3CB1] text-lg">❓</span>
                <h4 className="font-semibold text-gray-800">
                  Need help with billing?
                </h4>
              </div>
              <p className="text-sm text-gray-500 mb-3 leading-relaxed">
                Our support team is ready to assist you with any questions about
                your subscription.
              </p>
              <button className="text-sm font-medium text-[#6A3CB1] hover:underline">
                Contact Support →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🧩 Modal Renderer */}
      {activeModal === "add" && (
        <AddPaymentMethodModal
          onClose={closeModal}
          onPaymentMethodSelect={(method) => {
            setActiveModal(method); // Handle the modal for add/edit
          }}
        />
      )}
      {activeModal === "addCard" && <AddCardModal onClose={closeModal} />}
      {activeModal === "addBank" && <AddBankModal onClose={closeModal} />}
      {activeModal === "addUpi" && <AddUpiModal onClose={closeModal} />}
      {activeModal === "editCard" && <EditCardModal onClose={closeModal} />}
      {activeModal === "editBank" && <EditBankModal onClose={closeModal} />}
      {activeModal === "editUPI" && <EditUpiModal onClose={closeModal} />}
      {activeModal === "viewCard" && (
        <ViewCardModal
          onClose={closeModal}
          onEditCard={() => handleEdit("card")}
          onDeleteCard={() => handleDelete("card")}
        />
      )}
      {activeModal === "deleteCard" && (
        <DeleteModal type="card" onClose={closeModal} />
      )}
    </div>
  );
}
