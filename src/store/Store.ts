import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice"; // ✅ Add this import

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// ✅ Typed hooks support for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
