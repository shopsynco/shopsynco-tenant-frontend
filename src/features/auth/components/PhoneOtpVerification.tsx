import { useEffect, useState } from "react";
import {
  sendPhoneVerificationCode,
  verifyPhoneCode,
} from "../../../api/auth/authapi";
import { showError, showSuccess } from "../../../components/swalHelper";
import { isValidSignupPhone, SIGNUP_PHONE_HINT } from "../../../utils/signupPhoneValidation";

type PhoneOtpVerificationProps = {
  phone: string;
  email?: string;
  onPhoneChange: (value: string) => void;
  onVerifiedChange: (verified: boolean) => void;
};

export default function PhoneOtpVerification({
  phone,
  email,
  onPhoneChange,
  onVerifiedChange,
}: PhoneOtpVerificationProps) {
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  useEffect(() => {
    setOtp("");
    setOtpSent(false);
    setPhoneVerified(false);
    onVerifiedChange(false);
    // Reset verification when the phone number changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phone]);

  const handleSendOtp = async () => {
    const phoneTrimmed = phone.trim();
    if (!isValidSignupPhone(phoneTrimmed)) {
      showError("Invalid phone number", SIGNUP_PHONE_HINT);
      return;
    }

    setSendingOtp(true);
    try {
      await sendPhoneVerificationCode(phoneTrimmed, email?.trim());
      setOtpSent(true);
      setOtp("");
      showSuccess("OTP Sent", "We sent a 6-digit code to your mobile number.");
    } catch (error: unknown) {
      showError(
        "Send Failed",
        error instanceof Error ? error.message : "Failed to send OTP."
      );
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const phoneTrimmed = phone.trim();
    const code = otp.trim();
    if (code.length !== 6) {
      showError("Invalid code", "Enter the 6-digit OTP sent to your phone.");
      return;
    }

    setVerifyingOtp(true);
    try {
      await verifyPhoneCode(phoneTrimmed, code);
      setPhoneVerified(true);
      onVerifiedChange(true);
      showSuccess("Verified", "Your mobile number has been verified.");
    } catch (error: unknown) {
      showError(
        "Verification Failed",
        error instanceof Error ? error.message : "Invalid or expired OTP."
      );
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="phone"
        className="font-poppins font-medium text-[16px] leading-[24px] text-[#719CBF]"
      >
        Phone Number
      </label>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="tel"
          name="phone"
          id="phone"
          placeholder="+1 555 123 4567"
          autoComplete="tel"
          inputMode="tel"
          maxLength={22}
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          disabled={phoneVerified}
          className="flex-1 px-5 py-3 rounded-[8px] text-[#000000] placeholder-[#B7A9CE] bg-[#124B7A24] border-0 focus:outline-none focus:ring-2 focus:ring-[#719CBF] transition disabled:opacity-70"
          required
        />
        <button
          type="button"
          onClick={handleSendOtp}
          disabled={phoneVerified || sendingOtp || !phone.trim()}
          className="px-4 py-3 rounded-[8px] bg-[#6A9ECF] text-white font-medium whitespace-nowrap hover:bg-[#5c91c4] transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {sendingOtp ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
        </button>
      </div>

      {otpSent && !phoneVerified && (
        <div className="flex flex-col sm:flex-row gap-2 mt-1">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="flex-1 px-5 py-3 rounded-[8px] text-[#000000] placeholder-[#B7A9CE] bg-[#124B7A24] border-0 focus:outline-none focus:ring-2 focus:ring-[#719CBF] transition"
          />
          <button
            type="button"
            onClick={handleVerifyOtp}
            disabled={verifyingOtp || otp.length !== 6}
            className="px-4 py-3 rounded-[8px] bg-[#719CBF] text-white font-medium whitespace-nowrap hover:bg-[#5f97b6] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {verifyingOtp ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      )}

      {phoneVerified && (
        <p className="text-sm text-green-700 font-medium">Mobile number verified</p>
      )}
    </div>
  );
}
