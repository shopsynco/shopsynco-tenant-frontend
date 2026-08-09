import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import bgImage from "../../../assets/backgroundstore.png";
import {
  getStoreSlug,
  getStoreCategories,
  storeSetup,
  getStoreSetupStatus,
} from "../../../api/mainapi/StoreCreateapi";
import shopLogo from "../../../assets/Name-Logo.png";
import {
  saveStorefrontFromSetupTenant,
  saveStorefrontHostFromDomainLabel,
} from "../../../utils/storefrontHost";
import { syncTenantPortalSession } from "../../../api/auth/sessionApi";
import {
  resolvePostLoginNavigationPath,
  resolveStoreSetupComplete,
} from "../../../utils/planFlow";
interface FormData {
  store_name: string;
  product_service: string;
  domain: string;
}

type FieldKey = keyof FormData | "general";

const DOMAIN_PATTERN = /^[a-z0-9-]{3,63}$/;

function parseStoreSetupFieldErrors(data: unknown): Partial<Record<FieldKey, string>> {
  if (!data || typeof data !== "object") return {};
  const o = data as Record<string, unknown>;
  const fe = o.field_errors;
  if (fe && typeof fe === "object" && !Array.isArray(fe)) {
    const out: Partial<Record<FieldKey, string>> = {};
    for (const key of ["store_name", "domain", "product_service", "general"] as const) {
      const v = (fe as Record<string, unknown>)[key];
      if (typeof v === "string" && v.trim()) out[key] = v.trim();
    }
    return out;
  }
  const detail = o.detail;
  if (detail && typeof detail === "object" && !Array.isArray(detail)) {
    const out: Partial<Record<FieldKey, string>> = {};
    for (const [k, val] of Object.entries(detail as Record<string, unknown>)) {
      const msg = Array.isArray(val)
        ? val[0]
        : typeof val === "string"
          ? val
          : null;
      if (typeof msg !== "string" || !msg.trim()) continue;
      if (k === "store_name" || k === "domain" || k === "product_service") {
        out[k] = msg.trim();
      } else if (k === "non_field_errors") {
        out.general = msg.trim();
      }
    }
    return out;
  }
  return {};
}

const FALLBACK_CATEGORY_OPTIONS = [
  "Fashion",
  "Retail",
  "Food & Beverage",
  "Beauty & Wellness",
  "Electronics",
  "Home & Decor",
  "Services",
  "Other",
];

