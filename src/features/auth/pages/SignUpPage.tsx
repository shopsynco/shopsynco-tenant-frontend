import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import bgImage from "../../../assets/authbackground.png";
import { registerUser } from "../../../api/auth/authapi";
import { showSuccess, showError } from "../../../components/swalHelper";

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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get("email");
    if (emailParam) {
      setFormData((prev) => ({ ...prev, email: emailParam }));
    }
  }, [location.search]);

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

    try {
      const payload = {
        first_name: formData.first_name,
        company_name: formData.company_name,
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      };

      await registerUser(payload);

      showSuccess(
        "Account Created!",
        "Your account has been created successfully. Please log in to continue.",
        () => {
          navigate("/login");
        }
      );
    } catch (error: any) {
      console.error("Signup error:", error);
      showError("Signup Failed", error?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Card / Form container
          - default text color set to #42739A (Raleway) via text-[#42739A]
          - gradient and rounded 30px via arbitrary values
      */}
      <div
        className="w-full max-w-2xl p-12 shadow-2xl backdrop-blur-sm border border-white/20 flex flex-col gap-6
                   text-[#42739A] font-raleway"
        style={{
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.1)",
          // gradient exactly as requested: 139.18deg, transparent-> rgba(113,156,191,0.3)
          // using Tailwind arbitrary background in style to avoid escaping issues in some setups.
          background:
            "linear-gradient(139.18deg, rgba(255,255,255,0) 1.22%, rgba(113,156,191,0.3) 98.56%)",
          borderRadius: "30px",
        }}
      >
        {/* Heading (condition 2) */}
        <h2
          className="mx-auto mb-2 text-center font-raleway font-bold
                     text-[32px] leading-[38px] tracking-[0.04em] text-[#719CBF]"
        >
          Create Your Account
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
                className="
                  w-full px-5 py-3 bg-white text-[#000000] placeholder-[#B7A9CE]
                  border border-[#B7A9CE] rounded-[8px]
                  focus:outline-none focus:ring-0 focus:border-2 focus:border-[#719CBF]
                  transition
                "
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
                className="
                  w-full px-5 py-3 bg-white text-[#000000] placeholder-[#B7A9CE]
                  border border-[#B7A9CE] rounded-[8px]
                  focus:outline-none focus:ring-0 focus:border-2 focus:border-[#719CBF]
                  transition
                "
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
                className="
                  w-full px-5 py-3 bg-white text-[#000000] placeholder-[#B7A9CE]
                  border border-[#B7A9CE] rounded-[8px]
                  focus:outline-none focus:ring-0 focus:border-2 focus:border-[#719CBF]
                  transition
                "
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
                placeholder="Your Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="
                  w-full px-5 py-3 bg-white text-[#000000] placeholder-[#B7A9CE]
                  border border-[#B7A9CE] rounded-[8px]
                  focus:outline-none focus:ring-0 focus:border-2 focus:border-[#719CBF]
                  transition
                "
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
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Create a strong password (min 8 characters)"
              value={formData.password}
              onChange={handleChange}
              className="
                w-full px-5 py-3 bg-white text-[#000000] placeholder-[#B7A9CE]
                border border-[#B7A9CE] rounded-[8px]
                focus:outline-none focus:ring-0 focus:border-2 focus:border-[#719CBF]
                transition
              "
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="confirmPassword"
              className="font-poppins font-medium text-[16px] leading-[24px] text-[#719CBF]"
            >
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="
                w-full px-5 py-3 bg-white text-[#000000] placeholder-[#B7A9CE]
                border border-[#B7A9CE] rounded-[8px]
                focus:outline-none focus:ring-0 focus:border-2 focus:border-[#719CBF]
                transition
              "
              required
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="
              mt-2 w-full py-4 rounded-[10px] shadow-lg border border-white/10
              bg-[#719CBF] hover:bg-[#5f97b6] transition
              font-poppins font-semibold text-[24px] leading-[36px] text-[#FCFCFC]
              disabled:opacity-60 disabled:cursor-not-allowed
            "
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <p className="text-center text-sm mt-2">
            <span className="text-[#4A5C74]">Already have an account? </span>
            <a href="/login" className="text-[#6A9ECF] font-medium hover:underline transition">
              Login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}
