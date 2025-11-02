import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./privateRoute";
import Dashboard from "../pages/Dashboard";
import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPassword";
import RegisterPage from "../pages/auth/SignUpPage";
import LegalPolicies from "../pages/termscondition/PrivacyandPolicies";
import VerificationPage from "../pages/auth/VerificationPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import PasswordResetSuccess from "../pages/auth/ForgetPasswordSuccess";
import ChoosePlanPage from "../pages/MainPagess/ChoosePlanPage";
import PaymentPage from "../pages/MainPagess/PaymentPage";
import PaymentSuccessPage from "../pages/MainPagess/PaymentSuccessfulPage";
import StoreSetupPage from "../pages/MainPagess/createStore/setupStorePage";
import StoreSuccessPage from "../pages/MainPagess/createStore/storeSuccess";
import StoreSetupContactPage from "../pages/MainPagess/createStore/storeLocation&Contact";
import FeatureStorePage from "../pages/subscription/featureModal";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forget-password" element={<ForgotPasswordPage />} />
        <Route path="/verify-email" element={<VerificationPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/Resetpassword-Success"
          element={<PasswordResetSuccess />}
        />
        <Route path="/terms&condition" element={<LegalPolicies />} />
        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/Plans" element={<ChoosePlanPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
          <Route path="/setup-store" element={<StoreSetupPage />} />
          <Route path="/setup-store-contact" element={<StoreSetupContactPage />} />
          <Route path="/store-success" element={<StoreSuccessPage />} />
          <Route path="/feature-store" element={<FeatureStorePage />} />
          
        </Route>
      </Routes>
    </Router>
  );
};

export default AppRoutes;
