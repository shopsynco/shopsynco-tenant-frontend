import axiosInstance from "../../store/refreshToken/tokenUtils";
import { saveStorefrontHost } from "../../utils/storefrontHost";

export interface DiscoverResponse {
  slug?: string;
  tenant_slug?: string;
  storefront_host?: string | null;
  user_exists?: boolean;
  has_tenant?: boolean;
  requires_store_setup?: boolean;
  message?: string;
}
// 5️⃣ Discover store slug by email — no slug injection
export const discoverTenantSlug = async (
  email: string
): Promise<DiscoverResponse> => {
  try {
    // Make the API call to get the slug
    const res = await axiosInstance.post(`api/tenants/discover/`, { email });

    // Check if the response contains tenant_slug
    const slug = res.data?.tenant_slug ?? res.data?.slug;
    if (slug) {
      localStorage.setItem("store_slug", slug);
    }

    const storefrontHost = res.data?.storefront_host;
    if (typeof storefrontHost === "string" && storefrontHost.trim()) {
      saveStorefrontHost(storefrontHost);
    }

    return res.data;
  } catch (error) {
    console.error("Failed to get store slug:", error);
    throw error; // You can also handle the error here if needed
  }
};
