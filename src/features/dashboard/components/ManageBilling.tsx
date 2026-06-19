import { useState, useEffect } from "react";
import { Clock, HelpCircle, ArrowRight, FileText } from "lucide-react";
import Swal from "sweetalert2";
import Header from "./dashboardHeader";
import { useNavigate } from "react-router-dom";
import { fetchTenantDashboard } from "../../../api/mainapi/statusapi";
import { ensureTenantStoreSlugForApi } from "../../../utils/tenantStoreSlug";
import PlatformSupportChatModal from "./PlatformSupportChatModal";
import {
  fetchPlatformBills,
  fetchBillingSummary,
  type PlatformBill,
  type BillingSummary,
} from "../../../api/billing/platformBillingApi";

const formatDate = (d: string | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatAmount = (amount: string | number, currency = "INR") => {
  const n = Number(amount);
  const sym = currency === "INR" ? "₹" : `${currency} `;
  return sym + (Number.isFinite(n) ? n.toLocaleString("en-IN") : amount);
};

const statusClass = (status: string) => {
  const s = status.toLowerCase();
  if (s === "paid") return "text-green-700 bg-green-50 border-green-200";
  if (s === "overdue") return "text-red-700 bg-red-50 border-red-200";
  return "text-amber-700 bg-amber-50 border-amber-200";
};

export default function ManageBillingPage() {
  const navigate = useNavigate();
  const [supportTopic, setSupportTopic] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<string>("—");
  const [nextRenewalDate, setNextRenewalDate] = useState<string>("—");
  const [billingLoading, setBillingLoading] = useState(true);
  const [bills, setBills] = useState<PlatformBill[]>([]);
  const [summary, setSummary] = useState<BillingSummary | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setBillingLoading(true);
      try {
        await ensureTenantStoreSlugForApi();
        const [tenant, billList, billSummary] = await Promise.all([
          fetchTenantDashboard(),
          fetchPlatformBills().catch(() => []),
          fetchBillingSummary().catch(() => null),
        ]);
        if (cancelled) return;

        const data = tenant?.dashboard || {};
        const accountSummary = data?.account_summary || {};
        const nextRen = accountSummary?.next_renewal;
        const planRenewalDate = String(data?.current_plan?.renewal_date || "").trim();
        const renewalCycle = String(data?.current_plan?.renewal_cycle || "").trim();

        setBillingPeriod(renewalCycle || "Monthly");
        setNextRenewalDate(
          billSummary?.next_unified_bill_at
            ? formatDate(billSummary.next_unified_bill_at)
            : nextRen?.date
              ? String(nextRen.date)
              : planRenewalDate || "—",
        );
        setBills(billList);
        setSummary(billSummary);
      } catch (err) {
        console.error("Failed to load billing:", err);
      } finally {
        if (!cancelled) setBillingLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const outstanding = bills.filter(
    (b) => b.status === "issued" || b.status === "overdue",
  );

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
        <h1 className="text-3xl font-semibold text-gray-900 mb-8">Manage Billing</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[#AE84EB26] p-6">
                <p className="text-sm text-gray-600">Next unified bill</p>
                <p className="text-lg font-semibold text-[#6A3CB1] mt-1">
                  {billingLoading ? "…" : nextRenewalDate}
                </p>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <Clock size={14} />
                  <span>Plan: {billingPeriod}</span>
                </div>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <p className="text-sm text-gray-600">Accrued fees (unbilled)</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {billingLoading
                    ? "…"
                    : formatAmount(summary?.estimated_transaction_fees || "0")}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Rolled into your next Shopify-style bill
                </p>
              </div>
            </div>

            {/* Outstanding */}
            {outstanding.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6">
                <h3 className="font-semibold text-amber-900 mb-2">Payment due</h3>
                <p className="text-sm text-amber-800 mb-4">
                  {outstanding.length} bill(s) ·{" "}
                  {formatAmount(summary?.outstanding_total || "0")}
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/billing/bill/${outstanding[0].id}`)}
                  className="text-sm font-semibold text-[#7658A0] hover:underline"
                >
                  Pay now →
                </button>
              </div>
            )}

            {/* Bills list — Shopify style */}
            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                <FileText size={18} className="text-[#6A3CB1]" />
                <h3 className="font-semibold text-gray-900">Bills</h3>
              </div>
              {billingLoading ? (
                <p className="p-6 text-sm text-gray-500">Loading bills…</p>
              ) : bills.length === 0 ? (
                <p className="p-6 text-sm text-gray-500">
                  No bills yet. After your first paid month, unified bills appear here
                  every 30 days (subscription + transaction fees + apps).
                </p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {bills.map((bill) => (
                    <li key={bill.id}>
                      <button
                        type="button"
                        onClick={() => navigate(`/billing/bill/${bill.id}`)}
                        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 text-left transition"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {bill.bill_number}
                          </p>
                          <p className="text-sm text-gray-500 mt-0.5">
                            {formatDate(bill.issue_date)} ·{" "}
                            {formatDate(bill.period_start)} –{" "}
                            {formatDate(bill.period_end)}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span
                            className={`text-xs px-2 py-1 rounded-full border capitalize ${statusClass(bill.status)}`}
                          >
                            {bill.status}
                          </span>
                          <span className="font-semibold text-gray-900">
                            {formatAmount(bill.total_amount, bill.currency)}
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-[#8B6BB6] bg-white p-6 text-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle size={24} className="text-[#6A3CB1]" />
                <h4 className="font-semibold text-gray-800">How billing works</h4>
              </div>
              <ul className="text-sm text-gray-600 space-y-2 leading-relaxed list-disc pl-4">
                <li>Month 1 plan is paid at checkout after your free trial.</li>
                <li>
                  Every 30 days you receive one bill: subscription, transaction
                  fees, and Feature Store apps.
                </li>
                <li>Pay once from the bill detail page.</li>
              </ul>
              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setSupportTopic("Manage billing")}
                  className="text-sm font-bold text-[#6A3CB1] hover:underline inline-flex items-center gap-1"
                >
                  Contact Support <ArrowRight size={14} />
                </button>
              </div>
            </div>

            <div className="bg-[#AE84EB1A] rounded-2xl p-6">
              <h3 className="font-semibold text-[#6A3CB1] mb-2">Plan receipts</h3>
              <p className="text-sm text-[#565756] mb-3">
                Separate receipts from your first plan checkout
              </p>
              <button
                type="button"
                onClick={() => navigate("/invoice")}
                className="text-sm font-medium text-[#7658A0] hover:underline"
              >
                View plan payment history →
              </button>
            </div>
          </div>
        </div>
      </div>

      <PlatformSupportChatModal
        open={supportTopic !== null}
        onClose={() => setSupportTopic(null)}
        topicLabel={supportTopic ?? ""}
      />
    </div>
  );
}
