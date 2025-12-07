import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { loginUser } from "../../../store/authSlice";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { showSuccess } from "../../../components/swalHelper";
import { discoverTenantSlug } from "../../../api/auth/slugapi";

type TenantSlugResponse = {
  slug?: string;
  tenant_slug?: string;
  data?: {
    slug?: string;
    tenant_slug?: string;
  };
};

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((state: any) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    try {
      const trimmedEmail = email.trim();

      const result = await dispatch(
        loginUser({ email: trimmedEmail, password } as any)
      );

      if (loginUser.fulfilled.match(result)) {
        // 1️⃣ Login success – discover & store tenant slug
        try {
          const slugResponse = (await discoverTenantSlug(
            trimmedEmail
          )) as TenantSlugResponse;

          console.log("discoverTenantSlug response:", slugResponse);

          const slug =
            slugResponse?.slug ??
            slugResponse?.tenant_slug ??
            slugResponse?.data?.slug ??
            slugResponse?.data?.tenant_slug;

          if (slug) {
            localStorage.setItem("store_slug", slug);
            console.log("Slug created and saved:", slug);
          } else {
            console.warn(
              "Slug not returned from API for email:",
              trimmedEmail
            );
          }
        } catch (slugErr) {
          console.error("Failed to discover tenant slug:", slugErr);
          // Do not block login if slug fails
        }

        // 2️⃣ Show success modal + go to Plans when user clicks button
        showSuccess("Success", "Login Successful", () => {
          setErrorMessage("");
          navigate("/Plans");
        });
      } else {
        // build readable error message
        let errMsg = "Login failed";
        if (result && (result as any).payload) {
          const payload = (result as any).payload;
          if (typeof payload === "string") {
            errMsg = payload;
          } else if (typeof payload === "object") {
            errMsg =
              (payload as any)?.message ||
              (payload as any)?.detail ||
              JSON.stringify(payload) ||
              "Login failed";
          }
        }
        setErrorMessage(errMsg);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Something went wrong");
    }
  };

  // Clear server error when user types
  const onEmailChange = (v: string) => {
    setEmail(v);
    if (errorMessage) setErrorMessage("");
  };
  const onPasswordChange = (v: string) => {
    setPassword(v);
    if (errorMessage) setErrorMessage("");
  };

  return (
    <AuthLayout>
      <div
        className="w-full max-w-md p-10 rounded-3xl
          backdrop-blur-lg border border-white/30 shadow-xl 
          bg-white/40 relative"
        style={{
          background:
            "linear-gradient(112deg, rgba(255, 255, 255, 0.00) 0%, rgba(113, 156, 191, 0.20) 98.3%)",
        }}
      >
        {/* Title */}
        <h2
          id="login-title"
          className="mx-auto w-[106px] h-[47px]
             flex items-center justify-center
             text-[40px] leading-[40px] font-semibold
             text-[#719CBF] font-raleway mb-10"
          style={{ letterSpacing: "0" }}
        >
          Login
        </h2>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
          role="form"
          aria-labelledby="login-title"
          noValidate
        >
          <input
            name="email"
            type="email"
            placeholder="Email"
            autoComplete="email"
            className="rounded-xl px-5 py-4 w-full
              bg-[rgba(18,75,122,0.14)]
              text-black placeholder:text-[#9ea5ad]
              focus:outline-none focus:ring-2 focus:ring-[#719CBF]
              border border-gray-300 transition-all font-raleway"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            required
            aria-required={true}
          />

          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              autoComplete="current-password"
              className="rounded-xl px-5 py-4 w-full
                bg-[rgba(18,75,122,0.14)]
                text-black placeholder:text-[#9ea5ad]
                focus:outline-none focus:ring-2 focus:ring-[#719CBF]
                border border-gray-300 transition-all font-raleway"
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              required
              aria-required={true}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="
                absolute right-4 top-1/2 -translate-y-1/2
                text-[#9ea5ad]
                hover:text-[#6A9ECF]
                p-1 transition-colors duration-200
                flex items-center justify-center
              "
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* ERROR MESSAGE (shows under inputs) */}
          {errorMessage && (
            <p role="alert" className="text-red-500 text-sm font-raleway -mt-2">
              {errorMessage}
            </p>
          )}

          <div className="text-right">
            <button
              type="button"
              onClick={() =>
                navigate(`/forget-password?email=${encodeURIComponent(email)}`)
              }
              className="text-[#42739A] hover:text-[#6A9ECF] 
                hover:underline text-sm font-medium font-raleway"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl font-bold text-white
              bg-[#719CBF] hover:bg-[#5c91c4]
              shadow-md transition font-raleway disabled:opacity-60 disabled:cursor-not-allowed"
            aria-busy={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="text-center text-sm text-[#42739A] font-raleway">
            Don’t have an account?
            <span
              onClick={() => navigate("/email-verify")}
              className="text-[#6A9ECF] font-medium ml-1 hover:underline cursor-pointer"
              role="link"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") navigate("/email-verify");
              }}
            >
              Sign Up
            </span>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}
