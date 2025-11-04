import { useState, useEffect } from "react";
import { ArrowUpRight, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  fetchSubscriptionHistory,
  fetchSubscriptionStatus,
  fetchTenantDashboard,
} from "../api/subscription/statusapi";
import FeatureStorePage from "./subscription/featureModal";
import Header from "../components/dashboardHeader";


export default function Dashboard() {
  const [isFeatureStoreOpen, setIsFeatureStoreOpen] = useState(false);

  const [userData, setUserData] = useState({
    user_name: "",
    user_email: "",
  });

  const [planData, setPlanData] = useState({
    plan_name: "",
    renew_date: "",
    status: "",
  });

  const [historyData, setHistoryData] = useState({
    last_payment_amount: "",
    last_payment_date: "",
    payment_method: "",
    next_renewal_amount: "",
    next_renewal_date: "",
  });

  const [tenantData, setTenantData] = useState({
    domain: "",
    features: [] as string[],
  });

  const navigate = useNavigate();

  useEffect(() => {
    const getDashboardData = async () => {
      try {
        // ✅ Fetch all in parallel
        const [status, history, tenant] = await Promise.all([
          fetchSubscriptionStatus(),
          fetchSubscriptionHistory(),
          fetchTenantDashboard(),
        ]);

        // ✅ Extract + normalize user + plan info
        const user_name =
          status?.user_name || localStorage.getItem("user_name") || "";
        const user_email =
          status?.user_email || localStorage.getItem("user_email") || "";

        setUserData({ user_name, user_email });

        setPlanData({
          plan_name: status?.plan_name || tenant?.selected_plan || "",
          renew_date: status?.renew_date || tenant?.renew_date || "",
          status: status?.status || tenant?.subscription_status || "",
        });

        setHistoryData({
          last_payment_amount:
            history?.last_payment_amount || tenant?.last_payment_amount || "",
          last_payment_date:
            history?.last_payment_date || tenant?.last_payment_date || "",
          payment_method:
            history?.payment_method || tenant?.payment_method || "",
          next_renewal_amount:
            history?.next_renewal_amount || tenant?.next_renewal_amount || "",
          next_renewal_date:
            history?.next_renewal_date || tenant?.next_renewal_date || "",
        });

        setTenantData({
          domain: tenant?.domain || "yourcompany.shopsynco.com",
          features:
            tenant?.features?.length > 0
              ? tenant.features
              : [
                  "Online Store Builder",
                  "Product Management",
                  "Integrated Payment Gateway",
                  "Order & Shipping Management",
                  "Domain & Hosting",
                  "Support & Security",
                  "Email & Notification System",
                ],
        });

        // ✅ Cache user info
        localStorage.setItem("user_name", user_name);
        localStorage.setItem("user_email", user_email);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
    };

    getDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-800 relative">
      {/* ✅ Dynamic Header */}
      <Header />

      {/* MAIN DASHBOARD */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-10 flex flex-col gap-8">
        {/* WELCOME SECTION */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">
              Welcome, {userData.user_name || "Loading..."}
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
                <span className="text-[#6A3CB1] font-semibold">
                  {planData.plan_name || "Loading..."}
                </span>
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Renews yearly on{" "}
              <span className="text-[#6A3CB1] font-medium">
                {planData.renew_date || "—"}
              </span>
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
              {planData.status && (
                <p className="text-xs mt-1 text-green-600 font-medium">
                  {planData.status}
                </p>
              )}
            </div>

            {/* DOMAIN */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 border-b border-gray-200 pb-4">
              <div>
                <p className="font-medium text-gray-700 mb-1">🌐 Your Domain</p>
                <a
                  href={`https://${tenantData.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#6A3CB1] hover:underline text-sm break-all"
                >
                  {tenantData.domain}
                </a>
              </div>
              <button className="text-xs bg-white border border-gray-300 rounded-lg px-3 py-1 hover:bg-gray-50 whitespace-nowrap">
                Go To SaaS Dashboard ↗
              </button>
            </div>

            {/* BILLING + PLAN FEATURES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* LEFT */}
              <div className="space-y-6">
                <div>
                  <p className="flex items-center gap-2 font-semibold text-gray-700">
                    <span className="text-[#6A3CB1] text-lg">📄</span> Billing
                    Summary
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Last payment: ₹{historyData.last_payment_amount || "—"} on{" "}
                    {historyData.last_payment_date
                      ? new Date(
                          historyData.last_payment_date
                        ).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
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
                    {historyData.payment_method || "—"}
                  </p>
                </div>

                <div>
                  <p className="flex items-center gap-2 font-semibold text-gray-700">
                    <span className="text-[#6A3CB1] text-lg">📅</span> Next
                    Renewal
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Next payment: ₹{historyData.next_renewal_amount || "—"} on{" "}
                    {historyData.next_renewal_date
                      ? new Date(
                          historyData.next_renewal_date
                        ).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
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
                  {tenantData.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>

                <button
                  className="bg-[#6A3CB1] text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-[#5b32a2] transition"
                  onClick={() => {
                    if (window.innerWidth < 1024) {
                      navigate("/feature-store");
                    } else {
                      setIsFeatureStoreOpen(true);
                    }
                  }}
                >
                  Browse Feature Store
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex flex-col gap-6">
            <div className="rounded-2xl bg-gradient-to-br from-[#9A8CFC] to-[#6A9ECF] p-6 text-white shadow-md">
              <h3 className="text-lg font-semibold mb-2">Upgrade Your Plan</h3>
              <p className="text-sm mb-4 opacity-90">
                Get access to advanced features and increase your usage limits
                by upgrading to our premium plans.
              </p>
              <button
                className="bg-white text-[#6A3CB1] w-full py-2 rounded-lg font-semibold hover:bg-gray-100 transition"
                onClick={() => navigate("/plans")}
              >
                View Upgrade Options
              </button>
              <p className="text-xs mt-3 opacity-90">
                Upgrade today and get 20% off your first 3 months!
              </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#c9b8ff] p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-[#6A3CB1] mb-4">
                Quick Access
              </h3>
              <div className="flex flex-col gap-3">
                <button
                  className="flex justify-between items-center border rounded-lg px-4 py-3 hover:bg-gray-50 transition text-gray-700 font-medium"
                  onClick={() => navigate("/manage-billing")}
                >
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

      {isFeatureStoreOpen && (
        <FeatureStorePage onClose={() => setIsFeatureStoreOpen(false)} />
      )}
    </div>
  );
}
