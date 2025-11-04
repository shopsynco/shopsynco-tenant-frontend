import axios from "axios";
import { BASE_URL } from "../axios_config";

// ✅ API Endpoints
const LOGIN_URL = `${BASE_URL}api/tenants/auth/login/`;
const REFRESH_URL = `${BASE_URL}api/jwt/refresh/`;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// ✅ Attach Access Token + Auto Inject Store Slug into URL (with skip list)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    const storeSlug = localStorage.getItem("store_slug");

    // ✅ Add bearer token
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ Skip slug injection for auth/refresh/discover endpoints
    const skipSlugInjection =
      config.url &&
      (config.url.includes("auth/") ||
        config.url.includes("jwt/") ||
        config.url.includes("discover/"));

    // ✅ Inject slug into URL if needed
    if (!skipSlugInjection && storeSlug && config.url && !config.url.includes(`/api/${storeSlug}/`)) {
      const normalizedUrl = config.url.replace(/^\/+/, ""); // remove leading slash
      if (normalizedUrl.startsWith("api/")) {
        config.url = normalizedUrl.replace("api/", `api/${storeSlug}/`);
      } else {
        config.url = `api/${storeSlug}/${normalizedUrl}`;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ♻️ Token Refresh Logic
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: string | null) => void;
  reject: (error?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (token)
              originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch(Promise.reject);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh token found");

        const res = await axios.post(REFRESH_URL, { refresh: refreshToken });
        const newAccessToken = res.data.access;

        localStorage.setItem("accessToken", newAccessToken);
        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;

        console.log(
          "%c[Auth] Token refreshed successfully!",
          "color: #22c55e; font-weight: bold;"
        );

        processQueue(null, newAccessToken);
        return axiosInstance(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export { LOGIN_URL, REFRESH_URL };
export default axiosInstance;
