import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { fetchPlans } from "../../../api/mainapi/planapi";
import { getPricingQuote } from "../../../api/mainapi/planapi";
import { useNavigate } from "react-router-dom";

interface Plan {
  id: string;
  name: string;
  price: number;
  billing_cycle: string;
  is_active: boolean;
  date_added: string;
}

export default function ChoosePlanPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [billingPeriod, setBillingPeriod] = useState("12"); // Default to 12 months
  const [quoteData, setQuoteData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState<string>(""); // State for coupon code
  const [isCouponFieldVisible, setIsCouponFieldVisible] = useState<boolean>(); // State for coupon code
  const [error, setError] = useState<string>("");

  const navigate = useNavigate();

  // Fetch plans on component load
  useEffect(() => {
    const getPlans = async () => {
      try {
        const fetchedPlans = await fetchPlans();
        setPlans(fetchedPlans);
        if (fetchedPlans.length > 0) {
          setSelectedPlan(fetchedPlans[0]);
        }
      } catch (error) {
        console.error("Error fetching plans:", error);
      }
    };
    getPlans();
  }, []);
                     
  // Fetch quote data based on selected plan and billing period
  useEffect(() => {
    if (selectedPlan && billingPeriod) {
      const fetchQuote = async () => {
        setLoading(true);
        try {
          const quoteResponse = await getPricingQuote(
            selectedPlan.id,
            billingPeriod,
            "India" // Use the dynamic country if needed
          );
          setQuoteData(quoteResponse);
        } catch (error) {
          console.error("Error fetching pricing quote:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchQuote();
    }
  }, [selectedPlan, billingPeriod]);

  // Handle the application of coupon code
  const handleApplyCoupon = () => {
    if (couponCode === "DISCOUNT10") {
      // Example logic: Apply 10% discount if coupon code is valid
      setQuoteData((prevData: any) => {
        if (prevData) {
          const discount = prevData.total * 0.1;
          return {
            ...prevData,
            total: prevData.total - discount,
            discount: discount,
          };
        }
        return prevData;
      });
      setError(""); // Clear error if coupon is applied correctly
    } else {
      setError("Invalid Coupon Code");
    }
  };

  // Handle Payment submit and navigate to payment page with query params
  const handlePaymentSubmit = () => {
    // Navigate to the payment page with query parameters
    const planId = selectedPlan?.id || "";
    const months = billingPeriod;
    const country = "India";  // This can be dynamic if needed
    
    // Navigate to the Payment page with the selected plan details as query params
    navigate(`/payment?plan_id=${planId}&months=${months}&country=${country}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start py-8 px-4 md:py-16 md:px-12">
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-lg p-6 md:p-10 flex flex-col lg:flex-row gap-8 md:gap-10">
        {/* LEFT - PLAN SELECTION */}
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Choose Your Plan
          </h1>
          <p className="text-gray-600 mb-6 md:mb-8 text-sm md:text-base">
            Pick the plan and billing period that fit your business best.
          </p>

          {/* Plans */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-10">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`cursor-pointer border rounded-2xl p-5 sm:p-6 hover:shadow-md transition relative ${
                  selectedPlan?.id === plan.id
                    ? "border-2 border-purple-400"
                    : "border-gray-200"
                }`}
              >
                <h2 className="text-xl md:text-2xl font-bold text-gray-900">
                  ₹{plan.price}
                  <span className="text-gray-500 text-sm md:text-base font-normal">
                    /{plan.billing_cycle}
                  </span>
                </h2>
                <h3 className="text-base md:text-lg font-semibold mt-2">
                  {plan.name}
                </h3>

                <ul className="space-y-1 mb-4 text-sm text-gray-700 mt-2">
                  <li className="flex items-center gap-2">
                    <Check size={14} className="text-green-500" />
                    Active Plan
                  </li>
                </ul>

                <a
                  href="#"
                  className="absolute bottom-3 right-4 text-xs text-gray-500 hover:text-gray-700"
                >
                  More info
                </a>
              </div>
            ))}
          </div>

          {/* Billing Period */}
          <h3 className="text-md md:text-lg font-semibold mb-3 md:mb-4 text-gray-700">
            Select billing period
          </h3>

          <div className="space-y-3 md:space-y-4">
            {[{ months: "48", price: 1699 }, { months: "24", price: 1799 }, { months: "12", price: 1899 }].map(
              (option) => (
                <label
                  key={option.months}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between border rounded-xl px-4 py-3 sm:px-5 sm:py-4 cursor-pointer transition ${
                    billingPeriod === option.months
                      ? "border-purple-400 bg-purple-50"
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-0">
                    <input
                      type="radio"
                      name="billing"
                      checked={billingPeriod === option.months}
                      onChange={() => setBillingPeriod(option.months)}
                      className="accent-purple-500 w-4 h-4"
                    />
                    <span className="font-semibold text-gray-800 text-sm md:text-base">
                      {option.months} Months
                    </span>
                  </div>
                  <span className="font-semibold text-gray-800 text-sm md:text-base">
                    ₹{option.price}
                    <span className="text-xs md:text-sm text-gray-500">/month</span>
                  </span>
                </label>
              )
            )}
          </div>
        </div>

        {/* RIGHT - ORDER SUMMARY */}
        <div className="w-full lg:w-80 bg-purple-50 rounded-2xl p-5 sm:p-6 flex flex-col justify-between mt-8 lg:mt-0">
          <div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-4 md:mb-6">
              Order Summary
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Base Price</span>
                <span>₹{quoteData?.base_price || "Loading..."}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Fees</span>
                <span>₹{quoteData?.taxes || "Loading..."}</span>
              </div>

              {/* Coupon Code Section */}
              <div className="flex justify-between items-center mb-3">
                {!isCouponFieldVisible ? (
                  <>
                    <span className="text-gray-700 text-sm">Coupon Code</span>
                    <button
                      onClick={() => setIsCouponFieldVisible(true)}
                      className="text-blue-500 text-sm font-medium hover:text-blue-600"
                    >
                      Add
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1">
                      <label className="block text-sm text-gray-600 mb-1">
                        Coupon Code
                      </label>
                      <input
                        type="text"
                        placeholder="Enter Coupon Code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm"
                      />
                    </div>
                    <button
                      onClick={handleApplyCoupon}
                      className="ml-3 text-sm text-blue-500 font-medium hover:text-blue-600 focus:outline-none"
                    >
                      Apply
                    </button>
                  </>
                )}
              </div>
              {error && <p className="text-red-500 text-xs">{error}</p>}
              <div className="flex justify-between font-semibold text-gray-900 text-base">
                <span>Total Payable (yearly)</span>
                <span>₹{quoteData?.total || "Loading..."}</span>
              </div>
            </div>
          </div>

          {/* Payment Button */}
          <div className="flex justify-between mt-8 gap-3">
            <button className="flex-1 py-3 rounded-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 transition text-sm md:text-base">
              Cancel
            </button>
            <button
              onClick={handlePaymentSubmit}
              disabled={loading}
              className={`flex-1 py-3 rounded-lg font-semibold text-white ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#6A3CB1] hover:bg-[#5b32a2]"
              } transition`}
            >
              {loading ? "Processing..." : "Choose Payment Method"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
