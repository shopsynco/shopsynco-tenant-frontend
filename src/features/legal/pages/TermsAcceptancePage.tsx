import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import logo from "../../../assets/Name-Logo.png";
import { LEGAL_NAV, LEGAL_POLICIES } from "../legalContent";
import {
  hasAcceptedOnboardingTerms,
  markOnboardingTermsAccepted,
} from "../../../utils/termsAcceptance";
import { setPlansEntryFromCheckout } from "../../../utils/planFlow";

function LegalBackgroundDecor() {
  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden -z-10"
      aria-hidden
    >
      <div className="absolute -right-16 bottom-0 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-[#7B61FF]/30 via-[#AE84EB]/20 to-transparent blur-3xl" />
      <div className="absolute left-[-4rem] top-1/3 h-48 w-48 rounded-full bg-[#C4B5FD]/35 blur-2xl" />
    </div>
  );
}

export default function TermsAcceptancePage() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);

  const checkScrollEnd = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const threshold = 32;
    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
    if (atBottom) setHasScrolledToEnd(true);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", checkScrollEnd, { passive: true });
    const ro = new ResizeObserver(() => checkScrollEnd());
    ro.observe(el);
    checkScrollEnd();

    return () => {
      el.removeEventListener("scroll", checkScrollEnd);
      ro.disconnect();
    };
  }, [checkScrollEnd]);

  if (hasAcceptedOnboardingTerms()) {
    return <Navigate to="/plans" replace />;
  }

  const handleAgree = () => {
    if (!hasScrolledToEnd) return;
    markOnboardingTermsAccepted();
    setPlansEntryFromCheckout();
    navigate("/plans");
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-white font-poppins text-[#4A5C74]">
      <LegalBackgroundDecor />

      <header className="relative z-10 flex shrink-0 items-center border-b border-gray-200/80 bg-white/90 px-6 py-4 md:px-10">
        <img src={logo} alt="ShopSynco" className="h-9 w-auto" />
      </header>

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col px-6 py-6 md:px-10 md:py-8">
        <h1 className="mb-2 text-2xl font-bold tracking-tight text-[#2D2A3E] md:text-3xl">
          Terms &amp; conditions
        </h1>
        <p className="mb-4 text-sm text-gray-600">
          Please read all sections below. Scroll to the end of this page to
          enable the agree button, then continue to choose your plan.
        </p>

        <div
          ref={scrollRef}
          className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-[#E8E0F4] bg-white/80 p-5 shadow-sm md:p-8"
          style={{ maxHeight: "calc(100vh - 280px)" }}
        >
          {LEGAL_NAV.map((item, index) => {
            const policy = LEGAL_POLICIES[item.slug];
            return (
              <section
                key={item.slug}
                className={index > 0 ? "mt-10 border-t border-gray-100 pt-10" : ""}
              >
                <h2 className="mb-4 text-xl font-semibold text-[#2D2A3E]">
                  {policy.title}
                </h2>
                <div
                  className="prose prose-slate max-w-none text-[15px] leading-relaxed text-gray-700 [&_strong]:font-semibold [&_strong]:text-[#2D2A3E]"
                  dangerouslySetInnerHTML={{ __html: policy.html }}
                />
              </section>
            );
          })}
        </div>

        <div className="mt-6 shrink-0 pb-8">
          {!hasScrolledToEnd && (
            <p
              className="mb-3 text-center text-sm text-amber-700"
              role="status"
            >
              Scroll down to read the full terms before you can agree.
            </p>
          )}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAgree}
              disabled={!hasScrolledToEnd}
              className="w-full rounded-xl bg-[#7658A0] px-10 py-3 text-sm font-semibold text-white shadow-lg shadow-[#7658A0]/25 transition hover:bg-[#654878] focus:outline-none focus:ring-2 focus:ring-[#7658A0] focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none sm:w-auto"
            >
              I agree — continue to plans
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
