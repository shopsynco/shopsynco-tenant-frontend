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

export type PlanTrialEligibility = {
  eligible: boolean;
  message?: string;
};

export const fetchPlans = async (): Promise<{
  plans: unknown[];
  planTrial: PlanTrialEligibility;
}> => {
  const response = await axiosInstance.get("/api/tenants/pricing/options/", {
    timeout: 45000,
  });
  const list = normalizePlansPayload(response.data);
  const d = response.data as Record<string, unknown>;
  const pt = d.plan_trial as Record<string, unknown> | undefined;
  return {
    plans: list,
    planTrial: {
      eligible: pt?.eligible !== false,
      message: typeof pt?.message === "string" ? pt.message : "",
    },
  };
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

export const startPlanTrial = async (plan_id: string) => {
  const response = await axiosInstance.post("/api/tenants/pricing/start-trial/", {
    plan_id,
  });
  return response.data as {
    message: string;
    trial_days: number;
    trial_end: string;
    subscription: { id: string; status: string };
  };
};
