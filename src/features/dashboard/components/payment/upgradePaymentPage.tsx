import { useState, useEffect } from "react";
import { ChevronLeft, Eye, Plus, CreditCard } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  getPaymentMethods,
  submitPayment,
  verifyUpi,
  payWithUpi,
  getCardDetails,
} from "../../../../api/payment/paymentapi";
import { getPricingQuote } from "../../../../api/mainapi/planapi";

// Define types
interface PaymentMethod {
  label: string;
  value: string;
}

interface CardFormData {
  cardHolder: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
}

interface BankFormData {
  accountHolder: string;
  accountNumber: string;
  bankName: string;
  branchName: string;
  ifscCode: string;
  confirmAccountNumber: string;
}

interface ExistingCard {
  id?: string;
  card_last4: string;
  brand?: string;
  card_brand?: string;
  exp_month: number;
  exp_year: number;
  card_holder?: string;
  card_holder_name?: string;
  is_default?: boolean;
}

export default function UpgradePaymentPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string>("");
  const [upiID, setUpiID] = useState("");
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [loading, setLoading] = useState(false);
  const [quoteData, setQuoteData] = useState<any>(null);
  const [cardFormData, setCardFormData] = useState<CardFormData>({
    cardHolder: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });
  const [bankFormData, setBankFormData] = useState<BankFormData>({
    accountHolder: "",
    accountNumber: "",
    bankName: "",
    branchName: "",
    ifscCode: "",
    confirmAccountNumber: "",
  });
  const [existingCards, setExistingCards] = useState<ExistingCard[]>([]);
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const planId = params.get("plan_id");
  const months = params.get("months");
  const country = params.get("country");

  // Get subscription ID from localStorage or URL params
  const subscriptionId = params.get("subscription_id") || localStorage.getItem("subscription_id") || "";

  // Fetch existing cards on page load
  useEffect(() => {
    const fetchExistingCards = async () => {
      try {
        const res = await getCardDetails();
        const cards = (res.card_details || []).map(card => ({
          id: card.id,
          card_last4: card.card_last4,
          brand: card.card_brand,
          exp_month: card.exp_month,
          exp_year: card.exp_year,
          card_holder: card.card_holder_name,
          is_default: card.is_default,
        })) as ExistingCard[];
        setExistingCards(cards);
        // If there are existing cards, select the first one by default
        if (cards.length > 0 && cards[0].id) {
          setSelectedCardId(cards[0].id);
        }
      } catch (err) {
        console.error("Error fetching existing cards:", err);
        // Don't show alert for this as it's optional
      }
    };
    fetchExistingCards();
  }, []);

  // Fetch payment methods on load
  useEffect(() => {
    const fetchMethods = async () => {
      try {
        const res = await getPaymentMethods();
        setPaymentMethods(res.methods || []);
        if (res.methods?.length > 0) {
          setSelectedMethod(res.methods[0].value);
        }
      } catch (err) {
        console.error("Error fetching payment methods:", err);
        alert("Failed to load payment methods");
      }
    };
    fetchMethods();
  }, []);

  // Fetch quote data
  useEffect(() => {
    if (planId && months && country) {
      const fetchQuote = async () => {
        setLoading(true);
        try {
          const quoteResponse = await getPricingQuote(planId, months, country);
          setQuoteData(quoteResponse);
        } catch (error) {
          console.error("Error fetching pricing quote:", error);
          alert("Failed to load pricing information");
        } finally {
          setLoading(false);
        }
      };
      fetchQuote();
    }
  }, [planId, months, country]);

  // Handle method selection
  const handleMethodSelect = (methodValue: string) => {
    setSelectedMethod(methodValue);
    // Reset card form state when switching methods
    if (methodValue !== "credit_card" && methodValue !== "debit_card") {
      setShowAddCardForm(false);
    }
  };

  // Handle card selection from existing cards
  const handleCardSelect = (cardId: string) => {
    setSelectedCardId(cardId);
    setShowAddCardForm(false);
  };

  // Handle add new card button click
  const handleAddNewCard = () => {
    setShowAddCardForm(true);
    setSelectedCardId(null);
    // Reset form data
    setCardFormData({
      cardHolder: "",
      cardNumber: "",
      expiryDate: "",
      cvv: "",
    });
  };

  // Handle card input changes
  const handleCardInputChange = (field: keyof CardFormData, value: string) => {
    setCardFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle bank input changes
  const handleBankInputChange = (field: keyof BankFormData, value: string) => {
    setBankFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Format card number with spaces
  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = cleaned.match(/\d{4,16}/g);
    const match = matches ? matches[0] : "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    return parts.length ? parts.join(" ") : cleaned;
  };

  // Format expiry date for display
  const formatExpiryDate = (month: number, year: number): string => {
    return `${month.toString().padStart(2, "0")}/${year.toString().slice(-2)}`;
  };

  // Get card brand icon or name
  const getCardBrand = (brand: string): string => {
    const brands: { [key: string]: string } = {
      visa: "VISA",
      mastercard: "MasterCard",
      amex: "Amex",
      discover: "Discover",
      rupay: "RuPay",
    };
    return brands[brand.toLowerCase()] || brand;
  };

  // Validate forms
  const validateCardForm = (): boolean => {
    if (!cardFormData.cardHolder.trim()) {
      Swal.fire("Validation Error", "Please enter card holder name", "warning");
      return false;
    }
    if (
      !cardFormData.cardNumber ||
      cardFormData.cardNumber.replace(/\s/g, "").length < 16
    ) {
      Swal.fire("Validation Error", "Please enter valid 16-digit card number", "warning");
      return false;
    }
    if (!cardFormData.expiryDate) {
      Swal.fire("Validation Error", "Please select expiry date", "warning");
      return false;
    }
    if (!cardFormData.cvv || cardFormData.cvv.length !== 3) {
      Swal.fire("Validation Error", "Please enter valid CVV", "warning");
      return false;
    }
    return true;
  };

  const validateBankForm = (): boolean => {
    if (!bankFormData.accountHolder.trim()) {
      Swal.fire("Validation Error", "Please enter account holder name", "warning");
      return false;
    }
    if (!bankFormData.accountNumber) {
      Swal.fire("Validation Error", "Please enter account number", "warning");
      return false;
    }
    if (bankFormData.accountNumber !== bankFormData.confirmAccountNumber) {
      Swal.fire("Validation Error", "Account numbers don't match", "warning");
      return false;
    }
    if (!bankFormData.bankName) {
      Swal.fire("Validation Error", "Please select bank", "warning");
      return false;
    }
    if (!bankFormData.ifscCode) {
      Swal.fire("Validation Error", "Please enter IFSC code", "warning");
      return false;
    }
    return true;
  };

  const validateUpiForm = (): boolean => {
    if (!upiID.trim()) {
      Swal.fire("Validation Error", "Please enter UPI ID", "warning");
      return false;
    }
    if (!upiID.includes("@")) {
      Swal.fire("Validation Error", "Please enter valid UPI ID (e.g., example@okaxis)", "warning");
      return false;
    }
    return true;
  };

  // Handle UPI payment
  const handleUpiSubmit = async () => {
    if (!validateUpiForm()) return;

    if (!subscriptionId) {
      Swal.fire("Error", "Subscription ID is required. Please try again.", "error");
      return;
    }

    try {
      setLoading(true);

      // Verify UPI ID first
      const verifyResponse = await verifyUpi(upiID);
      if (!verifyResponse.success) {
        Swal.fire("Validation Error", "Invalid UPI ID. Please check and try again.", "error");
        return;
      }

      // Process UPI payment
      const upiPayload = {
        subscription_id: subscriptionId,
        method: "upi" as const,
        upi_id: upiID,
      };

      const paymentResponse = await payWithUpi(upiPayload);
      if (paymentResponse.success) {
        await Swal.fire("Success", "UPI Payment Successful!", "success");
        navigate("/payment-success");
      } else {
        throw new Error("UPI payment failed");
      }
    } catch (err: any) {
      console.error("❌ UPI Payment Error:", err);
      Swal.fire("Error", err.response?.data?.message || "UPI Payment failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle card payment
 const handleCardSubmit = async () => {
    if (!validateCardForm()) return;

    if (!subscriptionId) {
      Swal.fire("Error", "Subscription ID is required. Please try again.", "error");
      return;
    }

    try {
      setLoading(true);

      // Extract last 4 digits of card number
      const cardLast4 = cardFormData.cardNumber.replace(/\s/g, '').slice(-4);
      
      // Extract expiry month and year
      const [expYear, expMonth] = cardFormData.expiryDate.split('-');

      // Create properly typed payload based on selected method
      let paymentPayload;
      
      if (selectedMethod === "credit_card") {
        paymentPayload = {
          subscription_id: subscriptionId,
          method: "credit_card" as const,
          card_holder: cardFormData.cardHolder,
          card_last4: cardLast4,
          brand: "VISA",
          exp_month: parseInt(expMonth),
          exp_year: parseInt(expYear),
          cvv_present: true,
        };
      } else {
        paymentPayload = {
          subscription_id: subscriptionId,
          method: "debit_card" as const,
          card_holder: cardFormData.cardHolder,
          card_last4: cardLast4,
          brand: "VISA",
          exp_month: parseInt(expMonth),
          exp_year: parseInt(expYear),
          cvv_present: true,
        };
      }

      const paymentResponse = await submitPayment(paymentPayload);
      if (paymentResponse.success) {
        await Swal.fire("Success", "Card Payment Successful!", "success");
        navigate("/payment-success");
      } else {
        throw new Error("Card payment failed");
      }
    } catch (err: any) {
      console.error("❌ Card Payment Error:", err);
      Swal.fire("Error", err.response?.data?.message || "Card payment failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle bank transfer
  const handleBankSubmit = async () => {
    if (!validateBankForm()) return;

    if (!subscriptionId) {
      Swal.fire("Error", "Subscription ID is required. Please try again.", "error");
      return;
    }

    try {
      setLoading(true);

      // Create properly typed payload
      const paymentPayload = {
        subscription_id: subscriptionId,
        method: "bank_transfer" as const,
        account_holder: bankFormData.accountHolder,
        account_number: bankFormData.accountNumber,
        bank_name: bankFormData.bankName,
        branch_name: bankFormData.branchName,
        ifsc: bankFormData.ifscCode,
      };

      const paymentResponse = await submitPayment(paymentPayload);
      if (paymentResponse.success) {
        await Swal.fire("Success", "Bank Transfer Initiated Successfully!", "success");
        navigate("/payment-success");
      } else {
        throw new Error("Bank transfer failed");
      }
    } catch (err: any) {
      console.error("❌ Bank Transfer Error:", err);
      Swal.fire("Error", err.response?.data?.message || "Bank transfer failed. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Main payment handler
  const handlePaymentSubmit = () => {
    if (!selectedMethod) {
      Swal.fire("Validation Error", "Please select a payment method", "warning");
      return;
    }

    switch (selectedMethod) {
      case "upi":
        handleUpiSubmit();
        break;
      case "credit_card":
      case "debit_card":
        handleCardSubmit();
        break;
      case "bank_transfer":
        handleBankSubmit();
        break;
      default:
        Swal.fire("Error", "This payment method is not yet supported", "error");
    }
  };

  // Get current method label for display
//   const getCurrentMethodLabel = (): string => {
//     const method = paymentMethods.find((m) => m.value === selectedMethod);
//     return method?.label || "";
//   };

  // Input Field Component
  const InputField = ({
    label,
    placeholder,
    type = "text",
    value,
    onChange,
    ...props
  }: {
    label: string;
    placeholder?: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    [key: string]: any;
  }) => (
    <div>
      {label && (
        <label className="text-sm text-gray-600 mb-1 block">{label}</label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6A3CB1] focus:border-transparent"
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

      {/* Main Content */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
        {/* Left Section - Payment Methods */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Choose A Payment Method
          </h2>

          {paymentMethods.length === 0 ? (
            <p className="text-gray-500">Loading payment methods...</p>
          ) : (
            paymentMethods.map((method) => (
              <div
                key={method.value}
                className={`border rounded-xl mb-5 transition-all cursor-pointer ${
                  selectedMethod === method.value
                    ? "border-[#6A3CB1] bg-white shadow-sm ring-2 ring-[#6A3CB1] ring-opacity-20"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
                onClick={() => handleMethodSelect(method.value)}
              >
                <div className="w-full flex justify-between items-center p-5 text-left font-medium text-gray-800">
                  <span>{method.label}</span>
                  <span className="text-gray-400">
                    {selectedMethod === method.value ? "▲" : "▼"}
                  </span>
                </div>

                {/* UPI Form */}
                {selectedMethod === method.value && method.value === "upi" && (
                  <div className="border-t border-gray-200 p-5">
                    <InputField
                      label="UPI ID"
                      placeholder="example@okaxis"
                      value={upiID}
                      onChange={setUpiID}
                    />
                  </div>
                )}

                {/* Credit/Debit Card Form */}
                {selectedMethod === method.value &&
                  (method.value === "credit_card" ||
                    method.value === "debit_card") && (
                    <div className="border-t border-gray-200 p-5 space-y-4">
                      {/* Existing Cards Section */}
                      {existingCards.length > 0 && !showAddCardForm && (
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-700">
                            Saved Cards
                          </h4>
                          {existingCards.map((card) => (
                            <div
                              key={card.id}
                              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                selectedCardId === card.id
                                  ? "border-[#6A3CB1] bg-purple-50"
                                  : "border-gray-200 hover:border-gray-300"
                              }`}
                              onClick={() => card.id && handleCardSelect(card.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <CreditCard className="w-6 h-6 text-gray-500" />
                                  <div>
                                    <div className="font-medium text-gray-900">
                                      {getCardBrand(card.brand || "")} ••••{" "}
                                      {card.card_last4}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      Expires{" "}
                                      {formatExpiryDate(
                                        card.exp_month,
                                        card.exp_year
                                      )}
                                      {card.is_default && (
                                        <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                                          Default
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-sm text-gray-400">
                                      {card.card_holder || ""}
                                    </div>
                                  </div>
                                </div>
                                {selectedCardId === card.id && (
                                  <div className="w-4 h-4 bg-[#6A3CB1] rounded-full flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}

                          {/* Add New Card Button */}
                          <button
                            type="button"
                            onClick={handleAddNewCard}
                            className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center space-x-2 text-gray-500 hover:border-[#6A3CB1] hover:text-[#6A3CB1] transition-colors"
                          >
                            <Plus className="w-5 h-5" />
                            <span>Add New Card</span>
                          </button>
                        </div>
                      )}

                      {/* Add New Card Form */}
                      {(showAddCardForm || existingCards.length === 0) && (
                        <div className="space-y-4">
                          {existingCards.length > 0 && (
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium text-gray-700">
                                Add New Card
                              </h4>
                              <button
                                type="button"
                                onClick={() => setShowAddCardForm(false)}
                                className="text-sm text-[#6A3CB1] hover:underline"
                              >
                                ← Back to saved cards
                              </button>
                            </div>
                          )}

                          <InputField
                            label="Card Holder Name"
                            placeholder="Enter card holder name"
                            value={cardFormData.cardHolder}
                            onChange={(value: string) =>
                              handleCardInputChange("cardHolder", value)
                            }
                          />

                          <div>
                            <label className="text-sm text-gray-600 mb-1 block">
                              Card Number
                            </label>
                            <div className="relative">
                              <input
                                type={showCardNumber ? "text" : "password"}
                                placeholder="1234 5678 9012 3456"
                                value={cardFormData.cardNumber}
                                onChange={(e) =>
                                  handleCardInputChange(
                                    "cardNumber",
                                    formatCardNumber(e.target.value)
                                  )
                                }
                                maxLength={19}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6A3CB1] focus:border-transparent"
                              />
                              <Eye
                                size={18}
                                className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
                                onClick={() =>
                                  setShowCardNumber(!showCardNumber)
                                }
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <InputField
                              label="Expiry Date"
                              type="month"
                              value={cardFormData.expiryDate}
                              onChange={(value: string) =>
                                handleCardInputChange("expiryDate", value)
                              }
                            />
                            <InputField
                              label="CVV"
                              type="password"
                              placeholder="123"
                              maxLength={3}
                              value={cardFormData.cvv}
                              onChange={(value: string) =>
                                handleCardInputChange(
                                  "cvv",
                                  value.replace(/[^0-9]/g, "")
                                )
                              }
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                {/* Bank Transfer Form */}
                {selectedMethod === method.value &&
                  method.value === "bank_transfer" && (
                    <div className="border-t border-gray-200 p-5 space-y-4">
                      <InputField
                        label="Account Holder Name"
                        placeholder="Enter account holder name"
                        value={bankFormData.accountHolder}
                        onChange={(value: string) =>
                          handleBankInputChange("accountHolder", value)
                        }
                      />

                      <div>
                        <label className="text-sm text-gray-600 mb-1 block">
                          Bank Name
                        </label>
                        <select
                          value={bankFormData.bankName}
                          onChange={(e) =>
                            handleBankInputChange("bankName", e.target.value)
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#6A3CB1] focus:border-transparent"
                        >
                          <option value="">Select Bank</option>
                          <option value="SBI">State Bank of India (SBI)</option>
                          <option value="HDFC">HDFC Bank</option>
                          <option value="ICICI">ICICI Bank</option>
                          <option value="AXIS">Axis Bank</option>
                          <option value="KOTAK">Kotak Mahindra Bank</option>
                        </select>
                      </div>

                      <InputField
                        label="Account Number"
                        placeholder="Enter account number"
                        value={bankFormData.accountNumber}
                        onChange={(value: string) =>
                          handleBankInputChange(
                            "accountNumber",
                            value.replace(/[^0-9]/g, "")
                          )
                        }
                        maxLength={18}
                      />

                      <InputField
                        label="Re-enter Account Number"
                        placeholder="Re-enter account number"
                        value={bankFormData.confirmAccountNumber}
                        onChange={(value: string) =>
                          handleBankInputChange(
                            "confirmAccountNumber",
                            value.replace(/[^0-9]/g, "")
                          )
                        }
                        maxLength={18}
                      />

                      <InputField
                        label="Branch Name"
                        placeholder="Enter branch name"
                        value={bankFormData.branchName}
                        onChange={(value: string) =>
                          handleBankInputChange("branchName", value)
                        }
                      />

                      <InputField
                        label="IFSC Code"
                        placeholder="Enter IFSC code"
                        value={bankFormData.ifscCode}
                        onChange={(value: string) =>
                          handleBankInputChange("ifscCode", value.toUpperCase())
                        }
                      />
                    </div>
                  )}
              </div>
            ))
          )}
        </div>

        {/* Right Section - Order Summary */}
        <div className="border border-gray-200 rounded-2xl bg-[#F8F5FF] p-6 lg:p-10 h-full flex flex-col justify-between shadow-sm">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Order Summary
            </h3>
            <div className="space-y-3 text-gray-700 text-sm">
              <div className="flex justify-between">
                <span>Base Price</span>
                <span>₹{quoteData?.base_price || "Loading..."}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Fees</span>
                <span>₹{quoteData?.taxes || "Loading..."}</span>
              </div>
              <hr className="my-3 border-gray-300" />
              <div className="flex justify-between font-semibold text-gray-900 text-base">
                <span>Total Payable</span>
                <span>₹{quoteData?.total || "Loading..."}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8 gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-600 font-medium hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={handlePaymentSubmit}
              disabled={loading || !selectedMethod}
              className={`flex-1 py-3 rounded-lg font-semibold text-white ${
                loading || !selectedMethod
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#6A3CB1] hover:bg-[#5b32a2]"
              } transition`}
            >
              {loading ? "Processing..." : `Submit Payment`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
