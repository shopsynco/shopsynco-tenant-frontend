import { useState } from "react";
import { Plus, CreditCard, Clock } from "lucide-react";
import { AddCardModal } from "./AddPaymentMethodModal";
import Header from "./dashboardHeader";

export default function ManageBillingPage() {
  const [showAddMethod, setShowAddMethod] = useState(false);

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <Header />
      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Breadcrumbs */}
        <p className="text-sm text-gray-500 mb-2">
          Dashboard <span className="mx-1">›</span> Manage Billing
        </p>

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">
            Manage Billing
          </h1>
        </div>

        {/* Billing Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
          {/* Left Section */}
          <div className="space-y-8">
            {/* Billing Period */}
            <div className="rounded-2xl border border-[#E5E0FA] bg-[#F6F3FF] p-6">
              <p className="text-base font-semibold text-[#6A3CB1] flex items-center gap-2">
                Billing Period:{" "}
                <span className="font-medium text-[#6A3CB1]">Yearly</span>
              </p>
              <div className="flex items-center gap-2 mt-2 text-gray-600 text-sm">
                <Clock size={15} className="text-[#6A3CB1]" />
                <span>Next Renewal: Aug 25, 2026</span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl border border-[#E8E4F7] shadow-sm p-6 space-y-5">
              <h3 className="text-base font-semibold text-[#6A3CB1]">
                Payment Method
              </h3>

              <div className="flex items-center justify-between bg-[#F9F8FF] border border-[#E9E4FB] rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <CreditCard size={28} className="text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-800">
                      VISA **** 4564
                    </p>
                    <p className="text-sm text-gray-500">
                      Expires on Sep 20, 2026
                    </p>
                  </div>
                </div>
                <button className="px-4 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition">
                  Update
                </button>
              </div>

              <div className="pt-2 text-sm text-gray-700 border-t border-gray-200">
                <p className="font-medium mt-3">Manoj Boskar</p>
                <p className="text-xs mt-1 text-gray-500 leading-relaxed">
                  Gandhi Nagar road, Kadavanthra, Kochi, Kerala 682020
                </p>
                <button className="text-[#6A3CB1] text-xs font-medium mt-2 hover:underline">
                  Edit Billing Address
                </button>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setShowAddMethod(true)}
                  className="flex items-center gap-2 bg-[#6A3CB1] text-white text-sm px-5 py-2.5 rounded-lg hover:bg-[#5b32a2] transition"
                >
                  <Plus size={16} /> Add Payment Method
                </button>
              </div>
            </div>
          </div>

          {/* Right Section - Billing History */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-[#E8E4F7] shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-[#6A3CB1]">
                  Billing History
                </h3>
                <button className="text-sm font-medium text-[#6A3CB1] hover:underline">
                  View All
                </button>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-700">
                  <span>Aug 25, 2025</span>
                  <span>₹1899</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Aug 25, 2024</span>
                  <span>₹1899</span>
                </div>
              </div>
            </div>

            {/* Help Box */}
            <div className="rounded-2xl border border-[#E8E4F7] bg-white p-6 text-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[#6A3CB1] text-lg">❓</span>
                <h4 className="font-semibold text-gray-800">
                  Need help with billing?
                </h4>
              </div>
              <p className="text-sm text-gray-500 mb-3 leading-relaxed">
                Our support team is ready to assist you with any questions about
                your subscription.
              </p>
              <button className="text-sm font-medium text-[#6A3CB1] hover:underline">
                Contact Support →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Payment Method Modal */}
      {showAddMethod && (
        <AddCardModal onClose={() => setShowAddMethod(false)} />
      )}
    </div>
  );
}
