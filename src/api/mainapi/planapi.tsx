import axiosInstance from "../../refreshToken/tokenUtils";


export const fetchPlans = async () => {
  try {
    // Making the GET request using Axios
    const response = await axiosInstance.get("api/platform-admin/plans/available/");
    
    console.log(response);
    
    return response.data.plans; // Assuming the API response has 'plans' field
    
  } catch (error) {
    console.error("Error fetching plans:", error);
    throw error; 
  }
};
