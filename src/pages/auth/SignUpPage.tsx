import React, { useState } from "react";
import Swal from "sweetalert2";
import { registerUser } from "../../api/auth/authapi";
import { useNavigate } from "react-router-dom";
import bgImage from "../../assets/authbackground.png";

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

  const [formData, setFormData] = useState<RegisterFormData>({
    first_name: "",
    company_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      Swal.fire("Error", "Passwords do not match!", "error");
      setLoading(false);
      return;
    }

    try {
      // Prepare the payload for registration - use confirm_password instead of confirmPassword
      const payload = {
        first_name: formData.first_name,
        company_name: formData.company_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        confirm_password: formData.confirmPassword,
      };

      console.log("Signup payload:", payload);

      // Register user
      const signupRes = await registerUser(payload);
      console.log("Signup response:", signupRes);

      // Show success message
      Swal.fire(
        "Success",
        "Account created successfully! Please check your email to verify your account.",
        "success"
      );

      // Redirect to login page directly
      navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);

      // Reset form data
      setFormData({
        first_name: "",
        company_name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Signup error:", error.response?.data || error.message);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Signup failed. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div
        className="w-full max-w-2xl p-12 rounded-3xl shadow-2xl backdrop-blur-sm border border-white/50 flex flex-col gap-6"
        style={{
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.1)",
        }}
      >
        <h2
          className="text-3xl font-bold text-center text-[#719CBF] mb-2"
          style={{
            fontFamily: "Raleway, sans-serif",
            fontWeight: 700,
            fontSize: "32px",
            lineHeight: "100%",
          }}
        >
          Create Your Account
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Row 1: First Name & Company Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="first_name"
                className="text-[#719CBF] font-semibold text-base"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 500,
                  fontSize: "16px",
                  lineHeight: "100%",
                }}
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
                className="rounded-xl px-5 py-3 bg-white text-black border border-gray-300 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="company_name"
                className="text-[#719CBF] font-semibold text-base"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 500,
                  fontSize: "16px",
                  lineHeight: "100%",
                }}
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
                className="rounded-xl px-5 py-3 bg-white text-black border border-gray-300 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>
          </div>

          {/* Row 2: Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-[#719CBF] font-semibold text-base"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 500,
                  fontSize: "16px",
                  lineHeight: "100%",
                }}
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
                className="rounded-xl px-5 py-3 bg-white text-black border border-gray-300 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="phone"
                className="text-[#719CBF] font-semibold text-base"
                style={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 500,
                  fontSize: "16px",
                  lineHeight: "100%",
                }}
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
                className="rounded-xl px-5 py-3 bg-white text-black border border-gray-300 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
                required
              />
            </div>
          </div>

          {/* Password Fields */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-[#719CBF] font-semibold text-base"
              style={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 500,
                fontSize: "16px",
                lineHeight: "100%",
              }}
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
              className="rounded-xl px-5 py-3 bg-white text-black border border-gray-300 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="confirmPassword"
              className="text-[#719CBF] font-semibold text-base"
              style={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 500,
                fontSize: "16px",
                lineHeight: "100%",
              }}
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
              className="rounded-xl px-5 py-3 bg-white text-black border border-gray-300 placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-4 rounded-xl font-bold text-white bg-[#6A9ECF] hover:bg-[#5c91c4] shadow-lg border border-white/30 transition"
          >
            {loading ? "Creating Account..." : "Next"}
          </button>

          <p className="text-center text-sm text-[#4A5C74] mt-2">
            Already have an account?{" "}
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
