const SITE_NAME = "ShopSynco";

export const DEFAULT_META_DESCRIPTION =
  "Manage your ShopSynco store subscription, billing, plans, and merchant dashboard.";

type RouteMeta = {
  title: string;
  description?: string;
};

/** Path (no trailing slash) → browser tab title suffix after "ShopSynco –". */
const ROUTE_META: Record<string, RouteMeta> = {
  "/": { title: "Sign In", description: "Sign in to your ShopSynco merchant dashboard." },
  "/login": { title: "Sign In", description: "Sign in to your ShopSynco merchant dashboard." },
  "/signup": { title: "Sign Up", description: "Create your ShopSynco merchant account." },
  "/email-verify": { title: "Verify Email", description: "Verify your email to continue with ShopSynco." },
  "/verify-email": { title: "Verify Email", description: "Enter the verification code sent to your email." },
  "/verify-email-expired": { title: "Verification Expired", description: "Request a new ShopSynco verification code." },
  "/forget-password": { title: "Forgot Password", description: "Reset your ShopSynco account password." },
  "/reset-password": { title: "Reset Password", description: "Choose a new password for your ShopSynco account." },
  "/Resetpassword-Success": { title: "Password Updated", description: "Your ShopSynco password was reset successfully." },
  "/dashboard": { title: "Dashboard", description: DEFAULT_META_DESCRIPTION },
  "/plans": { title: "Choose Plan", description: "Select a ShopSynco subscription plan for your store." },
  "/payment": { title: "Checkout", description: "Complete your ShopSynco plan payment." },
  "/upgrade-payment": { title: "Upgrade Plan", description: "Pay to upgrade your ShopSynco subscription." },
  "/payment-success": { title: "Payment Successful", description: "Your ShopSynco payment was completed." },
  "/setup-store": { title: "Store Setup", description: "Set up your ShopSynco online store." },
  "/setup-store-contact": { title: "Store Contact", description: "Add location and contact details for your store." },
  "/store-success": { title: "Store Created", description: "Your ShopSynco store is ready." },
  "/feature-store": { title: "Feature Store", description: "Browse and add ShopSynco plan features." },
  "/manage-billing": { title: "Manage Billing", description: "Update payment methods and billing settings." },
  "/invoice": { title: "Invoices", description: "View and download your ShopSynco invoices." },
  "/onboarding/terms": { title: "Accept Terms", description: "Review and accept ShopSynco policies." },
  "/all-routes": { title: "Routes", description: "ShopSynco tenant app route index." },
};

function normalizePath(pathname: string): string {
  const base = pathname.split("?")[0]?.split("#")[0] || "/";
  if (base.length > 1 && base.endsWith("/")) {
    return base.slice(0, -1);
  }
  return base || "/";
}

export function resolveRouteMeta(pathname: string): RouteMeta {
  const path = normalizePath(pathname);

  if (ROUTE_META[path]) {
    return ROUTE_META[path];
  }

  if (path.startsWith("/legal/")) {
    const slug = path.slice("/legal/".length);
    const label = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, " ");
    return {
      title: label || "Legal",
      description: "ShopSynco legal policies and terms.",
    };
  }

  return {
    title: "Merchant Dashboard",
    description: DEFAULT_META_DESCRIPTION,
  };
}

export function formatDocumentTitle(title: string): string {
  return `${SITE_NAME} – ${title}`;
}

export function applyDocumentMeta(meta: RouteMeta): void {
  document.title = formatDocumentTitle(meta.title);

  const description = meta.description || DEFAULT_META_DESCRIPTION;
  let descTag = document.querySelector('meta[name="description"]');
  if (!descTag) {
    descTag = document.createElement("meta");
    descTag.setAttribute("name", "description");
    document.head.appendChild(descTag);
  }
  descTag.setAttribute("content", description);
}
