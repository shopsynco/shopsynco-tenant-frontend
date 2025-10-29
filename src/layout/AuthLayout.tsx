import bgImage from "../assets/authbackground.png";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative flex w-full min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* ✅ Top Left Logo */}
      <div className="absolute top-6 left-10 z-10">
        <img src="/logo.svg" alt="ShopSynco" className="w-36" />
      </div>

      {/* ✅ Two-column Layout */}
      <div className="flex w-full justify-between items-center -mt-10 px-20">
        {/* ✅ Left Section */}
        <div className="w-1/2 flex flex-col justify-center items-center">
          <h1 className="text-4xl font-extrabold text-purple-800 leading-snug text-center mb-4">
            START FRESH.
            <br />
            DREAM BOLD.
          </h1>

          <p className="text-gray-700 text-center max-w-md mb-8">
            ShopSynco is where ideas turn into businesses. Whether you’re
            opening your first store or scaling your tenth, we help you build,
            connect, and grow — all in one place.
            <br />
            <span className="block mt-2 text-sm text-gray-600">
              Your journey to something bigger starts here.
            </span>
          </p>

          <button
            className="px-6 py-2 bg-[#7658A033] text-[#7658A0] font-semibold rounded-full 
             border border-[#7658A033] shadow-md hover:bg-[#7658A040] 
             transition-colors duration-300"
          >
            Visit Website
          </button>
        </div>

        {/* ✅ Right Section - Dynamic (Login / Forgot Password etc.) */}
        <div className="w-1/2 flex justify-center">{children}</div>
      </div>
    </div>
  );
}
