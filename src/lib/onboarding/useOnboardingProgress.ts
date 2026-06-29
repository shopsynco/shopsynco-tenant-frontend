import { useCallback, useEffect, useMemo, useState } from "react";
import { defaultTenantHostFromSlug, resolveTenantStorefrontUrl } from "../../api/axios_config";
import { onboardingApi } from "../../api/onboardingApi";
import { ONBOARDING_STEP_ORDER } from "./stepDefinitions";
import { isStoreShareCompleted, markStoreShareCompleted } from "./storage";
import type {
  OnboardingProgressState,
  OnboardingShareAction,
  OnboardingStepId,
} from "./types";

const EMPTY_STEPS: Record<OnboardingStepId, boolean> = {
  "upload-logo": false,
  "add-product": false,
  "add-category": false,
  "customize-website": false,
  "connect-razorpay": false,
  "share-website": false,
};

function resolveStoreUrl(fallbackDomain?: string): string {
  const slug = (localStorage.getItem("store_slug") || "").trim();
  const fromDomain = String(fallbackDomain || "").trim();
  if (fromDomain) {
    return fromDomain.startsWith("http") ? fromDomain : `https://${fromDomain}`;
  }
  if (slug) {
    const saved = resolveTenantStorefrontUrl(slug);
    if (saved) return saved;
    const host = defaultTenantHostFromSlug(slug);
    if (host) return `https://${host}`;
  }
  return "";
}

function hasLogo(details: unknown): boolean {
  const logo = (details as { store_details?: { general_information?: { logo?: string | null } } })
    ?.store_details?.general_information?.logo;
  return Boolean(String(logo || "").trim());
}

async function fetchProductCount(): Promise<number> {
  try {
    const data = await onboardingApi.getKpis();
    const raw = Number(data?.kpis?.total_products?.value ?? 0);
    return Number.isFinite(raw) ? raw : 0;
  } catch {
    // TODO: Add tenant-accessible products count endpoint if manager KPIs are unavailable.
    return 0;
  }
}

async function fetchWebsiteCustomized(): Promise<boolean> {
  try {
    const data = await onboardingApi.getSavedStyles();
    const styles = data?.saved_styles || [];
    return Array.isArray(styles) && styles.length > 0;
  } catch {
    return false;
  }
}

async function fetchRazorpayConnected(): Promise<boolean> {
  try {
    const data = await onboardingApi.getPaymentGateways();
    const rawList = Array.isArray(data)
      ? data
      : data?.gateways || data?.results || data?.data || [];
    const razorpay = (rawList as Array<{ id?: string; provider?: string; is_connected?: boolean; connected?: boolean }>).find(
      (gateway) =>
        String(gateway.provider || "").toLowerCase() === "razorpay" ||
        String(gateway.id || "").trim().toLowerCase() === "razorpay",
    );
    return Boolean(razorpay?.is_connected ?? razorpay?.connected);
  } catch {
    return false;
  }
}

export function useOnboardingProgress(fallbackDomain?: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<Record<OnboardingStepId, boolean>>(EMPTY_STEPS);
  const [storeUrl, setStoreUrl] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [detailsResult, productCountResult, categoriesResult, customizedResult, razorpayResult] =
        await Promise.allSettled([
          onboardingApi.getStoreDetails(),
          fetchProductCount(),
          onboardingApi.getCategories(),
          fetchWebsiteCustomized(),
          fetchRazorpayConnected(),
        ]);

      const details = detailsResult.status === "fulfilled" ? detailsResult.value : null;
      const productCount =
        productCountResult.status === "fulfilled" ? productCountResult.value : 0;
      const categoriesPayload =
        categoriesResult.status === "fulfilled" ? categoriesResult.value : null;
      const categoryCount = Array.isArray(categoriesPayload?.categories)
        ? categoriesPayload.categories.length
        : 0;
      const customized =
        customizedResult.status === "fulfilled" ? customizedResult.value : false;
      const razorpayConnected =
        razorpayResult.status === "fulfilled" ? razorpayResult.value : false;

      const resolvedUrl = resolveStoreUrl(fallbackDomain);
      const shareCompleted = isStoreShareCompleted() && Boolean(resolvedUrl);

      const nextSteps: Record<OnboardingStepId, boolean> = {
        "upload-logo": details ? hasLogo(details) : false,
        "add-product": productCount > 0,
        "add-category": categoryCount > 0,
        "customize-website": customized,
        "connect-razorpay": razorpayConnected,
        "share-website": shareCompleted,
      };

      setSteps(nextSteps);
      setStoreUrl(resolvedUrl);
    } catch {
      setError("Unable to load setup progress. You can still continue from the checklist.");
      setSteps(EMPTY_STEPS);
      setStoreUrl(resolveStoreUrl(fallbackDomain));
    } finally {
      setLoading(false);
    }
  }, [fallbackDomain]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const completedCount = useMemo(
    () => ONBOARDING_STEP_ORDER.filter((id) => steps[id]).length,
    [steps],
  );

  const allComplete = completedCount === ONBOARDING_STEP_ORDER.length;

  const nextIncompleteStepId = useMemo(
    () => ONBOARDING_STEP_ORDER.find((id) => !steps[id]) ?? null,
    [steps],
  );

  const markShareStepComplete = useCallback((_action: OnboardingShareAction) => {
    markStoreShareCompleted();
    setSteps((prev) => ({ ...prev, "share-website": true }));
  }, []);

  const progress: OnboardingProgressState = {
    steps,
    completedCount,
    totalCount: ONBOARDING_STEP_ORDER.length,
    allComplete,
    nextIncompleteStepId,
    storeUrl,
    loading,
    error,
  };

  return { progress, refresh, markShareStepComplete };
}
