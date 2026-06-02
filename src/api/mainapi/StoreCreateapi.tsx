// src/api/mainapi/StoreCreateapi.tsx
import axiosInstance from "../../store/refreshToken/tokenUtils";


// ======================
// 🔹 Type Definitions
// ======================

// 🏪 Store creation payload
export interface StoreSetupPayload {
  store_name: string;
  product_service: string;
  domain: string;
}

// 🏪 Store creation response
export interface StoreSetupResponse {
  task_id?: string;
  status?: "pending" | "running" | "completed" | "failed";
  slug?: string;
  message?: string;
  success?: boolean;
  error?: string;
  tenant?: {
    id?: string;
    name?: string;
    schema_name?: string;
    domain?: string;
    localhost_domain?: string;
    trial_days?: number;
  };
}

export interface StoreCategoriesResponse {
  categories: string[];
}

// 🌍 Country
export interface Country {
  id: number;
  name: string;
  iso_code?: string;
}

// 🏙️ State / Region
export interface State {
  id: number;
  name: string;
  country_id?: number;
}

// 📍 Store contact info payload
export interface ContactFormPayload {
  business_address: string;
  country: string;
  state: string;
  contact_email: string;
  contact_number: string;
}

// 📍 Contact setup response
export interface ContactSetupResponse {
  success?: boolean;
  message?: string;
  tenant_slug?: string;
  storefront_host?: string | null;
  store?: {
    id: number;
    slug: string;
    name: string;
  };
}

// 🔍 Slug discovery response
export interface DiscoverResponse {
  slug: string;
  exists?: boolean;
}

// ======================
// 🔹 API Calls
// ======================

// 1️⃣ Create Store — No slug required yet
export const storeSetup = async (data: StoreSetupPayload): Promise<StoreSetupResponse> => {
  const response = await axiosInstance.post(`api/tenants/store/setup/`, data, {
    // Tenant/schema bootstrap can take longer on cold infra.
    timeout: 120000,
  });
  return response.data;
};

export const getStoreSetupStatus = async (taskId: string): Promise<StoreSetupResponse> => {
  const response = await axiosInstance.get(`api/tenants/store/setup/status/${taskId}/`);
  return response.data;
};

// 1.1️⃣ Get backend-driven store setup categories
export const getStoreCategories = async (): Promise<string[]> => {
  const response = await axiosInstance.get(`api/tenants/store/categories/`);
  const list = (response.data as StoreCategoriesResponse | undefined)?.categories;
  return Array.isArray(list) ? list : [];
};

// 2️⃣ Get all countries
export const getCountries = async (): Promise<Country[]> => {
  const res = await axiosInstance.get(`api/main/countries/`);
  return res.data;
};

// 3️⃣ Get states by country ID
export const getStates = async (countryId: number): Promise<State[]> => {
  const res = await axiosInstance.get(`api/main/states/${countryId}/`);
  return res.data;
};

// 4️⃣ Submit contact/location setup
export const storeContactSetup = async (
  data: ContactFormPayload
): Promise<ContactSetupResponse> => {
  const res = await axiosInstance.post(`api/tenants/store/setup/location/`, data);
  return res.data;
};

// 5️⃣ Discover store slug by email — no slug injection
export const getStoreSlug = async (email: string): Promise<DiscoverResponse> => {
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

