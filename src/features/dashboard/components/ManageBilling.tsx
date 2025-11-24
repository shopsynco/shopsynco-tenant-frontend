import { useState, useEffect } from "react";
import { Plus, CreditCard, X, Eye, Edit, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import Header from "./dashboardHeader";
import { getCardDetails } from "../../../api/payment/paymentapi";
import {
  DeleteModal,
  EditCardModal,
  EditBankModal,
  EditUpiModal,
  ViewCardModal,
} from "./payment/EditPaymentMethod";
import AddPaymentMethodModal from "./payment/AddPaymentMethodModal";
import {
  AddBankModal,
  AddCardModal,
  AddUpiModal,
} from "./payment/PaymentModal";

// Card details type definition
interface CardDetails {
  card_brand: string;
  card_last4: string;
  exp_month: string;
  exp_year: string;
  card_holder_name: string;
}

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
  const [cardDetails, setCardDetails] = useState<CardDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch card details on component mount
  useEffect(() => {
    const fetchCardDetails = async () => {
      try {
        setLoading(true);
        const response = await getCardDetails();
        if (response.card_details && response.card_details.length > 0) {
          const card = response.card_details[0];
          setCardDetails({
            card_brand: card.card_brand || "",
            card_last4: card.card_last4 || "",
            exp_month: String(card.exp_month || "").padStart(2, "0"),
            exp_year: String(card.exp_year || ""),
            card_holder_name: card.card_holder_name || "",
          });
        } else {
          setCardDetails(null);
        }
      } catch (err) {
        console.error("Error fetching card details:", err);
        setCardDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCardDetails();
  }, []);

  // Handle modal closure
  const closeModal = () => setActiveModal(null);

  // Function to handle the delete action
  const handleDelete = async (type: string) => {
    const result = await Swal.fire({
      title: "Delete Payment Method",
      text: `Are you sure you want to delete this ${type} payment method?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it",
    });

    if (result.isConfirmed) {
      try {
        // Refresh card details after deletion
        await Swal.fire("Deleted!", `The ${type} payment method has been deleted.`, "success");
        
        // Refresh card details
        const response = await getCardDetails();
        if (response.card_details && response.card_details.length > 0) {
          const card = response.card_details[0];
          setCardDetails({
            card_brand: card.card_brand || "VISA",
            card_last4: card.card_last4 || "",
            exp_month: String(card.exp_month || "").padStart(2, "0"),
            exp_year: String(card.exp_year || ""),
            card_holder_name: card.card_holder_name || "",
          });
        } else {
          setCardDetails(null);
        }
        
        closeModal();
      } catch (error) {
        Swal.fire("Error", "Failed to delete payment method. Please try again.", "error");
      }
    }
  };

  // Function to handle edit actions
  const handleEdit = (type: string) => {
    // Open the appropriate edit modal
    if (type === "card") {
      setActiveModal("editCard");
    } else if (type === "bank") {
      setActiveModal("editBank");
    } else if (type === "upi") {
      setActiveModal("editUPI");
    }
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
                <p className="font-medium mt-3">{cardDetails?.card_holder_name || "N/A"}</p>
                <p className="text-xs mt-1 text-gray-500 leading-relaxed">
                  {/* Billing address will be fetched from API */}
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
          onPaymentMethodSelect={(method: PaymentModalType) => {
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
          cardDetails={cardDetails}
        />
      )}
      {activeModal === "deleteCard" && (
        <DeleteModal type="card" onClose={closeModal} />
      )}
    </div>
  );
}
