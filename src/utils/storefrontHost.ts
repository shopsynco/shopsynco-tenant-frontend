export const STOREFRONT_HOST_KEY = "storefront_host";

export function platformDomainSuffix(): string {
  return (
    (import.meta.env.VITE_PLATFORM_TENANT_DOMAIN_SUFFIX as string | undefined)
      ?.trim()
      .toLowerCase()
      .replace(/^\./, "") || "shopsynco.com"
  );
}

/** Checkout placeholders use internal sgn… schema names — not customer-facing hosts. */
export function isInternalCheckoutSchemaSlug(value: string): boolean {
  const label = (value || "").trim().toLowerCase().split(".")[0];
  return /^sgn[a-f0-9]{8,}$/i.test(label);
}

export function normalizeStorefrontHost(raw: string): string {
  let host = (raw || "").trim().toLowerCase();
  if (!host) return "";
  host = host.replace(/^https?:\/\//, "").split("/")[0];
  if (host.startsWith("www.")) host = host.slice(4);
  if (!host.includes(".")) {
    host = `${host}.${platformDomainSuffix()}`;
  }
  return host;
}

export function readStorefrontHost(): string {
  try {
    const host = normalizeStorefrontHost(localStorage.getItem(STOREFRONT_HOST_KEY) || "");
    if (!host || isInternalCheckoutSchemaSlug(host)) return "";
    return host;
  } catch {
    return "";
  }
}

export function saveStorefrontHost(raw: string): void {
  const host = normalizeStorefrontHost(raw);
  if (!host || isInternalCheckoutSchemaSlug(host)) return;
  localStorage.setItem(STOREFRONT_HOST_KEY, host);
}

export function saveStorefrontHostFromDomainLabel(domainLabel: string): void {
  saveStorefrontHost(domainLabel);
}

export function saveStorefrontFromSetupTenant(tenant?: {
  domain?: string;
  schema_name?: string;
}): void {
  if (tenant?.domain) {
    saveStorefrontHost(tenant.domain);
  }
  if (tenant?.schema_name) {
    localStorage.setItem("store_slug", tenant.schema_name);
  }
}

export function storefrontUrlFromHost(host: string): string {
  const normalized = normalizeStorefrontHost(host);
  return normalized ? `https://${normalized}` : "";
}
