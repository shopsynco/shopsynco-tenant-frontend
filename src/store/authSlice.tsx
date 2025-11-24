import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance, { LOGIN_URL, REFRESH_URL } from "./refreshToken/tokenUtils";

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
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await axiosInstance.post(LOGIN_URL, credentials);
      const { access, refresh } = res.data;

      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);

      return { access, refresh };
    } catch (err: any) {
      const msg =
        err.response?.data?.detail || "Login failed, please try again.";
      return rejectWithValue(msg);
    }
  }
);

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
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
