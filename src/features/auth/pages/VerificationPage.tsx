import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  verifyEmailCode,
  sendEmailVerificationCode,
} from "../../../api/auth/authapi";
import bgImage from "../../../assets/commonbackground.png";

const VerificationPage: React.FC = () => {
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [timer, setTimer] = useState(300);
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const email: string = queryParams.get("email") || "";

  // refs for inputs (properly typed)
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // ⏱ Countdown timer
  useEffect(() => {
    if (timer === 0) {
      navigate(`/verification-expired?email=${encodeURIComponent(email)}`);
    }
  }, [timer]);

  // focus first input on mount
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (value: string, index: number) => {
    // only digits allowed
    if (!/^\d?$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    const key = e.key;
    if (key === "Backspace") {
      if (code[index]) {
        // if there's a digit in current, clear it
        setCode((prev) => {
          const copy = [...prev];
          copy[index] = "";
          return copy;
        });
      } else if (!code[index] && index > 0) {
        // if current is empty and backspace -> go previous
        inputsRef.current[index - 1]?.focus();
        setCode((prev) => {
          const copy = [...prev];
          copy[index - 1] = "";
          return copy;
        });
      }
    } else if (key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (key === "ArrowRight" && index < 5) {
      inputsRef.current[index + 1]?.focus();
    } else if (/^\d$/.test(key)) {
      // If user types a digit while focused, put it in and move forward
      e.preventDefault();
      handleChange(key, index);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("Text").trim();
    if (!/^\d{6}$/.test(pasted)) return;
    const arr = pasted.split("");
    setCode(arr);
    // fill inputs and focus last
    arr.forEach((d, i) => {
      if (inputsRef.current[i]) inputsRef.current[i]!.value = d;
    });
    inputsRef.current[5]?.focus();
  };

  // 🔁 Resend OTP using same pre-signup send API
  const handleResend = async () => {
    if (!email) {
      Swal.fire("Error", "Email not found. Please go back.", "error");
      return;
    }

    try {
      await sendEmailVerificationCode(email);
      Swal.fire({
        icon: "success",
        title: "Verification Code Resent",
        text: `A new code has been sent to ${email}.`,
        confirmButtonColor: "#719CBF",
      });
      setTimer(60);
      setCode(Array(6).fill(""));
      // clear inputs
      inputsRef.current.forEach((input) => {
        if (input) input.value = "";
      });
      inputsRef.current[0]?.focus();
    } catch (error: unknown) {
      Swal.fire({
        icon: "error",
        title: "Resend Failed",
        text:
          error instanceof Error
            ? error.message
            : "Unable to resend code. Try again later.",
        confirmButtonColor: "#719CBF",
      });
    }
  };

  const handleSubmit = async () => {
    const verificationCode = code.join("");

    if (verificationCode.length < 6 || /\D/.test(verificationCode)) {
      Swal.fire("Error", "Please enter all 6 digits of your code.", "error");
      return;
    }

    if (!email) {
      Swal.fire(
        "Error",
        "Email not found in request. Please go back.",
        "error"
      );
      return;
    }

    try {
      // ✅ Verify email (pre-signup verify)
      await verifyEmailCode(email, verificationCode);

      await Swal.fire({
        icon: "success",
        title: "Email Verified!",
        text: "Your email has been verified. Now create your account.",
        confirmButtonColor: "#719CBF",
      });

      // 👉 Go to SIGNUP page with email prefilled
      navigate(`/signup?email=${encodeURIComponent(email)}`);
    } catch (error: unknown) {
      Swal.fire({
        icon: "error",
        title: "Invalid Code",
        text:
          error instanceof Error
            ? error.message
            : "The verification code you entered is invalid or expired.",
        confirmButtonColor: "#719CBF",
      });
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "#f6fbff",
      }}
    >
      <div
        className="w-full max-w-[420px] p-8 rounded-[22px] shadow-2xl"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(235,242,248,0.9) 100%)",
          border: "1px solid rgba(255,255,255,0.6)",
          boxShadow:
            "0 12px 30px rgba(43,63,84,0.08), inset 0 1px 0 rgba(255,255,255,0.6)",
        }}
        role="region"
        aria-labelledby="verify-title"
      >
        <h2
          id="verify-title"
          className="text-3xl font-semibold text-center mb-2"
          style={{ color: "#4A7EA0" }}
        >
          Verify Your Email ID
        </h2>

        <p
          className="text-center text-sm mb-6 max-w-[320px] mx-auto"
          style={{ color: "#6b8aa2" }}
        >
          Enter your 6 digits code that you received on your email.
        </p>

        {/* OTP Row */}
        <div
          className="flex justify-center gap-3 mb-4"
          onPaste={handlePaste}
          aria-label="OTP input"
        >
          {code.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              ref={(el: HTMLInputElement | null) => {
                inputsRef.current[index] = el;
              }}
              inputMode="numeric"
              pattern="[0-9]*"
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) =>
                handleChange(e.target.value.replace(/\D/g, ""), index)
              }
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 text-center rounded-lg text-lg font-semibold
                       border border-transparent outline-none transition-all duration-150"
              style={{
                backgroundColor: "#cfdfe8", // soft bluish box color
                boxShadow: "inset 0 3px 6px rgba(0,0,0,0.04)",
                color: "#244b61",
              }}
              // Hover border color (#124B7A24)
              onMouseEnter={(ev) => {
                ev.currentTarget.style.border = "1px solid #124B7A24";
              }}
              onMouseLeave={(ev) => {
                ev.currentTarget.style.border = "1px solid transparent";
              }}
              // subtle focus: thin soft blue border + glow
              onFocus={(ev) => {
                ev.currentTarget.style.boxShadow =
                  "inset 0 3px 6px rgba(0,0,0,0.04), 0 0 0 3px rgba(113,156,191,0.12)";
                ev.currentTarget.style.border = "1px solid #719CBF";
              }}
              onBlur={(ev) => {
                ev.currentTarget.style.boxShadow =
                  "inset 0 3px 6px rgba(0,0,0,0.04)";
                ev.currentTarget.style.border = "1px solid transparent";
              }}
              aria-label={`Digit ${index + 1}`}
            />
          ))}
        </div>

        {/* Timer */}
        <p className="text-center text-sm mb-5" style={{ color: "#bf4141" }}>
          <span className="font-mono">
            00:{timer.toString().padStart(2, "0")}
          </span>
        </p>

        {/* Continue button */}
        <button
          onClick={handleSubmit}
          className="w-full py-3 rounded-full text-white font-semibold mb-3 transition-shadow"
          style={{
            backgroundColor: "#719cbf",
            boxShadow: "0 8px 18px rgba(17,80,110,0.12)",
          }}
          aria-label="Continue"
        >
          Continue
        </button>

        {/* Resend text */}
        <p className="text-center text-xs" style={{ color: "#6b8aa2" }}>
          If you don't receive any code!{" "}
          <button
            onClick={handleResend}
            disabled={timer > 0}
            className={`ml-1 font-semibold ${
              timer > 0 ? "cursor-not-allowed" : ""
            }`}
            style={{ color: timer > 0 ? "#c0c6cc" : "#bf4141" }}
            aria-disabled={timer > 0}
          >
            Resend
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerificationPage;
