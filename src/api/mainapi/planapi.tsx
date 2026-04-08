import axiosInstance from "../../store/refreshToken/tokenUtils";


function normalizePlansPayload(data: unknown): unknown[] {
  if (!data || typeof data !== "object") return [];
  const d = data as Record<string, unknown>;
  const raw = d.plans ?? d.data;
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    const inner = raw as Record<string, unknown>;
    if (Array.isArray(inner.plans)) return inner.plans;
    if (Array.isArray(inner.results)) return inner.results;
  }
  return [];
}

export const fetchPlans = async () => {
  const response = await axiosInstance.get("/api/tenants/pricing/options/");
  const list = normalizePlansPayload(response.data);
  return list;
};


export const getPricingQuote = async (plan_id: string, months: string, country: string) => {
  try {
    const response = await axiosInstance.get(
      `/api/tenants/pricing/quote/?plan_id=${plan_id}&months=${months}&country=${country}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching pricing quote:", error);
    throw error;
  }
};
