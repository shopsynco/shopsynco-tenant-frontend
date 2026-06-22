import { useState, useEffect } from "react";
import { Eye, Download, ArrowRight, HelpCircle } from "lucide-react";
import Header from "../components/dashboardHeader";

import InvoiceDetailModal from "../components/invoiceDetailModal";
import { fetchInvoices, downloadInvoiceFile } from "../../../api/mainapi/invoiceapi";
import { useNavigate } from "react-router-dom";
import { showError } from "../../../components/swalHelper";
import PlatformSupportChatModal from "../components/PlatformSupportChatModal";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null); // Track selected invoice
  const [isModalOpen, setIsModalOpen] = useState(false); // Track modal visibility
  const [supportTopic, setSupportTopic] = useState<string | null>(null);
  const navigate = useNavigate();
  // Fetch invoices from the API
  useEffect(() => {
    const getInvoices = async () => {
      try {
        const data = await fetchInvoices();
        // If the array is wrapped in an object, extract it:
        const list = Array.isArray(data)
          ? data
          : data.results || data.invoices || [];
        setInvoices(list);
      } catch (error) {
        console.error(error);
        showError("Load Failed", "Failed to load invoices. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    getInvoices();
  }, []);

  // Open invoice detail modal
  const openInvoiceDetail = (transactionId: string) => {
    const invoice = invoices.find(
      (inv: any) => inv.transaction_id === transactionId,
    );
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const formatAmount = (inv: any) => {
    const amount = Number(inv.amount ?? 0);
    const currency = String(inv.currency || "INR").toUpperCase();
    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
      }).format(amount);
    } catch {
      return `${currency} ${amount.toFixed(2)}`;
    }
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInvoice(null);
  };

  const handleDownloadInvoice = async (inv: {
    transaction_id?: string | number;
    invoice_no?: string;
  }) => {
    try {
      const ref = inv.transaction_id ?? inv.invoice_no ?? "";
      if (!ref) throw new Error("Missing invoice identifier.");
      await downloadInvoiceFile(ref);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to download invoice. Please try again.";
      showError("Error", message);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <p className="text-sm text-gray-500 mb-2">
          <span
            className="cursor-pointer hover:underline"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </span>{" "}
          <span className="mx-1">›</span> View Invoices
        </p>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">
            Invoices are automatically emailed to your registered address.
          </p>
        </div>

        {/* Mobile invoice cards */}
        <div className="md:hidden space-y-3">
          {loading ? (
            <p className="text-center py-6 text-gray-500">Loading invoices...</p>
          ) : invoices.length === 0 ? (
            <p className="text-center py-6 text-gray-500">No invoices yet.</p>
          ) : (
            invoices.map((inv: any) => (
              <div
                key={inv.transaction_id || inv.invoice_no}
                className="rounded-xl border border-[#6A3CB1] bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{inv.invoice_no}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{inv.date}</p>
                  </div>
                  <p className="font-semibold text-gray-900 shrink-0">{formatAmount(inv)}</p>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{inv.description}</p>
                <p className="text-xs text-gray-500 capitalize mb-3">
                  {String(inv.payment_method || "—").replace(/_/g, " ")}
                </p>
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    className="text-gray-500 hover:text-[#6A3CB1]"
                    onClick={() => openInvoiceDetail(inv.transaction_id)}
                    aria-label="View invoice"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    type="button"
                    className="text-gray-500 hover:text-[#6A3CB1]"
                    onClick={() => void handleDownloadInvoice(inv)}
                    aria-label="Download invoice"
                  >
                    <Download size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop invoices table */}
        <div className="hidden md:block bg-white border border-[#6A3CB1] rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm text-gray-700">
            <thead className=" text-[#6A3CB1]  border-[#D8CFFC] text-sm font-semibold">
              <tr>
                <th className="py-4 px-6">Invoice No.</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6">Payment Method</th>
                <th className="py-4 px-6 text-right">Amount</th>
                <th className="py-4 px-6"></th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-4">
                    Loading invoices...
                  </td>
                </tr>
              ) : (
                invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-gray-500">
                      No invoices yet.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv: any) => (
                  <tr
                    key={inv.transaction_id || inv.invoice_no}
                    className="border-t border-[#E9E4FB] hover:bg-[#FAF8FF] transition"
                  >
                    <td className="py-4 px-6 font-medium">{inv.invoice_no}</td>
                    <td className="py-4 px-6">{inv.date}</td>
                    <td className="py-4 px-6 truncate max-w-[180px]">
                      {inv.description}
                    </td>
                    <td className="py-4 px-6 capitalize">
                      {String(inv.payment_method || "—").replace(/_/g, " ")}
                    </td>
                    <td className="py-4 px-6 text-right font-semibold text-gray-900">
                      {formatAmount(inv)}
                    </td>
                    <td className="py-4 px-6 text-right flex items-center justify-end gap-3">
                      <button
                        className="text-gray-500 hover:text-[#6A3CB1]"
                        onClick={() => openInvoiceDetail(inv.transaction_id)}
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        type="button"
                        className="text-gray-500 hover:text-[#6A3CB1]"
                        onClick={() => void handleDownloadInvoice(inv)}
                        aria-label="Download invoice"
                      >
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )
              )}
            </tbody>
          </table>
        </div>

        {/* Help Box */}
        <div className="mt-8 rounded-2xl border border-[#8B6BB6] bg-white p-6 text-gray-700 w-full max-w-[445px]">
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
            <button
              type="button"
              onClick={() => setSupportTopic("Invoices")}
              className="text-sm font-bold text-[#6A3CB1] hover:underline inline-flex items-center gap-1"
            >
              Contact Support <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {isModalOpen && selectedInvoice && (
        <InvoiceDetailModal invoice={selectedInvoice} closeModal={closeModal} />
      )}
      <PlatformSupportChatModal
        open={supportTopic !== null}
        onClose={() => setSupportTopic(null)}
        topicLabel={supportTopic ?? ""}
      />
    </div>
  );
}
