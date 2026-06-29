import axiosInstance from "../store/refreshToken/tokenUtils";
import { resolveTenantStoreSlugForApi } from "../utils/tenantStoreSlug";

function managerCategoryPath(): string {
  const slug = resolveTenantStoreSlugForApi();
  if (!slug) throw new Error("Store context missing");
  return `api/manager/${slug}/products/categories`;
}

export const onboardingApi = {
  async getStoreDetails() {
    const { data } = await axiosInstance.get("api/manager/store-details/");
    return data;
  },

  async getKpis() {
    const { data } = await axiosInstance.get("api/manager/dashboard/kpis/");
    return data;
  },

  async getCategories() {
    const base = managerCategoryPath();
    const { data } = await axiosInstance.get(`${base}/`);
    return data;
  },

  async getLayout() {
    const { data } = await axiosInstance.get("api/content/layout/");
    return data;
  },

  async getSavedStyles() {
    const { data } = await axiosInstance.get("api/content/saved-styles/");
    return data;
  },

  async getPaymentGateways() {
    const { data } = await axiosInstance.get("api/manager/billing/payment-gateways/");
    return data;
  },
};
