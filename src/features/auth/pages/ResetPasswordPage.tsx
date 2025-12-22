import React, { useState, useEffect } from "react";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import bgImage from "../../../assets/commonbackground.png";
import { resetPassword } from "../../../api/auth/authapi";
import { showError, showSuccess } from "../../../components/swalHelper";

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [validations, setValidations] = useState({
    upperCase: false,
    number: false,
    length: false,
  });

  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email");

  useEffect(() => {
    setValidations({
      upperCase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      length: password.length >= 8,
    });
  }, [password]);

  const handleSubmit = async () => {
    // 1. add at top

    /* ---------- inside handleSubmit ---------- */
    if (password !== confirmPassword) {
      showError(
        "Passwords do not match",
        "Please make sure both passwords are identical."
      );
      return;
    }

    if (!Object.values(validations).every(Boolean)) {
      showError("Weak password", "Please meet all password requirements.");
      return;
    }

    try {
      await resetPassword(email || "", password, confirmPassword);
      showSuccess(
        "Password Reset Successful",
        "Your password has been updated successfully!",
        () => navigate("/Resetpassword-Success")
      );
    } catch (error: unknown) {
      showError(
        "Reset Failed",
        error instanceof Error
          ? error.message
          : "Something went wrong. Try again."
      );
    }
  };

  const allValid = Object.values(validations).every(Boolean);
  const strength = Object.values(validations).filter(Boolean).length;
  const strengthColors = [
    "bg-red-400",
    "bg-yellow-400",
    "bg-blue-400",
    "bg-green-500",
  ];

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div
        className="w-full max-w-sm p-8 rounded-2xl  
          backdrop-blur-sm border border-white/50 
          shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]
          flex flex-col gap-4"
        style={{
          background:
            "linear-gradient(112.13deg, rgba(255,255,255,0.6) 0%, rgba(113,156,191,0.25) 98.3%)",
        }}
      >
        <h2 className="text-2xl font-semibold text-[#719CBF] mb-2">
          Reset Your Password
        </h2>
        <p className="text-sm text-[#719CBF] mb-6">
          Set a new password for your account.
        </p>

        {/* Password Input */}
        <div className="mb-4 relative">
          <input
  type={showPassword ? "text" : "password"}
  placeholder="Enter New Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="w-full px-4 py-2 rounded-md 
             bg-[#124B7A24] text-[#719CBF] placeholder:text-[#719CBF] 
             border-0 focus:outline-none focus:ring-2 focus:ring-[#a2b8da]"
/>  
          <button
            type="button"
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Confirm Password Input */}
        <div className="mb-2 relative">
          <input
            type={showConfirm ? "text" : "password"}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-md 
             text-[#719CBF] placeholder:text-[#719CBF]      bg-[#124B7A24]
              focus:outline-none focus:ring-2 focus:ring-[#a2b8da]"
          />
          <button
            type="button"
            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            onClick={() => setShowConfirm(!showConfirm)}
          >
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Strength Bar */}
        <div className="flex gap-1 mb-4">
          {[...Array(3)].map((_, index) => (
            <div
              key={index}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                index < strength ? strengthColors[strength] : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Password Requirements */}
        <div className="mb-4 text-left text-sm">
          {!allValid && password && (
            <p className="text-red-500 font-medium mb-2">
              Weak Password. Must Contain:
            </p>
          )}
          <ul className="space-y-1">
            <li
              className={`flex items-center gap-2 ${
                validations.upperCase ? "text-green-600" : "text-gray-400"
              }`}
            >
              {validations.upperCase ? (
                <CheckCircle size={14} />
              ) : (
                <XCircle size={14} />
              )}{" "}
              At least 1 uppercase letter
            </li>
            <li
              className={`flex items-center gap-2 ${
                validations.number ? "text-green-600" : "text-gray-400"
              }`}
            >
              {validations.number ? (
                <CheckCircle size={14} />
              ) : (
                <XCircle size={14} />
              )}{" "}
              At least 1 number
            </li>
            <li
              className={`flex items-center gap-2 ${
                validations.length ? "text-green-600" : "text-gray-400"
              }`}
            >
              {validations.length ? (
                <CheckCircle size={14} />
              ) : (
                <XCircle size={14} />
              )}{" "}
              At least 8 characters
            </li>
          </ul>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleSubmit}
          className={`w-full py-2 rounded-lg transition text-white ${
            allValid
              ? "bg-[#a2b8da] hover:bg-[#8ea9d0]"
              : "bg-gray-300 cursor-not-allowed"
          }`}
          disabled={!allValid}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
