import { Link } from "react-router-dom";
import bgImage from "../../../assets/backgroundsuccess.png";
import { CheckCircle } from "lucide-react";

export default function PaymentSuccessPage() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center px-6 py-10"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",  // Make sure the background covers the entire screen
        backgroundPosition: "center",  // Center the background image
        backgroundRepeat: "no-repeat", // Prevent background repetition
      }}
    >
      {/* ShopSynco Logo */}
      <div className="absolute top-6 left-6">
        <img src="/logo.svg" alt="ShopSynco" className="w-36" />
      </div>

      {/* Success Modal with Glassmorphism Effect */}
       <div className="relative z-10 w-[90%] max-w-md bg-gradient-to-r from-[#719CBF]/30 via-[#719CBF]/30 to-[#719CBF]/30 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="text-green-500 w-10 h-10" />
          </div>
        </div>
        <h2 className="text-3xl font-semibold text-gray-800 mb-4">
          Payment Successful!
        </h2>
        <p className="text-gray-600 mb-6">
          Great! Your journey begins here. Time to set up your store and make it shine.
        </p>
        <Link
          to="/setup-store"
          className="bg-blue-600 text-white py-3 px-6 rounded-full text-lg font-semibold hover:bg-blue-700 transition duration-300"
        >
          Set Up My Store
        </Link>
      </div>
    </div>
  );
}
