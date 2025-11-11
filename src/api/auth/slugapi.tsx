import axiosInstance from "../../refreshToken/tokenUtils";


const SLUG_URL = "api/tenants/discover/";

export interface DiscoverPayload {
  email: string;
}

export const createSlug = async (data: DiscoverPayload) => {
  try {
    const response = await axiosInstance.post(SLUG_URL, data);
    return response.data;
  } catch (error: any) {
    console.error("Slug creation failed:", error);
    throw error;
  }
};
