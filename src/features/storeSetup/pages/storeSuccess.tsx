import React, { useEffect, useLayoutEffect, useState } from "react";
import bgImage from "../../../assets/backgroundsuccess.png";
import shopLogo from "../../../assets/Name-Logo.png";
import { Check, CheckCircle, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { resolvePostStoreSetupDashboard } from "../../../api/axios_config";
import { markStoreOnboardingComplete } from "../../../utils/planFlow";
import { copyTextToClipboard } from "../../../utils/copyToClipboard";

const StoreSuccessPage: React.FC = () => {
  const [dashboardUrl, setDashboardUrl] = useState<string>("");
  const [sameOriginPath, setSameOriginPath] = useState<string | null>(null);
  const [leaveAppHref, setLeaveAppHref] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const navigate = useNavigate();

  useLayoutEffect(() => {
    markStoreOnboardingComplete();
  }, []);

  useEffect(() => {
    const storeSlug = localStorage.getItem("store_slug");
    const resolved = resolvePostStoreSetupDashboard(storeSlug);
    setDashboardUrl(resolved.displayUrl);
    setSameOriginPath(resolved.sameOriginPath);
    setLeaveAppHref(resolved.leaveAppHref);
  }, []);

  const handleCopy = async () => {
    if (!dashboardUrl.trim()) return;
    setCopyError(false);
    const ok = await copyTextToClipboard(dashboardUrl);
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } else {
      setCopyError(true);
    }
  };

  return (
    <div
      className="relative flex items-center justify-center min-h-screen bg-white overflow-hidden"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute top-6 left-6 z-20">
        <img
          src={shopLogo}
          alt="ShopSynco"
          className="h-10 w-auto object-contain"
        />
      </div>

      <div className="relative z-10 w-[90%] max-w-md bg-gradient-to-r from-[#719CBF]/10 via-[#719CBF]/10 to-[#719CBF]/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl p-8 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="text-green-500 w-10 h-10" />
          </div>

          <h2 className="text-2xl font-semibold text-gray-800">
            Store Created Successfully
          </h2>

          <p className="text-gray-600">Your dashboard is ready at</p>

          <div className="w-full">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 w-full text-gray-700 font-mono text-sm">
              <span className="truncate flex-1 text-left" title={dashboardUrl}>
                {dashboardUrl || "…"}
              </span>
              <button
                type="button"
                onClick={() => void handleCopy()}
                disabled={!dashboardUrl.trim()}
                aria-label={copied ? "Copied to clipboard" : "Copy dashboard URL"}
                className="shrink-0 p-1.5 rounded-md text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-600" aria-hidden />
                ) : (
                  <Copy className="w-5 h-5" aria-hidden />
                )}
              </button>
            </div>
            {copied && (
              <p className="text-xs text-green-600 mt-1 text-left">Copied to clipboard</p>
            )}
            {copyError && (
              <p className="text-xs text-red-600 mt-1 text-left">
                Could not copy. Select the URL and copy manually.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              markStoreOnboardingComplete();
              if (sameOriginPath) {
                navigate(sameOriginPath);
              } else if (leaveAppHref) {
                window.location.href = leaveAppHref;
              } else {
                navigate("/dashboard");
              }
            }}
            className="w-full bg-[#6A3CB1] hover:bg-[#5a2d9d] text-white py-3 rounded-lg font-medium transition"
          >
            Go to Dashboard
          </button>

          <p className="text-sm text-gray-500">
            You can always access your dashboard from your email confirmation or
            by signing in to our website.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StoreSuccessPage;
