import React from "react";
import bgImage from "../../../assets/backgroundstore.png"; // background image

const StoreSetupContactPage: React.FC = () => {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-10 relative bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${bgImage})`, // Use your background image path
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Store Setup Title - OUTSIDE the glass card */}
      <h2 className="text-4xl font-semibold text-center text-[#6A3CB1] mb-8">
        Setup Your Store
      </h2>

      {/* Glassmorphic Card with Wider Width */}
      <div
        className="max-w-7xl mx-auto p-8 bg-white/60 backdrop-blur-md border border-white/30 rounded-2xl shadow-xl"
        style={{
          maxWidth: "90%", // Adjusted to fit more on smaller screens
          width: "750px", // Set a custom width for form container
        }}
      >
        {/* Inner Title */}
        <h3 className="text-2xl font-semibold text-[#719CBF] mb-6 text-center">
          Location & Contact
        </h3>

        <form>
          {/* Location & Contact Section */}
          <div className="space-y-6">
            <div>
              <label
                htmlFor="business-address"
                className="block text-lg font-medium text-gray-700"
              >
                Business Address
              </label>
              <input
                type="text"
                id="business-address"
                placeholder="Enter your business address"
                className="w-full p-4 mt-2 text-sm text-gray-700 bg-white/60 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-[#6A3CB1] focus:border-[#6A3CB1]"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="country"
                  className="block text-lg font-medium text-gray-700"
                >
                  Country / Region
                </label>
                <select
                  id="country"
                  className="w-full p-4 mt-2 text-sm text-gray-700 bg-white/60 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-[#6A3CB1] focus:border-[#6A3CB1]"
                >
                  <option>Select</option>
                  <option>United States</option>
                  <option>India</option>
                  <option>Australia</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="state-city"
                  className="block text-lg font-medium text-gray-700"
                >
                  State / City
                </label>
                <input
                  type="text"
                  id="state-city"
                  placeholder="Enter your state or city"
                  className="w-full p-4 mt-2 text-sm text-gray-700 bg-white/60 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-[#6A3CB1] focus:border-[#6A3CB1]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="contact-email"
                className="block text-lg font-medium text-gray-700"
              >
                Contact Email
              </label>
              <input
                type="email"
                id="contact-email"
                placeholder="Enter your contact email"
                className="w-full p-4 mt-2 text-sm text-gray-700 bg-white/60 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-[#6A3CB1] focus:border-[#6A3CB1]"
              />
            </div>

            <div>
              <label
                htmlFor="contact-number"
                className="block text-lg font-medium text-gray-700"
              >
                Contact Number
              </label>
              <input
                type="text"
                id="contact-number"
                placeholder="Enter your phone number"
                className="w-full p-4 mt-2 text-sm text-gray-700 bg-white/60 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-[#6A3CB1] focus:border-[#6A3CB1]"
              />
            </div>

            <div className="text-center mt-6">
              <button
                type="submit"
                className="w-full bg-[#6A3CB1] text-white py-4 rounded-lg font-medium shadow-md hover:bg-[#5a2d9d] transition"
              >
                Create My Store
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StoreSetupContactPage;
