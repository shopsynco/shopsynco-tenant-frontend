import { useState, useEffect } from "react";
import { ChevronLeft } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { paymentErrorMessage } from "../../../../utils/paymentErrorMessage";
import {
  createCheckoutSubscription,
  createRazorpayOrder,
  verifyRazorpayPayment,
  getPaymentStatus,
} from "../../../../api/payment/paymentapi";
import { getPricingQuote } from "../../../../api/mainapi/planapi";
import { showError } from "../../../../components/swalHelper";
import {
  markTenantSubscriptionActive,
  setPlansEntryFromCheckout,
} from "../../../../utils/planFlow";

type RazorpayCtor = new (options: Record<string, unknown>) => { open: () => void };

/**
 * Checkout step after "Choose plan": order summary + one action to open Razorpay.
 * Payment instruments (UPI, cards, netbanking, wallets) are chosen inside Razorpay only —
 * a separate "choose payment method" screen would duplicate their hosted UI.
 */
export default function PaymentPage() {
  const [loading, setLoading] = useState(false);
  const [quoteData, setQuoteData] = useState<Record<string, unknown> | null>(null);
  const navigate = useNavigate();
  const goPaymentSuccess = () => {
    markTenantSubscriptionActive();
    navigate("/payment-success");
  };
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const planId = params.get("plan_id");
  const months = params.get("months");
  const country = params.get("country");

  const [subscriptionId, setSubscriptionId] = useState<string>(
    params.get("subscription_id") || localStorage.getItem("subscription_id") || ""
  );
  const [creatingSubscription, setCreatingSubscription] = useState(false);

  useEffect(() => {
    if (planId && months && country) {
      setLoading(true);
      getPricingQuote(planId, months, country)
        .then(setQuoteData)
        .catch(() => {
          showError("Load Failed", "Failed to load pricing information.");
        })
        .finally(() => setLoading(false));
    }
  }, [planId, months, country]);

  useEffect(() => {
    const ensureSubscription = async () => {
      if (subscriptionId || !planId || !months) return;
      try {
        setCreatingSubscription(true);
        const checkout = await createCheckoutSubscription({
          plan_id: planId,
          months: Number(months),
          payment_method: "credit_card",
        });
        const createdId = checkout?.subscription_id;
        if (createdId) {
          setSubscriptionId(createdId);
          localStorage.setItem("subscription_id", createdId);
        }
      } catch (err) {
        console.error("Error creating checkout subscription:", err);
      } finally {
        setCreatingSubscription(false);
      }
    };
    void ensureSubscription();
  }, [subscriptionId, planId, months]);

  const loadRazorpayScript = async (): Promise<boolean> => {
    if ((window as unknown as { Razorpay?: RazorpayCtor }).Razorpay) return true;
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const openRazorpayCheckout = async () => {
    const waitForPaymentConfirmation = async (subId: string) => {
      const maxAttempts = 15;
      const delayMs = 2500;
      for (let i = 0; i < maxAttempts; i += 1) {
        const statusRes = await getPaymentStatus(subId);
        if (statusRes.status === "success") return true;
        if (statusRes.status === "failed") return false;
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
      return false;
    };

    const ensureFreshSubscriptionId = async () => {
      if (!planId || !months) return "";
      const checkout = await createCheckoutSubscription({
        plan_id: planId,
        months: Number(months),
        payment_method: "credit_card",
      });
      const createdId = checkout?.subscription_id || "";
      if (createdId) {
        setSubscriptionId(createdId);
        localStorage.setItem("subscription_id", createdId);
      }
      return createdId;
    };

    // Always bind checkout to the current plan session so a stale localStorage
    // subscription_id from another tenant cannot break verify after Razorpay pays.
    let activeSubscriptionId = subscriptionId;
    if (planId && months) {
      activeSubscriptionId = await ensureFreshSubscriptionId();
    } else if (!activeSubscriptionId) {
      activeSubscriptionId = await ensureFreshSubscriptionId();
    }
    if (!activeSubscriptionId) {
      showError("Missing subscription ID", "Please try again.");
      return;
    }
    const total = Number(quoteData?.total ?? 0);
    if (!Number.isFinite(total) || total <= 0) {
      Swal.fire("Error", "Invalid payable amount. Please refresh and try again.", "error");
      return;
    }
    const scriptLoaded = await loadRazorpayScript();
    const Razorpay = (window as unknown as { Razorpay?: RazorpayCtor }).Razorpay;
    if (!scriptLoaded || !Razorpay) {
      Swal.fire("Error", "Failed to load Razorpay checkout.", "error");
      return;
    }

    let order: Awaited<ReturnType<typeof createRazorpayOrder>>;
    try {
      order = await createRazorpayOrder({
        subscription_id: activeSubscriptionId,
        amount: total,
        currency: "INR",
      });
    } catch (err: unknown) {
      const ax = err as {
        response?: { status?: number; data?: { error?: string } };
      };
      const isSubscriptionMissing =
        ax?.response?.status === 404 &&
        String(ax?.response?.data?.error || "")
          .toLowerCase()
          .includes("subscription not found");
      if (!isSubscriptionMissing) throw err;
      activeSubscriptionId = await ensureFreshSubscriptionId();
      if (!activeSubscriptionId) throw err;
      order = await createRazorpayOrder({
        subscription_id: activeSubscriptionId,
        amount: total,
        currency: "INR",
      });
    }

    // Omit `method` so Razorpay shows every enabled instrument (UPI, cards, NB, wallets).
    const razorpay = new Razorpay({
      key: order.key_id,
      amount: order.amount,
      currency: order.currency,
      order_id: order.order_id,
      name: "Shopsynco",
      description: "Subscription payment",
      prefill: order.prefill || {},
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        try {
          const verification = await verifyRazorpayPayment({
            subscription_id: activeSubscriptionId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            method: "upi",
          });
          if (verification.success === true) {
            if (verification.status === "success") {
              await Swal.fire("Success", "Payment successful!", "success");
              goPaymentSuccess();
              return;
            }
            const confirmed = await waitForPaymentConfirmation(activeSubscriptionId);
            if (confirmed) {
              await Swal.fire("Success", "Payment successful!", "success");
              goPaymentSuccess();
              return;
            }
            await Swal.fire(
              "Payment pending",
              "Signature verified. Waiting for gateway capture confirmation. Please check payment status shortly.",
              "info"
            );
            return;
          }
          throw new Error("Payment verification failed");
        } catch (verifyErr: unknown) {
          const ve = verifyErr as { response?: { data?: { error?: string; message?: string } } };
          Swal.fire(
            "Error",
            ve?.response?.data?.error ||
              ve?.response?.data?.message ||
              "Payment verification failed.",
            "error"
          );
        }
      },
      modal: {
        ondismiss: () => {
          Swal.fire("Cancelled", "Payment was cancelled.", "info");
        },
      },
    });
    razorpay.open();
  };

  const handlePayClick = async () => {
    try {
      setLoading(true);
      await openRazorpayCheckout();
    } catch (err: unknown) {
      console.error("Payment checkout error:", err);
      const ax = err as { response?: { data?: unknown } };
      const msg =
        paymentErrorMessage(ax?.response?.data) ||
        (typeof (ax?.response?.data as { message?: string })?.message === "string"
          ? (ax?.response?.data as { message?: string }).message
          : "") ||
        "Payment could not be started. Please try again.";
      Swal.fire("Error", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const totalDisplay =
    quoteData?.total != null && quoteData.total !== ""
      ? String(quoteData.total as string | number)
      : "—";
  const basePriceDisplay =
    quoteData?.base_price != null && quoteData.base_price !== ""
      ? String(quoteData.base_price as string | number)
      : "—";
  const taxesDisplay = (() => {
    const t = quoteData?.taxes ?? quoteData?.taxes_and_fees ?? quoteData?.tax;
    if (t == null || t === "") return "—";
    return String(t as string | number);
  })();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center px-4 sm:px-6 py-6 sm:py-10">
      <div className="w-full max-w-6xl mb-6 flex items-center gap-2 text-gray-500">
        <ChevronLeft className="w-4 h-4" />
        <Link
          to="/plans"
          onClick={() => setPlansEntryFromCheckout()}
          className="text-sm text-gray-700 hover:underline"
        >
          Back to Choose Plan
        </Link>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Complete payment</h2>
          <p className="text-gray-600 mb-6 text-sm leading-relaxed">
            You&apos;ll complete card, UPI, netbanking, or wallet payment in the secure Razorpay
            window. We don&apos;t collect card or UPI details on this page.
          </p>
          <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-5 text-sm text-gray-700">
            <p className="font-medium text-gray-900 mb-2">What happens next</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Click the button below to open Razorpay Checkout.</li>
              <li>Pick any payment method Razorpay offers (same options as in their modal).</li>
              <li>After payment, we&apos;ll verify and activate your subscription.</li>
            </ul>
          </div>
        </div>

        <div
          className="w-full lg:w-96 flex flex-col h-full rounded-[20px]"
          style={{ background: "#AE84EB0D" }}
        >
          <div className="flex-1 flex flex-col gap-4 p-6">
            <h3 className="font-poppins font-semibold text-[28px] leading-tight text-black my-4">
              Order Summary
            </h3>
            <div className="space-y-3 text-sm text-[#4B4B4B]">
              <div className="flex justify-between">
                <span className="font-poppins text-[18px] text-black">Base Price</span>
                <span className="font-poppins text-[18px] text-black">₹{basePriceDisplay}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-poppins text-[18px] text-black">Taxes &amp; fees</span>
                <span className="font-poppins text-[18px] text-black">₹{taxesDisplay}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E2D9F0]">
                <span className="font-poppins text-[20px] font-semibold text-black">Total</span>
                <span className="font-poppins text-[20px] font-semibold text-black">
                  ₹{totalDisplay}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-4 shrink-0 px-6 pb-6">
            <p className="text-xs font-poppins text-[#4B4B4B] text-center px-1">
              By paying, you agree to our{" "}
              <a
                href="/legal/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7658A0] font-semibold underline"
              >
                Terms
              </a>{" "}
              and{" "}
              <a
                href="/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7658A0] font-semibold underline"
              >
                Privacy Policy
              </a>
              .
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center justify-center rounded-[10px] bg-[#EEE9F5] text-[#1E1E1E] font-poppins font-semibold px-6 py-3"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handlePayClick()}
                disabled={loading || creatingSubscription || !quoteData}
                className="flex items-center justify-center rounded-[10px] bg-[#7658A0] text-white font-poppins font-semibold px-8 py-3 disabled:opacity-60"
              >
                {loading || creatingSubscription ? "Please wait…" : "Pay with Razorpay"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
