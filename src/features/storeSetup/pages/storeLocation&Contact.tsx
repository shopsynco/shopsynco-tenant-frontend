import React, { useEffect, useState } from "react";

import bgImage from "../../../assets/backgroundstore.png";
import {
  getCountries,
  getStates,
  storeContactSetup,
} from "../../../api/mainapi/StoreCreateapi";
import { useNavigate } from "react-router-dom";
import { discoverTenantSlug } from "../../../api/auth/slugapi";
import shopLogo from "../../../assets/Name-Logo.png";
import { showError, showSuccess } from "../../../components/swalHelper";
import { markStoreOnboardingComplete } from "../../../utils/planFlow";
import {
  ensureTenantUserEmail,
  readStoredTenantUserEmail,
} from "../../../utils/tenantUserEmail";
import { saveStorefrontHost } from "../../../utils/storefrontHost";
import { trackMetaPixelStoreSetup } from "../../../lib/metaPixel";

const StoreSetupContactPage: React.FC = () => {
  const [resolvedEmail, setResolvedEmail] = useState(
    () => readStoredTenantUserEmail()
  );

  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(
    null
  );
  const [formData, setFormData] = useState({
    business_address: "",
    country: "",
    state: "",
    contact_email: resolvedEmail,
    contact_number: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const email = await ensureTenantUserEmail();
      if (!cancelled && email) {
        setResolvedEmail(email);
        setFormData((prev) => ({ ...prev, contact_email: email }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ✅ Fetch countries on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await getCountries();
        setCountries(res);
      } catch (err) {
        console.error("Failed to load countries:", err);
      }
    })();
  }, []);

  // ✅ Fetch states when a country is selected
  useEffect(() => {
    if (selectedCountryId) {
      (async () => {
        try {
          const res = await getStates(selectedCountryId);
          setStates(res);
        } catch (err) {
          console.error("Failed to load states:", err);
        }
      })();
    }
  }, [selectedCountryId]);

  // ✅ Handle input change
  // ✅ accept every possible field
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id.replace("-", "_")]: value }));
  };

  // ✅ Country select
  const handleCountrySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryId = Number(e.target.value);
    setSelectedCountryId(countryId);
    const selectedCountry = countries.find((c) => c.id === countryId);
    setFormData((prev) => ({ ...prev, country: selectedCountry?.name || "" }));
  };

  // ✅ Submit form
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const email = resolvedEmail || formData.contact_email?.trim();
      if (!email) {
        showError(
          "Missing email",
          "We could not find your signup email. Go back to login and sign in again, then continue store setup.",
        );
        setLoading(false);
        return;
      }

      const res = await storeContactSetup({ ...formData, contact_email: email });
      if (res?.storefront_host) {
        saveStorefrontHost(res.storefront_host);
      }
      const loginEmail = resolvedEmail || readStoredTenantUserEmail();
      const discoverEmail = loginEmail || email;
      const discoverRes = await discoverTenantSlug(discoverEmail);
      if (discoverRes?.storefront_host) {
        saveStorefrontHost(discoverRes.storefront_host);
      }

      try {
        localStorage.setItem("tenant_store_onboarding_complete", "1");
        sessionStorage.removeItem("tenant_store_setup_incomplete");
        markStoreOnboardingComplete();
      } catch {
        /* ignore */
      }

      trackMetaPixelStoreSetup({ em: email });

      showSuccess(
        "Store Created",
        "Your store has been set up successfully.",
        () => navigate("/store-success")
      );
    } catch (err: unknown) {
      console.error(err);
      const ax = err as { response?: { data?: { detail?: unknown; message?: unknown; error?: unknown } } };
      const data = ax.response?.data;
      const detail =
        (typeof data?.detail === "string" && data.detail) ||
        (typeof data?.message === "string" && data.message) ||
        (typeof data?.error === "string" && data.error) ||
        "Failed to submit contact details. Please try again.";
      showError("Submission Failed", detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-10 relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="absolute top-6 left-6">
        <img
          src={shopLogo}
          alt="ShopSynco Logo"
          className="w-36 h-auto object-contain"
        />
      </div>
      <h2 className="text-4xl font-semibold text-center text-[#6A3CB1] mb-8">
        Setup Your Store
      </h2>

      <div
        className="p-8 bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl shadow-xl w-full max-w-3xl "
        style={{
          background:
            "linear-gradient(112deg, rgba(255, 255, 255, 0.00) 0%, rgba(113, 156, 191, 0.20) 98.3%)",
        }}
      >
        <h3 className="text-2xl font-semibold text-[#719CBF] mb-6 text-center">
          Location & Contact
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ---------- Business Address ---------- */}
          <div>
            <label
              htmlFor="business-address"
              className="block text-lg font-medium text-[#719CBF]"
            >
              Business Address
            </label>
            <textarea
              id="business-address"
              rows={3}
              value={formData.business_address}
              onChange={handleChange}
              placeholder="Enter your business address"
              className="w-full p-4 mt-2 text-sm text-gray-700 bg-transparent border border-gray-300 rounded-lg
                 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6A3CB1] resize-none"
            />
          </div>

          {/* ---------- Country / State ---------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Country */}
            <div>
              <label
                htmlFor="country"
                className="block text-lg font-medium text-[#719CBF]"
              >
                Country / Region
              </label>
              <select
                id="country"
                onChange={handleCountrySelect}
                className="w-full p-4 mt-2 text-sm text-gray-700 bg-transparent border border-gray-300 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-[#6A3CB1]"
              >
                <option value="">Select</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* State */}
            <div>
              <label
                htmlFor="state"
                className="block text-lg font-medium text-[#719CBF]"
              >
                State / City
              </label>
              <select
                id="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full p-4 mt-2 text-sm text-gray-700 bg-transparent border border-gray-300 rounded-lg
                   focus:outline-none focus:ring-2 focus:ring-[#6A3CB1]"
              >
                <option value="">Select</option>
                {states.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* ---------- Contact Email (signup — read-only) ---------- */}
          <div>
            <label
              htmlFor="contact-email"
              className="block text-lg font-medium text-[#719CBF]"
            >
              Contact email
            </label>
            <input
              type="email"
              id="contact-email"
              value={formData.contact_email}
              readOnly
              autoComplete="email"
              aria-readonly="true"
              placeholder={resolvedEmail ? undefined : "Loading your email…"}
              className="w-full p-4 mt-2 text-sm text-gray-700 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed"
            />
            <p className="mt-2 text-xs text-gray-500">
              This is the email you used to sign up for ShopSynco. It is used as your store contact email and cannot
              be changed here.
            </p>
          </div>

          {/* ---------- Contact Number ---------- */}
          <div>
            <label
              htmlFor="contact-number"
              className="block text-lg font-medium text-[#719CBF]"
            >
              Contact Number
            </label>
            <input
              type="text"
              id="contact-number"
              value={formData.contact_number}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="w-full p-4 mt-2 text-sm text-gray-700 bg-transparent border border-gray-300 rounded-lg
                 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#6A3CB1]"
            />
          </div>

          {/* ---------- Previous + Submit ---------- */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => navigate("/setup-store")}
              className="sm:flex-1 py-4 rounded-lg font-semibold border-2 border-[#719CBF] text-[#719CBF] bg-white/40
                hover:bg-white/70 transition shadow-md disabled:opacity-50"
            >
              Previous
            </button>
            <button
              type="submit"
              disabled={loading}
              className="sm:flex-1 bg-[#719CBF] text-white py-4 rounded-lg font-semibold shadow-md hover:bg-[#5c91c4] transition disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Create My Store"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoreSetupContactPage;
