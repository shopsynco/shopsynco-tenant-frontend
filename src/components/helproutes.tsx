import { useNavigate } from "react-router-dom";

const AllRoutesPage = () => {
  const navigate = useNavigate();

  const routes = [
    { path: "/signup", label: "Sign Up" },
    { path: "/login", label: "Login" },
    { path: "/forget-password", label: "Forgot Password" },
    { path: "/verify-email", label: "Verify Email" },
    { path: "/reset-password", label: "Reset Password" },
    { path: "/Resetpassword-Success", label: "Password Reset Success" },
    { path: "/terms&condition", label: "Terms & Conditions" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/plans", label: "Choose Plan" },
    { path: "/payment", label: "Payment" },
    { path: "/upgrade-payment", label: "Payment Upgrade" },
    { path: "/payment-success", label: "Payment Success" },
    { path: "/setup-store", label: "Store Setup" },
    { path: "/setup-store-contact", label: "Store Contact Setup" },
    { path: "/store-success", label: "Store Success" },
    { path: "/feature-store", label: "Feature Store" },
    { path: "/manage-billing", label: "Manage Billing" },
    { path: "/invoice", label: "Invoices" },
  ];

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 py-10 px-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        🌐 All Routes Page
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-6xl">
        {routes.map((route) => (
          <button
            key={route.path}
            onClick={() => navigate(route.path)}
            className="bg-blue-600 text-white font-medium py-3 px-4 rounded-md shadow hover:bg-blue-700 transition-all text-center"
          >
            <div className="text-base">{route.label}</div>
            <div className="text-xs opacity-80">{route.path}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default AllRoutesPage;
