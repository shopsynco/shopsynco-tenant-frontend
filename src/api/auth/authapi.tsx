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
    const response = await axios.post(`${BASE_URL}api/tenants/signup/`, data, {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    return response.data;
  } catch (error: unknown) {
    const errorResponse = error as { response?: { data?: unknown } };
    if (errorResponse?.response?.data) {
      const data = errorResponse.response.data;

      // Handle different error response formats
      if (typeof data === 'object' && data !== null) {
        const dataObj = data as Record<string, unknown>;
        
        if ('email' in dataObj) {
          const emailError = Array.isArray(dataObj.email)
            ? dataObj.email[0]
            : dataObj.email;
          throw new Error(String(emailError));
        } else if ('detail' in dataObj) {
          throw new Error(String(dataObj.detail));
        } else if ('message' in dataObj) {
          throw new Error(String(dataObj.message));
        } else if (Array.isArray(data) && data.length > 0) {
          const firstItem = data[0] as { message?: unknown } | unknown;
          const message = typeof firstItem === 'object' && firstItem !== null && 'message' in firstItem
            ? firstItem.message
            : JSON.stringify(firstItem);
          throw new Error(String(message));
        } else {
          // Handle non-field errors object
          const keys = Object.keys(dataObj);
          if (keys.length > 0) {
            const firstErrorKey = keys[0];
            const firstError = dataObj[firstErrorKey];
            const errorMessage = Array.isArray(firstError)
              ? firstError[0]
              : firstError;
            throw new Error(String(errorMessage));
          }
        }
      } else if (typeof data === "string") {
        throw new Error(data);
      }
    }

    const errorMessage = error instanceof Error ? error.message : "Registration failed. Please try again.";
    throw new Error(errorMessage);
  }
};
// ------------------------------------------------------
// ✅ SEND EMAIL VERIFICATION CODE (after signup)
// ------------------------------------------------------
export const sendEmailVerificationCode = async (email: string) => {
  try {
    const response = await axios.post(
      `${BASE_URL}api/user/pre-signup/verify-email/send/`,
      { email },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || "Failed to send email verification code.");
  }
};

// ------------------------------------------------------
// ✅ VERIFY OTP CODE
// ------------------------------------------------------
export const verifyEmailCode = async (email: string, otp: string) => {
  try {
    const response = await axios.post(
      `${BASE_URL}api/user/pre-signup/verify-email/verify/`,
      { email, verification_code: otp },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || "Invalid or expired verification code.");
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
    const response = await axiosInstance.get("api/tenants/tenant_slug/auth/profile/");
    console.log("User Profile Response:", response.data);
    return response.data; // expected: { user_name: "...", user_email: "..." }
  } catch (error: any) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};
