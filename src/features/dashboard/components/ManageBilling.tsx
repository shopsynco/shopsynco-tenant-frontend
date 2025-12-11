import { useState, useEffect } from "react";
import {
  Plus,
  CreditCard,
  Eye,
  Edit,
  Trash2,
  Clock,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
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
import { useNavigate } from "react-router-dom";
import { fetchInvoices } from "../../../api/mainapi/invoiceapi";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

/* Shape that comes from the API */
interface CardDetails {
  card_brand: string;
  card_last4: string;
  exp_month: number;
  exp_year: number;
  card_holder_name: string;
  billing_address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
}

/* Props expected by the ViewCardModal (strings only) */
interface ViewCardModalProps {
  card_brand: string;
  card_last4: string;
  exp_month: string;
  exp_year: string;
  card_holder_name: string;
  billing_address?: CardDetails["billing_address"];
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

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function ManageBillingPage() {
  const [activeModal, setActiveModal] = useState<PaymentModalType>(null);
  const [cardDetails, setCardDetails] = useState<CardDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<any[]>([]);
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatAmount = (n: number) => "₹" + n.toLocaleString("en-IN");
  useEffect(() => {
    fetchInvoices()
      .then((data) => {
        const list = Array.isArray(data)
          ? data
          : data.results || data.invoices || [];
        setInvoices(list);
      })
      .catch(() => setInvoices([]));
  }, []);
  /* ----------  fetch card details  ---------- */
  useEffect(() => {
    const fetchCardDetails = async () => {
      try {
        setLoading(true);
        const response = await getCardDetails();
        if (response.card_details?.length) {
          setCardDetails(response.card_details[0]);
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

  const closeModal = () => setActiveModal(null);

  /* ----------  delete handler  ---------- */
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

    if (!result.isConfirmed) return;

    try {
      await Swal.fire("Deleted!", `${type} removed.`, "success");
      const response = await getCardDetails();
      setCardDetails(response.card_details?.[0] ?? null);
      closeModal();
    } catch {
      Swal.fire("Error", "Failed to delete payment method.", "error");
    }
  };

  /* ----------  edit handler  ---------- */
  const handleEdit = (type: string) => {
    if (type === "card") setActiveModal("editCard");
    else if (type === "bank") setActiveModal("editBank");
    else if (type === "upi") setActiveModal("editUPI");
  };

  /* ----------  helpers  ---------- */
  const toViewModalShape = (
    src: CardDetails | null
  ): ViewCardModalProps | null => {
    if (!src) return null;
    return {
      ...src,
      exp_month: String(src.exp_month).padStart(2, "0"),
      exp_year: String(src.exp_year),
    };
  };

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-10">
        <p className="text-sm text-gray-500 mb-2">
          <span
            className="cursor-pointer hover:underline"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </span>
          <span className="mx-1">›</span>
          <span className="text-gray-700 font-medium">Manage Billing</span>
        </p>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">
            Manage Billing
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          {/* ------------  Left  ------------ */}
          <div className="space-y-8">
            {/* Billing period */}
            <div className="rounded-2xl bg-[#AE84EB26] p-6">
              <p className="text-base font-semibold text-black">
                Billing Period:{" "}
                <span className="font-semibold text-[#6A3CB1]">Yearly</span>
              </p>
              <div className="flex items-center gap-2 mt-2 text-black text-sm">
                <Clock size={15} />
                <span>Next Renewal: Aug 25, 2026</span>
              </div>
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl border border-[#8B6BB6] shadow-sm p-6 space-y-5">
              <h3 className="text-base font-semibold text-[#6A3CB1]">
                Payment Method
              </h3>

              {loading ? (
                <div>Loading card details...</div>
              ) : cardDetails ? (
                <>
                  <div className="flex items-center justify-between bg-[#F9F8FF] border border-[#8B6BB6] rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <CreditCard size={28} className="text-green-600" />
                      <p className="font-semibold text-gray-800">
                        {cardDetails.card_brand} **** {cardDetails.card_last4}
                      </p>
                    </div>
                    <div className="text-gray-800 font-semibold">
                      {cardDetails.card_holder_name}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setActiveModal("viewCard")}
                      >
                        <Eye size={20} />
                      </button>
                      <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setActiveModal("editCard")}
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setActiveModal("deleteCard")}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  {/* -------- billing address -------- */}
                  <div className="pt-2 text-sm text-gray-700 border-t border-gray-200">
                    <p className="font-medium mt-3">
                      {cardDetails.card_holder_name}
                    </p>
                    {cardDetails.billing_address ? (
                      <div className="text-xs mt-1 text-gray-500 leading-relaxed">
                        <p>{cardDetails.billing_address.line1}</p>
                        {cardDetails.billing_address.line2 && (
                          <p>{cardDetails.billing_address.line2}</p>
                        )}
                        <p>
                          {cardDetails.billing_address.city},{" "}
                          {cardDetails.billing_address.state}{" "}
                          {cardDetails.billing_address.postal_code}
                        </p>
                        <p>{cardDetails.billing_address.country}</p>
                      </div>
                    ) : (
                      <button className="text-[#6A3CB1] text-xs font-medium mt-2 hover:underline">
                        + Add Billing Address
                      </button>
                    )}
                    {cardDetails.billing_address && (
                      <button className="text-[#6A3CB1] text-xs font-medium mt-2 hover:underline">
                        Edit Billing Address
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div>No card details available</div>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setActiveModal("add")}
                  className="flex items-center gap-2 bg-[#6A3CB1] text-white text-sm px-5 py-2.5 rounded-lg hover:bg-[#5b32a2] transition"
                >
                  <Plus size={16} /> Add Payment Method
                </button>
              </div>
            </div>
          </div>

          {/* ------------  Right  ------------ */}
          <div className="space-y-6">
            <div className="bg-[#AE84EB1A] rounded-2xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-[#6A3CB1]">
                  Billing History
                </h3>
                <button
                  onClick={() => navigate("/invoice")}
                  className="bg-[#7658A0] text-sm font-medium text-white rounded-lg px-3 py-1.5 hover:opacity-90 transition"
                >
                  View All
                </button>
              </div>
              <p className="text-sm text-[#565756] mb-4">
                Recent invoices and payments
              </p>
              <div className="space-y-3 text-sm">
                {invoices.length === 0 ? (
                  <>
                    <div className="flex justify-between text-[#565756]">
                      <span className="font-medium">Aug 25, 2025</span>
                      <span className="font-medium">₹1,899</span>
                    </div>
                    <div className="flex justify-between text-[#565756]">
                      <span className="font-medium">Aug 25, 2024</span>
                      <span className="font-medium">₹1,899</span>
                    </div>
                  </>
                ) : (
                  invoices
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .slice(0, 2)
                    .map((inv) => (
                      <div
                        key={inv.id}
                        className="flex justify-between text-[#565756]"
                      >
                        <span className="font-medium">
                          {formatDate(inv.date)}
                        </span>
                        <span className="font-medium">
                          {formatAmount(inv.amount)}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-[#8B6BB6] bg-white p-6 text-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle size={24} className="text-[#6A3CB1]" />
                <h4 className="font-semibold text-gray-800">
                  Need help with billing?
                </h4>
              </div>
              <p className="text-sm text-gray-500 mb-3 leading-relaxed">
                Our support team is ready to assist you with any questions about
                your subscription.
              </p>
              <div className="flex justify-end">
                <button className="text-sm font-bold text-[#6A3CB1] hover:underline inline-flex items-center gap-1">
                  Contact Support <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================  MODALS  ===================== */}
      {activeModal === "add" && (
        <AddPaymentMethodModal
          onClose={closeModal}
          onPaymentMethodSelect={(method: PaymentModalType) =>
            setActiveModal(method)
          }
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
          cardDetails={toViewModalShape(cardDetails)}
        />
      )}
      {activeModal === "deleteCard" && (
        <DeleteModal type="card" onClose={closeModal} />
      )}
    </div>
  );
}
