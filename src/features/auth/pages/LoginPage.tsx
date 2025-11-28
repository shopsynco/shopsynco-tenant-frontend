import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { loginUser } from "../../../store/authSlice";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import shopLogo from "../../../assets/Name-Logo.png";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((state: any) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      Swal.fire("Error", "Please enter both email and password.", "error");
      return;
    }

    try {
      const result = await dispatch(
        // cast to any if your thunk types are not set up
        loginUser({ email: email.trim(), password } as any)
      );

      // success path
      if (loginUser.fulfilled.match(result)) {
        Swal.fire("Success", "Login Successful", "success");
        navigate("/Plans");
      } else {
        // failure: ensure error message is a string
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

        Swal.fire("Error", errMsg, "error");
      }
    } catch (err: any) {
      Swal.fire("Error", err?.message || "Something went wrong", "error");
    }
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
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src={shopLogo}
            alt="ShopSynco Logo"
            className="h-16 w-auto object-contain"
          />
        </div>

        {/* Title */}
        <h2
          id="login-title"
          className="text-3xl font-bold text-center mb-4 
            bg-gradient-to-r from-[#7658A0] to-[#4A3B5E]
            bg-clip-text text-transparent font-poppins"
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
            className="rounded-xl px-5 py-4 w-full bg-[#124B7A24]
              text-black placeholder:text-gray-600
              focus:outline-none focus:ring-2 focus:ring-[#719CBF]
              border border-gray-300 transition-all font-raleway"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-required
          />

          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              autoComplete="current-password"
              className="rounded-xl px-5 py-4 w-full bg-[#124B7A24]
                text-black placeholder:text-gray-600
                focus:outline-none focus:ring-2 focus:ring-[#719CBF]
                border border-gray-300 transition-all font-raleway"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-4 text-[#42739A] hover:text-[#6A9ECF] p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

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
