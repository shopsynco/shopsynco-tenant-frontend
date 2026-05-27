import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import { store } from "./store/Store";
import "./index.css";

// Legacy capital-P path: normalize before React Router runs (bookmark / bad redirects).
{
  const path = window.location.pathname;
  if (path === "/Plans" || path === "/Plans/") {
    window.history.replaceState(
      null,
      "",
      `/plans${window.location.search}${window.location.hash}`
    );
  }
}

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element #root not found");
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
