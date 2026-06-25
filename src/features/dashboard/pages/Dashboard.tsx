import { useState, useEffect } from "react";
import {
  ArrowUpRight,
  Clock,
  Globe,
  FileText,
  CreditCard,
  Calendar,
  Package,
  MessageSquare,
  Store,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  fetchSubscriptionStatus,
  fetchTenantDashboard,
} from "../../../api/mainapi/statusapi";
import {
  defaultTenantHostFromSlug,
  resolveTenantManagerBaseUrl,
} from "../../../api/axios_config";
import { ensureTenantStoreSlugForApi } from "../../../utils/tenantStoreSlug";
import { saveStorefrontHost } from "../../../utils/storefrontHost";
import {
  markStoreOnboardingComplete,
  resolveStoreSetupComplete,
  setPlansEntryFromDashboard,
} from "../../../utils/planFlow";
import FeatureStorePage from "../components/FeatureModal";
import FeedbackModal from "../components/FeedbackModal";
import Header from "../components/dashboardHeader";
import SupportContactBanner from "../components/SupportContactBanner";
import OnboardingChecklist from "../components/onboarding/OnboardingChecklist";
import QuickStartGuide from "../components/onboarding/QuickStartGuide";
import SetupWizard from "../components/onboarding/SetupWizard";
import { useOnboardingProgress } from "../../../lib/onboarding/useOnboardingProgress";

