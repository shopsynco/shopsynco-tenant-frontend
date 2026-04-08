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
      {/* subtle overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-transparent" />

      {/* top-left logo */}
      <div className="absolute top-6 left-6 z-20">
        <img
          src={shopLogo}
          alt="ShopSynco Logo"
          className="w-36 h-auto object-contain"
        />
      </div>

      <div className="relative z-20 w-full max-w-6xl mx-auto px-6 lg:px-10 py-16">
        <div className="flex flex-col-reverse lg:flex-row gap-12 items-center">
          {/* LEFT - marketing block */}

          <div className="w-full lg:w-1/2 flex flex-col items-center text-center lg:mr-2">
            <h1 className="text-display-lg font-poppins bg-purple-gradient bg-clip-text text-transparent">
              START FRESH
              <br />
              DREAM BOLD
            </h1>

            <p className="max-w-xl mt-4 font-raleway text-[#7658A0]">
              ShopSynco is where ideas turn into businesses.
              <br />
              Whether you’re opening your first store or scaling your tenth,
              <br />
              we help you build, connect, and grow — all in one place.
              <br />
              <span className="block mt-2 text-sm text-[#7658A0]">
                Your journey to something bigger starts here.
              </span>
            </p>

            <button
              onClick={() => window.open("/", "_blank")}
              className="mt-6 rounded-full bg-[rgba(118,88,160,0.2)]
             text-purple-600 font-semibold font-raleway
             h-[71px] px-[46px] py-[24px]
             transition-colors duration-300 hover:bg-[rgba(118,88,160,0.3)]"
            >
              Visit Website
            </button>
          </div>

          {/* RIGHT - auth card */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="w-full max-w-md">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
