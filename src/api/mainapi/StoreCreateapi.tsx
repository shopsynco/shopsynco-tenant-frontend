// src/api/mainapi/StoreCreateapi.ts

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
  slug: string;
  message?: string;
  success?: boolean;
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
  success: boolean;
  message?: string;
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
  const response = await axiosInstance.post(`api/tenants/store/setup/`, data);
  return response.data;
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
  const res = await axiosInstance.post(`api/tenants/store/setup/`, data);
  return res.data;
};

// 5️⃣ Discover store slug by email — no slug injection
export const getStoreSlug = async (email: string): Promise<DiscoverResponse> => {
  const res = await axiosInstance.post(`api/tenants/discover/`, { email });
  return res.data;
};
