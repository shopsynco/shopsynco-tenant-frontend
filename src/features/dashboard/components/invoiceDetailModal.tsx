import React from "react";
import Swal from "sweetalert2";
import { BASE_URL } from "../../../api/axios_config";

const InvoiceDetailModal = ({ invoice, closeModal }: any) => {
  const downloadInvoice = async () => {
    try {
      window.open(
        `${BASE_URL}/api/tenant/pqrs_company/billing/invoices/${invoice.id}/download`,
        "_blank"
      );
    } catch (error) {
      Swal.fire("Error", "Failed to download the invoice.", "error");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white rounded-xl w-[480px] p-8 relative shadow-xl">
        <button
          onClick={closeModal}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          X
        </button>
        <h2 className="text-xl font-semibold mb-4 text-[#4A5C74]">
          Invoice Details
        </h2>
        <div className="space-y-3">
          <p><strong>Invoice No:</strong> {invoice.id}</p>
          <p><strong>Date:</strong> {invoice.date}</p>
          <p><strong>Description:</strong> {invoice.description}</p>
          <p><strong>Payment Method:</strong> {invoice.paymentMethod}</p>
          <p><strong>Amount:</strong> {invoice.amount}</p>
        </div>
        <button
          onClick={downloadInvoice}
          className="mt-4 w-full bg-[#6A3CB1] text-white py-3 rounded-lg"
        >
          Download Invoice
        </button>
      </div>
    </div>
  );
};

export default InvoiceDetailModal;
