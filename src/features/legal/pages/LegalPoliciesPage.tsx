import { NavLink, Navigate, useNavigate, useParams } from "react-router-dom";
import logo from "../../../assets/Name-Logo.png";
import {
  LEGAL_NAV,
  LEGAL_ORDER,
  LEGAL_POLICIES,
  parseLegalSlug,
  type LegalSlug,
} from "../legalContent";

function LegalBackgroundDecor() {
  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden -z-10"
      aria-hidden
    >
      <div className="absolute -right-16 bottom-0 h-[28rem] w-[28rem] rounded-full bg-gradient-to-br from-[#7B61FF]/30 via-[#AE84EB]/20 to-transparent blur-3xl" />
      <div className="absolute left-[-4rem] top-1/3 h-48 w-48 rounded-full bg-[#C4B5FD]/35 blur-2xl" />
      <div className="absolute right-1/4 top-8 h-24 w-24 rounded-full bg-[#7B61FF]/40 blur-xl" />
      <div className="absolute right-8 top-24 h-20 w-20 rotate-12 rounded-lg bg-gradient-to-br from-[#7B61FF]/25 to-[#38BDF8]/20 blur-md" />
    </div>
  );
}

export default function LegalPoliciesPage() {
  const { policySlug } = useParams<{ policySlug: string }>();
  const navigate = useNavigate();
  const slug = parseLegalSlug(policySlug);

  if (policySlug && !LEGAL_ORDER.includes(policySlug as LegalSlug)) {
    return <Navigate to="/legal/terms" replace />;
  }

  const policy = LEGAL_POLICIES[slug];
  const idx = LEGAL_ORDER.indexOf(slug);
  const nextSlug = LEGAL_ORDER[idx + 1];

  const goNext = () => {
    if (nextSlug) {
      navigate(`/legal/${nextSlug}`);
      return;
    }
    const hasSub = localStorage.getItem("tenant_subscription_active") === "1";
    navigate(hasSub ? "/dashboard" : "/plans");
  };

  const nextLabel = nextSlug ? "Next" : "Done";

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-white font-poppins text-[#4A5C74]">
      <LegalBackgroundDecor />

      <div className="relative z-10 flex min-h-screen flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="flex w-full shrink-0 flex-col border-b border-gray-200/80 bg-white/90 px-6 py-8 md:w-[min(100%,280px)] md:border-b-0 md:border-r md:border-gray-200/80 md:py-12 md:pl-8 md:pr-6 lg:pl-10">
          <div className="mb-8 flex items-center gap-3">
            <img src={logo} alt="ShopSynco" className="h-9 w-auto" />
          </div>

          <nav className="flex flex-row gap-2 overflow-x-auto pb-2 md:flex-col md:gap-1 md:overflow-visible md:pb-0">
            {LEGAL_NAV.map((item) => (
              <NavLink
                key={item.slug}
                to={`/legal/${item.slug}`}
                className={({ isActive }) =>
                  [
                    "whitespace-nowrap rounded-lg px-3 py-2.5 text-sm transition md:whitespace-normal",
                    isActive
                      ? "font-semibold text-[#5B3FA8] md:border-l-[3px] md:border-[#7B61FF] md:bg-[#7B61FF]/08 md:pl-3"
                      : "font-medium text-gray-500 hover:text-[#7B61FF]/90",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-6 hidden text-left text-sm text-gray-500 underline-offset-2 hover:text-[#7B61FF] hover:underline md:block"
          >
            ← Back
          </button>
        </aside>

        {/* Content */}
        <div className="flex flex-1 flex-col px-6 py-8 md:px-12 md:py-12 lg:px-16">
          <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
            <h1 className="mb-6 text-2xl font-bold tracking-tight text-[#2D2A3E] md:text-3xl">
              {policy.title}
            </h1>

            <div
              className="prose prose-slate max-w-none flex-1 text-[15px] leading-relaxed text-gray-700 [&_strong]:font-semibold [&_strong]:text-[#2D2A3E]"
              dangerouslySetInnerHTML={{ __html: policy.html }}
            />

            <div className="mt-12 flex justify-end pb-6 md:pb-10">
              <button
                type="button"
                onClick={goNext}
                className="rounded-xl bg-[#7B61FF] px-10 py-3 text-sm font-semibold text-white shadow-lg shadow-[#7B61FF]/25 transition hover:bg-[#6B51EF] focus:outline-none focus:ring-2 focus:ring-[#7B61FF] focus:ring-offset-2"
              >
                {nextLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
