import { useEffect, useMemo, useState } from "react";
import logo from "../../../assets/Name-Logo.png";
import { fetchUserProfile } from "../../../api/auth/authapi";
import {
  fetchInvoicedetail,
  type InvoiceDetail,
} from "../../../api/mainapi/invoiceapi";

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionId: string | null;
}

const COMPANY_FROM = {
  name: "Shop Synco. Pvt.",
  street: "123 Business Street",
  city: "Tech City, Kerala",
  email: "hotelsynco@gmail.com",
  taxId: "XX1234567",
};

function parseInvoiceDate(dateStr: string): Date | null {
  const parsed = new Date(dateStr);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function billingPeriodLabel(
  dateStr?: string | null,
  description?: string | null
): string {
  if (!dateStr) return "—";
  const start = parseInvoiceDate(dateStr);
  if (!start) return dateStr;

  const end = new Date(start);
  const yearly = /year/i.test(description ?? "");
  if (yearly) {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }
  end.setDate(end.getDate() - 1);

  return `${formatDisplayDate(start)} – ${formatDisplayDate(end)}`;
}

function formatCurrency(amount: number, currency = "INR"): string {
  const symbol = currency === "INR" ? "₹" : currency;
  const formatted = amount.toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${symbol} ${formatted}`;
}

function lineItemsFromInvoice(invoice: InvoiceDetail) {
  const period = /year/i.test(invoice.description ?? "") ? "Yearly" : "Monthly";
  const total = Number(invoice.amount) || 0;
  const descriptions = [
    `Transaction fees - ${period}`,
    `Subscription fees - ${period}`,
    `Feature fees - ${period}`,
  ];
  const perLine = Math.floor((total / 3) * 100) / 100;
  return descriptions.map((description, index) => ({
    description,
    unitPrice:
      index < descriptions.length - 1
        ? perLine
        : Math.round((total - perLine * (descriptions.length - 1)) * 100) / 100,
    quantity: 1,
  }));
}

function featuresLabel(plan?: string | null): string {
  if (plan?.trim()) {
    return `Features included: ${plan}`;
  }
  return "Features included: 5 users, 50GB storage, priority support";
}

export default function InvoiceDetailModal({
  isOpen,
  onClose,
  transactionId,
}: InvoiceDetailModalProps) {
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [billingName, setBillingName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const siteId = useMemo(
    () => localStorage.getItem("store_slug")?.trim() || "—",
    [isOpen]
  );

  useEffect(() => {
    if (!isOpen || !transactionId) {
      setInvoice(null);
      setError(null);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [detail, profile] = await Promise.all([
          fetchInvoicedetail(transactionId),
          fetchUserProfile(),
        ]);
        if (cancelled) return;

        setInvoice(detail);
        const user = profile?.user;
        const name =
          user?.full_name?.trim() ||
          [user?.first_name, user?.last_name].filter(Boolean).join(" ").trim();
        setBillingName(name || "—");
        setBillingEmail(user?.email?.trim() || "—");
      } catch {
        if (!cancelled) {
          setError("Unable to load invoice details. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [isOpen, transactionId]);

  if (!isOpen) return null;

  const lineItems = invoice ? lineItemsFromInvoice(invoice) : [];
  const subtotal = Number(invoice?.amount) || 0;
  const tax = 0;
  const total = subtotal + tax;
  const currency = invoice?.currency ?? "INR";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-[900px] max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="invoice-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
          aria-label="Close invoice"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-4 sm:p-8 lg:p-10">
          {loading && (
            <p className="py-16 text-center text-sm text-gray-500">
              Loading invoice…
            </p>
          )}

          {error && !loading && (
            <p className="py-16 text-center text-sm text-red-600">{error}</p>
          )}

          {invoice && !loading && (
            <>
              <img
                src={logo}
                alt="ShopSynco"
                className="h-[34px] w-auto lg:h-12"
              />

              <h2
                id="invoice-modal-title"
                className="mt-4 text-[16px] font-bold uppercase tracking-wide text-black lg:mt-6 lg:text-[28px]"
              >
                Invoice
              </h2>

              <div className="mt-4 grid gap-6 lg:mt-8 lg:grid-cols-2 lg:gap-10">
                <div className="space-y-4 text-[10px] leading-relaxed text-black lg:text-[14px]">
                  <div className="space-y-1">
                    <p>
                      <span className="font-medium">Invoice ID:</span>{" "}
                      {invoice.gateway_transaction_id ||
                        invoice.transaction_id ||
                        "—"}
                    </p>
                    <p>
                      <span className="font-medium">Invoice No:</span>{" "}
                      {invoice.invoice_no}
                    </p>
                    <p>
                      <span className="font-medium">Date of Issue:</span>{" "}
                      {invoice.date}
                    </p>
                    <p>
                      <span className="font-medium">Billing Period:</span>{" "}
                      {billingPeriodLabel(invoice.date, invoice.description)}
                    </p>
                    <p>
                      <span className="font-medium">Site ID:</span> {siteId}
                    </p>
                  </div>

                  <div className="space-y-1 pt-2">
                    <p className="text-[10px] font-semibold text-gray-600 lg:text-[14px]">
                      Payment Information
                    </p>
                    <p>{invoice.payment_method || "Card"}</p>
                    <p>
                      <span className="font-medium">Transaction ID:</span>{" "}
                      {invoice.transaction_id || "—"}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span> Paid
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-[10px] leading-relaxed text-black lg:grid-cols-1 lg:gap-6 lg:text-right lg:text-[14px]">
                  <div>
                    <p className="font-semibold text-gray-600">From:</p>
                    <p>{COMPANY_FROM.name}</p>
                    <p>{COMPANY_FROM.street}</p>
                    <p>{COMPANY_FROM.city}</p>
                    <p>{COMPANY_FROM.email}</p>
                    <p>GSTIN / VAT ID: {COMPANY_FROM.taxId}</p>
                  </div>

                  <div>
                    <p className="font-semibold text-gray-600">Billing to:</p>
                    <p>{billingName}</p>
                    <p>{billingEmail}</p>
                    <p className="text-gray-600">Tax ID: (if provided)</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-4 lg:mt-10 lg:pt-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="pb-2 pr-2 text-[10px] font-semibold text-black lg:pb-3 lg:pr-4 lg:text-[12px]">
                        Description
                      </th>
                      <th className="pb-2 pr-2 text-right text-[10px] font-semibold text-black lg:pb-3 lg:pr-4 lg:text-[12px]">
                        Unit Price ({currency})
                      </th>
                      <th className="pb-2 pr-2 text-center text-[10px] font-semibold text-black lg:pb-3 lg:pr-4 lg:text-[12px]">
                        Quantity
                      </th>
                      <th className="pb-2 text-right text-[10px] font-semibold text-black lg:pb-3 lg:text-[12px]">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item) => (
                      <tr
                        key={item.description}
                        className="border-b border-gray-100"
                      >
                        <td className="py-2 pr-2 text-[10px] text-black lg:py-4 lg:pr-4 lg:text-[16px]">
                          {item.description}
                        </td>
                        <td className="py-2 pr-2 text-right text-[10px] text-black lg:py-4 lg:pr-4 lg:text-[16px]">
                          {formatCurrency(item.unitPrice, currency)}
                        </td>
                        <td className="py-2 pr-2 text-center text-[10px] text-black lg:py-4 lg:pr-4 lg:text-[16px]">
                          {item.quantity}
                        </td>
                        <td className="py-2 text-right text-[10px] text-black lg:py-4 lg:text-[16px]">
                          {formatCurrency(
                            item.unitPrice * item.quantity,
                            currency
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p className="mt-3 text-[8px] text-black/60 lg:mt-4 lg:text-[12px]">
                  {featuresLabel(invoice.plan)}
                </p>

                <div className="mt-6 flex justify-end lg:mt-8">
                  <div className="w-full max-w-xs space-y-2 text-[10px] text-black lg:text-[14px]">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(subtotal, currency)}</span>
                    </div>
                    {tax > 0 && (
                      <div className="flex justify-between">
                        <span>Tax (10% VAT):</span>
                        <span>{formatCurrency(tax, currency)}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between text-[12px] font-bold lg:text-[18px]">
                        <span>Total:</span>
                        <span>{formatCurrency(total, currency)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <footer className="mt-8 border-t border-gray-100 pt-4 text-center text-[8px] leading-relaxed text-gray-400 lg:mt-12 lg:pt-6 lg:text-[12px]">
                <p>Thank you for choosing Your SaaS Company.</p>
                <p>For support, contact us at support@yourcompany.com</p>
              </footer>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
