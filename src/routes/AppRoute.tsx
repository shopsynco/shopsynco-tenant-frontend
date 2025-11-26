import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./privateRoute";
import Dashboard from "../features/dashboard/pages/Dashboard";
import ForgotPasswordPage from "../features/auth/pages/ForgotPassword";
import ResetPasswordPage from "../features/auth/pages/ResetPasswordPage";
import PasswordResetSuccess from "../features/auth/pages/ForgetPasswordSuccess";

import PaymentSuccessPage from "../features/dashboard/components/payment/PaymentSuccessfulPage";
import StoreSetupPage from "../features/storeSetup/pages/setupStorePage";
import StoreSuccessPage from "../features/storeSetup/pages/storeSuccess";
import StoreSetupContactPage from "../features/storeSetup/pages/storeLocation&Contact";
import FeatureStorePage from "../features/dashboard/components/FeatureModal";
import ManageBillingPage from "../features/dashboard/components/ManageBilling";
import RegisterPage from "../features/auth/pages/SignUpPage";
import LoginPage from "../features/auth/pages/LoginPage";
import VerificationPage from "../features/auth/pages/VerificationPage";
import LegalPolicies from "../features/auth/pages/PrivacyandPolicies";
import ChoosePlanPage from "../features/dashboard/pages/ChoosePlanPage";
import InvoicesPage from "../features/dashboard/pages/InvoicesPage";
import AllRoutesPage from "../components/helproutes";
import PaymentPage from "../features/dashboard/components/payment/PaymentPage";
import UpgradePaymentPage from "../features/dashboard/components/payment/upgradePaymentPage";
import EnterEmail from "../features/auth/pages/EnterEmail";
import ExpiredVerificationPage from "../features/auth/pages/VerificationExpiredPage";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AllRoutesPage />} />
        <Route path="/signup" element={<RegisterPage />} />
        <Route path="/email-verify" element={<EnterEmail />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forget-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-email" element={<VerificationPage />} />
        <Route path="/verify-email-expired" element={<ExpiredVerificationPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/Resetpassword-Success"
          element={<PasswordResetSuccess />}
        />
        <Route path="/terms&condition" element={<LegalPolicies />} />
        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/plans" element={<ChoosePlanPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/upgrade-payment" element={<UpgradePaymentPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/setup-store" element={<StoreSetupPage />} />
          <Route
            path="/setup-store-contact"
            element={<StoreSetupContactPage />}
          />
          <Route path="/store-success" element={<StoreSuccessPage />} />
          <Route path="/feature-store" element={<FeatureStorePage />} />
          <Route path="/manage-billing" element={<ManageBillingPage />} />
          <Route path="/invoice" element={<InvoicesPage />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;
