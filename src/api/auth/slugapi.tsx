import axiosInstance from "../../store/refreshToken/tokenUtils";

export interface DiscoverResponse {
  slug: string;
  exists?: boolean;
}
// 5️⃣ Discover store slug by email — no slug injection
export const discoverTenantSlug = async (
  email: string
): Promise<DiscoverResponse> => {
  try {
    // Make the API call to get the slug
    const res = await axiosInstance.post(`api/tenants/discover/`, { email });

    // Check if the response contains tenant_slug
    if (res.data?.tenant_slug) {
      // Store the slug in localStorage
      localStorage.setItem("store_slug", res.data.tenant_slug);
      // Slug saved to localStorage
    }

    return res.data; // Return the response data
  } catch (error) {
    console.error("Failed to get store slug:", error);
    throw error; // You can also handle the error here if needed
  }
};
