import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import bgImage from "../../../assets/authbackground.png";
import { registerUser } from "../../../api/auth/authapi";
import { showSuccess, showError } from "../../../components/swalHelper";
import {
  startTenantGoogleOAuth,
  oauthErrorMessage as getOauthErrorMessage,
} from "../utils/googleOAuth";
import { isValidSignupPhone, SIGNUP_PHONE_HINT } from "../../../utils/signupPhoneValidation";
import { trackMetaPixelCompleteRegistration } from "../../../lib/metaPixel";
import { decodeJwtPayload } from "../utils/googleOAuth";
import { completeTenantAuthAndRedirect } from "../../../api/auth/sessionApi";
import { persistTenantUserEmail } from "../../../utils/tenantUserEmail";

interface RegisterFormData {
  first_name: string;
  company_name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState<RegisterFormData>({
    first_name: "",
    company_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [googleErrorMessage, setGoogleErrorMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setFormData((prev) => ({ ...prev, email: emailParam }));
    }
  }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = (params.get("error") || "").trim();
    const access = params.get("auth_access_token");
    const refresh = params.get("auth_refresh_token");
    const emailParam = params.get("email");

    if (oauthError) {
      const cleanPath = emailParam
        ? `${window.location.pathname}?email=${encodeURIComponent(emailParam)}`
        : window.location.pathname;
      window.history.replaceState({}, document.title, cleanPath);
      setGoogleErrorMessage(getOauthErrorMessage(oauthError));
      return;
    }

    if (!access || !refresh) return;

    window.history.replaceState({}, document.title, window.location.pathname);
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
    const jwtPayload = decodeJwtPayload(access);
    const jwtEmail =
      typeof jwtPayload?.email === "string" ? jwtPayload.email.trim() : "";
    const signupEmail = jwtEmail || String(emailParam || "").trim();
    if (signupEmail) persistTenantUserEmail(signupEmail);
    trackMetaPixelCompleteRegistration(
      signupEmail ? { em: signupEmail } : undefined,
    );
    void completeTenantAuthAndRedirect();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      showError("Error", "Passwords do not match!");
      setLoading(false);
      return;
    }

    const phoneTrimmed = formData.phone.trim();
    if (!isValidSignupPhone(phoneTrimmed)) {
      showError("Invalid phone number", SIGNUP_PHONE_HINT);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        first_name: formData.first_name,
        company_name: formData.company_name,
        email: formData.email.toLowerCase().trim(),
        phone: phoneTrimmed,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      };

      await registerUser(payload);
      trackMetaPixelCompleteRegistration({
        em: payload.email,
        ph: phoneTrimmed,
        fn: formData.first_name,
      });

      showSuccess(
        "Account Created!",
        "Your account has been created successfully. Please log in to continue.",
        () => {
          navigate("/login");
        }
      );
    } catch (error: any) {
      console.error("Signup error:", error);
      showError(
        "Signup Failed",
        error?.message || "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    setGoogleErrorMessage("");
    try {
      await startTenantGoogleOAuth("/signup");
    } catch (error: unknown) {
      setGoogleLoading(false);
      const message =
        error instanceof Error
          ? error.message
          : "Unable to continue with Google sign-in.";
      showError("Google Sign Up", message);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div
        className="w-full max-w-2xl p-12 shadow-2xl backdrop-blur-sm border border-white/20 flex flex-col gap-6
                   text-[#42739A] font-raleway"
        style={{
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.1)",
          background:
            "linear-gradient(139.18deg, rgba(255,255,255,0) 1.22%, rgba(113,156,191,0.3) 98.56%)",
          borderRadius: "30px",
        }}
      >
        <h2
          className="mx-auto mb-2 text-center font-raleway font-bold
                     text-[32px] leading-[38px] tracking-[0.04em] text-[#719CBF]"
        >
          Create Your Account
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {googleErrorMessage && (
            <p role="alert" className="text-red-500 text-sm text-center">
              {googleErrorMessage}
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="first_name"
                className="font-poppins font-medium text-[16px] leading-[24px] text-[#719CBF]"
              >
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                id="first_name"
                placeholder="Your First Name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-5 py-3 rounded-[8px] text-[#000000] placeholder-[#B7A9CE] bg-[#124B7A24] border-0 focus:outline-none focus:ring-2 focus:ring-[#719CBF] transition"
                required
              />
            </div>

            {/* Company Name */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="company_name"
                className="font-poppins font-medium text-[16px] leading-[24px] text-[#719CBF]"
              >
                Company Name
              </label>
              <input
                type="text"
                name="company_name"
                id="company_name"
                placeholder="Your Company Name"
                value={formData.company_name}
                onChange={handleChange}
                className="w-full px-5 py-3 rounded-[8px] text-[#000000] placeholder-[#B7A9CE] bg-[#124B7A24] border-0 focus:outline-none focus:ring-2 focus:ring-[#719CBF] transition"
                required
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="font-poppins font-medium text-[16px] leading-[24px] text-[#719CBF]"
              >
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Your Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-5 py-3 rounded-[8px] text-[#000000] placeholder-[#B7A9CE] bg-[#124B7A24] border-0 focus:outline-none focus:ring-2 focus:ring-[#719CBF] transition"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="phone"
                className="font-poppins font-medium text-[16px] leading-[24px] text-[#719CBF]"
              >
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                placeholder="+1 555 123 4567"
                autoComplete="tel"
                inputMode="tel"
                maxLength={22}
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-5 py-3 rounded-[8px] text-[#000000] placeholder-[#B7A9CE] bg-[#124B7A24] border-0 focus:outline-none focus:ring-2 focus:ring-[#719CBF] transition"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="font-poppins font-medium text-[16px] leading-[24px] text-[#719CBF]"
            >
              Create Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                placeholder="Create a strong password (min 8 characters)"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-5 py-3 pr-12 rounded-[8px] text-[#000000] placeholder-[#B7A9CE] bg-[#124B7A24] border-0 focus:outline-none focus:ring-2 focus:ring-[#719CBF] transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-[#5f7f9c] hover:text-[#42739A]"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="confirmPassword"
              className="font-poppins font-medium text-[16px] leading-[24px] text-[#719CBF]"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                id="confirmPassword"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-5 py-3 pr-12 rounded-[8px] text-[#000000] placeholder-[#B7A9CE] bg-[#124B7A24] border-0 focus:outline-none focus:ring-2 focus:ring-[#719CBF] transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-[#5f7f9c] hover:text-[#42739A]"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex flex-col gap-[16px]">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-[10px] shadow-lg border border-white/10
              bg-[#719CBF] hover:bg-[#5f97b6] transition
              font-poppins font-semibold text-[16px] leading-[24px] md:text-[24px] md:leading-[33px] text-[#FCFCFC]
              disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <button
              type="button"
              disabled={googleLoading}
              onClick={handleGoogleSignup}
              className="w-full py-4 rounded-[10px] shadow-lg border border-gray-300
              bg-white hover:bg-gray-100 transition
              font-poppins font-semibold text-[16px] leading-[24px] md:text-[24px] md:leading-[33px] text-[#1f2937]
              disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {googleLoading ? "Connecting..." : "Sign Up with Google"}
            </button>
          </div>

          <p className="text-center text-sm mt-2">
            <span className="text-[#4A5C74]">Already have an account? </span>
            <a
              href="/login"
              className="text-[#6A9ECF] font-medium hover:underline transition"
            >
              Login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}