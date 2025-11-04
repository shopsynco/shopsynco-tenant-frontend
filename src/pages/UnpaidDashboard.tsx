import Header from "../../components/dashboardHeader";
import { AlertTriangle } from "lucide-react";

export default function UnpaidDashboard() {
  return (
    <div className="min-h-screen bg-[#FAF9FF]">
      <Header />

      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        {/* LEFT SIDE */}
        <div>
          {/* Greeting */}
          <h1 className="text-3xl font-semibold text-gray-900 mb-3">
            Welcome, Manoj!
          </h1>

          {/* Warning Banner */}
          <div className="flex items-center gap-2 bg-[#FFF7E6] text-[#C07000] border border-[#FFE7B8] rounded-lg px-4 py-3 text-sm mb-6">
            <AlertTriangle size={18} />
            <p>
              Your subscription is not active — complete your payment to start using{" "}
              <span className="font-medium text-gray-900">ShopSynco</span>.
            </p>
          </div>

          {/* Subscription Box */}
          <div className="bg-white border border-[#D8CFFC] rounded-2xl shadow-sm p-8">
            <h2 className="text-[#6A3CB1] font-semibold text-lg mb-2">
              Complete Your Subscription
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              You’re just one step away from accessing all ShopSynco features.
            </p>

            <div className="border border-[#E8E4F7] bg-[#F9F8FF] rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-5">
                <div>
                  <p className="text-base text-gray-700">
                    Selected Plan:{" "}
                    <span className="font-semibold text-[#6A3CB1]">Starter</span>
                  </p>
                </div>
                <p className="text-[#6A3CB1] font-bold text-xl mt-2 sm:mt-0">
                  ₹1899
                  <span className="text-sm font-medium text-gray-500">/month</span>
                </p>
              </div>

              <ul className="space-y-2 text-sm text-gray-600 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-[#6A3CB1]">✓</span> Up to 30 Rooms
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#6A3CB1]">✓</span> Manager dashboard only
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#6A3CB1]">✓</span> Email Support
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#6A3CB1]">✓</span> Room Status Tracking
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#6A3CB1]">✓</span> Basic Staff Management
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[#6A3CB1]">✓</span> Basic Reporting
                </li>
              </ul>

              <div className="flex flex-col sm:flex-row gap-3">
                <button className="flex-1 py-2.5 text-sm border border-[#6A3CB1] text-[#6A3CB1] rounded-lg font-medium hover:bg-[#F3EEFF] transition">
                  Change Plan
                </button>
                <button className="flex-1 py-2.5 text-sm bg-[#6A3CB1] text-white rounded-lg font-medium hover:bg-[#5b32a2] transition">
                  Complete Payment Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="space-y-6">
          {/* Domain Card */}
          <div className="bg-[#F6F3FF] border border-[#E1DAFA] rounded-2xl p-6 shadow-sm">
            <h3 className="text-[#6A3CB1] font-semibold mb-2">
              Your Selected Domain
            </h3>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value="yourcompany.shopsynco.com"
                readOnly
                className="flex-1 text-sm border border-[#D8CFFC] rounded-md px-3 py-2 text-gray-700 bg-white focus:outline-none"
              />
              <button className="text-xs bg-[#6A3CB1] text-white px-3 py-2 rounded-md hover:bg-[#5b32a2] transition">
                Change
              </button>
            </div>
            <p className="text-xs text-red-500 font-medium">
              We’ll hold this domain for 48 hours. Complete payment to secure it.
            </p>
          </div>

          {/* Support Card */}
          <div className="bg-white border border-[#D8CFFC] rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <div className="text-[#6A3CB1] text-lg">❓</div>
              <div>
                <h4 className="text-gray-900 font-semibold mb-1">
                  Need help with payment?
                </h4>
                <p className="text-sm text-gray-500 mb-3 leading-relaxed">
                  Our support team is ready to assist you with any questions
                  about your subscription.
                </p>
                <button className="text-sm font-medium text-[#6A3CB1] hover:underline">
                  Contact Support →
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
