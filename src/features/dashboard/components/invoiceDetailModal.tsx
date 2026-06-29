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

const POPPINS = '"Poppins", sans-serif';

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
  description?: string | null,
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

function formatPaymentMethod(method?: string | null): string {
  const raw = String(method || "").trim();
  if (!raw) return "Credit Card";
  return raw.replace(/_/g, " ");
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
    [isOpen],
  );

  useEffect(() => {
    const id = "font-poppins-invoice-modal";
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);

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
  const tax = Math.round(subtotal * 0.1 * 100) / 100;
  const total = subtotal + tax;
  const currency = invoice?.currency ?? "INR";

  const metaTextClass =
    "text-[10px] leading-relaxed text-black lg:text-[14px] lg:leading-[22px]";
  const sectionLabelClass =
    "text-[10px] font-semibold text-[#757575] lg:text-[14px]";
  const descriptionHeadClass =
    "pb-2 pr-2 text-left text-[10px] font-semibold text-black lg:pb-3 lg:pr-6 lg:text-[12px]";
  const descriptionCellClass =
    "py-2 pr-2 text-left text-[10px] text-black lg:py-4 lg:pr-6 lg:text-[16px]";
  const numericColClass = "w-[72px] sm:w-[88px] lg:w-[140px]";
  const unitPriceHeadClass =
    "pb-2 px-2 text-center text-[10px] font-semibold text-black sm:px-3 lg:pb-3 lg:px-4 lg:text-right lg:text-[12px]";
  const unitPriceCellClass =
    "py-2 px-2 text-center text-[10px] tabular-nums text-black sm:px-3 lg:py-4 lg:px-4 lg:text-right lg:text-[16px]";
  const quantityHeadClass =
    "pb-2 px-2 text-center text-[10px] font-semibold text-black sm:px-3 lg:pb-3 lg:px-4 lg:text-[12px]";
  const quantityCellClass =
    "py-2 px-2 text-center text-[10px] tabular-nums text-black sm:px-3 lg:py-4 lg:px-4 lg:text-[16px]";
  const amountHeadClass =
    "pb-2 px-2 text-center text-[10px] font-semibold text-black sm:px-3 lg:pb-3 lg:px-4 lg:text-[12px]";
  const amountCellClass =
    "py-2 px-2 text-center text-[10px] tabular-nums text-black sm:px-3 lg:py-4 lg:px-4 lg:text-[16px]";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="relative w-full max-w-[900px] max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-xl"
        style={{ fontFamily: POPPINS }}
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

        <div className="p-4 sm:p-8 lg:px-12 lg:py-10">
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
                className="mt-4 text-[16px] font-bold uppercase tracking-wide text-black lg:mt-6 lg:text-[28px] lg:leading-tight"
              >
                Invoice
              </h2>

              <div className="mt-4 grid gap-8 lg:mt-10 lg:grid-cols-2 lg:gap-12">
                <div className="space-y-6">
                  <div className={`space-y-1.5 ${metaTextClass}`}>
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

                  <div className={`space-y-1.5 ${metaTextClass}`}>
                    <p className={sectionLabelClass}>Payment Information</p>
                    <p>{formatPaymentMethod(invoice.payment_method)}</p>
                    <p>
                      <span className="font-medium">Transaction ID:</span>{" "}
                      {invoice.transaction_id || "—"}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span> Paid
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-8 text-left lg:items-end lg:text-right">
                  <div className={metaTextClass}>
                    <p className={sectionLabelClass}>From</p>
                    <p>{COMPANY_FROM.name}</p>
                    <p>{COMPANY_FROM.street}</p>
                    <p>{COMPANY_FROM.city}</p>
                    <p>{COMPANY_FROM.email}</p>
                    <p>GSTIN / VAT ID: {COMPANY_FROM.taxId}</p>
                  </div>

                  <div className={metaTextClass}>
                    <p className={sectionLabelClass}>Billing to</p>
                    <p>{billingName}</p>
                    <p>{billingEmail}</p>
                    <p className="text-[#757575]">Tax ID: (if provided)</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-gray-200 pt-4 lg:mt-10 lg:pt-6">
                <table className="w-full table-fixed border-collapse">
                  <colgroup>
                    <col />
                    <col className={numericColClass} />
                    <col className={numericColClass} />
                    <col className={numericColClass} />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className={descriptionHeadClass}>Description</th>
                      <th className={unitPriceHeadClass}>
                        Unit Price ({currency})
                      </th>
                      <th className={quantityHeadClass}>Quantity</th>
                      <th className={amountHeadClass}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lineItems.map((item) => (
                      <tr
                        key={item.description}
                        className="border-b border-gray-100"
                      >
                        <td className={descriptionCellClass}>
                          {item.description}
                        </td>
                        <td className={unitPriceCellClass}>
                          {formatCurrency(item.unitPrice, currency)}
                        </td>
                        <td className={quantityCellClass}>{item.quantity}</td>
                        <td className={amountCellClass}>
                          {formatCurrency(
                            item.unitPrice * item.quantity,
                            currency,
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p className="mt-3 text-[8px] text-[#757575] lg:mt-4 lg:text-[12px]">
                  {featuresLabel(invoice.plan)}
                </p>

                <div className="mt-6 flex justify-end lg:mt-8">
                  <div className="w-full max-w-[280px] space-y-2 text-[10px] text-black lg:text-[14px]">
                    <div className="flex justify-between gap-4">
                      <span>Subtotal:</span>
                      <span className="tabular-nums">
                        {formatCurrency(subtotal, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Tax (10% VAT):</span>
                      <span className="tabular-nums">
                        {formatCurrency(tax, currency)}
                      </span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between gap-4 text-[12px] font-bold lg:text-[18px]">
                        <span>Total:</span>
                        <span className="tabular-nums">
                          {formatCurrency(total, currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <footer className="mt-8 border-t border-gray-100 pt-4 text-center text-[8px] leading-relaxed text-[#9CA3AF] lg:mt-12 lg:pt-6 lg:text-[12px]">
                <p>Thank you for choosing Shop Synco.</p>
                <p>For support, contact us at {COMPANY_FROM.email}</p>
              </footer>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
