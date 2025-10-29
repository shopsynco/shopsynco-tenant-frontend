import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function PaymentPage() {
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [upiID, setUpiID] = useState<string>(""); // UPI ID state
  const [isUPIModalOpen, setIsUPIModalOpen] = useState(false); // UPI Modal state
  const [timer, setTimer] = useState(600); // Timer state (10 minutes in seconds)

  const handleMethodSelect = (method: string) => {
    setSelectedMethod(selectedMethod === method ? "" : method);
    if (method === "UPI") {
      setUpiID(""); // Reset UPI ID if switching methods
    }
  };

  // Timer logic for auto-expiration (10 minutes)
  useEffect(() => {
    if (isUPIModalOpen && timer > 0) {
      const countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(countdown);
    }

    if (timer === 0) {
      setIsUPIModalOpen(false); // Close modal after 10 minutes
    }
  }, [isUPIModalOpen, timer]);

  const handleUPISubmit = () => {
    if (upiID.trim() === "") {
      alert("Please enter a valid UPI ID.");
      return;
    }

    // Trigger the modal after UPI ID is entered and Submit Payment is clicked
    setIsUPIModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center px-6 py-10">
      {/* Header */}
      <div className="w-full max-w-6xl mb-6 flex items-center gap-2 text-gray-500 sticky top-0 bg-white z-20">
        <ChevronLeft className="w-4 h-4" />
        <span className="text-sm">
          <Link to="/plan" className="text-black hover:underline">
            Back to Choose Plan
          </Link>
        </span>
      </div>

      {/* Content */}
      <div className="bg-white w-full max-w-6xl rounded-2xl shadow-md grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 p-8 flex-grow">
        {/* Left Section: Payment Method */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Choose A Payment Method
          </h2>

          {/* Credit Card */}
          <div
            className={`border-2 rounded-xl mb-4 transition-all ${
              selectedMethod === "Credit Card"
                ? "border-purple-500 bg-purple-50"
                : "border-gray-200"
            }`}
          >
            <button
              type="button"
              onClick={() => handleMethodSelect("Credit Card")}
              className="w-full flex justify-between items-center p-4 text-left"
            >
              <span className="font-medium text-gray-700">Credit Card</span>
              <span className="text-gray-400">
                {selectedMethod === "Credit Card" ? "▲" : "▼"}
              </span>
            </button>

            {selectedMethod === "Credit Card" && (
              <div className="border-t border-gray-200 p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Card Holder Name"
                    className="input-style"
                  />
                  <input
                    type="text"
                    placeholder="Card Number"
                    className="input-style"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Expiry Date (MM/YY)"
                    className="input-style"
                  />
                  <input
                    type="text"
                    placeholder="CVV"
                    className="input-style"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bank Transfer */}
          <div
            className={`border-2 rounded-xl mb-4 transition-all ${
              selectedMethod === "Bank Transfer"
                ? "border-purple-500 bg-purple-50"
                : "border-gray-200"
            }`}
          >
            <button
              type="button"
              onClick={() => handleMethodSelect("Bank Transfer")}
              className="w-full flex justify-between items-center p-4 text-left"
            >
              <span className="font-medium text-gray-700">Bank Transfer</span>
              <span className="text-gray-400">
                {selectedMethod === "Bank Transfer" ? "▲" : "▼"}
              </span>
            </button>

            {selectedMethod === "Bank Transfer" && (
              <div className="border-t border-gray-200 p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Account Holder Name"
                    className="input-style"
                  />
                  <input
                    type="text"
                    placeholder="Bank Name"
                    className="input-style"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Account Number"
                    className="input-style"
                  />
                  <input
                    type="text"
                    placeholder="Re-enter Account Number"
                    className="input-style"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Branch Name"
                    className="input-style"
                  />
                  <input
                    type="text"
                    placeholder="IFSC Code"
                    className="input-style"
                  />
                </div>
              </div>
            )}
          </div>

          {/* UPI */}
          <div
            className={`border-2 rounded-xl transition-all ${
              selectedMethod === "UPI"
                ? "border-purple-500 bg-purple-50"
                : "border-gray-200"
            }`}
          >
            <button
              type="button"
              onClick={() => handleMethodSelect("UPI")}
              className="w-full flex justify-between items-center p-4 text-left"
            >
              <span className="font-medium text-gray-700">UPI</span>
              <span className="text-gray-400">
                {selectedMethod === "UPI" ? "▲" : "▼"}
              </span>
            </button>

            {selectedMethod === "UPI" && (
              <div className="border-t border-gray-200 p-4">
                <input
                  type="text"
                  placeholder="Enter your UPI ID"
                  className="input-style w-full"
                  value={upiID}
                  onChange={(e) => setUpiID(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Order Summary */}
        <div className="border border-gray-200 rounded-2xl p-6 bg-purple-50/50 shadow-xl z-10 sticky bottom-0">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Order Summary
          </h3>
          <div className="space-y-2 text-gray-700 text-sm">
            <div className="flex justify-between">
              <span>Base Price (monthly)</span>
              <span>₹1699</span>
            </div>
            <div className="flex justify-between">
              <span>GST 18%</span>
              <span>₹270</span>
            </div>
            <div className="flex justify-between">
              <span>Credits</span>
              <span>₹0.00</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-semibold text-gray-900">
              <span>Total Payable (yearly)</span>
              <span>₹20,388</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            By checking out, you agree with our{" "}
            <a href="#" className="underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline">
              Privacy Policy
            </a>
            .
          </p>

          <div className="flex justify-between mt-6 gap-3">
            <button className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-100">
              Cancel
            </button>
            <button
              onClick={handleUPISubmit}
              className="flex-1 py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700"
            >
              Submit Payment
            </button>
          </div>
        </div>
      </div>

      {/* UPI Modal */}
      {isUPIModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h3 className="text-2xl font-semibold text-purple-600 mb-4">
              Complete Your Payment
            </h3>
            <ul className="space-y-2 text-gray-700">
              <li>
                Go to UPI ID linked mobile app or Click on the notification from
                your UPI ID linked mobile app
              </li>
              <li>Check pending transactions</li>
              <li>
                Complete the payment by selecting the bank and entering UPI PIN
              </li>
            </ul>
            <p className="text-xs text-gray-500 mt-4">
              This page will automatically expire in {Math.floor(timer / 60)}:
              {timer % 60 < 10 ? `0${timer % 60}` : timer % 60} minutes.
            </p>
            <p className="text-xs text-gray-500 mt-4">
              <strong>Note:</strong> Please do not press back button or close
              the screen until the payment is complete.
            </p>
            <button
              onClick={() => setIsUPIModalOpen(false)}
              className="mt-4 w-full py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700"
            >
              I Completed the Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
