import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { loginUser } from "../../../store/authSlice";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "../components/AuthLayout";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ email, password }));

    if (loginUser.fulfilled.match(result)) {
      Swal.fire("Success", "Login Successful", "success");
      navigate("/Plans");
    } else {
      Swal.fire("Error", result.payload as string, "error");
    }
  };

  return (
    <AuthLayout>
      {/* ✅ Login Form (Right Side) */}
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
          Login
        </h2>

        {/* Email Input */}
        <input
          type="email"
          placeholder="Email"
          className="rounded-xl px-5 py-4 w-full 
                     bg-[#124B7A24] text-black 
                     placeholder:text-gray-600
                     focus:outline-none focus:ring-2 focus:ring-purple-400"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password Input */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="rounded-xl px-5 py-4 w-full 
                       bg-[#124B7A24] text-black 
                       placeholder:text-gray-600
                       focus:outline-none focus:ring-2 focus:ring-purple-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-5 text-[#4A5C74] hover:text-[#6A9ECF]"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {/* Forgot Password */}
        <div className="text-right">
          <button
            type="button"
            onClick={() =>
              navigate(`/forget-password?email=${encodeURIComponent(email)}`)
            }
            className="text-[#4A5C74] hover:text-[#6A9ECF] hover:underline text-sm font-medium transition"
          >
            Forgot Password?
          </button>
        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full py-4 rounded-xl font-bold text-white
            bg-[#6A9ECF] hover:bg-[#5c91c4] shadow-lg border border-white/30
            transition"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Sign Up Link */}
        <p className="text-center text-sm text-[#4A5C74] mt-2">
          Don’t have an account?{" "}
          <a
            href="#"
            className="text-[#6A9ECF] font-medium hover:underline transition"
            onClick={() => navigate("/signup")}
          >
            Sign Up
          </a>
        </p>
      </form>
    </AuthLayout>
  );
}
