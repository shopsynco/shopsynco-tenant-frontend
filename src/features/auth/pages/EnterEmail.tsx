import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import { sendEmailVerificationCode } from "../../../api/auth/authapi";
import { showError, showSuccess } from "../../../components/swalHelper";

export default function EnterEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Prefill email if passed in query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    if (emailParam) setEmail(emailParam);
  }, [location.search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
  showError("Validation Error", "Please enter your email.");
  return;
}

try {
  setLoading(true);
  await sendEmailVerificationCode(email.toLowerCase().trim());
  showSuccess(
    "Verification Sent",
    "We’ve sent a 6-digit verification code to your email.",
    () => navigate(`/verify-email?email=${encodeURIComponent(email)}`)
  );
} catch (err: any) {
  showError(
    "Send Failed",
    err.message || "Failed to send verification email. Please try again."
  );
} finally {
  setLoading(false);
}
  };

  return (
    <AuthLayout>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md p-12 rounded-3xl
          backdrop-blur-sm border border-white/50 
          shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]
          flex flex-col gap-6"
        style={{
          background:
            "linear-gradient(112.13deg, rgba(255,255,255,0.6) 0%, rgba(113,156,191,0.25) 98.3%)",
        }}
      >
        <h2 className="text-3xl font-bold text-center text-[#4A5C74] mb-2">
          Verify your email
        </h2>

        <p className="text-center text-gray-600 text-sm mb-4">
          Enter your email address. We’ll send a 6-digit code to verify it
          before creating your account.
        </p>

        <input
          type="email"
          placeholder="user@shopsynco.com"
          className="rounded-xl px-5 py-4 w-full 
                     bg-[#124B7A24] text-black 
                     placeholder:text-gray-600
                     focus:outline-none focus:ring-2 focus:ring-purple-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full py-4 rounded-xl font-bold text-white
            bg-[#6A9ECF] hover:bg-[#5c91c4] shadow-lg border border-white/30
            transition"
        >
          {loading ? "Sending..." : "Continue"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/login")}
          className="text-[#4A5C74] hover:text-[#6A9ECF] hover:underline text-sm font-medium transition text-center mt-2"
        >
          Back to Login
        </button>
      </form>
    </AuthLayout>
  );
}
