/** Manager dashboard paths opened from the tenant SaaS dashboard. */
export const ONBOARDING_MANAGER_PATHS = {
  storeDetails: "/settings/store-details",
  addProduct: "/products/add",
  addCategory: "/products/categories/add",
  contentManagementTemplates: "/content?tab=templates",
  contentManagementSaved: "/content?tab=saved",
  paymentsBilling: "/settings/payments-billings",
} as const;

export function resolveCustomizeWebsitePath(hasSavedStyles: boolean): string {
  return hasSavedStyles
    ? ONBOARDING_MANAGER_PATHS.contentManagementSaved
    : ONBOARDING_MANAGER_PATHS.contentManagementTemplates;
}
