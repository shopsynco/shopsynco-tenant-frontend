import React, { useEffect, useState } from "react";
import bgImage from "../../../assets/backgroundsuccess.png";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StoreSuccessPage: React.FC = () => {
  const [dashboardUrl, setDashboardUrl] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    // Get store slug from localStorage
    const storeSlug = localStorage.getItem("store_slug");
    if (storeSlug) {
      setDashboardUrl(`https://${storeSlug}.shopsynco.com`);
    } else {
      // If no slug, redirect to dashboard
      setDashboardUrl("/dashboard");
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(dashboardUrl);
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen bg-white overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Floating confetti / shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <img
            src="/confetti.svg"
            alt="confetti"
            className="w-full h-full object-cover opacity-70"
          />
        </div>
      </div>

      {/* Center Card */}
      <div className="relative z-10 w-[90%] max-w-md bg-gradient-to-r from-[#719CBF]/10 via-[#719CBF]/10 to-[#719CBF]/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="text-green-500 w-10 h-10" />
          </div>

          <h2 className="text-2xl font-semibold text-gray-800">
            Store Created Successfully
          </h2>

          <p className="text-gray-600">Your dashboard is ready at</p>

          <div className="flex items-center justify-between bg-gray-100 rounded-lg px-3 py-2 w-full text-gray-700 font-mono">
            <span className="truncate">{dashboardUrl}</span>
            <button
              onClick={handleCopy}
              className="text-blue-600 hover:text-blue-800 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16.5v1.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0020 18v-7.5A2.25 2.25 0 0017.75 8h-1.5M8 16.5H6.75A2.25 2.25 0 014.5 14.25v-7.5A2.25 2.25 0 016.75 4.5h7.5A2.25 2.25 0 0116.5 6.75V8M8 16.5h8.25"
                />
              </svg>
            </button>
          </div>

          <button
            onClick={() => {
              if (dashboardUrl.startsWith("http")) {
                window.location.href = dashboardUrl;
              } else {
                navigate(dashboardUrl);
              }
            }}
            className="w-full bg-[#6A3CB1] hover:bg-[#5a2d9d] text-white py-3 rounded-lg font-medium transition"
          >
            Go to Dashboard
          </button>

          <p className="text-sm text-gray-500">
            You can always access your dashboard from your email confirmation or
            by signing in to our website.
          </p>
        </div>
      </div>

      {/* Logo */}
      <div className="absolute top-6 left-6">
        <img src="/logo.svg" alt="ShopSynco" className="w-28" />
      </div>
    </div>
  );
};

export default StoreSuccessPage;
