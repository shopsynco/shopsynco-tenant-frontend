import axios from "axios";
import { BASE_URL } from "../../axios_config";

// -----------------------------
// 🔹 Forget Password Code API
// -----------------------------
export const forgotPassword = async (email: string) => {
  try {
    const response = await axios.post(
      `${BASE_URL}api/user/auth/forgot-password/`,
      { email },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error: any) {
    const detail =
      error.response?.data?.detail || "Request failed. Please try again.";
    throw new Error(detail);
  }
};

// -----------------------------
// 🔹 Verify Reset Code API
// -----------------------------
export const verifyResetCode = async (email: string, code: string) => {
  try {
    const response = await axios.post(
      `${BASE_URL}api/user/auth/verify-reset-code/`,
      { email, code },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error: any) {
    const detail =
      error.response?.data?.detail ||
      "Invalid or expired verification code. Please try again.";
    throw new Error(detail);
  }
};

// -----------------------------
// 🔹 Reset Password API
// -----------------------------
export const resetPassword = async (
  email: string,
  password: string,
  confirmPassword: string
) => {
  try {
    const response = await axios.post(
      `${BASE_URL}api/user/auth/reset-password/`,
      { email, password, confirm_password: confirmPassword },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error: any) {
    const detail =
      error.response?.data?.detail || "Password reset failed. Try again.";
    throw new Error(detail);
  }
};

// -----------------------------
// 🔹 Resend Verification Code API
// -----------------------------
export const resendVerificationCode = async (email: string) => {
  try {
    const response = await axios.post(
      `${BASE_URL}api/user/auth/resend-verification-code/`,
      { email },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error: any) {
    const detail =
      error.response?.data?.detail ||
      "Failed to resend verification code. Try again.";
    throw new Error(detail);
  }
};

// ✅ Export as a single object for easy import
export const authApi = {
  forgotPassword,
  verifyResetCode,
  resetPassword,
  resendVerificationCode,
};
export interface RegisterPayload {
  name: string;
  company_name: string;
  admin_email: string;
  phone?: string;
  domain: string;
  admin_password: string;
}

export const registerUser = async (data: RegisterPayload) => {
  try {
    const response = await axios.post(
      `${BASE_URL}api/tenants/signup/`,
      data,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      "Registration failed. Please try again.";
    throw new Error(message);
  }
};
export const discoverTenant = async (domain: string) => {
  const response = await axios.post(`${BASE_URL}api/tenants/discover/`, { domain });
  return response.data;
};