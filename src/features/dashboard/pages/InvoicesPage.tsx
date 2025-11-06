import { Eye, Download } from "lucide-react";
import Header from "../components/dashboardHeader";


export default function InvoicesPage() {
  const invoices = [
    {
      id: "INV – 003",
      date: "Aug 25, 2024",
      description: "Basic Plan Renewal",
      paymentMethod: "Debit Card",
      amount: "₹1899",
    },
    {
      id: "INV – 002",
      date: "Aug 30, 2024",
      description: "Add-Ons; Customer Management",
      paymentMethod: "Debit Card",
      amount: "₹899",
    },
    {
      id: "INV – 001",
      date: "Aug 25, 2024",
      description: "Basic Plan Subscription",
      paymentMethod: "Debit Card",
      amount: "₹1899",
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <Header />

      <div className="max-w-6xl mx-auto px-6 py-10">
        {/* Breadcrumb */}
        <p className="text-sm text-gray-500 mb-2">
          Dashboard <span className="mx-1">›</span> View Invoices
        </p>

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-1">
            Invoices are automatically emailed to your registered address.
          </p>
        </div>

        {/* Invoices Table */}
        <div className="bg-white border border-[#D8CFFC] rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-gray-700">
            <thead className="bg-[#F8F6FF] text-[#6A3CB1] text-sm font-semibold">
              <tr>
                <th className="py-4 px-6">Invoice No.</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6">Description</th>
                <th className="py-4 px-6">Payment Method</th>
                <th className="py-4 px-6 text-right">Amount</th>
                <th className="py-4 px-6"></th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((inv, i) => (
                <tr
                  key={i}
                  className="border-t border-[#E9E4FB] hover:bg-[#FAF8FF] transition"
                >
                  <td className="py-4 px-6 font-medium">{inv.id}</td>
                  <td className="py-4 px-6">{inv.date}</td>
                  <td className="py-4 px-6 truncate max-w-[180px]">
                    {inv.description}
                  </td>
                  <td className="py-4 px-6">{inv.paymentMethod}</td>
                  <td className="py-4 px-6 text-right font-semibold text-gray-900">
                    {inv.amount}
                  </td>
                  <td className="py-4 px-6 text-right flex items-center justify-end gap-3">
                    <button className="text-gray-500 hover:text-[#6A3CB1]">
                      <Eye size={18} />
                    </button>
                    <button className="text-gray-500 hover:text-[#6A3CB1]">
                      <Download size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Support Box */}
        <div className="border border-[#D8CFFC] bg-white rounded-2xl p-6 mt-10 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="text-[#6A3CB1] text-xl">😊</div>
            <div>
              <h4 className="text-gray-900 font-semibold mb-1">
                Need help with invoices?
              </h4>
              <p className="text-sm text-gray-500 mb-3 leading-relaxed">
                Our support team is ready to assist you with any questions
                about your subscription.
              </p>
              <button className="text-sm font-medium text-[#6A3CB1] hover:underline">
                Contact Support →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
