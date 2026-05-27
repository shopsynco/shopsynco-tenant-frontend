import React from "react";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";
import bgImage from "../../../assets/commonbackground.png";

const PasswordResetSuccess: React.FC = () => {
  const navigate = useNavigate();

  const handleGoToLogin = () => navigate("/login");

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center relative overflow-hidden"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* decorative soft glow behind the card */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          width: 520,
          height: 300,
          filter: "blur(40px)",
          background:
            "radial-gradient(circle at 20% 30%, rgba(113,156,191,0.16), rgba(255,255,255,0))",
          transform: "translateY(-5%)",
          borderRadius: 24,
          zIndex: 0,
          opacity: 0.95,
        }}
      />

      {/* centered card */}
      <div
        className="relative z-10 mx-auto"
        style={{ width: 480 }}
      >
        <div
          className="mx-auto"
          style={{
            borderRadius: 16,
            padding: "36px 40px",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(235,242,248,0.94) 100%)",
            boxShadow: "0 20px 40px rgba(43,63,84,0.10)",
            border: "1px solid rgba(255,255,255,0.6)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            textAlign: "center",
          }}
          role="status"
          aria-live="polite"
        >
          {/* icon circle */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 72,
              background: "rgba(210,247,225,0.88)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 18px",
              boxShadow: "inset 0 2px 6px rgba(0,0,0,0.02)",
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
              }}
            >
              <Check size={36} color="#1f9b46" strokeWidth={2.5} />
            </div>
          </div>

          {/* heading */}
          <h1
            style={{
              fontFamily: "Raleway, sans-serif",
              fontWeight: 600,
              fontSize: 24,
              lineHeight: "1.05",
              color: "#3b6f8f",
              margin: 0,
              marginBottom: 12,
            }}
          >
            Your password has been reset successfully!
          </h1>

          {/* subtext */}
          <p
            style={{
              fontFamily: "Raleway, sans-serif",
              fontWeight: 400,
              fontSize: 14,
              color: "#6b8aa2",
              marginTop: 0,
              marginBottom: 22,
            }}
          >
            You can now sign in with your new password.
          </p>

          {/* CTA (full width like screenshot) */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <button
              onClick={handleGoToLogin}
              className="rounded-lg font-semibold"
              style={{
                width: 320,
                padding: "10px 14px",
                backgroundColor: "#719cbf",
                color: "#ffffff",
                border: "none",
                boxShadow: "0 8px 18px rgba(17,80,110,0.12)",
                cursor: "pointer",
                fontFamily: "Raleway, sans-serif",
                fontSize: 14,
              }}
              aria-label="Go to Login"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetSuccess;
