import { resolveTenantManagerBaseUrl } from "../../api/axios_config";

/**
 * Open the manager dashboard SPA with the current tenant session, so the
 * manager app does not ask for credentials again (cross-origin localStorage
 * cannot be shared — pass JWT via query handoff already supported on manager
 * `/login`).
 */
export function openManagerDashboardPath(path = "/store-overview"): void {
  const base = resolveTenantManagerBaseUrl();
  if (!base) {
    window.alert(
      "Manager dashboard URL is not configured. Set VITE_TENANT_MANAGER_ORIGIN in your environment.",
    );
    return;
  }

  const access = (localStorage.getItem("accessToken") || "").trim();
  const refresh = (localStorage.getItem("refreshToken") || "").trim();
  const slug = (localStorage.getItem("store_slug") || "").trim();

  const targetPath = (path || "/store-overview").startsWith("/")
    ? path || "/store-overview"
    : `/${path}`;

  if (!access || !refresh) {
    // Not signed in on tenant app — send them to manager login.
    window.open(`${base}/login`, "_blank", "noopener,noreferrer");
    return;
  }

  const params = new URLSearchParams();
  params.set("auth_access_token", access);
  params.set("auth_refresh_token", refresh);
  params.set("redirect", targetPath);
  if (slug) params.set("store_slug", slug);

  window.open(
    `${base}/login?${params.toString()}`,
    "_blank",
    "noopener,noreferrer",
  );
}
