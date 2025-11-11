import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import bgImage from "../../../assets/commonbackground.png";
import {
  verifyResetCode,
  resendVerificationCode,
} from "../../../api/auth/authapi";

const VerificationPage: React.FC = () => {
  const [code, setCode] = useState<string[]>(Array(5).fill(""));
  const [timer, setTimer] = useState(60);
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const email: string = queryParams.get("email") || "";

  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(countdown);
    }
  }, [timer]);

  const handleChange = (value: string, index: number) => {
    if (/^\d?$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 4) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  // ✅ Resend API handler
  const handleResend = async () => {
    if (!email) {
      Swal.fire("Error", "Email not found. Please go back.", "error");
      return;
    }

    try {
      await resendVerificationCode({ email });
      Swal.fire({
        icon: "success",
        title: "Verification Code Resent",
        text: `A new code has been sent to ${email}.`,
        confirmButtonColor: "#6A9ECF",
      });
      setTimer(60);
      setCode(Array(5).fill(""));
    } catch (error: unknown) {
      Swal.fire({
        icon: "error",
        title: "Resend Failed",
        text:
          error instanceof Error
            ? error.message
            : "Unable to resend code. Try again later.",
        confirmButtonColor: "#6A9ECF",
      });
    }
  };

  const handleSubmit = async () => {
    const verificationCode = code.join("");
    if (verificationCode.length < 5) {
      Swal.fire("Error", "Please enter all 5 digits of your code.", "error");
      return;
    }

    if (!email) {
      Swal.fire(
        "Error",
        "Email not found in request. Please go back.",
        "error"
      );
      return;
    }

    try {
      await verifyResetCode({ email, code: verificationCode });
      await Swal.fire({
        icon: "success",
        title: "Code Verified!",
        text: "Your verification code is correct. You can now reset your password.",
        confirmButtonColor: "#6A9ECF",
      });
      navigate(`/terms&condition`);
    } catch (error: unknown) {
      Swal.fire({
        icon: "error",
        title: "Invalid Code",
        text:
          error instanceof Error
            ? error.message
            : "The verification code you entered is invalid or expired.",
        confirmButtonColor: "#6A9ECF",
      });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl w-[380px] p-8 text-center border border-white/40">
        <h2 className="text-2xl font-semibold text-[#466b9d] mb-2">
          Verification
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Enter the 5-digit code sent to <br />
          <b className="text-[#466b9d]">{email}</b>
        </p>

        {/* OTP Inputs */}
        <div className="flex justify-center gap-2 mb-6">
          {code.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, index)}
              className="w-10 h-12 text-center border border-gray-300 rounded-md 
                         focus:outline-none focus:ring-2 focus:ring-[#6A9ECF] 
                         text-lg text-gray-700 bg-white/70"
            />
          ))}
        </div>

        {/* Timer */}
        <p className="text-sm text-red-400 mb-4">
          00 : {timer.toString().padStart(2, "0")}
        </p>

        {/* Continue Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-[#6A9ECF] text-white py-2 rounded-lg hover:bg-[#5c91c4] transition font-semibold shadow-md"
        >
          Continue
        </button>

        {/* Resend Link */}
        <p className="text-xs text-gray-500 mt-4">
          Didn’t receive the code?{" "}
          <button
            onClick={handleResend}
            disabled={timer > 0}
            className={`ml-1 ${
              timer > 0
                ? "text-gray-400 cursor-not-allowed"
                : "text-[#6A9ECF] hover:underline"
            }`}
          >
            Resend
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerificationPage;
