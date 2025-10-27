// src/api/authApi.ts

import { BASE_URL } from "../../axios_config";
import axiosInstance from "../../refreshToken/tokenUtils";

export const authApi = {
  // 🔹 Forgot Password
  forgotPassword: (email: string) =>
    axiosInstance.post(
      `${BASE_URL}api/tenant/pqrs_company/auth/forgot-password/`,
      { email }
    ),

//   // 🔹 Reset Password (optional future)
//   resetPassword: (data: { token: string; password: string }) =>
//     axiosInstance.post(
//       `${BASE_URL}api/tenant/pqrs_company/auth/reset-password/`,
//       data
//     ),

//   // 🔹 Login (if you ever want to call it directly)
//   login: (credentials: { email: string; password: string }) =>
//     axiosInstance.post(
//       `${BASE_URL}api/tenant/pqrs_company/auth/login/`,
//       credentials
//     ),
};

export default authApi;
