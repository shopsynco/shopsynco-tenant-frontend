import { BASE_URL } from "../../axios_config";
import axiosInstance from "../../refreshToken/tokenUtils";

export interface StoreSetupPayload {
  store_name: string;
  product_service: string;
  domain: string;
}

export const storeSetup = async (data: StoreSetupPayload) => {
  try {
    const response = await axiosInstance.post(
      `${BASE_URL}api/tenants/pqrs_company/store/setup/`,
      data,
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error: any) {
    console.error("Store setup failed:", error);
    throw error;
  }
};
