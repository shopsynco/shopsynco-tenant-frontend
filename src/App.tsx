import React from "react";
import AppRoutes from "./routes/AppRoute";

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: unknown }
> {
  state = { hasError: false, error: null as unknown };

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      const msg =
        this.state.error instanceof Error
          ? this.state.error.message
          : String(this.state.error);
      return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
          <div className="max-w-2xl w-full border border-red-200 bg-red-50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-red-700 mb-2">
              App crashed while rendering
            </h2>
            <p className="text-sm text-red-800 break-words">{msg}</p>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => window.location.assign("/dashboard")}
                className="px-4 py-2 rounded-lg bg-[#719CBF] text-white font-semibold"
              >
                Go to dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
    </ErrorBoundary>
  );
}

export default App;
