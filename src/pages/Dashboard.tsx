import React, { useState } from "react";
import { Bell, LogOut, ArrowUpRight, ArrowLeft, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Name-Logo.png";

export default function Dashboard() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const notifications = [
    {
      title: "New Feature Available",
      text: "Explore Smart Analytics – now in your dashboard.",
      time: "1 hour ago",
    },
    {
      title: "Payment Method Updated",
      text: "Your saved payment details were successfully updated.",
      time: "3 hours ago",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-800 relative">
      {/* HEADER */}
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img src={logo} alt="ShopSynco" className="h-8" />
        </div>

        <div className="flex items-center gap-4 relative">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setNotifOpen(!notifOpen);
                setProfileOpen(false);
              }}
              className="p-2 rounded-full hover:bg-gray-100 relative"
            >
              <Bell size={20} className="text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#6A3CB1] rounded-full"></span>
            </button>

            {notifOpen && (
              <div className="hidden lg:block absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700">
                    Notifications
                  </h3>
                  <button className="text-xs text-[#6A3CB1] hover:underline font-medium">
                    Clear All
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                  {notifications.map((n, i) => (
                    <div
                      key={i}
                      className="px-4 py-3 hover:bg-gray-50 text-sm text-gray-700"
                    >
                      <p className="font-semibold">{n.title}</p>
                      <p className="text-xs text-gray-500">{n.text}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{n.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setNotifOpen(false);
              }}
              className="flex items-center gap-3 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-100 transition bg-gray-50"
            >
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-800">
                  Manoj Basker
                </p>
                <p className="text-xs text-gray-500">Manoj123@gmail.com</p>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-4 h-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-md rounded-lg py-2 border border-gray-100 z-50">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE NOTIFICATION PAGE */}
      {notifOpen && (
        <div className="fixed inset-0 bg-white z-50 p-6 overflow-y-auto lg:hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setNotifOpen(false)}
                className="p-2 rounded-md hover:bg-gray-100"
              >
                <ArrowLeft size={20} />
              </button>
              <h3 className="text-lg font-semibold text-gray-800">
                Notifications
              </h3>
            </div>
            <button className="text-sm text-[#6A3CB1] hover:underline font-medium">
              Clear All
            </button>
          </div>

          <div className="flex flex-col gap-4">
            {notifications.map((n, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-xl p-4 shadow-sm hover:bg-gray-50"
              >
                <p className="font-semibold text-gray-800">{n.title}</p>
                <p className="text-sm text-gray-500 mt-1">{n.text}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-400">{n.time}</span>
                  <button className="text-xs text-[#6A3CB1] font-medium hover:underline">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MAIN DASHBOARD */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-10 flex flex-col gap-8">
        {/* WELCOME SECTION */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              Welcome, Manoj!
            </h1>
            <p className="text-gray-500">
              Here’s an overview of your account and subscription.
            </p>
          </div>

          <div className="bg-[#F5F1FF] border border-[#E2DAFF] rounded-2xl px-6 py-4 shadow-sm w-full sm:w-auto lg:min-w-[280px]">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-gray-600" />
              <p className="text-sm text-gray-700">
                <span className="font-medium text-gray-800">Current Plan:</span>{" "}
                <span className="text-[#6A3CB1] font-semibold">Starter</span>
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Renews yearly on{" "}
              <span className="text-[#6A3CB1] font-medium">Aug 25</span>
            </p>
          </div>
        </div>

        {/* ACCOUNT SUMMARY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT SIDE */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#c9b8ff] shadow-sm p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
              <h2 className="text-lg font-semibold text-[#6A3CB1]">
                Account Summary
              </h2>
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                Active
              </span>
            </div>

            {/* DOMAIN */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 border-b border-gray-200 pb-4">
              <div>
                <p className="font-medium text-gray-700 mb-1">🌐 Your Domain</p>
                <a
                  href="#"
                  className="text-[#6A3CB1] hover:underline text-sm break-all"
                >
                  yourcompany.shopsynco.com
                </a>
              </div>
              <button className="text-xs bg-white border border-gray-300 rounded-lg px-3 py-1 hover:bg-gray-50 whitespace-nowrap">
                Go To SaaS Dashboard ↗
              </button>
            </div>

            {/* BILLING + PLAN FEATURES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10  ">
              {/* LEFT */}
              <div className="space-y-6">
                <div>
                  <p className="flex items-center gap-2 font-semibold text-gray-700">
                    <span className="text-[#6A3CB1] text-lg">📄</span> Billing
                    Summary
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Last payment: ₹1899 on Aug 25, 2025
                  </p>
                  <button className="mt-2 text-xs sm:text-sm flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md text-[#6A3CB1] hover:bg-[#F5F1FF] transition font-medium">
                    Download Invoice
                  </button>
                </div>

                <div>
                  <p className="flex items-center gap-2 font-semibold text-gray-700">
                    <span className="text-[#6A3CB1] text-lg">💳</span> Payment
                    Method
                  </p>
                  <p className="text-green-600 font-semibold text-sm mt-1">
                    VISA **** **** **** 4526
                  </p>
                </div>

                <div>
                  <p className="flex items-center gap-2 font-semibold text-gray-700">
                    <span className="text-[#6A3CB1] text-lg">📅</span> Next
                    Renewal
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Next payment: ₹1899 on Aug 25, 2026
                  </p>
                </div>
              </div>

              {/* RIGHT */}
              <div>
                <p className="flex items-center gap-2 font-semibold text-gray-700 mb-2">
                  <span className="text-[#6A3CB1] text-lg">🧱</span> Plan
                  Features
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-3">
                  <li>Online Store Builder</li>
                  <li>Product Management</li>
                  <li>Integrated Payment Gateway</li>
                  <li>Order & Shipping Management</li>
                  <li>Domain & Hosting</li>
                  <li>Support & Security</li>
                  <li>Email & Notification System</li>
                </ul>

                <p className="text-sm text-[#6A3CB1] mt-3 font-semibold">
                  Add-Ons
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
                  <li>Customer Management</li>
                  <li>Store Analytics Dashboard</li>
                  <li>App & Plugin Integration (Basic Tier)</li>
                </ul>

                <button className="bg-[#6A3CB1] text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-[#5b32a2] transition">
                  Browse Feature Store
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col gap-6">
            {/* UPGRADE PLAN */}
            <div className="rounded-2xl bg-gradient-to-br from-[#9A8CFC] to-[#6A9ECF] p-6 text-white shadow-md">
              <h3 className="text-lg font-semibold mb-2">Upgrade Your Plan</h3>
              <p className="text-sm mb-4 opacity-90">
                Get access to advanced features and increase your usage limits
                by upgrading to our premium plans.
              </p>
              <button className="bg-white text-[#6A3CB1] w-full py-2 rounded-lg font-semibold hover:bg-gray-100 transition">
                View Upgrade Options
              </button>
              <p className="text-xs mt-3 opacity-90">
                Upgrade today and get 20% off your first 3 months!
              </p>
            </div>

            {/* QUICK ACCESS */}
            <div className="bg-white rounded-2xl border border-[#c9b8ff] p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[#6A3CB1] mb-4">
                Quick Access
              </h3>
              <div className="flex flex-col gap-3">
                <button className="flex justify-between items-center border rounded-lg px-4 py-3 hover:bg-gray-50 transition text-gray-700 font-medium">
                  Manage Billing <ArrowUpRight className="h-4 w-4" />
                </button>
                <button className="flex justify-between items-center border rounded-lg px-4 py-3 hover:bg-gray-50 transition text-gray-700 font-medium">
                  View Invoices <ArrowUpRight className="h-4 w-4" />
                </button>
                <button className="flex justify-between items-center border rounded-lg px-4 py-3 hover:bg-gray-50 transition text-gray-700 font-medium">
                  Give Feedback <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
