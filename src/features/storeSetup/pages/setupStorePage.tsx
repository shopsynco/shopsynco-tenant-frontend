import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import bgImage from "../../../assets/backgroundstore.png";
import {
  getStoreCategories,
  storeSetup,
} from "../../../api/mainapi/StoreCreateapi";
import shopLogo from "../../../assets/Name-Logo.png";
import { showError } from "../../../components/swalHelper";

interface FormData {
  store_name: string;
  product_service: string;
  domain: string;
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
  const navigate = useNavigate();

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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Submit handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const domainValue = formData.domain.trim().toLowerCase();
    const storeName = formData.store_name.trim();
    const category = formData.product_service.trim();

    if (!storeName || !category || !domainValue) {
      showError("Validation", "Please fill all required fields.");
      return;
    }
    if (!/^[a-z0-9-]{3,40}$/.test(domainValue)) {
      showError(
        "Invalid domain",
        "Domain can contain lowercase letters, numbers, and hyphen only (3-40 chars)."
      );
      return;
    }

    try {
      setLoading(true);
      const result = await storeSetup({
        ...formData,
        store_name: storeName,
        product_service: category,
        domain: domainValue,
      });
      const schemaName = result?.tenant?.schema_name;
      if (schemaName) {
        localStorage.setItem("store_slug", schemaName);
      }

      navigate("/setup-store-contact");
    } catch (err) {
      console.error("❌ Failed to setup store:", err);
      const responseData = axios.isAxiosError(err)
        ? (err.response?.data as
            | {
                error?: string;
                message?: string;
                detail?: string | Record<string, unknown> | string[];
              }
            | undefined)
        : undefined;

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
      showError(
        "Store Creation Failed",
        backendMessage
      );
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
      <h2 className="text-4xl font-semibold text-[#6A3CB1] mb-8 text-center">
        Setup Your Store
      </h2>

      {/* Card */}
      <div
        className="p-12 rounded-2xl bg-transparent backdrop-blur-sm border border-white/50 
        shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] flex flex-col items-center text-center gap-8 z-10"
        style={{
          width: "750px",
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
                className="w-full rounded-xl px-5 py-4 border border-gray-300 text-black placeholder:text-gray-500 
                focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg bg-transparent"
                required
              />
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
                className="w-full rounded-xl px-5 py-4 border border-gray-300 text-black
             placeholder:text-gray-500 bg-transparent
             focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg
             resize-none"
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
            </div>
          </div>

          {/* Domain */}

          <div className="w-full">
            <label className="block text-left text-sm font-medium text-[#719CBF] mb-2">
              Domain
            </label>

            {/* flex container → input + suffix */}
            <div className="flex items-center gap-2">
              {/* editable prefix */}
              <input
                type="text"
                name="domain"
                placeholder="my-store"
                value={formData.domain}
                onChange={handleChange}
                className="flex-1 rounded-l-xl px-5 py-4 border border-gray-300 border-r-0
           text-black placeholder:text-gray-500
           focus:outline-none focus:ring-2 focus:ring-purple-400
           text-lg bg-transparent"
                required
              />

              {/* locked suffix */}
              <span
                className="px-4 py-4 border-y border-r border-gray-300 rounded-r-xl
                     bg-white/10 text-black select-none"
              >
                .shopsynco.com
              </span>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#719CBF] text-white py-4 px-6 rounded-xl text-lg font-semibold 
            hover:bg-[#5c91c4] transition duration-300 mt-6 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}
