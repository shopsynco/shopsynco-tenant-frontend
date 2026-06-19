import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import Header from "../components/dashboardHeader";
import {
  fetchPlatformBill,
  type PlatformBill,
} from "../../../api/billing/platformBillingApi";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../../../api/payment/paymentapi";

const loadRazorpayScript = (): Promise<boolean> =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(!!window.Razorpay);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

const fmtDate = (iso: string | null | undefined) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const fmtMoney = (amount: string | number, currency = "INR") => {
  const n = Number(amount);
  const sym = currency === "INR" ? "₹" : currency + " ";
  return sym + (Number.isFinite(n) ? n.toLocaleString("en-IN") : amount);
};

const statusBadge = (status: string) => {
  const s = status.toLowerCase();
  if (s === "paid")
    return "bg-green-100 text-green-800 border-green-200";
  if (s === "overdue")
    return "bg-red-100 text-red-800 border-red-200";
  return "bg-amber-100 text-amber-800 border-amber-200";
};

export default function PlatformBillDetailPage() {
  const { billId } = useParams<{ billId: string }>();
  const navigate = useNavigate();
  const [bill, setBill] = useState<PlatformBill | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!billId) return;
    setLoading(true);
    fetchPlatformBill(billId)
      .then(setBill)
      .catch(() => setBill(null))
      .finally(() => setLoading(false));
  }, [billId]);

  const handlePay = async () => {
    if (!bill || bill.status === "paid") return;
    const total = Number(bill.total_amount);
    if (!Number.isFinite(total) || total <= 0) {
      Swal.fire("Error", "Invalid bill amount.", "error");
      return;
    }
    setPaying(true);
    try {
      const scriptOk = await loadRazorpayScript();
      if (!scriptOk || !window.Razorpay) {
        Swal.fire("Error", "Could not load Razorpay checkout.", "error");
        return;
      }
      const order = await createRazorpayOrder({
        subscription_id: "",
        platform_bill_id: bill.id,
        amount: total,
        currency: bill.currency || "INR",
        checkout_purpose: "platform_bill",
      });
      const Razorpay = window.Razorpay;
      const rzp = new Razorpay({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: "ShopSynco",
        description: `Bill ${bill.bill_number}`,
        prefill: order.prefill || {},
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await verifyRazorpayPayment({
              subscription_id: "",
              platform_bill_id: bill.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              checkout_purpose: "platform_bill",
              amount: order.amount,
            });
            await Swal.fire("Paid", "Your bill was paid successfully.", "success");
            const updated = await fetchPlatformBill(bill.id);
            setBill(updated);
          } catch (e: unknown) {
            const msg =
              (e as { response?: { data?: { error?: string } } })?.response?.data
                ?.error || "Payment verification failed.";
            Swal.fire("Error", msg, "error");
          }
        },
      });
      rzp.open();
    } catch (e: unknown) {
      const msg =
        (e as { response?: { data?: { error?: string } } })?.response?.data
          ?.error || "Could not start payment.";
      Swal.fire("Error", msg, "error");
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-3xl mx-auto px-6 py-16 text-gray-500">Loading bill…</div>
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-3xl mx-auto px-6 py-16">
          <p className="text-gray-600">Bill not found.</p>
          <button
            type="button"
            onClick={() => navigate("/manage-billing")}
            className="mt-4 text-[#7658A0] font-medium hover:underline"
          >
            Back to billing
          </button>
        </div>
      </div>
    );
  }

  const canPay = bill.status === "issued" || bill.status === "overdue";

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <button
          type="button"
          onClick={() => navigate("/manage-billing")}
          className="text-sm text-gray-500 hover:text-[#7658A0] mb-6"
        >
          ← Manage Billing
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-gray-100">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">Bill {bill.bill_number}</p>
                <h1 className="text-3xl font-semibold text-gray-900 mt-1">
                  {fmtMoney(bill.total_amount, bill.currency)}
                </h1>
                <p className="text-sm text-gray-500 mt-1">{bill.currency}</p>
              </div>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-sm font-medium border capitalize ${statusBadge(bill.status)}`}
              >
                {bill.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Issued {fmtDate(bill.issue_date)} · {bill.reason}
            </p>
            {bill.paid_at && (
              <p className="text-sm text-gray-600 mt-1">
                Paid on {fmtDate(bill.paid_at)}
                {bill.payment_method_label ? ` · ${bill.payment_method_label}` : ""}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Billing period: {fmtDate(bill.period_start)} – {fmtDate(bill.period_end)}
            </p>
          </div>

          <div className="p-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Details
            </h2>
            <div className="space-y-3">
              {bill.lines.map((line, i) => (
                <div
                  key={`${line.category}-${i}`}
                  className="flex justify-between text-sm text-gray-800 py-2 border-b border-gray-50"
                >
                  <span>{line.label}</span>
                  <span className="font-medium">{fmtMoney(line.amount, bill.currency)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-6 pt-4 border-t border-gray-200 font-semibold text-gray-900">
              <span>Total</span>
              <span>{fmtMoney(bill.total_amount, bill.currency)}</span>
            </div>
            {canPay && (
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  disabled={paying}
                  onClick={() => void handlePay()}
                  className="px-6 py-3 rounded-lg bg-[#7658A0] text-white font-medium hover:bg-[#5f4a8a] disabled:opacity-50"
                >
                  {paying ? "Opening checkout…" : "Pay now"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
