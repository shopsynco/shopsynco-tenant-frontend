// src/pages/auth/components/AuthLayout.tsx
import React from "react";
import bgImage from "../../../assets/authbackground.png";
import shopLogo from "../../../assets/Name-Logo.png";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative flex w-full min-h-screen items-center bg-fixed"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* overlay to darken/lighten background for readability */}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent"
      />

      {/* Top-left Logo */}
      <div className="absolute top-6 left-6 z-20">
        <img
          src={shopLogo}
          alt="ShopSynco Logo"
          className="w-36 h-auto object-contain"
        />
      </div>

      {/* Two-column layout: responsive */}
      <div className="relative z-20 w-full max-w-6xl mx-auto px-6 lg:px-10 py-16">
        <div className="flex flex-col-reverse lg:flex-row gap-12 items-center">
          {/* LEFT - marketing text */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center items-start">
            <h1 className="text-4xl lg:text-5xl font-extrabold font-poppins text-[#4A3B5E] leading-tight mb-4">
              <span className="block">START FRESH.</span>
              <span className="block">DREAM BOLD.</span>
            </h1>

            <p className="text-gray-700 max-w-lg mb-6 font-raleway">
              ShopSynco is where ideas turn into businesses. Whether you’re
              opening your first store or scaling your tenth, we help you build,
              connect, and grow — all in one place.
              <span className="block mt-2 text-sm text-gray-600">
                Your journey to something bigger starts here.
              </span>
            </p>

            <button
              className="px-6 py-2 bg-[#7658A033] text-[#7658A0] font-semibold rounded-full 
                border border-[#7658A033] shadow-md hover:bg-[#7658A040] 
                transition-colors duration-300 font-raleway"
              onClick={() => window.open("/", "_blank")}
            >
              Visit Website
            </button>
          </div>

          {/* RIGHT - dynamic panel for auth forms */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="w-full max-w-md">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
