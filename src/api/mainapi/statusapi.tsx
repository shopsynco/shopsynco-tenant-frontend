import axiosInstance from "../../store/refreshToken/tokenUtils";


export const fetchSubscriptionStatus = async () => {
  try {
    const response = await axiosInstance.get("api/subscription/status/");
    return response.data; 
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    throw error;
  }
};

export const fetchSubscriptionHistory = async () => {
  try {
    const response = await axiosInstance.get("api/subscription/history/");
    return response.data; 
   
  } catch (error) {
    console.error("Error fetching subscription history:", error);
    throw error;
  }
};

export const upgradeSubscriptionPlan = async (planId: string) => {
  try {
    const response = await axiosInstance.post("/api/subscription/upgrade/", {
      plan_id: planId,
    });

    /* ✅ Expected backend response example:
      {
        "message": "Upgrade successful",
        "new_plan": "Professional",
        "next_payment_date": "2026-08-25"
      }
    */
    return response.data;
  } catch (error) {
    console.error("Error upgrading subscription plan:", error);
    throw error;
  }
};

export const fetchTenantDashboard = async () => {
  try {
    const response = await axiosInstance.get("api/tenants/dashboard/");
    
    return response.data;
  } catch (error: any) {
    console.error("Error fetching dashboard:", error);
    throw error;
  }
};