/**
 * Builds a user-visible message from tenant payment API error payloads
 * (e.g. Razorpay create-order: `error` + optional `hint`).
 */
export function paymentErrorMessage(data: unknown): string {
  if (!data || typeof data !== "object") return "";
  const d = data as { error?: string; message?: string; hint?: string };
  const parts = [d.error, d.hint].filter((x) => typeof x === "string" && x.trim());
  if (parts.length) return parts.join("\n\n");
  return typeof d.message === "string" && d.message.trim() ? d.message : "";
}
