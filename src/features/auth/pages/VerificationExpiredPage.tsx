import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import bgImage from "../../../assets/commonbackground.png";
import { sendEmailVerificationCode } from "../../../api/auth/authapi";
import Swal from "sweetalert2";

const ExpiredVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get("email") || "";

  const handleResend = async () => {
    try {
      await sendEmailVerificationCode(email);

      Swal.fire({
        icon: "success",
        title: "Code Resent!",
        text: "A new verification code has been sent to your email.",
        confirmButtonColor: "#719CBF",
      });

      // go back to verification page with prefilled email
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    } catch {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Unable to resend code. Try again later.",
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
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* subtle decorative glow behind card (matches screenshot feel) */}
      <div
        aria-hidden
        style={{
          width: 420,
          height: 240,
          position: "absolute",
          filter: "blur(40px)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(235,242,248,0.9) 100%)",
          transform: "translateY(-8%)",
          borderRadius: 32,
          zIndex: 0,
          opacity: 0.95,
        }}
      />

      <div className="relative w-full max-w-[640px] p-0" style={{ zIndex: 10 }}>
        <div
          className="mx-auto"
          style={{
            width: 420,
            // card
            borderRadius: 14,
            padding: "36px 36px",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(235,242,248,0.88) 100%)",
            boxShadow:
              "0 18px 40px rgba(43,63,84,0.10), inset 0 1px 0 rgba(255,255,255,0.6)",
            border: "1px solid rgba(255,255,255,0.6)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            textAlign: "center",
          }}
          role="alert"
        >
          <h1
            style={{
              fontFamily: "Raleway, sans-serif",
              fontWeight: 600,
              fontSize: "40px",
              lineHeight: "100%",
              margin: 0,
              color: "#4A7EA0",
              marginBottom: 10,
            }}
          >
            Verification code expired!
          </h1>

          <p
            style={{
              fontFamily: "Raleway, sans-serif",
              fontWeight: 400,
              fontSize: "15px",
              color: "#6b8aa2",
              marginTop: 0,
              marginBottom: 22,
            }}
          >
            Please request a new one.
          </p>

          <button
            onClick={handleResend}
            className="rounded-full"
            style={{
              width: 280,
              padding: "10px 18px",
              backgroundColor: "#719cbf",
              color: "#fff",
              border: "none",
              fontFamily: "Raleway, sans-serif",
              fontWeight: 600,
              boxShadow: "0 8px 18px rgba(17,80,110,0.12)",
              cursor: "pointer",
              borderRadius: 8,
            }}
            aria-label="Resend Code"
          >
            Resend Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpiredVerificationPage;
