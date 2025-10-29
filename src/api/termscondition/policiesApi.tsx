import axios from "axios";
import { BASE_URL } from "../../axios_config";

export interface Policy {
  id: number;
  title: string;
  slug: string;
  content: string;
}

export const getLegalPolicies = async (): Promise<Policy[]> => {
  try {
    const response = await axios.get(`${BASE_URL}api/setting/legal/policies/`);
    return response.data;
  } catch (error: any) {
    console.error("Failed to fetch legal policies:", error);
    throw new Error("Unable to load policies. Please try again later.");
  }
};
