import { useState } from "react";
import { useNavigate } from "react-router-dom";
import bgImage from "../../../assets/backgroundstore.png"; // background image

interface FormData {
  storeName: string;
  category: string;
  domain: string;
}

export default function StoreSetupPage() {
  const [formData, setFormData] = useState<FormData>({
    storeName: "",
    category: "",
    domain: "",
  });
  
  const navigate = useNavigate();
   
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, category: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic
    navigate("/setup-store-contact"); // Navigate after form submission
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-10 relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${bgImage})`,
      }}
    >
      {/* Logo */}
      <div className="absolute top-6 left-6">
        <img src="/logo.svg" alt="ShopSynco" className="w-36" />
      </div>

      {/* Store Setup Title - OUTSIDE the glass card */}
      <h2 className="text-4xl font-semibold text-[#6A3CB1] mb-8 text-center">
        Setup Your Store
      </h2>

      {/* Glassmorphic Card */}
      <div
        className="p-12 rounded-2xl bg-transparent backdrop-blur-sm border border-white/50 
        shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] flex flex-col items-center text-center gap-8 z-10"
        style={{
          width: "750px", // Increased width for longer inputs
          background:
            "linear-gradient(112.13deg, rgba(113,156,191,0.25) 98.3%), rgba(113,156,191,0.25) 98.3%)",
        }}
      >
        {/* Inner Title */}
        <h3 className="text-2xl font-semibold text-[#719CBF]">
          Basic Store Details
        </h3>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-6 w-full mx-auto"
        >
          {/* Store Name + Category with labels */}
          <div className="w-full">
            <div className="flex flex-col md:flex-row gap-6 w-full mb-2">
              <div className="flex-1">
                <label className="block text-left text-sm font-medium text-gray-700 mb-2">
                  Company / Store Name
                </label>
                <input
                  type="text"
                  name="storeName"
                  placeholder="Your Store Home"
                  value={formData.storeName}
                  onChange={handleChange}
                  className="w-full rounded-xl px-5 py-4 border border-gray-300 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg"
                  required
                />
              </div>
              <div className="flex-1">
                <label className="block text-left text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleCategoryChange}
                  className="w-full rounded-xl px-5 py-4 border border-gray-300 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="electronics">Electronics</option>
                  <option value="fashion">Fashion</option>
                  <option value="beauty">Beauty</option>
                  <option value="home">Home</option>
                </select>
              </div>
            </div>
          </div>

          {/* Domain with label */}
          <div className="w-full">
            <label className="block text-left text-sm font-medium text-gray-700 mb-2">
              Domain
            </label>
            <div className="flex gap-4 w-full">
              <input
                type="text"
                name="domain"
                placeholder="Your Domain"
                value={formData.domain}
                onChange={handleChange}
                className="flex-1 rounded-xl px-5 py-4 border border-gray-300 text-black placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-400 text-lg"
                required
              />
              <button
                type="button"
                onClick={() => {}}
                className="rounded-xl bg-[#6A9ECF] hover:bg-[#5c91c4] text-white font-medium transition px-8 py-4 whitespace-nowrap text-lg"
              >
                Check Customers
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#719CBF] text-white py-4 px-6 rounded-xl text-lg font-semibold hover:bg-[#5c91c4] transition duration-300 mt-6"
          >
            Next
          </button>
        </form>
      </div>
    </div>
  );
}
