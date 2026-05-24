import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../store/hooks";
import { hasAcceptedOnboardingTerms } from "../utils/termsAcceptance";

const ONBOARDING_TERMS_PATH = "/onboarding/terms";

const PrivateRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const accessToken =
    useAppSelector((state) => state.auth.accessToken) ||
    localStorage.getItem("accessToken");

  if (accessToken) {
    const path = location.pathname.toLowerCase().replace(/\/$/, "") || "/";
    const termsPath = ONBOARDING_TERMS_PATH;
    const onboardingTermsAccepted = hasAcceptedOnboardingTerms();
    const isOnTermsPage = path === termsPath;

    const allowsPaymentFlow =
      path === "/plans" || path === "/payment" || path === "/payment-success";
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

    if (!hasActiveSubscription) {
      if (allowsStoreSetupFlow) {
        return (
          <Navigate
            to={onboardingTermsAccepted ? "/plans" : termsPath}
            replace
          />
        );
      }

      if (!onboardingTermsAccepted) {
        if (!isOnTermsPage) {
          return <Navigate to={termsPath} replace />;
        }
        return children ? <>{children}</> : <Outlet />;
      }

      if (isOnTermsPage) {
        return <Navigate to="/plans" replace />;
      }

      if (!allowsPaymentFlow) {
        return <Navigate to="/plans" replace />;
      }

      return children ? <>{children}</> : <Outlet />;
    }

    if (needsStoreSetup && !allowsStoreSetupFlow) {
      return <Navigate to="/setup-store" replace />;
    }

    if (storeSetupIncomplete && !allowsStoreSetupFlow) {
      return <Navigate to="/setup-store-contact" replace />;
    }

    return children ? <>{children}</> : <Outlet />;
  }

  return <Navigate to="/login" replace />;
};

export default PrivateRoute;
