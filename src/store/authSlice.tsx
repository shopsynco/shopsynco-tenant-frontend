import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance, { LOGIN_URL, REFRESH_URL } from "./refreshToken/tokenUtils";
import { clearPlanFlowFlags, markTenantSubscriptionActive } from "../utils/planFlow";
import { clearOnboardingTermsAcceptance } from "../utils/termsAcceptance";
import { readTenantSlugFromAccessToken } from "../utils/tenantStoreSlug";

const SESSION_REQUIRES_STORE_SETUP = "tenant_requires_store_setup";
const SESSION_STORE_SETUP_INCOMPLETE = "tenant_store_setup_incomplete";

/** Returned from login thunk (also used by LoginPage for routing). */
export type LoginSuccessPayload = {
  access: string;
  refresh: string;
  requires_store_setup: boolean;
  action_required: string | null;
  loginMessage: string | null;
  has_active_subscription: boolean;
  store_setup_incomplete: boolean;
};

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  accessToken: localStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken"),
  loading: false,
  error: null,
};

// ✅ Login Thunk
export const loginUser = createAsyncThunk<
  LoginSuccessPayload,
  { email: string; password: string },
  { rejectValue: string }
>("auth/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    const res = await axiosInstance.post(LOGIN_URL, credentials);
    const { access, refresh } = res.data;

    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);

    const jwtSlug = readTenantSlugFromAccessToken();
    if (jwtSlug) {
      localStorage.setItem("store_slug", jwtSlug);
    }

    const userEmail = res.data?.user?.email;
    if (typeof userEmail === "string" && userEmail.trim()) {
      localStorage.setItem("user_email", userEmail.trim());
    }

    // Stale slug breaks onboarding: interceptor would call .../{slug}/store/setup/ → 404
    const requiresStoreSetup = Boolean(res.data?.requires_store_setup);
    if (requiresStoreSetup) {
      localStorage.removeItem("store_slug");
    }
    try {
      if (requiresStoreSetup) {
        sessionStorage.setItem(SESSION_REQUIRES_STORE_SETUP, "1");
      } else {
        sessionStorage.removeItem(SESSION_REQUIRES_STORE_SETUP);
      }
    } catch {
      /* ignore */
    }

    const hasActiveSubscription = Boolean(res.data?.has_active_subscription);
    if (hasActiveSubscription) {
      markTenantSubscriptionActive();
    } else {
      // Prevent stale local flag from allowing dashboard access without payment.
      localStorage.removeItem("tenant_subscription_active");
    }

    const storeSetupIncomplete = Boolean(res.data?.store_setup_incomplete);
    try {
      if (storeSetupIncomplete) {
        sessionStorage.setItem(SESSION_STORE_SETUP_INCOMPLETE, "1");
      } else {
        sessionStorage.removeItem(SESSION_STORE_SETUP_INCOMPLETE);
      }
    } catch {
      /* ignore */
    }

    return {
      access,
      refresh,
      requires_store_setup: Boolean(res.data?.requires_store_setup),
      action_required:
        typeof res.data?.action_required === "string"
          ? res.data.action_required
          : null,
      loginMessage:
        typeof res.data?.message === "string" ? res.data.message : null,
      has_active_subscription: hasActiveSubscription,
      store_setup_incomplete: storeSetupIncomplete,
    };
  } catch (err: unknown) {
    const ax = err as {
      response?: {
        data?: { detail?: unknown; message?: unknown; code?: unknown };
      };
    };
    const data = ax.response?.data;
    const msg =
      typeof data?.message === "string"
        ? data.message
        : typeof data?.detail === "string"
          ? data.detail
          : "Login failed, please try again.";
    return rejectWithValue(msg);
  }
});

// ✅ Refresh Token Thunk
export const refreshAccessToken = createAsyncThunk(
  "auth/refreshAccessToken",
  async (_, { rejectWithValue }) => {
    const refresh = localStorage.getItem("refreshToken");
    if (!refresh) return rejectWithValue("No refresh token found");

    try {
      const res = await axiosInstance.post(REFRESH_URL, { refresh });
      const { access } = res.data;

      localStorage.setItem("accessToken", access);
      if (typeof res.data.refresh === "string" && res.data.refresh.length > 0) {
        localStorage.setItem("refreshToken", res.data.refresh);
      }
      return access;
    } catch {
      return rejectWithValue("Token refresh failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      clearPlanFlowFlags();
      clearOnboardingTermsAcceptance();
      try {
        sessionStorage.removeItem(SESSION_REQUIRES_STORE_SETUP);
        sessionStorage.removeItem(SESSION_STORE_SETUP_INCOMPLETE);
      } catch {
        /* ignore */
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.access;
        state.refreshToken = action.payload.refresh;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload;
        state.refreshToken = localStorage.getItem("refreshToken");
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
