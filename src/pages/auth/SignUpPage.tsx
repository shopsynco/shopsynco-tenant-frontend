import React, { useState } from "react";
import bgImage from "../../assets/authbackground.png";
import Swal from "sweetalert2";
import { registerUser, discoverTenant } from "../../api/auth/authapi";
import { checkDomainAvailability } from "../../api/auth/domainapi";
import { useNavigate } from "react-router-dom";

interface RegisterFormData {
  firstName: string;
  companyName: string;
  email: string;
  phone: string;
  domain: string;
  password: string;
}

export default function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: "",
    companyName: "",
    email: "",
    phone: "",
    domain: "",
    password: "",
  });

  const [checkingDomain, setCheckingDomain] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ Ensure valid domain format
      const formattedDomain = formData.domain.includes(".")
        ? formData.domain
        : `${formData.domain}.localhost`;

      const payload = {
        name: formData.companyName,
        domain: formattedDomain,
        admin_email: formData.email,
        admin_password: formData.password,
      };

      console.log("Signup payload:", payload);

      // ✅ Step 1: Register tenant
      const signupRes = await registerUser(payload);
      console.log("Signup response:", signupRes);

      // ✅ Step 2: Discover tenant slug
      const discoverRes = await discoverTenant(formattedDomain);
      console.log("Discover response:", discoverRes);

      const tenantSlug =
        discoverRes?.schema_name ||
        discoverRes?.tenant?.schema_name ||
        discoverRes?.tenant?.domain ||
        null;

      Swal.fire("Success", "Account created successfully!", "success");

      // ✅ Step 3: Redirect with tenant slug
      if (tenantSlug) {
        navigate(`/verify-email?slug=${tenantSlug}&email=${formData.email}`);
      } else {
        Swal.fire("Warning", "Could not get tenant slug.", "info");
      }

      // ✅ Reset form
      setFormData({
        firstName: "",
        companyName: "",
        email: "",
        phone: "",
        domain: "",
        password: "",
      });
    } catch (error: any) {
      console.error("Signup/Discover error:", error.response?.data || error.message);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Signup failed. Please check your details.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDomainCheck = async (): Promise<void> => {
    if (!formData.domain) {
      Swal.fire("Error", "Please enter a domain name", "error");
      return;
    }

    setCheckingDomain(true);
    try {
      const result = await checkDomainAvailability(formData.domain);
      console.log("Domain check result:", result);

      const availableDomains = result.domains?.filter((d: any) => d.available);
      if (availableDomains?.length > 0) {
        Swal.fire(
          "Available ✅",
          `${availableDomains[0].domain} is available!`,
          "success"
        );
      } else {
        Swal.fire(
          "Unavailable ❌",
          "Domain not available. Try another name.",
          "error"
        );
      }
    } catch (err: any) {
      Swal.fire("Error", err.message, "error");
    } finally {
      setCheckingDomain(false);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Logo */}
      <div className="absolute top-6 left-10">
        <img src="/logo.svg" alt="ShopSynco" className="w-36" />
      </div>

      {/* Form Container */}
      <div
        className="w-full max-w-2xl p-12 rounded-3xl shadow-2xl 
        backdrop-blur-sm border border-white/50 
        shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]
        flex flex-col gap-6"
        style={{
          background:
            "linear-gradient(112.13deg, rgba(255,255,255,0.6) 0%, rgba(113,156,191,0.25) 98.3%)",
        }}
      >
        <h2 className="text-3xl font-bold text-center text-[#4A5C74] mb-2">
          Create Your Account
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* Row 1: First Name & Company Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="firstName"
              placeholder="Your First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="rounded-xl px-5 py-3 bg-[#124B7A24] text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
            <input
              type="text"
              name="companyName"
              placeholder="Your Company Name"
              value={formData.companyName}
              onChange={handleChange}
              className="rounded-xl px-5 py-3 bg-[#124B7A24] text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>

          {/* Row 2: Email & Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="email"
              name="email"
              placeholder="Your Email Address"
              value={formData.email}
              onChange={handleChange}
              className="rounded-xl px-5 py-3 bg-[#124B7A24] text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Your Phone Number"
              value={formData.phone}
              onChange={handleChange}
              className="rounded-xl px-5 py-3 bg-[#124B7A24] text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Row 3: Domain with Check Availability */}
          <div className="grid grid-cols-[2fr_1fr] gap-4">
            <input
              type="text"
              name="domain"
              placeholder="Your Domain"
              value={formData.domain}
              onChange={handleChange}
              className="rounded-xl px-5 py-3 bg-[#124B7A24] text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
            <button
              type="button"
              onClick={handleDomainCheck}
              disabled={checkingDomain}
              className="rounded-xl bg-[#6A9ECF] hover:bg-[#5c91c4] text-white font-medium transition"
            >
              {checkingDomain ? "Checking..." : "Check"}
            </button>
          </div>

          {/* Password */}
          <input
            type="password"
            name="password"
            placeholder="Create a strong password (min 8 characters)"
            value={formData.password}
            onChange={handleChange}
            className="rounded-xl px-5 py-3 bg-[#124B7A24] text-black placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
            required
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-4 rounded-xl font-bold text-white
              bg-[#6A9ECF] hover:bg-[#5c91c4] shadow-lg border border-white/30
              transition"
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
