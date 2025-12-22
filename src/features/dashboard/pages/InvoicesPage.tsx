import { useState, useEffect } from "react";
import { Eye, Download, ArrowRight, HelpCircle } from "lucide-react";
import Header from "../components/dashboardHeader";

import InvoiceDetailModal from "../components/invoiceDetailModal";
import { fetchInvoices } from "../../../api/mainapi/invoiceapi";
import { useNavigate } from "react-router-dom";
import { showError } from "../../../components/swalHelper";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null); // Track selected invoice
  const [isModalOpen, setIsModalOpen] = useState(false); // Track modal visibility
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
  const openInvoiceDetail = (invoiceId: string) => {
    const invoice = invoices.find((inv: any) => inv.id === invoiceId);
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedInvoice(null);
  };

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
          </span>{" "}
          <span className="mx-1">›</span> View Invoices
        </p>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">
            Invoices are automatically emailed to your registered address.
          </p>
        </div>

        {/* Invoices Table */}
        <div className="bg-white border border-[#6A3CB1] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-gray-700">
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
                invoices.map((inv: any) => (
                  <tr
                    key={inv.id}
                    className="border-t border-[#E9E4FB] hover:bg-[#FAF8FF] transition"
                  >
                    <td className="py-4 px-6 font-medium">{inv.id}</td>
                    <td className="py-4 px-6">{inv.date}</td>
                    <td className="py-4 px-6 truncate max-w-[180px]">
                      {inv.description}
                    </td>
                    <td className="py-4 px-6">{inv.paymentMethod}</td>
                    <td className="py-4 px-6 text-right font-semibold text-gray-900">
                      {inv.amount}
                    </td>
                    <td className="py-4 px-6 text-right flex items-center justify-end gap-3">
                      <button
                        className="text-gray-500 hover:text-[#6A3CB1]"
                        onClick={() => openInvoiceDetail(inv.id)}
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        className="text-gray-500 hover:text-[#6A3CB1]"
                        // onClick={() =>
                        //   window.open(
                        //     `${BASE_URL}/api/tenant/pqrs_company/billing/invoices/${inv.id}/download`,
                        //     "_blank"
                        // //   )
                        // }
                      >
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Help Box */}
        <div
          className="rounded-2xl border border-[#8B6BB6] bg-white p-6 text-gray-700 w-full max-w-[445px]"
          style={{
            height: 184,
            marginTop: 79, // pushes it to 790 px from top
            marginLeft: 45,
            opacity: 1,
          }}
        >
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

      {/* Invoice Detail Modal */}
      {isModalOpen && selectedInvoice && (
        <InvoiceDetailModal invoice={selectedInvoice} closeModal={closeModal} />
      )}
    </div>
  );
}
