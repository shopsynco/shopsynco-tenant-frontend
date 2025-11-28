// src/features/auth/pages/ForgotPassword.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import AuthLayout from "../components/AuthLayout";
import { authApi } from "../../../api/auth/authapi";

type ApiErrors = Record<string, string[]>;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<ApiErrors>({});

  // Prefill email if passed in query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    if (emailParam) setEmail(emailParam);
  }, [location.search]);

  const showApiErrorsWithSwal = (apiErrors: ApiErrors) => {
    const flat = Object.entries(apiErrors)
      .map(([field, messages]) => `${field}: ${messages.join(", ")}`)
      .join("\n");
    Swal.fire({ icon: "error", title: "Validation error", text: flat });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!email) {
      setErrors({ email: ["Please enter your email"] });
      return;
    }

    try {
      setLoading(true);

      // If you don't need the API response body, don't assign it to a variable
      // await authApi.forgotPassword(email);

      // If you want to show server 'detail' message on success, capture it:
      const response = await authApi.forgotPassword(email);

      // Example: if server returns { detail: "Sent" } or similar
      const serverMsg =
        response?.data?.detail ||
        response?.data?.message ||
        "If this email is registered, a reset code has been sent.";

      // Show success using the styled Swal (or your swal helper)
      await Swal.fire({
        icon: "success",
        title: "Verification Sent",
        text: serverMsg,
        confirmButtonColor: "#719CBF",
      });

      // Navigate to verification page (prefill email)
      navigate(`/verification-sent?email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      const data = err?.response?.data;

      if (data && typeof data === "object") {
        // DRF-style field errors
        const fieldErrors: ApiErrors = {};

        if (Array.isArray(data)) {
          // top-level array of messages
          Swal.fire("Error", data.join("\n"), "error");
        } else {
          Object.entries(data).forEach(([k, v]) => {
            if (Array.isArray(v)) fieldErrors[k] = v.map(String);
            else fieldErrors[k] = [String(v)];
          });

          setErrors(fieldErrors);
          showApiErrorsWithSwal(fieldErrors);
        }
      } else {
        Swal.fire("Error", err?.message || "Request failed", "error");
      }
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
          flex flex-col gap-4"
        style={{
          background:
            "linear-gradient(112.13deg, rgba(255,255,255,0.6) 0%, rgba(113,156,191,0.25) 98.3%)",
        }}
        noValidate
      >
        <h2 className="text-3xl font-bold text-center text-[#4A5C74] mb-2">
          Forgot Password
        </h2>

        <p className="text-center text-gray-600 text-sm mb-4">
          Enter your email for verification. We’ll send a 6-digit code to your
          inbox.
        </p>

        <div>
          <input
            type="email"
            placeholder="user@shopsynco.com"
            className="rounded-xl px-5 py-4 w-full 
                     bg-[#124B7A24] text-black 
                     placeholder:text-gray-600
                     focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={errors.email ? "true" : "false"}
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-sm text-red-500 mt-2">
              {errors.email.map((m, i) => (
                <span key={i} className="block">
                  {m}
                </span>
              ))}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full py-4 rounded-xl font-bold text-white
            bg-[#6A9ECF] hover:bg-[#5c91c4] shadow-lg border border-white/30
            transition disabled:opacity-60 disabled:cursor-not-allowed"
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
