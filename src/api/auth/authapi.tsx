import axios from "axios";
import { BASE_URL } from "../axios_config";
import axiosInstance from "../../store/refreshToken/tokenUtils";

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

export const verifyResetCode = async ({
  email,
  verification_code,
}: {
  email: string;
  verification_code: string;
}) => {
  try {
    const response = await axios.post(
      `${BASE_URL}api/user/auth/verify-reset-code/`,
      { email, verification_code },
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

export const resendVerificationCode = async ({ email }: { email: string }) => {
  try {
    console.log("[RESEND] Request payload:", { email });
    const response = await axios.post(
      `${BASE_URL}api/user/auth/resend-verification-code/`,
      { email },
      { headers: { "Content-Type": "application/json" } }
    );
    

    return response.data;
  } catch (error: any) {
    const message =
      error.response?.data?.message || "Unable to resend verification code.";
    throw new Error(message);
  }
};

// ✅ Export as a single object for easy import
export const authApi = {
  forgotPassword,
  verifyResetCode,
  resetPassword,
  resendVerificationCode,
};
// In your authapi.tsx
export interface RegisterPayload {
  first_name: string;
  company_name: string;
  email: string;
  phone: string;
  password: string;
  confirm_password: string; // Change from confirmPassword to confirm_password
}

export const registerUser = async (data: RegisterPayload) => {
  try {
    const response = await axios.post(`https://stagingbackend.shopsynco.com/api/tenants/signup/`, data, {
    // const response = await axios.post(`${BASE_URL}api/tenants/signup/`, data, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });
    
    return response.data;
  } catch (error: any) {
    // DEBUG: Log the complete error response
    console.log("🔍 FULL ERROR RESPONSE:", error.response);
    console.log("🔍 ERROR DATA:", error.response?.data);
    
    if (error.response?.data) {
      const data = error.response.data;
      console.log("🔍 ERROR DATA TYPE:", typeof data);
      console.log("🔍 ERROR DATA KEYS:", Object.keys(data));
      
      // Handle different error response formats
      if (data.email) {
        const emailError = Array.isArray(data.email) ? data.email[0] : data.email;
        console.log("🔍 EMAIL ERROR:", emailError);
        throw new Error(emailError);
      } else if (data.detail) {
        throw new Error(data.detail);
      } else if (data.message) {
        throw new Error(data.message);
      } else if (typeof data === 'string') {
        throw new Error(data);
      } else if (Array.isArray(data) && data.length > 0) {
        throw new Error(data[0].message || JSON.stringify(data[0]));
      }
      // Handle non-field errors object
      else if (typeof data === 'object') {
        const firstErrorKey = Object.keys(data)[0];
        const firstError = data[firstErrorKey];
        const errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
        throw new Error(errorMessage);
      }
    }
    
    throw new Error(error.message || "Registration failed. Please try again.");
  }
};

export const discoverTenant = async (domain: string) => {
  const response = await axios.post(`${BASE_URL}api/tenants/discover/`, {
    domain,
  });
  return response.data;
};

export const fetchUserProfile = async () => {
  try {
    const response = await axiosInstance.get("api/tenants/auth/profile/");
    return response.data; // expected: { user_name: "...", user_email: "..." }
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};