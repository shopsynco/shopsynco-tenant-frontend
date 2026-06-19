import axiosInstance from "../../store/refreshToken/tokenUtils";
import { ensureTenantStoreSlugForApi } from "../../utils/tenantStoreSlug";

export interface PlatformBillLine {
  category: string;
  label: string;
  amount: string;
}

export interface PlatformBill {
  id: string;
  bill_number: string;
  status: string;
  period_start: string | null;
  period_end: string | null;
  issue_date: string | null;
  due_date: string | null;
  paid_at: string | null;
  reason: string;
  subtotal: string;
  total_amount: string;
  currency: string;
  payment_method_label?: string;
  gateway_payment_id?: string;
  lines: PlatformBillLine[];
}

export interface BillingSummary {
  on_trial: boolean;
  first_plan_paid_at: string | null;
  next_unified_bill_at: string | null;
  paid_until: string | null;
  estimated_transaction_fees: string;
  outstanding_bill_count: number;
  outstanding_total: string;
  latest_paid_bill: PlatformBill | null;
}

async function billingBase(): Promise<string> {
  const slug = await ensureTenantStoreSlugForApi();
  if (!slug) throw new Error("Tenant not found");
  return `api/tenants/${slug}/billing`;
}

export async function fetchPlatformBills(): Promise<PlatformBill[]> {
  const base = await billingBase();
  const res = await axiosInstance.get(`${base}/platform-bills/`);
  return res.data?.results || [];
}

export async function fetchPlatformBill(billId: string): Promise<PlatformBill> {
  const base = await billingBase();
  const res = await axiosInstance.get(`${base}/platform-bills/${billId}/`);
  return res.data;
}

export async function fetchBillingSummary(): Promise<BillingSummary> {
  const base = await billingBase();
  const res = await axiosInstance.get(`${base}/summary/`);
  return res.data;
}
