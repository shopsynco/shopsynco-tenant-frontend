import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";

const PrivateRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  // Get token from Redux or localStorage
  const accessToken =
    useAppSelector((state) => state.auth.accessToken) ||
    localStorage.getItem("accessToken");

  if (accessToken) {
    const path = location.pathname.toLowerCase();
    const allowsPaymentFlow =
      path === "/plans" ||
      path === "/payment" ||
      path === "/payment-success";
    const allowsStoreSetupFlow =
      path === "/setup-store" ||
      path === "/setup-store-contact" ||
      path === "/store-success";

    const needsStoreSetup =
      sessionStorage.getItem("tenant_requires_store_setup") === "1";
    const hasActiveSubscription =
      localStorage.getItem("tenant_subscription_active") === "1";

    // Enforce payment before dashboard access.
    if (!hasActiveSubscription && !allowsPaymentFlow) {
      return <Navigate to="/plans" replace />;
    }

    // Enforce store setup after payment when account has no tenant yet.
    if (needsStoreSetup && !allowsStoreSetupFlow) {
      return <Navigate to="/setup-store" replace />;
    }

    return children ? <>{children}</> : <Outlet />;
  }

  // Else redirect to login
  return <Navigate to="/login" replace />;
};

export default PrivateRoute;
