import axiosInstance from "../../store/refreshToken/tokenUtils";


export const fetchPlans = async () => {
  try {
    // Making the GET request using Axios
    const response = await axiosInstance.get("/api/tenants/pricing/options/");
    console.log("Fetched plans:", response.data);
    
    return response.data.plans; // Assuming the API response has 'plans' field
    
  } catch (error) {
    console.error("Error fetching plans:", error);
    throw error; 
  }
};


export const getPricingQuote = async (plan_id: string, months: string, country: string) => {
  try {
    const response = await axiosInstance.get(
      `/api/tenants/pricing/quote/?plan_id=${plan_id}&months=${months}&country=${country}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching pricing quote:", error);
    throw error;
  }
};
