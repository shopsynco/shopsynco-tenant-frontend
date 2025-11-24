import axios from "axios";
import { BASE_URL } from "../axios_config";

export interface Policy {
  id: number;
  title: string;
  content: string;
}

// Support both direct array and paginated response formats
export type PoliciesResponse = Policy[] | { results: Policy[] };

export const getLegalPolicies = async (): Promise<PoliciesResponse> => {
  try {
    const response = await axios.get(`${BASE_URL}api/setting/legal/policies/`);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Failed to fetch legal policies:", errorMessage);
    throw new Error("Unable to load policies. Please try again later.");
  }
};
