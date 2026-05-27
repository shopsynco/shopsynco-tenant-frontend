import { Navigate } from "react-router-dom";

/** @deprecated Use `/legal/terms` — kept for any old bookmarks. */
export default function PrivacyandPolicies() {
  return <Navigate to="/legal/terms" replace />;
}
