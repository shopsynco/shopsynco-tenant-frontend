import axiosInstance from "../../refreshToken/tokenUtils";

// ✅ Fetch available payment methods
export const getPaymentMethods = async () => {
  const res = await axiosInstance.get("/api/tenant/payment/methods/");
  return res.data; // expects { methods: [...] }
};

// ✅ Submit credit/bank payment
export const submitPayment = async (payload: {
  subscription_id: string;
  method: string;
  card_holder?: string;
  card_last4?: string;
  brand?: string;
  exp_month?: number;
  exp_year?: number;
  cvv_present?: boolean;
}) => {
  const res = await axiosInstance.post("/api/tenant/payment/submit/", payload);
  return res.data;
};

// ✅ Verify UPI
export const verifyUpi = async (upi_id: string) => {
  const res = await axiosInstance.post("/api/tenant/payment/upi/verify/", {
    upi_id,
  });
  return res.data;
};

// ✅ UPI Payment Finalization
export const payWithUpi = async (payload: {
  subscription_id: string;
  method: string;
  upi_id: string;
}) => {
  const res = await axiosInstance.post("/api/tenant/payment/upi/pay/", payload);
  return res.data;
};

