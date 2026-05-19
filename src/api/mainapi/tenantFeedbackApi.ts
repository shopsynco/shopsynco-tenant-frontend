import axiosInstance from "../../store/refreshToken/tokenUtils";

export type TenantFeedbackCategory =
  | "complaint"
  | "suggestion"
  | "general"
  | "other";

export interface SubmitTenantFeedbackPayload {
  category: TenantFeedbackCategory;
  body: string;
  /** Optional display name if shown after approval on storefront */
  public_display_name?: string;
}

export async function submitTenantFeedback(
  tenantSlug: string,
  payload: SubmitTenantFeedbackPayload,
): Promise<{ message: string; id: string }> {
  const slug = tenantSlug.trim().toLowerCase();
  const { data } = await axiosInstance.post<{ message?: string; id?: string }>(
    `api/tenants/${encodeURIComponent(slug)}/feedback/`,
    payload,
  );
  return {
    message: data?.message || "Submitted.",
    id: String(data?.id || ""),
  };
}
