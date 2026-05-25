import { downloadInvoiceFile } from "../../../api/mainapi/invoiceapi";
import { showError } from "../../../components/swalHelper";

interface Invoice {
  invoice_no?: string;
  transaction_id?: string | number;
  date: string;
  description: string;
  payment_method?: string;
  amount: string | number;
  currency?: string;
}

interface InvoiceDetailModalProps {
  invoice: Invoice;
  closeModal: () => void;
}

const InvoiceDetailModal = ({
  invoice,
  closeModal,
}: InvoiceDetailModalProps) => {
  const downloadInvoice = async () => {
    try {
      const ref = invoice.transaction_id ?? invoice.invoice_no ?? "";
      if (!ref) throw new Error("Missing invoice identifier.");
      await downloadInvoiceFile(ref);
    } catch (err: any) {
      showError("Error", err.message || "Failed to download invoice.");
    }
  };

  const amount = Number(invoice.amount ?? 0);
  const currency = String(invoice.currency || "INR").toUpperCase();
  let formattedAmount = `${currency} ${amount.toFixed(2)}`;
  try {
    formattedAmount = new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    /* fall back to plain string */
  }
  const paymentMethodLabel = String(invoice.payment_method || "—").replace(
    /_/g,
    " ",
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-xl w-[480px] p-8 relative shadow-xl">
        <button
          onClick={closeModal}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          X
        </button>

        <h2 className="text-xl font-semibold mb-4 text-[#4A5C74]">
          Invoice Details
        </h2>

        <div className="space-y-3">
          <p>
            <strong>Invoice No:</strong> {invoice.invoice_no}
          </p>
          <p>
            <strong>Date:</strong> {invoice.date}
          </p>
          <p>
            <strong>Description:</strong> {invoice.description}
          </p>
          <p className="capitalize">
            <strong className="not-italic">Payment Method:</strong>{" "}
            {paymentMethodLabel}
          </p>
          <p>
            <strong>Amount:</strong> {formattedAmount}
          </p>
        </div>

        <button
          onClick={downloadInvoice}
          className="mt-4 w-full bg-[#6A3CB1] text-white py-3 rounded-lg"
        >
          Download Invoice
        </button>
      </div>
    </div>
  );
};

export default InvoiceDetailModal;
