import { useState, useEffect } from "react";
import { ChevronLeft, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getPaymentMethods,
  submitPayment,
  verifyUpi,
  payWithUpi,
} from "../../api/payment/paymentapi";

export default function PaymentPage() {
  const [paymentMethods, setPaymentMethods] = useState<
    { name: string; code: string }[]
  >([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [upiID, setUpiID] = useState<string>("");
  const [isUPIModalOpen, setIsUPIModalOpen] = useState(false);
  const [timer, setTimer] = useState(600);
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [loading, setLoading] = useState(false);

  const subscriptionId = "uuid-from-checkout"; // Replace dynamically

  // ✅ Fetch payment methods on load
  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const res = await getPaymentMethods();
        setPaymentMethods(res.methods || []);
        // Auto-select first method
        if (res.methods?.length > 0) setSelectedMethod(res.methods[0].name);
      } catch (err) {
        console.error("Error fetching payment methods:", err);
      }
    };
    fetchMethods();
  }, []);

  // ✅ Countdown for UPI modal
  useEffect(() => {
    if (isUPIModalOpen && timer > 0) {
      const countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(countdown);
    }
    if (timer === 0) setIsUPIModalOpen(false);
  }, [isUPIModalOpen, timer]);

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(selectedMethod === method ? "" : method);
    if (method.toLowerCase().includes("upi")) setUpiID("");
  };

  // ✅ Handle Payment Submit
  const handlePaymentSubmit = async () => {
    try {
      setLoading(true);
      const methodCode = paymentMethods.find(
        (m) => m.name === selectedMethod
      )?.code;

      if (methodCode === "credit_card" || methodCode === "bank_transfer") {
        const payload = {
          subscription_id: subscriptionId,
          method: methodCode,
          card_holder: "Manoj Pilla",
          card_last4: "4564",
          brand: "VISA",
          exp_month: 12,
          exp_year: 2028,
          cvv_present: true,
        };

        const res = await submitPayment(payload);
        console.log("✅ Payment Success:", res);
        alert("✅ Payment submitted successfully!");
      }

      if (methodCode === "upi") {
        if (!upiID) return alert("Please enter UPI ID");
        const verifyRes = await verifyUpi(upiID);
        console.log("✅ UPI Verified:", verifyRes);
        setIsUPIModalOpen(true);

        const payRes = await payWithUpi({
          subscription_id: subscriptionId,
          method: "upi",
          upi_id: upiID,
        });
        console.log("✅ UPI Payment Completed:", payRes);
      }
    } catch (err) {
      console.error("❌ Payment Error:", err);
      alert("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const InputField = ({
    label,
    placeholder,
    type = "text",
    ...props
  }: {
    label?: string;
    placeholder?: string;
    type?: string;
    [key: string]: any;
  }) => (
    <div>
      {label && (
        <label className="text-sm text-gray-600 mb-1 block">{label}</label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6A3CB1]"
        {...props}
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="w-full max-w-6xl mb-6 flex items-center gap-2 text-gray-500">
        <ChevronLeft className="w-4 h-4" />
        <Link to="/plans" className="text-sm text-gray-700 hover:underline">
          Back to Choose Plan
        </Link>
      </div>

      {/* Main */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
        {/* Left Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Choose A Payment Method
          </h2>

          {paymentMethods.length === 0 ? (
            <p className="text-gray-500">Loading payment methods...</p>
          ) : (
            paymentMethods.map((method) => (
              <div
                key={method.code}
                className={`border rounded-xl mb-5 transition-all ${
                  selectedMethod === method.name
                    ? "border-[#6A3CB1] bg-white shadow-sm"
                    : "border-gray-200 bg-white"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleMethodSelect(method.name)}
                  className="w-full flex justify-between items-center p-5 text-left font-medium text-gray-800"
                >
                  {method.name}
                  <span className="text-gray-400">
                    {selectedMethod === method.name ? "▲" : "▼"}
                  </span>
                </button>

                {/* Credit Card Fields */}
                {selectedMethod === "Credit Card" &&
                  method.code === "credit_card" && (
                    <div className="border-t border-gray-200 p-5 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField
                          label="Card Holder Name"
                          placeholder="Manoj Pilla"
                        />
                        <div>
                          <label className="text-sm text-gray-600 mb-1 block">
                            Card Number
                          </label>
                          <div className="relative">
                            <input
                              type={showCardNumber ? "text" : "password"}
                              value="•••• •••• •••• 4564"
                              readOnly
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6A3CB1]"
                            />
                            <Eye
                              size={18}
                              className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
                              onClick={() => setShowCardNumber(!showCardNumber)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField label="Expiry Date" type="month" />
                        <InputField
                          label="CVV"
                          type="password"
                          placeholder="•••"
                        />
                      </div>
                    </div>
                  )}

                {/* UPI Field */}
                {selectedMethod === "UPI" && method.code === "upi" && (
                  <div className="border-t border-gray-200 p-5">
                    <InputField
                      label="UPI ID"
                      placeholder="example@okaxis"
                      value={upiID}
                      onChange={(e: any) => setUpiID(e.target.value)}
                    />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Right Section (Order Summary) */}
        <div className="border border-gray-200 rounded-2xl bg-[#F8F5FF] p-6 lg:p-10 h-full flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Order Summary
            </h3>
            <div className="space-y-3 text-gray-700 text-sm">
              <div className="flex justify-between">
                <span>Base Price (monthly)</span>
                <span>₹298</span>
              </div>
              <div className="flex justify-between">
                <span>GST 18%</span>
                <span>₹78</span>
              </div>
              <hr className="my-3 border-gray-300" />
              <div className="flex justify-between font-semibold text-gray-900 text-base">
                <span>Total Payable (yearly)</span>
                <span>₹4,512</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8 gap-3">
            <button className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-100 transition">
              Cancel
            </button>
            <button
              onClick={handlePaymentSubmit}
              disabled={loading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#6A3CB1] hover:bg-[#5b32a2]"
              } transition`}
            >
              {loading ? "Processing..." : "Submit Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
