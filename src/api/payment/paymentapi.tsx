import axiosInstance from "../../store/refreshToken/tokenUtils";

// Define types for the payloads and responses
interface PaymentMethod {
  label: string;
  value: string;
}

// Type for credit card payment
interface CreditCardPaymentPayload {
  subscription_id: string;
  method: "credit_card";
  card_holder: string;
  card_last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
  cvv_present: boolean;
}

// Type for debit card payment (ADD THIS)
interface DebitCardPaymentPayload {
  subscription_id: string;
  method: "debit_card";
  card_holder: string;
  card_last4: string;
  brand: string;
  exp_month: number;
  exp_year: number;
  cvv_present: boolean;
}

// Type for bank transfer payment
interface BankTransferPaymentPayload {
  subscription_id: string;
  method: "bank_transfer";
  account_holder: string;
  account_number: string;
  bank_name: string;
  branch_name: string;
  ifsc: string;
}

// Type for UPI payment
interface UpiPaymentPayload {
  subscription_id: string;
  method: "upi";
  upi_id: string;
}

// Union type for all payment methods (INCLUDE debit_card)
type SubmitPaymentPayload = 
  | CreditCardPaymentPayload 
  | DebitCardPaymentPayload 
  | BankTransferPaymentPayload 
  | UpiPaymentPayload;

// Type for the response of UPI verification
interface UpiVerificationResponse {
  success: boolean;
}

// Type for the response of a successful payment
interface PaymentResponse {
  success: boolean;
}

// Type for adding a new payment method
interface AddPaymentMethodPayload {
  method: string;
  details: Record<string, unknown>;
}

// Type for card detail item
interface CardDetailItem {
  card_brand: string;
  card_last4: string;
  exp_month: number;
  exp_year: number;
  card_holder_name: string;
  billing_address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
}
// Type for the response when fetching card details
interface CardDetailsResponse {
  card_details: CardDetailItem[];
}

// Type for updating card details
interface UpdateCardDetailsPayload {
  card_holder_name: string;
  card_number: string;
  exp_month: number;
  exp_year: number;
  cvv: string;
  card_brand: string;
}

// Type for the response when getting payment status
interface PaymentStatusResponse {
  status: "success" | "pending" | "failed";
}

/* ---------------------- 💳 FETCH PAYMENT METHODS ---------------------- */
export const getPaymentMethods = async (): Promise<{ methods: PaymentMethod[] }> => {
  try {
    const res = await axiosInstance.get("/api/tenants/payment/methods/");
    return res.data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorData = (error as { response?: { data?: unknown } })?.response?.data;
    console.error("❌ Error fetching payment methods:", errorData || errorMessage);
    throw error;
  }
};

/* ---------------------- 💳 SUBMIT PAYMENT ---------------------- */
export const submitPayment = async (payload: SubmitPaymentPayload): Promise<PaymentResponse> => {
  try {
    const res = await axiosInstance.post("/api/tenant/payment/submit/", payload);
    return res.data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorData = (error as { response?: { data?: unknown } })?.response?.data;
    console.error("❌ Payment submission error:", errorData || errorMessage);
    throw error;
  }
};

/* ---------------------- 📱 VERIFY UPI ---------------------- */
export const verifyUpi = async (upi_id: string): Promise<UpiVerificationResponse> => {
  try {
    const res = await axiosInstance.post("/api/tenant/payment/upi/verify/", { upi_id });
    return res.data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorData = (error as { response?: { data?: unknown } })?.response?.data;
    console.error("❌ UPI verification error:", errorData || errorMessage);
    throw error;
  }
};

/* ---------------------- 📱 UPI PAYMENT FINALIZATION ---------------------- */
export const payWithUpi = async (payload: UpiPaymentPayload): Promise<PaymentResponse> => {
  try {
    const res = await axiosInstance.post("/api/tenant/payment/upi/pay/", payload);
    return res.data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorData = (error as { response?: { data?: unknown } })?.response?.data;
    console.error("❌ UPI payment submission error:", errorData || errorMessage);
    throw error;
  }
};

/* ---------------------- 💾 ADD SAVED PAYMENT METHOD ---------------------- */
export const addPaymentMethod = async (payload: AddPaymentMethodPayload): Promise<{ success: boolean; message?: string }> => {
  try {
    const res = await axiosInstance.post("/api/tenants/payment/methods/", payload);
    return res.data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorData = (error as { response?: { data?: unknown } })?.response?.data;
    console.error("❌ Error adding payment method:", errorData || errorMessage);
    throw error;
  }
};

/* ---------------------- 📊 GET PAYMENT STATUS ---------------------- */
export const getPaymentStatus = async (subscriptionId: string): Promise<PaymentStatusResponse> => {
  try {
    const res = await axiosInstance.get("/api/tenants/payment/status/", {
      params: { subscription_id: subscriptionId },
    });
    return res.data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorData = (error as { response?: { data?: unknown } })?.response?.data;
    console.error("❌ Error fetching payment status:", errorData || errorMessage);
    throw error;
  }
};

/* ---------------------- 💳 GET CARD DETAILS ---------------------- */
export const getCardDetails = async (): Promise<CardDetailsResponse> => {
  try {
    const res = await axiosInstance.get("/api/tenants/payment/card/");
    return res.data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorData = (error as { response?: { data?: unknown } })?.response?.data;
    console.error("❌ Error fetching card details:", errorData || errorMessage);
    throw error;
  }
};

/* ---------------------- 💳 UPDATE CARD DETAILS ---------------------- */
export const updateCardDetails = async (cardData: UpdateCardDetailsPayload): Promise<{ success: boolean; message?: string }> => {
  try {
    const res = await axiosInstance.post("/api/tenants/payment/card/update/", cardData);
    return res.data;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorData = (error as { response?: { data?: unknown } })?.response?.data;
    console.error("❌ Error updating card details:", errorData || errorMessage);
    throw error;
  }
};