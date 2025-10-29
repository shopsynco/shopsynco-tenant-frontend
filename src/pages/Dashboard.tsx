import React, { useState } from "react";
import { Check } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: number;
  color: string;
  border: string;
  features: string[];
  description: string;
}

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: 1899,
    color: "text-green-600",
    border: "border-green-400",
    description: "Perfect for small hotels",
    features: ["Up to 30 Shops", "Basic Support", "Essential Features"],
  },
  {
    id: "professional",
    name: "Professional",
    price: 4000,
    color: "text-blue-600",
    border: "border-blue-400",
    description: "Most popular for growing hotels",
    features: ["Up to 30 Shops", "Priority Support", "Advanced Analytics"],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: 9999,
    color: "text-amber-600",
    border: "border-amber-400",
    description: "For hotel chains and large properties",
    features: ["Unlimited Shops", "Dedicated Manager", "Custom Solutions"],
  },
];

export default function Dashboard() {
  const [selectedPlan, setSelectedPlan] = useState<Plan>(plans[0]);
  const [billingPeriod, setBillingPeriod] = useState("48");

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-start py-16 px-12">
      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-lg p-10 flex gap-10">
        {/* LEFT - PLAN SELECTION */}
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Choose Your Plan
          </h1>
          <p className="text-gray-600 mb-8">
            Pick the plan and billing period that fit your business best.
          </p>

          {/* Plans */}
          <div className="grid grid-cols-3 gap-6 mb-10">
            {plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`cursor-pointer border rounded-2xl p-6 hover:shadow-md transition relative ${
                  selectedPlan.id === plan.id
                    ? `${plan.border} border-2`
                    : "border-gray-200"
                }`}
              >
                <h2 className={`text-2xl font-bold ${plan.color}`}>
                  ₹{plan.price}
                  <span className="text-gray-500 text-base font-normal">
                    /month
                  </span>
                </h2>
                <h3 className="text-lg font-semibold mt-2">{plan.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{plan.description}</p>

                <ul className="space-y-1 mb-4 text-sm text-gray-700">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check size={14} className="text-green-500" /> {f}
                    </li>
                  ))}
                </ul>

                <a
                  href="#"
                  className="absolute bottom-4 right-5 text-xs text-gray-500 hover:text-gray-700"
                >
                  More info
                </a>
              </div>
            ))}
          </div>

          {/* Billing Period */}
          <h3 className="text-md font-semibold mb-4 text-gray-700">
            Select billing period
          </h3>

          <div className="space-y-4">
            {[
              { months: "48", price: 1699, save: "Save Up To 30%" },
              { months: "24", price: 1799, save: "Save Up To 20%" },
              { months: "12", price: 1899, save: "" },
            ].map((option) => (
              <label
                key={option.months}
                className={`flex items-center justify-between border rounded-xl px-5 py-4 cursor-pointer transition ${
                  billingPeriod === option.months
                    ? "border-purple-400 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="billing"
                    checked={billingPeriod === option.months}
                    onChange={() => setBillingPeriod(option.months)}
                    className="accent-purple-500 w-4 h-4"
                  />
                  <span className="font-semibold text-gray-800">
                    {option.months} Months
                  </span>
                  {option.save && (
                    <span className="ml-2 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                      {option.save}
                    </span>
                  )}
                </div>
                <span className="font-semibold text-gray-800">
                  ₹{option.price}
                  <span className="text-sm text-gray-500">/month</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* RIGHT - ORDER SUMMARY */}
        <div className="w-80 bg-purple-50 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Order Summary
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Base Price</span>
                <span>₹{1699}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Fees</span>
                <span>₹270</span>
              </div>
              <div className="flex justify-between items-center border-b border-purple-200 pb-3">
                <span>Coupon Code</span>
                <button className="text-purple-600 font-medium hover:underline">
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Terms + Buttons */}
          <div>
            <p className="text-xs text-gray-600 mt-6 mb-4 leading-snug">
              By checking out, you agree with our{" "}
              <a href="#" className="text-purple-600 hover:underline">
                Terms of Service
              </a>{" "}
              and confirm that you have read our{" "}
              <a href="#" className="text-purple-600 hover:underline">
                Privacy Policy
              </a>
              . You can cancel recurring payments at any time.
            </p>

            <div className="flex gap-3">
              <button className="flex-1 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition">
                Cancel
              </button>
              <button className="flex-1 py-3 rounded-xl font-semibold text-white bg-purple-600 hover:bg-purple-700 transition">
                Choose Payment Method
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
