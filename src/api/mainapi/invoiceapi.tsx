import axiosInstance from "../../store/refreshToken/tokenUtils";

type InvoiceDetail = {
  invoice_no?: string;
  date?: string;
  description?: string;
  payment_method?: string;
  amount?: number | string;
  currency?: string;
  plan?: string | null;
  gateway_transaction_id?: string | null;
  transaction_id?: string | null;
};

const triggerFileDownload = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
};

const normalizeInvoiceDetail = (payload: unknown): InvoiceDetail => {
  if (!payload || typeof payload !== "object") return {};
  const record = payload as Record<string, unknown>;
  if (record.data && typeof record.data === "object") {
    return record.data as InvoiceDetail;
  }
  return record as InvoiceDetail;
};

// Fetch invoices from the API
export const fetchInvoices = async () => {
  try {
    const response = await axiosInstance.get(`api/tenants/billing/invoices/`);
    return response.data;
  } catch {
    throw new Error("Failed to load invoices. Please try again.");
  }
};

export const fetchInvoicedetail = async (transaction_id: string) => {
  try {
    const response = await axiosInstance.get(
      `api/tenants/billing/invoices/${transaction_id}/`,
    );
    return response.data;
  } catch {
    throw new Error("Failed to load invoice detail. Please try again.");
  }
};

export const downloadInvoiceFile = async (invoiceRef: string | number) => {
  const transactionId = String(invoiceRef || "").trim();
  if (!transactionId) {
    throw new Error("Missing invoice identifier.");
  }

  try {
    const payload = await fetchInvoicedetail(transactionId);
    const detail = normalizeInvoiceDetail(payload);
    const invoiceNo = String(detail.invoice_no || `invoice-${transactionId}`).trim();
    const currency = String(detail.currency || "INR").toUpperCase();
    const amount = Number(detail.amount ?? 0);

    let formattedAmount = `${currency} ${amount.toFixed(2)}`;
    try {
      formattedAmount = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
      }).format(amount);
    } catch {
      /* keep fallback */
    }

    const lines = [
      "ShopSynco Invoice",
      "-----------------",
      `Invoice No: ${invoiceNo}`,
      `Date: ${detail.date || "—"}`,
      `Description: ${detail.description || "—"}`,
      `Payment Method: ${String(detail.payment_method || "—").replace(/_/g, " ")}`,
      `Amount: ${formattedAmount}`,
      detail.plan ? `Plan: ${detail.plan}` : null,
      detail.gateway_transaction_id
        ? `Gateway Transaction ID: ${detail.gateway_transaction_id}`
        : detail.transaction_id
          ? `Transaction ID: ${detail.transaction_id}`
          : null,
    ]
      .filter((line): line is string => Boolean(line))
      .join("\n");

    const blob = new Blob([lines], { type: "text/plain;charset=utf-8" });
    const safeName = invoiceNo.replace(/[^\w.-]+/g, "_");
    triggerFileDownload(blob, `${safeName}.txt`);
  } catch (error) {
    if (error instanceof Error && error.message) {
      throw error;
    }
    throw new Error("Failed to download invoice. Please try again.");
  }
};
