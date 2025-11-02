import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function PaymentPage() {
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [upiID, setUpiID] = useState<string>("");
  const [isUPIModalOpen, setIsUPIModalOpen] = useState(false);
  const [timer, setTimer] = useState(600);

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(selectedMethod === method ? "" : method);
    if (method === "UPI") setUpiID("");
  };

  useEffect(() => {
    if (isUPIModalOpen && timer > 0) {
      const countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(countdown);
    }
    if (timer === 0) setIsUPIModalOpen(false);
  }, [isUPIModalOpen, timer]);

  const handleUPISubmit = () => {
    if (upiID.trim() === "" && selectedMethod === "UPI") {
      alert("Please enter a valid UPI ID.");
      return;
    }
    setIsUPIModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4 sm:px-6 py-6 sm:py-10">
      {/* Header */}
      <div className="w-full max-w-6xl mb-6 flex items-center gap-2 text-gray-500">
        <ChevronLeft className="w-4 h-4" />
        <Link to="/plan" className="text-sm text-gray-700 hover:underline">
          Back to Choose Plan
        </Link>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10 flex-grow">
        {/* Left Section */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Choose A Payment Method
          </h2>

          {["Credit Card", "Bank Transfer", "UPI"].map((method) => (
            <div
              key={method}
              className={`border rounded-xl mb-5 transition-all ${
                selectedMethod === method
                  ? "border-[#6A3CB1] bg-white shadow-sm"
                  : "border-gray-200 bg-white"
              }`}
            >
              <button
                type="button"
                onClick={() => handleMethodSelect(method)}
                className="w-full flex justify-between items-center p-5 text-left font-medium text-gray-800"
              >
                {method}
                <span className="text-gray-400">
                  {selectedMethod === method ? "▲" : "▼"}
                </span>
              </button>

              {selectedMethod === method && (
                <div className="border-t border-gray-200 p-5 space-y-4">
                  {/* Credit Card Form */}
                  {method === "Credit Card" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          placeholder="Card Holder Name"
                          className="input-style"
                        />
                        <input placeholder="Card Number" className="input-style" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          placeholder="Expiry Date (MM/YY)"
                          className="input-style"
                        />
                        <input placeholder="CVV" className="input-style" />
                      </div>
                    </div>
                  )}

                  {/* Bank Transfer Form */}
                  {method === "Bank Transfer" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          placeholder="Account Holder Name"
                          className="input-style"
                        />
                        <input placeholder="Bank Name" className="input-style" />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input
                          placeholder="Account Number"
                          className="input-style"
                        />
                        <input
                          placeholder="Re-enter Account Number"
                          className="input-style"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <input placeholder="Branch Name" className="input-style" />
                        <input placeholder="IFSC Code" className="input-style" />
                      </div>
                    </div>
                  )}

                  {/* UPI Form */}
                  {method === "UPI" && (
                    <input
                      type="text"
                      placeholder="Enter your UPI ID"
                      className="input-style w-full"
                      value={upiID}
                      onChange={(e) => setUpiID(e.target.value)}
                    />
                  )}
                </div>
              )}
            </div>
          ))}
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
              <div className="flex justify-between">
                <span>Credits</span>
                <span>₹0.00</span>
              </div>

              <hr className="my-3 border-gray-300" />

              <div className="flex justify-between font-semibold text-gray-900 text-base">
                <span>Total Payable (yearly)</span>
                <span>₹4,512</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-5 leading-relaxed">
              By checking out, you agree with our{" "}
              <a href="#" className="underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="underline">
                Privacy Policy
              </a>
              . You can cancel recurring payments at any time.
            </p>
          </div>

          <div className="flex justify-between mt-8 gap-3">
            <button className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-100 transition">
              Cancel
            </button>
            <button
              onClick={handleUPISubmit}
              className="flex-1 py-3 rounded-lg bg-[#6A3CB1] text-white font-semibold hover:bg-[#5b32a2] transition"
            >
              Submit Payment
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Summary */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-inner p-4 lg:hidden">
        <div className="flex justify-between text-sm mb-2">
          <span>Subtotal</span>
          <span>₹298/mo</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>GST 18%</span>
          <span>₹78</span>
        </div>
        <div className="flex justify-between font-semibold text-base mt-2">
          <span>Total</span>
          <span>₹4,512/yr</span>
        </div>
        <button
          onClick={handleUPISubmit}
          className="mt-3 w-full py-3 bg-[#6A3CB1] text-white rounded-lg font-medium hover:bg-[#5b32a2]"
        >
          Choose A Payment Method
        </button>
      </div>

      {/* UPI Modal */}
      {isUPIModalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] sm:w-96 shadow-xl">
            <h3 className="text-lg font-semibold text-[#6A3CB1] mb-3">
              Complete Your Payment
            </h3>
            <ul className="list-disc list-inside text-gray-700 text-sm space-y-2">
              <li>Go to your UPI app notification</li>
              <li>Check pending transaction</li>
              <li>Complete payment by entering your UPI PIN</li>
            </ul>
            <p className="text-xs text-gray-500 mt-3">
              This page will expire in {Math.floor(timer / 60)}:
              {timer % 60 < 10 ? `0${timer % 60}` : timer % 60} minutes.
            </p>
            <button
              onClick={() => setIsUPIModalOpen(false)}
              className="mt-4 w-full py-3 rounded-lg bg-[#6A3CB1] text-white font-semibold hover:bg-[#5b32a2]"
            >
              I Completed the Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
