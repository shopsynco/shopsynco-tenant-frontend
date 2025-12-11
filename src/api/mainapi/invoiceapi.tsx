import axiosInstance from "../../store/refreshToken/tokenUtils";

// Fetch invoices from the API
export const fetchInvoices = async () => {
  try {
    const response = await axiosInstance.get(`api/tenants/billing/invoices/`);
    return response.data;  // Returning the data so that the component can use it
  } catch (error) {
    throw new Error("Failed to load invoices. Please try again.");
  }
};
export const fetchInvoicedetail = async (transaction_id: string) => {
  try {
    const response = await axiosInstance.get(
      `api/tenants/billing/invoices/${transaction_id}/`
    );
    console.log("Invoice Detail Response:", response.data);
    return response.data;
  } catch (error) {
    throw new Error("Failed to load invoice detail. Please try again.");
  }
};
