import React, { useEffect, useState } from "react";
import bgImage from "../../../assets/backgroundstore.png";
import {
  getCountries,
  getStates,
  storeContactSetup,
  getStoreSlug,
} from "../../../api/mainapi/StoreCreateapi";
import { useNavigate } from "react-router-dom";

const StoreSetupContactPage: React.FC = () => {
  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    business_address: "",
    country: "",
    state: "",
    contact_email: "",
    contact_number: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const email = formData.contact_email?.trim();

      if (!email) {
        alert("Please enter a valid contact email.");
        setLoading(false);
        return;
      }

      // 🔹 Step 1: Call slug API to generate or get existing slug
      console.log("📩 Generating slug for email:", email);
      const slugResponse = await getStoreSlug(email);

      if (slugResponse?.slug) {
        localStorage.setItem("store_slug", slugResponse.slug);
        console.log("✅ Slug created and saved:", slugResponse.slug);
      } else {
        console.warn("⚠️ Slug not returned from API for email:", email);
      }

      // 🔹 Step 2: Submit contact info
      const result = await storeContactSetup(formData);
      console.log("✅ Store contact setup completed:", result);

      // 🔹 Step 3: Redirect to finish/setup complete page
      navigate("/setup-store-finish");
    } catch (err) {
      console.error("❌ Failed to submit contact details:", err);
      alert("Failed to submit contact details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-10 relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <h2 className="text-4xl font-semibold text-center text-[#6A3CB1] mb-8">
        Setup Your Store
      </h2>

      <div className="p-8 bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl shadow-xl w-full max-w-3xl">
        <h3 className="text-2xl font-semibold text-[#719CBF] mb-6 text-center">
          Location & Contact
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Address */}
          <div>
            <label htmlFor="business-address" className="block text-lg font-medium text-gray-700">
              Business Address
            </label>
            <input
              type="text"
              id="business-address"
              value={formData.business_address}
              onChange={handleChange}
              placeholder="Enter your business address"
              className="w-full p-4 mt-2 text-sm text-gray-700 bg-white/60 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-[#6A3CB1]"
            />
          </div>

          {/* Country / State */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label htmlFor="country" className="block text-lg font-medium text-gray-700">
                Country / Region
              </label>
              <select
                id="country"
                onChange={handleCountrySelect}
                className="w-full p-4 mt-2 text-sm text-gray-700 bg-white/60 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-[#6A3CB1]"
              >
                <option value="">Select</option>
                {countries.map((country) => (
                  <option key={country.id} value={country.id}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="state" className="block text-lg font-medium text-gray-700">
                State / City
              </label>
              <select
                id="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full p-4 mt-2 text-sm text-gray-700 bg-white/60 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-[#6A3CB1]"
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

          {/* Contact Email */}
          <div>
            <label htmlFor="contact-email" className="block text-lg font-medium text-gray-700">
              Contact Email
            </label>
            <input
              type="email"
              id="contact-email"
              value={formData.contact_email}
              onChange={handleChange}
              placeholder="Enter your contact email"
              className="w-full p-4 mt-2 text-sm text-gray-700 bg-white/60 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-[#6A3CB1]"
              required
            />
          </div>

          {/* Contact Number */}
          <div>
            <label htmlFor="contact-number" className="block text-lg font-medium text-gray-700">
              Contact Number
            </label>
            <input
              type="text"
              id="contact-number"
              value={formData.contact_number}
              onChange={handleChange}
              placeholder="Enter your phone number"
              className="w-full p-4 mt-2 text-sm text-gray-700 bg-white/60 border border-gray-300 rounded-lg shadow-md focus:ring-2 focus:ring-[#6A3CB1]"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6A3CB1] text-white py-4 rounded-lg font-medium shadow-md hover:bg-[#5a2d9d] transition disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Create My Store"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default StoreSetupContactPage;
