import { resolveTenantManagerBaseUrl } from "../../api/axios_config";

export function openManagerDashboardPath(path: string): void {
  const base = resolveTenantManagerBaseUrl();
  if (!base) {
    window.alert(
      "Manager dashboard URL is not configured. Set VITE_TENANT_MANAGER_ORIGIN in your environment.",
    );
    return;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  window.open(`${base}${normalized}`, "_blank", "noopener,noreferrer");
}