export default function StoreSetupPage() {
  const [formData, setFormData] = useState<FormData>({
    store_name: "",
    product_service: "",
    domain: "",
  });

  const [loading, setLoading] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const session = await syncTenantPortalSession();
        if (cancelled) return;
        // Renew/extend after expiry should never re-ask for domain on an existing store.
        if (!session.requires_store_setup) {
          navigate(resolvePostLoginNavigationPath(session), { replace: true });
        }
      } catch {
        if (!cancelled && resolveStoreSetupComplete()) {
          navigate("/dashboard", { replace: true });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    const loadCategoryOptions = async () => {
      try {
        const categories = await getStoreCategories();
        setCategoryOptions(
          categories.length > 0 ? categories : FALLBACK_CATEGORY_OPTIONS
        );
      } catch {
        setCategoryOptions(FALLBACK_CATEGORY_OPTIONS);
      }
    };
    loadCategoryOptions();
  }, []);

  // ✅ Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const key = name as keyof FormData;
    const nextValue =
      name === "domain"
        ? value.toLowerCase().replace(/\s+/g, "")
        : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      delete next.general;
      return next;
    });
  };

  // ✅ Submit handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const domainValue = formData.domain.trim().toLowerCase();
    const storeName = formData.store_name.trim();
    const category = formData.product_service.trim();

    const nextErrors: Partial<Record<FieldKey, string>> = {};
    if (!storeName) nextErrors.store_name = "Store name is required.";
    else if (storeName.length < 2)
      nextErrors.store_name = "Store name must be at least 2 characters.";
    else if (storeName.length > 200)
      nextErrors.store_name = "Store name must be at most 200 characters.";

    if (!category) nextErrors.product_service = "Please select a category.";

    if (!domainValue) {
      nextErrors.domain =
        "Enter your business or store name in small letters (e.g. mybakery).";
    } else if (!DOMAIN_PATTERN.test(domainValue)) {
      nextErrors.domain =
        "Use 3–63 small letters, numbers, or hyphens only — no spaces or capitals (e.g. my-bakery).";
    }

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});

    saveStorefrontHostFromDomainLabel(domainValue);

    try {
      setLoading(true);
      const result = await storeSetup({
        ...formData,
        store_name: storeName,
        product_service: category,
        domain: domainValue,
      });
      if (result?.task_id && (result.status === "pending" || result.status === "running")) {
        for (let i = 0; i < 90; i += 1) {
          const statusRes = await getStoreSetupStatus(result.task_id);
          if (statusRes.status === "completed" && statusRes.tenant?.schema_name) {
            saveStorefrontFromSetupTenant(statusRes.tenant);
            navigate("/setup-store-contact");
            return;
          }
          if (statusRes.status === "failed") {
            setFieldErrors({ general: statusRes.error || statusRes.message || "Store setup failed." });
            return;
          }
          await new Promise((resolve) => setTimeout(resolve, 2000));
        }
        setFieldErrors({
          general:
            "Store setup is still in progress. Please wait a bit and try again.",
        });
        return;
      }

      const schemaName = result?.tenant?.schema_name;
      if (schemaName || result?.tenant?.domain) {
        saveStorefrontFromSetupTenant(result.tenant);
      }
      navigate("/setup-store-contact");
    } catch (err) {
      console.error("❌ Failed to setup store:", err);
      const responseData = axios.isAxiosError(err)
        ? (err.response?.data as
            | {
                error?: string;
                message?: string;
                field_errors?: Record<string, string>;
                detail?: string | Record<string, unknown> | string[];
              }
            | undefined)
        : undefined;
      const axiosCode = axios.isAxiosError(err) ? err.code : undefined;
      const isTimeout = axiosCode === "ECONNABORTED";

      let detailMessage = "";
      if (typeof responseData?.detail === "string") {
        detailMessage = responseData.detail;
      } else if (Array.isArray(responseData?.detail)) {
        detailMessage = String(responseData?.detail[0] ?? "");
      } else if (
        responseData?.detail &&
        typeof responseData.detail === "object"
      ) {
        const first = Object.values(responseData.detail)[0];
        if (Array.isArray(first)) detailMessage = String(first[0] ?? "");
        else if (typeof first === "string") detailMessage = first;
      }

      const backendMessage =
        detailMessage ||
        responseData?.message ||
        responseData?.error ||
        "Failed to create store. Please check inputs or server.";

      // Timeout can happen after server created the tenant; verify by discover
      // before showing a hard failure to avoid accidental duplicate creation.
      if (isTimeout) {
        try {
          const loginEmail = localStorage.getItem("user_email")?.trim();
          if (loginEmail) {
            // Backend may still be finalizing schema; poll discover briefly.
            for (let i = 0; i < 6; i += 1) {
              const discover = await getStoreSlug(loginEmail);
              if (discover?.slug) {
                localStorage.setItem("store_slug", discover.slug);
                navigate("/setup-store-contact");
                return;
              }
              await new Promise((resolve) => setTimeout(resolve, 3000));
            }
          }
        } catch (discoverErr) {
          console.warn("Store setup timeout and discover fallback failed", discoverErr);
        }
      }

      const fromApi = parseStoreSetupFieldErrors(responseData);
      if (Object.keys(fromApi).length > 0) {
        setFieldErrors(fromApi);
        return;
      }

      const msgLower = backendMessage.toLowerCase();
      if (msgLower.includes("already taken") && msgLower.includes("domain")) {
        setFieldErrors({ domain: backendMessage });
        return;
      }
      const friendlyMessage =
        msgLower.includes("schema_name_key") ||
        msgLower.includes("duplicate key value") ||
        msgLower.includes("already exists")
          ? "A store with similar details already exists. Please try a different store or domain name."
          : backendMessage;
      setFieldErrors({ general: friendlyMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-10 relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Logo */}
      <div className="absolute top-6 left-6">
        <img
          src={shopLogo}
          alt="ShopSynco Logo"
          className="w-36 h-auto object-contain"
        />
      </div>

      {/* Title */}
      <h2 className="text-2xl sm:text-4xl font-semibold text-[#6A3CB1] mb-8 text-center px-2">
        Setup Your Store
      </h2>

      {/* Card */}
      <div
        className="w-full max-w-3xl mx-auto p-6 sm:p-8 md:p-12 rounded-2xl bg-transparent backdrop-blur-sm border border-white/50 
        shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] flex flex-col items-center text-center gap-8 z-10"
        style={{
          background:
            "linear-gradient(112deg, rgba(255, 255, 255, 0.00) 0%, rgba(113, 156, 191, 0.20) 98.3%)",
        }}
      >
        <h3 className="text-2xl font-semibold text-[#719CBF]">
          Basic Store Details
        </h3>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-6 w-full mx-auto"
        >
          {fieldErrors.general ? (
            <p
              className="w-full text-left text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3"
              role="alert"
            >
              {fieldErrors.general}
            </p>
          ) : null}

          <div className="flex flex-col md:flex-row gap-6 w-full mb-2">
            {/* Store Name */}
            <div className="flex-1">
              <label className="block text-left text-sm font-medium text-[#719CBF] mb-2">
                Company / Store Name
              </label>
              <input
                type="text"
                name="store_name"
                placeholder="Your Store Home"
                value={formData.store_name}
                onChange={handleChange}
                aria-invalid={Boolean(fieldErrors.store_name)}
                className={`w-full rounded-xl px-5 py-4 border text-black placeholder:text-gray-500 
                focus:outline-none focus:ring-2 text-lg bg-transparent ${
                  fieldErrors.store_name
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:ring-purple-400"
                }`}
                required
              />
              {fieldErrors.store_name ? (
                <p className="text-left text-sm text-red-600 mt-1">{fieldErrors.store_name}</p>
              ) : null}
            </div>

            {/* Category */}
            <div className="flex-1">
              <label className="block text-left text-sm font-medium text-[#719CBF] mb-2">
                Category
              </label>
              <select
                name="product_service"
                value={formData.product_service}
                onChange={handleChange}
                aria-invalid={Boolean(fieldErrors.product_service)}
                className={`w-full rounded-xl px-5 py-4 border text-black
             placeholder:text-gray-500 bg-transparent
             focus:outline-none focus:ring-2 text-lg
             resize-none ${
               fieldErrors.product_service
                 ? "border-red-500 focus:ring-red-400"
                 : "border-gray-300 focus:ring-purple-400"
             }`}
                required
              >
                <option value="" disabled>
                  Select category
                </option>
                {categoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {fieldErrors.product_service ? (
                <p className="text-left text-sm text-red-600 mt-1">{fieldErrors.product_service}</p>
              ) : null}
            </div>
          </div>

          {/* Store web address */}
          <div className="w-full">
            <label
              htmlFor="store-domain"
              className="block text-left text-sm font-medium text-[#719CBF] mb-2"
            >
              Domain/Your store link — business name in small letters
            </label>

            <div className="flex flex-col sm:flex-row items-stretch gap-0 w-full">
              {/* editable prefix */}
              <input
                id="store-domain"
                type="text"
                name="domain"
                placeholder="e.g. mybakery"
                value={formData.domain}
                onChange={handleChange}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
                aria-describedby="store-domain-hint"
                aria-invalid={Boolean(fieldErrors.domain)}
                className={`w-full sm:flex-1 rounded-xl sm:rounded-l-xl sm:rounded-r-none px-5 py-4 border sm:border-r-0
           text-black placeholder:text-gray-500
           focus:outline-none focus:ring-2
           text-lg bg-transparent ${
             fieldErrors.domain
               ? "border-red-500 focus:ring-red-400"
               : "border-gray-300 focus:ring-purple-400"
           }`}
                required
              />

              {/* locked suffix */}
              <span
                className={`px-4 py-4 border rounded-xl sm:rounded-l-none sm:rounded-r-xl flex items-center justify-center shrink-0
                     bg-white/10 text-black select-none text-sm sm:text-base ${
                       fieldErrors.domain ? "border-red-500" : "border-gray-300"
                     }`}
              >
                .shopsynco.com
              </span>
            </div>
            <p
              id="store-domain-hint"
              className="text-left text-xs text-gray-600 mt-2 leading-relaxed"
            >
              {formData.domain.trim() ? (
                <>
                  Type your shop or business name in{" "}
                  <span className="font-medium">small letters</span> — no spaces.
                  Your customers will visit:{" "}
                  <span className="font-medium text-[#719CBF]">
                    {formData.domain.trim().toLowerCase()}.shopsynco.com
                  </span>
                </>
              ) : (
                <>
                  Type your shop or business name in{" "}
                  <span className="font-medium">small letters</span> — no spaces.
                  Example: if your store is &quot;My Bakery&quot;, type{" "}
                  <span className="font-medium text-[#719CBF]">mybakery</span> →
                  mybakery.shopsynco.com
                </>
              )}
            </p>
            {fieldErrors.domain ? (
              <p className="text-left text-sm text-red-600 mt-1">{fieldErrors.domain}</p>
            ) : null}
          </div>

          {/* Previous + Next */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 w-full mt-6">
            <button
              type="button"
              disabled={loading}
              onClick={() => navigate(-1)}
              className="sm:flex-1 py-4 px-6 rounded-xl text-lg font-semibold border-2 border-[#719CBF] text-[#719CBF] bg-white/40
                hover:bg-white/70 transition duration-300 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="submit"
              disabled={loading}
              className="sm:flex-1 bg-[#719CBF] text-white py-4 px-6 rounded-xl text-lg font-semibold 
                hover:bg-[#5c91c4] transition duration-300 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Next"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
