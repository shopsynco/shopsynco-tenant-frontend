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
    const allowsPrePaymentFlow = allowsPaymentFlow;
    const allowsStoreSetupFlow =
      path === "/setup-store" ||
      path === "/setup-store-contact" ||
      path === "/store-success";

    const needsStoreSetup =
      sessionStorage.getItem("tenant_requires_store_setup") === "1";
    const storeSetupIncomplete =
      sessionStorage.getItem("tenant_store_setup_incomplete") === "1";
    const hasActiveSubscription =
      localStorage.getItem("tenant_subscription_active") === "1";

    // No subscription yet: only plan checkout / payment / terms (not store setup — avoids /plans ↔ /setup-store loops).
    if (!hasActiveSubscription) {
      if (allowsStoreSetupFlow) {
        return <Navigate to="/plans" replace />;
      }
      if (!allowsPrePaymentFlow) {
        return <Navigate to="/plans" replace />;
      }
      return children ? <>{children}</> : <Outlet />;
    }

    // After payment: guide tenant creation + location/contact when flags say so.
    if (needsStoreSetup && !allowsStoreSetupFlow) {
      return <Navigate to="/setup-store" replace />;
    }

    if (storeSetupIncomplete && !allowsStoreSetupFlow) {
      return <Navigate to="/setup-store-contact" replace />;
    }

    return children ? <>{children}</> : <Outlet />;
  }

  // Else redirect to login
  return <Navigate to="/login" replace />;
};

export default PrivateRoute;
