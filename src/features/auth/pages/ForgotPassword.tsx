import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import AuthLayout from "../components/AuthLayout";
import { authApi } from "../../../api/auth/authapi";

export default function ForgotPasswordPage() {
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
      Swal.fire("Error", "Please enter your email", "error");
      return;
    }

    try {
      setLoading(true);
      await authApi.forgotPassword(email);
      Swal.fire(
        "Success",
        "If this email is registered, a reset code has been sent.",
        "success"
      );
    } catch (err: any) {
      Swal.fire("Error", err.response?.data?.detail || "Request failed", "error");
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
          Forgot Password
        </h2>

        <p className="text-center text-gray-600 text-sm mb-4">
          Enter your email for verification. We’ll send a 6-digit code to your inbox.
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
