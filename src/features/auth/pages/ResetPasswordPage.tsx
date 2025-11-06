import React, { useState, useEffect } from "react";
import { Eye, EyeOff, CheckCircle, XCircle } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import bgImage from "../../../assets/commonbackground.png";
import { resetPassword } from "../../../api/auth/authapi"; 

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
    if (password !== confirmPassword) {
      Swal.fire("Error", "Passwords do not match", "error");
      return;
    }

    if (!Object.values(validations).every(Boolean)) {
      Swal.fire("Error", "Please meet all password requirements", "error");
      return;
    }

    try {
      await resetPassword({
        email: email || "",
        password,
        confirmPassword,
      });

      await Swal.fire({
        icon: "success",
        title: "Password Reset Successful",
        text: "Your password has been updated successfully!",
        confirmButtonColor: "#6A9ECF",
      });

      // ✅ Redirect after SweetAlert closes
      navigate("/Resetpassword-Success"); // 👈 or navigate("/login") if you prefer
    } catch (error: unknown) {
      Swal.fire({
        icon: "error",
        title: "Reset Failed",
        text: error instanceof Error ? error.message : "Something went wrong. Try again.",
        confirmButtonColor: "#6A9ECF",
      });
    }
  };

  const allValid = Object.values(validations).every(Boolean);
  const strength = Object.values(validations).filter(Boolean).length;
  const strengthColors = ["bg-red-400", "bg-yellow-400", "bg-blue-400", "bg-green-500"];

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl w-[380px] p-8 text-center z-10">
        <h2 className="text-2xl font-semibold text-[#466b9d] mb-2">
          Reset Your Password
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Set a new password for your account.
        </p>

        {/* Password Input */}
        <div className="mb-4 relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-4 py-2 border ${
              !allValid && password
                ? "border-red-400"
                : "border-gray-300"
            } rounded-md focus:outline-none focus:ring-2 focus:ring-[#a2b8da] text-gray-700`}
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
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#a2b8da] text-gray-700"
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
              {validations.upperCase ? <CheckCircle size={14} /> : <XCircle size={14} />}{" "}
              At least 1 uppercase letter
            </li>
            <li
              className={`flex items-center gap-2 ${
                validations.number ? "text-green-600" : "text-gray-400"
              }`}
            >
              {validations.number ? <CheckCircle size={14} /> : <XCircle size={14} />}{" "}
              At least 1 number
            </li>
            <li
              className={`flex items-center gap-2 ${
                validations.length ? "text-green-600" : "text-gray-400"
              }`}
            >
              {validations.length ? <CheckCircle size={14} /> : <XCircle size={14} />}{" "}
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
