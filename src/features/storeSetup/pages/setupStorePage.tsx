import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../../../assets/backgroundstore.png";
import { storeSetup } from "../../../api/mainapi/StoreCreateapi";

interface FormData {
  store_name: string;
  product_service: string;
  domain: string;
}

export default function StoreSetupPage() {
  const [formData, setFormData] = useState<FormData>({
    store_name: "",
    product_service: "",
    domain: "",
  });

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Submit handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);
      const result = await storeSetup(formData);
      console.log("✅ Store created:", result);

      // 🟢 No slug stored here — email will be added on next page
      navigate("/setup-store-contact");
    } catch (err) {
      console.error("❌ Failed to setup store:", err);
      alert("Failed to create store. Please check inputs or server.");
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
        <img src="/logo.svg" alt="ShopSynco" className="w-36" />
      </div>

      {/* Title */}
      <h2 className="text-4xl font-semibold text-[#6A3CB1] mb-8 text-center">
        Setup Your Store
      </h2>

      {/* Card */}
      <div
        className="p-12 rounded-2xl bg-transparent backdrop-blur-sm border border-white/50 
        shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] flex flex-col items-center text-center gap-8 z-10"
        style={{ width: "750px" }}
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
              <label className="block text-left text-sm font-medium text-gray-700 mb-2">
                Company / Store Name
              </label>
              <input
                type="text"
                name="store_name"
                placeholder="Your Store Home"
                value={formData.store_name}
                onChange={handleChange}
                className="w-full rounded-xl px-5 py-4 border border-gray-300 text-black placeholder:text-gray-500 
                focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg"
                required
              />
            </div>

            {/* Category (changed to input field) */}
            <div className="flex-1">
              <label className="block text-left text-sm font-medium text-gray-700 mb-2">
                Category / Service Type
              </label>
              <input
                type="text"
                name="product_service"
                placeholder="e.g., Fashion, Cleaning, Retail..."
                value={formData.product_service}
                onChange={handleChange}
                className="w-full rounded-xl px-5 py-4 border border-gray-300 text-black placeholder:text-gray-500 
                focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg"
                required
              />
            </div>
          </div>

          {/* Domain */}
          <div className="w-full">
            <label className="block text-left text-sm font-medium text-gray-700 mb-2">
              Domain
            </label>
            <input
              type="text"
              name="domain"
              placeholder="mystore.shopsynco.com"
              value={formData.domain}
              onChange={handleChange}
              className="w-full rounded-xl px-5 py-4 border border-gray-300 text-black placeholder:text-gray-500 
              focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg"
              required
            />
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