export default function Dashboard() {
  const [isFeatureStoreOpen, setIsFeatureStoreOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const [userData, setUserData] = useState({
    user_name: "",
    user_email: "",
  });

  const [planData, setPlanData] = useState({
    plan_name: "",
    renew_date: "",
    status: "",
  });

  const [historyData, setHistoryData] = useState({
    last_payment_amount: "",
    last_payment_date: "",
    payment_method: "",
    next_renewal_amount: "",
    next_renewal_date: "",
  });

  const displayName =
    userData.user_name.trim() ||
    (userData.user_email.includes("@")
      ? userData.user_email.split("@")[0]
      : userData.user_email) ||
    "there";

  const [tenantData, setTenantData] = useState({
    domain: "",
    features: [] as string[],
  });

  const [showSetupBanner, setShowSetupBanner] = useState(false);
  const [isTrialPlan, setIsTrialPlan] = useState(false);
  const [storeSetupComplete, setStoreSetupComplete] = useState(() =>
    resolveStoreSetupComplete(),
  );

  const navigate = useNavigate();

  const slugForDisplay = localStorage.getItem("store_slug")?.trim() || "";
  const domainHost =
    tenantData.domain.trim() ||
    (slugForDisplay ? defaultTenantHostFromSlug(slugForDisplay) : "");
  const domainUrl =
    domainHost && !domainHost.startsWith("http")
      ? `https://${domainHost}`
      : domainHost;

  const { progress: onboardingProgress, markShareStepComplete } =
    useOnboardingProgress(domainUrl);

  const openManagerDashboard = () => {
    const base = resolveTenantManagerBaseUrl();
    if (!base) {
      window.alert(
        "Manager dashboard URL is not configured. Set VITE_TENANT_MANAGER_ORIGIN in your environment.",
      );
      return;
    }
    window.open(`${base}/store-overview`, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    try {
      const incomplete =
        sessionStorage.getItem("tenant_store_setup_incomplete") === "1";
      const onboardingDone =
        localStorage.getItem("tenant_store_onboarding_complete") === "1";
      setShowSetupBanner(Boolean(incomplete && !onboardingDone));
    } catch {
      setShowSetupBanner(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setDashboardLoading(true);
      setDashboardError(null);

      const slug = await ensureTenantStoreSlugForApi();
      if (cancelled) return;

      if (!slug) {
        setDashboardError(
          "We could not resolve your store (missing tenant). Try logging in again or finish store setup.",
        );
        const email = localStorage.getItem("user_email")?.trim() || "";
        setUserData((prev) => ({
          ...prev,
          user_email: email || prev.user_email,
        }));
        setDashboardLoading(false);
        return;
      }

      try {
        const [tenant, subscriptionRes] = await Promise.all([
          fetchTenantDashboard(),
          fetchSubscriptionStatus().catch(() => null),
        ]);
        if (cancelled) return;

        const subStatus = String(subscriptionRes?.subscription?.status || "").toLowerCase();
        setIsTrialPlan(subStatus === "trial");

        const data = tenant?.dashboard || {};
        const summary = data?.account_summary || {};
        const billing = summary?.billing_summary?.last_payment;
        const nextRen = summary?.next_renewal;
        const pmRaw = summary?.payment_method;

        const user_name = String(data?.user_info?.name || "").trim();
        const user_email = String(data?.user_info?.email || "").trim();
        setUserData({ user_name, user_email });

        const plan_name = String(data?.current_plan?.name || "").trim();
        const renew_date = String(data?.current_plan?.renewal_date || "").trim();
        const status = String(summary?.domain?.status || "").trim();
        setPlanData({ plan_name, renew_date, status });

        const pmDisplay =
          pmRaw && typeof pmRaw === "object"
            ? String(
                (pmRaw as { masked_info?: string; method?: string }).masked_info ||
                  (pmRaw as { method?: string }).method ||
                  "",
              ).trim() || "—"
            : typeof pmRaw === "string" && pmRaw.trim()
              ? pmRaw.trim()
              : "—";

        const lastAmt =
          billing?.amount != null && !Number.isNaN(Number(billing.amount))
            ? Number(billing.amount).toLocaleString("en-IN")
            : "";
        const nextAmt =
          nextRen?.amount != null && !Number.isNaN(Number(nextRen.amount))
            ? Number(nextRen.amount).toLocaleString("en-IN")
            : "";

        setHistoryData({
          last_payment_amount: lastAmt,
          last_payment_date: billing?.date ? String(billing.date) : "",
          payment_method: pmDisplay,
          next_renewal_amount: nextAmt,
          next_renewal_date: nextRen?.date ? String(nextRen.date) : renew_date,
        });

        const apiDomain = String(summary?.domain?.name || "").trim();
        const fallbackDomain = defaultTenantHostFromSlug(slug);
        const domain = apiDomain || fallbackDomain;
        if (apiDomain) saveStorefrontHost(apiDomain);
        const features =
          data?.plan_features?.included_features?.map((f: { name?: string }) => f.name) ||
          [];
        setTenantData({ domain, features });

        const setupComplete = resolveStoreSetupComplete({ domain });
        setStoreSetupComplete(setupComplete);
        if (setupComplete) {
          markStoreOnboardingComplete();
          setShowSetupBanner(false);
        }

        if (user_name) localStorage.setItem("user_name", user_name);
        if (user_email) localStorage.setItem("user_email", user_email);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        if (!cancelled) {
          const errData = (
            err as {
              response?: {
                data?: {
                  your_tenant_slug?: string;
                  message?: string;
                  error?: string;
                };
              };
            }
          ).response?.data;
          const correctSlug = errData?.your_tenant_slug?.trim();
          if (correctSlug) {
            localStorage.setItem("store_slug", correctSlug);
            setDashboardError(null);
            setDashboardLoading(true);
            try {
              const tenant = await fetchTenantDashboard();
              if (cancelled) return;
              const data = tenant?.dashboard || {};
              const summary = data?.account_summary || {};
              const apiDomain = String(summary?.domain?.name || "").trim();
              const resolvedDomain = apiDomain || defaultTenantHostFromSlug(correctSlug);
              if (apiDomain) saveStorefrontHost(apiDomain);
              setTenantData({
                domain: resolvedDomain,
                features:
                  data?.plan_features?.included_features?.map((f: { name?: string }) => f.name) ||
                  [],
              });
              setDashboardLoading(false);
              return;
            } catch (retryErr) {
              console.error("Dashboard retry after slug correction failed:", retryErr);
            }
          }
          setDashboardError(
            errData?.message ||
              errData?.error ||
              "Could not load your dashboard. Check your connection and try refreshing the page.",
          );
        }
      } finally {
        if (!cancelled) setDashboardLoading(false);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-800 relative">
      <Header />
      <main className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-10 flex flex-col gap-8">
        {dashboardError && (
          <div
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
            role="alert"
          >
            {dashboardError}
          </div>
        )}

        <section
          className="max-lg:order-1 relative overflow-hidden rounded-2xl border border-[#6A3CB1]/25 bg-gradient-to-br from-[#5A2D9D] via-[#6A3CB1] to-[#8B6BB6] p-6 sm:p-8 shadow-[0_16px_48px_rgba(106,60,177,0.38)]"
          aria-label="Manage your store"
        >
          <div
            className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -bottom-14 -left-10 h-36 w-36 rounded-full bg-white/5"
            aria-hidden
          />
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/75 sm:text-sm">
                Your storefront command center
              </p>
              <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
                Manage My Store
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
                Jump into your store dashboard to manage products, orders, design,
                and customers — everything you need to run your shop.
              </p>
            </div>
            <button
              type="button"
              onClick={openManagerDashboard}
              className="group inline-flex w-full shrink-0 items-center justify-center gap-3 rounded-xl bg-white px-8 py-4 text-base font-semibold text-[#6A3CB1] shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition-all hover:scale-[1.02] hover:bg-[#F8F4FF] hover:shadow-[0_12px_32px_rgba(0,0,0,0.22)] active:scale-[0.99] sm:w-auto sm:min-w-[260px] sm:text-lg"
            >
              <Store
                size={24}
                className="text-[#6A3CB1] transition-transform group-hover:scale-110"
                strokeWidth={2}
              />
              Manage My Store
              <ArrowUpRight
                size={22}
                className="text-[#6A3CB1] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              />
            </button>
          </div>
        </section>

        {showSetupBanner && (
          <div
            className="max-lg:order-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            role="region"
            aria-label="Store setup reminder"
          >
            <p className="text-sm text-amber-950 pr-2">
              You&apos;ve already completed your sign-up and payment. Continue
              where you left off to set up your store and get started.
            </p>
            <button
              type="button"
              onClick={() => {
                const slug = localStorage.getItem("store_slug");
                navigate(slug ? "/setup-store-contact" : "/setup-store");
              }}
              className="shrink-0 rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
            >
              Continue Setup
            </button>
          </div>
        )}

        <section className="max-lg:order-2 grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6 items-start">
          <OnboardingChecklist
            progress={onboardingProgress}
            onShareAction={markShareStepComplete}
          />
          <QuickStartGuide progress={onboardingProgress} />
        </section>

        <SetupWizard
          progress={onboardingProgress}
          onShareAction={markShareStepComplete}
        />

        {!dashboardLoading && (
          <div className="hidden lg:block">
            <SupportContactBanner
              variant={isTrialPlan && !storeSetupComplete ? "trial" : "default"}
              showSetupCta={!storeSetupComplete && (isTrialPlan || showSetupBanner)}
            />
          </div>
        )}

        {/* WELCOME */}
        <div className="max-lg:order-3 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-black">
              Welcome, {dashboardLoading ? "Loading..." : displayName}
            </h1>
            <p className="text-gray-500">
              Here’s an overview of your account and subscription.
            </p>
          </div>

          <div className="hidden lg:block bg-[#F5F1FF] border border-[#E2DAFF] rounded-2xl px-6 py-4 shadow-sm w-full sm:w-auto lg:min-w-[280px]">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm text-gray-700">
                <span className="font-medium text-gray-800">Current Plan:</span>{" "}
                <span className="text-[#6A3CB1] font-semibold">
                  {dashboardLoading ? "Loading..." : planData.plan_name || "—"}
                </span>
              </p>
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Clock size={16} className="text-gray-600" />
              Renews yearly on{" "}
              <span className="text-[#6A3CB1] font-medium ml-1">
                {planData.renew_date || "—"}
              </span>
            </p>
          </div>
        </div>

        {/* CURRENT PLAN — mobile */}
        <div className="max-lg:order-4 lg:hidden bg-[#F5F1FF] border border-[#E2DAFF] rounded-2xl px-6 py-4 shadow-sm w-full">
          <p className="text-[20px] leading-[28px] text-gray-800">
            <span className="font-medium">Current Plan:</span>{" "}
            <span className="text-[#6A3CB1] font-semibold">
              {dashboardLoading ? "Loading..." : planData.plan_name || "—"}
            </span>
          </p>
          <p className="mt-2 text-sm text-gray-500 flex items-center gap-1">
            <Clock size={16} className="text-gray-600 shrink-0" />
            Renews yearly on{" "}
            <span className="text-[#6A3CB1] font-medium">
              {planData.renew_date || "—"}
            </span>
          </p>
        </div>

        {/* UPGRADE PLAN — mobile */}
        <div
          className="max-lg:order-5 lg:hidden relative w-full overflow-hidden rounded-[10px] text-white flex flex-col min-h-[280px]"
          style={{
            background: "linear-gradient(218.51deg, #719CBF -9.07%, #A782D8 63.72%)",
          }}
        >
          <div className="flex items-start gap-4 p-6 pb-4">
            <svg
              className="w-8 h-8 shrink-0 mt-1"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v8M8 12l4-4 4 4" />
            </svg>
            <div className="min-w-0">
              <h3
                className="text-white font-semibold text-xl leading-tight"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Upgrade Your Plan
              </h3>
              <p
                className="mt-3 text-sm leading-relaxed text-white/95"
                style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
              >
                Get access to advanced features and increase your usage limits by upgrading to our premium plans.
              </p>
            </div>
          </div>

          <div className="px-6 pb-4">
            <button
              type="button"
              onClick={() => {
                setPlansEntryFromDashboard();
                navigate("/plans");
              }}
              className="w-full rounded-[5px] bg-white text-[#6A3CB1] py-3 px-4 font-medium text-base"
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              View Upgrade Options
            </button>
          </div>

          <div className="mt-auto bg-black/30 px-4 py-4 text-center">
            <p
              className="text-white text-sm"
              style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400 }}
            >
              Upgrade today and get 20% off your first 3 months!
            </p>
          </div>
        </div>

        {/* ACCOUNT SUMMARY + DESKTOP SIDEBAR */}
        <div className="max-lg:order-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#c9b8ff] shadow-sm p-8">
            <div className="flex flex-row items-center gap-3 mb-6 max-lg:justify-between">
              <h2 className="text-lg font-semibold text-[#6A3CB1]">Account Summary</h2>
              {planData.status && (
                <span className="inline-flex items-center justify-center rounded-full bg-[#48BC29]/60 px-3 py-0.5 max-lg:px-[12px] max-lg:py-[6px] text-xs font-medium leading-none text-white shrink-0">
                  {planData.status}
                </span>
              )}
            </div>

            {/* DOMAIN */}
            <div className="mb-6 border-b border-gray-200 pb-4">
              <p className="flex items-center gap-2 font-semibold text-black">
                <Globe size={20} className="text-[#8B6BB6]" />
                Your Domain
              </p>
              {domainUrl ? (
                <a
                  href={domainUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-1 text-sm text-[#6A3CB1] break-all hover:underline"
                >
                  {domainHost}
                  <ArrowUpRight size={14} className="shrink-0" />
                </a>
              ) : (
                <span className="mt-1 text-sm text-gray-400">—</span>
              )}
            </div>

            {/* BILLING + PLAN FEATURES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <p className="flex items-center gap-2 font-semibold text-black">
                    <FileText size={20} className="text-[#8B6BB6]" />
                    Billing Summary
                  </p>
                  <p className="text-sm text-black mt-1">
                    Last payment: ₹{historyData.last_payment_amount || "—"} on{" "}
                    {historyData.last_payment_date || "—"}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/invoice")}
                    className="mt-2 text-xs sm:text-sm flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md text-black hover:bg-[#F5F1FF] transition font-medium"
                  >
                    Download Invoice
                  </button>
                </div>

                <div>
                  <p className="flex items-center gap-2 font-semibold text-black">
                    <CreditCard size={20} className="text-[#8B6BB6]" />
                    Payment Method
                  </p>
                  <p className="text-black font-semibold text-sm mt-1">
                    {historyData.payment_method || "—"}
                  </p>
                </div>

                <div>
                  <p className="flex items-center gap-2 font-semibold text-black">
                    <Calendar size={20} className="text-[#8B6BB6]" />
                    Next Renewal
                  </p>
                  <p className="text-sm text-black mt-1">
                    Next payment: ₹{historyData.next_renewal_amount || "—"} on{" "}
                    {historyData.next_renewal_date || "—"}
                  </p>
                </div>
              </div>

              <div>
                <p className="flex items-center gap-2 font-semibold text-black mb-2">
                  <Package size={20} className="text-[#8B6BB6]" />
                  Plan Features
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-3">
                  {tenantData.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
                <button
                  onClick={() =>
                    window.innerWidth < 1024
                      ? navigate("/feature-store")
                      : setIsFeatureStoreOpen(true)
                  }
                  className="w-full sm:w-auto text-white font-semibold rounded-md flex items-center justify-center px-5 py-2.5"
                  style={{
                    borderRadius: 5,
                    background: "linear-gradient(80.21deg, #AE84EB 8.97%, #7CB2E5 94.42%)",
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 600,
                    fontSize: 16,
                    lineHeight: "30px",
                  }}
                >
                  Browse Feature Store
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT — desktop only */}
          <div className="hidden lg:flex flex-col gap-6 w-full min-w-0">
            {/* UPGRADE CARD */}
            <div
              className="relative w-full max-w-[445px] mx-auto lg:mx-0 overflow-hidden rounded-[10px] text-white flex flex-col min-h-[280px] sm:min-h-[320px]"
              style={{
                background: "linear-gradient(218.51deg, #719CBF -9.07%, #A782D8 63.72%)",
              }}
            >
              <div className="flex items-start gap-4 p-6 sm:p-7 pb-4">
                <svg
                  className="w-8 h-8 shrink-0 mt-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8M8 12l4-4 4 4" />
                </svg>
                <div className="min-w-0">
                  <h3
                    className="text-white font-semibold text-xl sm:text-2xl leading-tight"
                    style={{ fontFamily: "Poppins, sans-serif" }}
                  >
                    Upgrade Your Plan
                  </h3>
                  <p
                    className="mt-3 text-sm sm:text-base leading-relaxed text-white/95"
                    style={{ fontFamily: "Poppins, sans-serif", fontWeight: 500 }}
                  >
                    Get access to advanced features and increase your usage limits by upgrading to our premium plans.
                  </p>
                </div>
              </div>

              <div className="px-6 sm:px-7 pb-4">
                <button
                  type="button"
                  onClick={() => {
                    setPlansEntryFromDashboard();
                    navigate("/plans");
                  }}
                  className="w-full rounded-[5px] bg-white text-[#6A3CB1] py-3 px-4 font-medium text-base"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  View Upgrade Options
                </button>
              </div>

              <div className="mt-auto bg-black/30 px-4 py-4 text-center">
                <p
                  className="text-white text-sm sm:text-base"
                  style={{ fontFamily: "Poppins, sans-serif", fontWeight: 400 }}
                >
                  Upgrade today and get 20% off your first 3 months!
                </p>
              </div>
            </div>

            {/* QUICK ACCESS — desktop only */}
            <div className="hidden lg:block w-full max-w-[445px] mx-auto lg:mx-0 bg-white shadow-sm rounded-[10px] border border-[#8B6BB6] p-6 sm:px-10 sm:py-7">
              <h3
                className="mb-4 font-semibold text-xl sm:text-2xl text-[#8B6BB6]"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                Quick Access
              </h3>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate("/manage-billing")}
                  className="flex items-center justify-between border rounded-lg px-4 py-3 hover:bg-gray-50 transition font-medium text-black"
                  style={{ borderColor: "#8B6BB6" }}
                >
                  <span className="flex items-center gap-3">
                    <CreditCard size={20} className="text-[#8B6BB6]" />
                    Manage Billing
                  </span>
                  <ArrowUpRight size={16} className="text-[#8B6BB6]" />
                </button>

                <button
                onClick={() => navigate("/invoice")}
                  className="flex items-center justify-between border rounded-lg px-4 py-3 hover:bg-gray-50 transition font-medium text-black"
                  style={{ borderColor: "#8B6BB6" }}
                >
                  <span className="flex items-center gap-3">
                    <FileText size={20} className="text-[#8B6BB6]" />
                    View Invoices
                  </span>
                  <ArrowUpRight size={16} className="text-[#8B6BB6]" />
                </button>

                <button
                  type="button"
                  onClick={() => setFeedbackModalOpen(true)}
                  className="flex items-center justify-between border rounded-lg px-4 py-3 hover:bg-gray-50 transition font-medium text-black"
                  style={{ borderColor: "#8B6BB6" }}
                >
                  <span className="flex items-center gap-3">
                    <MessageSquare size={20} className="text-[#8B6BB6]" />
                    Give Feedback
                  </span>
                  <ArrowUpRight size={16} className="text-[#8B6BB6]" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {!dashboardLoading && (
          <div className="max-lg:order-7 lg:hidden">
            <SupportContactBanner
              variant={isTrialPlan && !storeSetupComplete ? "trial" : "default"}
              showSetupCta={!storeSetupComplete && (isTrialPlan || showSetupBanner)}
            />
          </div>
        )}
      </main>

      {isFeatureStoreOpen && (
        <FeatureStorePage onClose={() => setIsFeatureStoreOpen(false)} />
      )}
      <FeedbackModal open={feedbackModalOpen} onClose={() => setFeedbackModalOpen(false)} />
    </div>
  );
}