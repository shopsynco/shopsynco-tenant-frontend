import axiosInstance from "../../refreshToken/tokenUtils";

/* ---------------------- 💳 FETCH PAYMENT METHODS ---------------------- */
export const getPaymentMethods = async () => {
  try {
    const res = await axiosInstance.get("/api/tenants/payment/methods/");
    return res.data; // expected: { methods: [...] }
  } catch (error: any) {
    console.error("❌ Error fetching payment methods:", error.response?.data || error.message);
    throw error;
  }
};

/* ---------------------- 💳 SUBMIT CREDIT / BANK PAYMENT ---------------------- */
export const submitPayment = async (payload: {
  subscription_id: string;
  method: "credit_card" | "bank_transfer";
  // credit/debit specific
  card_holder?: string;
  card_last4?: string;
  brand?: string;
  exp_month?: number;
  exp_year?: number;
  cvv_present?: boolean;
  // bank specific
  account_holder?: string;
  account_number?: string;
  bank_name?: string;
  branch_name?: string;
  ifsc?: string;
}) => {
  try {
    const res = await axiosInstance.post("/api/tenants/payment/submit/", payload);
    return res.data;
  } catch (error: any) {
    console.error("❌ Payment submission error:", error.response?.data || error.message);
    throw error;
  }
};

/* ---------------------- 📱 VERIFY UPI ---------------------- */
export const verifyUpi = async (upi_id: string) => {
  try {
    const res = await axiosInstance.post("/api/tenants/payment/upi/verify/", { upi_id });
    return res.data; // expected: { success: true }
  } catch (error: any) {
    console.error("❌ UPI verification error:", error.response?.data || error.message);
    throw error;
  }
};

/* ---------------------- 📱 UPI PAYMENT FINALIZATION ---------------------- */
export const payWithUpi = async (payload: {
  subscription_id: string;
  method: "upi";
  upi_id: string;
}) => {
  try {
    const res = await axiosInstance.post("/api/tenants/payment/upi/pay/", payload);
    return res.data; // expected: { success: true }
  } catch (error: any) {
    console.error("❌ UPI payment submission error:", error.response?.data || error.message);
    throw error;
  }
};

/* ---------------------- 💾 ADD SAVED PAYMENT METHOD ---------------------- */
export const addPaymentMethod = async (payload: any) => {
  try {
    const res = await axiosInstance.post("/api/tenantss/payment/methods/", payload);
    return res.data;
  } catch (error: any) {
    console.error("❌ Error adding payment method:", error.response?.data || error.message);
    throw error;
  }
};

/* ---------------------- 📊 GET PAYMENT STATUS ---------------------- */
export const getPaymentStatus = async (subscriptionId: string) => {
  try {
    const res = await axiosInstance.get(
      `/api/tenantss/payment/status/?subscription_id=${subscriptionId}`
    );
    return res.data; // expected: { status: "success" | "pending" | "failed" }
  } catch (error: any) {
    console.error("❌ Error fetching payment status:", error.response?.data || error.message);
    throw error;
  }
};
