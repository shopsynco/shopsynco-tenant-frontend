import axios from "axios";
import { BASE_URL } from "../axios_config"; // Update this path if needed

// Fetch invoices from the API
export const fetchInvoices = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/tenant/pqrs_company/billing/invoices/`);
    return response.data;  // Returning the data so that the component can use it
  } catch (error) {
    throw new Error("Failed to load invoices. Please try again.");
  }
};
export const fetchInvoicedetail = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/api/tenant/pqrs_company/billing/invoices/{transaction_id}/`);
    return response.data;  // Returning the data so that the component can use it
  } catch (error) {
    throw new Error("Failed to load invoices. Please try again.");
  }
};
