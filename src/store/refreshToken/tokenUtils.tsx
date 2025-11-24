import axios from "axios";
import { BASE_URL } from "../../api/axios_config";

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
    // 🏷️ Get store slug from localStorage for multi-tenant routing
    const storeSlug = localStorage.getItem("store_slug");

    // 🟦 DEBUG: show request start
    console.log(
      "%c[Axios] → Outgoing Request:",
      "color:#3b82f6;font-weight:bold",
      config.url
    );

    // ✅ Add bearer token
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(
        "%c[Axios] ✓ Token added to headers",
        "color:#22c55e;font-weight:bold"
      );
    } else {
      console.log(
        "%c[Axios] ⚠️ No access token found — public request",
        "color:#eab308;font-weight:bold"
      );
    }

    // ==========================================
    // 🏷️ STORE SLUG INJECTION LOGIC START
    // ==========================================

    const skipSlugInjection =
      config.url &&
      (config.url.includes("auth/") ||
        config.url.includes("jwt/") ||
        config.url.includes("discover/") ||
        config.url.includes("signup/"));

    if (!skipSlugInjection && storeSlug && config.url) {
      let url = config.url.replace(/^\/+/, "");

      // Define prefixes that should NEVER get the slug injected.
      // Add any other endpoints you want to exempt here.
      const noSlugPrefixes = [
        "api/tenants/pricing", // pricing endpoints
        "api/tenants/payment", // payment endpoints (plural)
        "api/tenant/payment", // payment endpoints (singular)
        "api/tenants/payment/", // defensive variants
        "api/tenant/payment/", // defensive variants
        "api/tenants/pricing/options", // specific endpoints if needed
        "api/tenants/pricing/quote", // specific endpoints if needed
      ];

      // If the URL starts with any of the no-slug prefixes, skip injection.
      for (const prefix of noSlugPrefixes) {
        if (
          url === prefix ||
          url.startsWith(prefix + "/") ||
          url.startsWith(prefix + "?")
        ) {
          console.log(
            "%c[Axios] ⛔ Skipping slug injection for:",
            "color:#f97316;font-weight:bold",
            url
          );
          return config;
        }
      }

      // Match: api/tenants/<something...>
      if (url.startsWith("api/tenants/")) {
        const parts = url.split("/"); // ["api", "tenants", "..."]

        // Already injected → do nothing
        if (parts[2] === storeSlug) {
          return config;
        }

        // Insert slug after "tenants"
        parts.splice(2, 0, storeSlug);

        const newUrl = parts.join("/");

        config.url = newUrl;

        console.log(
          "%c[Axios] 🏷️ Slug injected:",
          "color:#a855f7;font-weight:bold",
          storeSlug,
          "→",
          config.url
        );
      }
    }

    // ==========================================
    // 🏷️ STORE SLUG INJECTION LOGIC END
    // ==========================================

    return config;
  },
  (error) => {
    console.error("[Axios] ❌ Request error:", error);
    return Promise.reject(error);
  }
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

    // 🔴 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        console.log(
          "%c[Auth] 🕐 Token refresh in progress...",
          "color:#f59e0b"
        );
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

        console.log("%c[Auth] 🔄 Refreshing token...", "color:#06b6d4");
        const res = await axios.post(REFRESH_URL, { refresh: refreshToken });
        const newAccessToken = res.data.access;

        localStorage.setItem("accessToken", newAccessToken);
        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newAccessToken}`;

        console.log(
          "%c[Auth] ✅ Token refreshed successfully!",
          "color:#22c55e;font-weight:bold"
        );

        processQueue(null, newAccessToken);
        return axiosInstance(originalRequest);
      } catch (err) {
        console.error("%c[Auth] ❌ Token refresh failed", "color:#ef4444");
        processQueue(err, null);

        // 🚪 Force logout
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        console.warn(
          "%c[Auth] 🚪 Logged out due to expired token",
          "color:#ef4444"
        );
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // Generic error log
    console.error(
      "[Axios] ❌ Response error:",
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

export { LOGIN_URL, REFRESH_URL };
export default axiosInstance;
