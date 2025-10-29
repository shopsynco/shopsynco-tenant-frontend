// src/services/api.ts

import { BASE_URL } from "../../axios_config";

export const fetchPlans = async () => {
  try {
    const response = await fetch(`${BASE_URL}/api/platform-admin/plans/available/`);
    if (!response.ok) {
      throw new Error("Failed to fetch plans");
    }
    const data = await response.json();
    return data.plans; // Return the plans array
  } catch (error) {
    console.error("Error fetching plans:", error);
    throw error; // Rethrow error to handle it in the calling component
  }
};
