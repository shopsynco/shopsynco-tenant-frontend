import { useState, useEffect } from "react";
import {
  ArrowUpRight,
  Clock,
  Globe,
  FileText,
  CreditCard,
  Calendar,
  Package,
  MessageSquare,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchTenantDashboard } from "../../../api/mainapi/statusapi";
import FeatureStorePage from "../components/FeatureModal";
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
        const tenant = await fetchTenantDashboard();
        const data = tenant?.dashboard || {};

        const user_name = data?.user_info?.name || "";
        const user_email = data?.user_info?.email || "";
        setUserData({ user_name, user_email });

        const plan_name = data?.current_plan?.name || "";
        const renew_date = data?.current_plan?.renewal_date || "";
        const status = data?.account_summary?.domain?.status || "";
        setPlanData({ plan_name, renew_date, status });

        setHistoryData({
          last_payment_amount: "—",
          last_payment_date: "—",
          payment_method: data?.payment_method || "—",
          next_renewal_amount: "—",
          next_renewal_date: renew_date || "—",
        });

        const domain = data?.account_summary?.domain?.name || "";
        const features =
          data?.plan_features?.included_features?.map((f: any) => f.name) || [];
        setTenantData({ domain, features });

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
      <Header />
      <main className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-10 flex flex-col gap-8">
        {/* WELCOME SECTION */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-semibold text-black">
              Welcome, {userData.user_name || "Loading..."}
            </h1>
            <p className="text-gray-500">
              Here’s an overview of your account and subscription.
            </p>
          </div>

          <div className="bg-[#F5F1FF] border border-[#E2DAFF] rounded-2xl px-6 py-4 shadow-sm w-full sm:w-auto lg:min-w-[280px]">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm text-gray-700">
                <span className="font-medium text-gray-800">Current Plan:</span>{" "}
                <span className="text-[#6A3CB1] font-semibold">
                  {planData.plan_name || "Loading..."}
                </span>
              </p>
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Clock size={16} className="text-gray-600" />
              Renews yearly on{" "}
              <span className="text-[#6A3CB1] font-medium ml-1">
                {planData.renew_date || "—"}
              </span>
            </p>
          </div>
        </div>

        {/* ACCOUNT SUMMARY */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-[#c9b8ff] shadow-sm p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
              <h2 className="text-lg font-semibold text-[#6A3CB1]">Account Summary</h2>
              {planData.status && (
                <p
                  className="text-xs font-medium text-white flex items-center justify-center"
                  style={{
                    backgroundColor: "#48BC2999",
                    width: 68,
                    height: 22,
                    borderRadius: 100,
                    padding: "6px 12px",
                    gap: 10,
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 500,
                    fontSize: 14,
                    lineHeight: "30px",
                    letterSpacing: 0,
                  }}
                >
                  {planData.status}
                </p>
              )}
            </div>

            {/* DOMAIN */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 border-b border-gray-200 pb-4">
              <div>
                <p className="flex items-center gap-2 font-semibold text-black">
                  <Globe size={20} className="text-[#8B6BB6]" />
                  Your Domain
                </p>
                <a
                  href={`https://${tenantData.domain}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#6A3CB1] hover:underline text-sm break-all"
                >
                  {tenantData.domain}
                </a>
              </div>
              <button
                className="inline-flex items-center gap-[10px]"
                style={{
                  width: 254,
                  height: 38,
                  borderRadius: 5,
                  backgroundColor: "#AE84EB0D",
                  padding: "10px 20px",
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 500,
                  fontSize: 16,
                  lineHeight: "30px",
                  color: "#8B6BB6",
                  letterSpacing: 0,
                }}
              >
                Go to SaaS Dashboard
                <ArrowUpRight size={18} className="text-[#8B6BB6]" />
              </button>
            </div>

            {/* BILLING + PLAN FEATURES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div>
                  <p className="flex items-center gap-2 font-semibold text-black">
                    <FileText size={20} className="text-[#8B6BB6]" />
                    Billing Summary
                  </p>
                  <p className="text-sm text-black mt-1">
                    Last payment: ₹{historyData.last_payment_amount || "—"} on{" "}
                    {historyData.last_payment_date
                      ? new Date(historyData.last_payment_date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                  <button className="mt-2 text-xs sm:text-sm flex items-center gap-1 px-3 py-1.5 border border-gray-300 rounded-md text-black hover:bg-[#F5F1FF] transition font-medium">
                    Download Invoice
                  </button>
                </div>

                <div>
                  <p className="flex items-center gap-2 font-semibold text-black">
                    <CreditCard size={20} className="text-[#8B6BB6]" />
                    Payment Method
                  </p>
                  <p className="text-black font-semibold text-sm mt-1">
                    {historyData.payment_method || "—"}
                  </p>
                </div>

                <div>
                  <p className="flex items-center gap-2 font-semibold text-black">
                    <Calendar size={20} className="text-[#8B6BB6]" />
                    Next Renewal
                  </p>
                  <p className="text-sm text-black mt-1">
                    Next payment: ₹{historyData.next_renewal_amount || "—"} on{" "}
                    {historyData.next_renewal_date
                      ? new Date(historyData.next_renewal_date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </p>
                </div>
              </div>

              <div>
                <p className="flex items-center gap-2 font-semibold text-black mb-2">
                  <Package size={20} className="text-[#8B6BB6]" />
                  Plan Features
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-3">
                  {tenantData.features.map((f, i) => (
                    <li key={i}>{f}</li>
                  ))}
                </ul>
                <button
                  onClick={() =>
                    window.innerWidth < 1024
                      ? navigate("/feature-store")
                      : setIsFeatureStoreOpen(true)
                  }
                  className="text-white font-semibold rounded-md flex items-center justify-center"
                  style={{
                    width: 212,
                    height: 39,
                    borderRadius: 5,
                    background: "linear-gradient(80.21deg, #AE84EB 8.97%, #7CB2E5 94.42%)",
                    padding: "14px 20px",
                    gap: 5,
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 600,
                    fontSize: 16,
                    lineHeight: "30px",
                    letterSpacing: 0,
                  }}
                >
                  Browse Feature Store
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-6">
            {/* UPGRADE CARD */}
            <div
              className="relative text-white overflow-hidden"
              style={{
                width: 445,
                height: 358,
                borderRadius: 10,
                background: "linear-gradient(218.51deg, #719CBF -9.07%, #A782D8 63.72%)",
              }}
            >
              <svg
                className="absolute"
                style={{ top: 40, left: 58, width: 32, height: 32 }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v8M8 12l4-4 4 4" />
              </svg>

              <h3
                className="absolute text-white"
                style={{
                  top: 45,
                  left: 102,
                  width: 266,
                  height: 20,
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 600,
                  fontSize: 28,
                  lineHeight: "30px",
                  letterSpacing: 0,
                }}
              >
                Upgrade Your Plan
              </h3>

              <p
                className="absolute text-center"
                style={{
                  top: 90,
                  left: 28,
                  width: 389,
                  height: 75,
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 500,
                  fontSize: 18,
                  lineHeight: "25px",
                  letterSpacing: "2%",
                }}
              >
                Get access to advanced features and increase your usage limits by upgrading to our premium plans.
              </p>

              <button
                onClick={() => navigate("/plans")}
                className="absolute text-center"
                style={{
                  top: 199,
                  left: 28,
                  width: 389,
                  height: 50,
                  borderRadius: 5,
                  backgroundColor: "#fff",
                  color: "#6A3CB1",
                  padding: "10px 65px",
                  gap: 10,
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 500,
                  fontSize: 16,
                  lineHeight: "30px",
                  letterSpacing: 0,
                }}
              >
                View Upgrade Options
              </button>

              <div
                className="absolute left-0 bottom-0"
                style={{
                  width: 445,
                  height: 78,
                  backgroundColor: "#00000047",
                  borderBottomLeftRadius: 10,
                  borderBottomRightRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <p
                  className="text-center text-white"
                  style={{
                    fontFamily: "Poppins, sans-serif",
                    fontWeight: 400,
                    fontSize: 16,
                    lineHeight: "30px",
                    letterSpacing: 0,
                  }}
                >
                  Upgrade today and get 20% off your first 3 months!
                </p>
              </div>
            </div>

            {/* QUICK ACCESS */}
            <div
              className="bg-white shadow-sm"
              style={{
                width: 445,
                height: 344,
                borderRadius: 10,
                border: "1px solid #8B6BB6",
                padding: "28px 40px",
              }}
            >
              <h3
                className="mb-4"
                style={{
                  width: 163,
                  height: 30,
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 600,
                  fontSize: 24,
                  lineHeight: "30px",
                  letterSpacing: 0,
                  color: "#8B6BB6",
                }}
              >
                Quick Access
              </h3>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => navigate("/manage-billing")}
                  className="flex items-center justify-between border rounded-lg px-4 py-3 hover:bg-gray-50 transition font-medium text-black"
                  style={{ borderColor: "#8B6BB6" }}
                >
                  <span className="flex items-center gap-3">
                    <CreditCard size={20} className="text-[#8B6BB6]" />
                    Manage Billing
                  </span>
                  <ArrowUpRight size={16} className="text-[#8B6BB6]" />
                </button>

                <button
                  className="flex items-center justify-between border rounded-lg px-4 py-3 hover:bg-gray-50 transition font-medium text-black"
                  style={{ borderColor: "#8B6BB6" }}
                >
                  <span className="flex items-center gap-3">
                    <FileText size={20} className="text-[#8B6BB6]" />
                    View Invoices
                  </span>
                  <ArrowUpRight size={16} className="text-[#8B6BB6]" />
                </button>

                <button
                  className="flex items-center justify-between border rounded-lg px-4 py-3 hover:bg-gray-50 transition font-medium text-black"
                  style={{ borderColor: "#8B6BB6" }}
                >
                  <span className="flex items-center gap-3">
                    <MessageSquare size={20} className="text-[#8B6BB6]" />
                    Give Feedback
                  </span>
                  <ArrowUpRight size={16} className="text-[#8B6BB6]" />
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