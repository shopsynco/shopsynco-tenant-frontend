import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { loginUser } from "../../../store/authSlice";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import AuthLayout from "../components/AuthLayout";
import { showSuccess } from "../../../components/swalHelper";
import { discoverTenantSlug } from "../../../api/auth/slugapi";
import { completeTenantAuthAndRedirect } from "../../../api/auth/sessionApi";
import {
  resolvePostLoginNavigationPath,
  setPlansEntryFromCheckout,
} from "../../../utils/planFlow";
import { trackMetaPixelShopSyncoLogin } from "../../../lib/metaPixel";
import { persistTenantUserEmail } from "../../../utils/tenantUserEmail";
import { readTenantSlugFromAccessToken } from "../../../utils/tenantStoreSlug";
import { redirectToTenantAppPath } from "../../../api/axios_config";
import {
  decodeJwtPayload,
  isTenantSignupOAuthError,
  oauthErrorMessage,
  startTenantGoogleOAuth,
  tenantSignupPath,
} from "../utils/googleOAuth";

type TenantSlugResponse = {
  slug?: string;
  tenant_slug?: string;
  user_role?: string;
  user_exists?: boolean;
  has_tenant?: boolean;
  data?: {
    slug?: string;
    tenant_slug?: string;
    user_exists?: boolean;
    has_tenant?: boolean;
    user_role?: string;
  };
};

function pickField<T>(...values: unknown[]): T | undefined {
  for (const value of values) {
    if (value !== undefined && value !== null) return value as T;
  }
  return undefined;
}

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading } = useAppSelector((state: any) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showSignupHint, setShowSignupHint] = useState(false);

  const redirectToSignup = React.useCallback(
    (signupEmail?: string) => {
      redirectToTenantAppPath(tenantSignupPath(signupEmail || email));
    },
    [email]
  );

  const offerSignupIfNonTenantEmail = React.useCallback(
    async (probeEmail: string): Promise<boolean> => {
      if (!probeEmail || !probeEmail.includes("@")) return false;
      try {
        const res = (await discoverTenantSlug(probeEmail)) as TenantSlugResponse;
        const userExists = pickField<boolean>(
          res?.user_exists,
          res?.data?.user_exists
        );
        const hasTenant = pickField<boolean>(
          res?.has_tenant,
          res?.data?.has_tenant
        );
        const role = (
          pickField<string>(res?.user_role, res?.data?.user_role) || ""
        )
          .toString()
          .trim()
          .toLowerCase();

        if (userExists === false || hasTenant === false) {
          setErrorMessage(
            "No store account found for this email. Sign up to create your store."
          );
          setShowSignupHint(true);
          return true;
        }
        if (role === "customer") {
          setErrorMessage(oauthErrorMessage("google_customer_account_conflict"));
          setShowSignupHint(true);
          return true;
        }
        return false;
      } catch (err: unknown) {
        const ax = err as {
          response?: { status?: number; data?: TenantSlugResponse };
        };
        const status = ax.response?.status;
        const data = ax.response?.data;
        const userExists = pickField<boolean>(
          data?.user_exists,
          data?.data?.user_exists
        );
        if (status === 404 || userExists === false) {
          setErrorMessage(
            "No store account found for this email. Sign up to create your store."
          );
          setShowSignupHint(true);
          return true;
        }
        return false;
      }
    },
    []
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = (params.get("error") || "").trim();
    const access = params.get("auth_access_token");
    const refresh = params.get("auth_refresh_token");

    if (oauthError) {
      const cleanUrl = `${window.location.origin}${window.location.pathname}`;
      window.history.replaceState({}, document.title, cleanUrl);

      if (isTenantSignupOAuthError(oauthError)) {
        redirectToTenantAppPath(tenantSignupPath());
        return;
      }

      setErrorMessage(oauthErrorMessage(oauthError));
      return;
    }

    if (!access || !refresh) return;

    const cleanUrl = `${window.location.origin}${window.location.pathname}`;
    window.history.replaceState({}, document.title, cleanUrl);

    const payload = decodeJwtPayload(access) || {};
    const emailFromToken =
      typeof payload.email === "string" ? payload.email.trim() : "";
    const roleFromToken =
      typeof payload.role === "string"
        ? payload.role.trim().toLowerCase()
        : "";
    if (roleFromToken === "customer") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      redirectToTenantAppPath(tenantSignupPath(emailFromToken));
      return;
    }

    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
    if (emailFromToken) {
      persistTenantUserEmail(emailFromToken);
    }

    const slugFromToken =
      typeof payload.tenant_slug === "string"
        ? payload.tenant_slug.trim()
        : "";

    if (slugFromToken) {
      localStorage.setItem("store_slug", slugFromToken);
    }

    trackMetaPixelShopSyncoLogin(
      emailFromToken ? { em: emailFromToken } : undefined,
    );

    void completeTenantAuthAndRedirect();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setShowSignupHint(false);

    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    try {
      const trimmedEmail = email.trim();

      const result = await dispatch(
        loginUser({ email: trimmedEmail, password } as any)
      );

      if (loginUser.fulfilled.match(result)) {
        const payload = result.payload;
        trackMetaPixelShopSyncoLogin({ em: trimmedEmail });
        const needsStoreSetup =
          payload.requires_store_setup === true ||
          payload.action_required === "store_setup";

        const hasPaidAccess = payload.has_active_subscription === true;
        const setupIncomplete = payload.store_setup_incomplete === true;

        // Prefer JWT tenant_slug; discover only when the token has no store context.
        const jwtSlug = readTenantSlugFromAccessToken();
        if (jwtSlug) {
          localStorage.setItem("store_slug", jwtSlug);
        } else if (!needsStoreSetup) {
          try {
            const slugResponse = (await discoverTenantSlug(
              trimmedEmail
            )) as TenantSlugResponse;

            const role = slugResponse?.user_role?.toString().trim().toLowerCase();
            if (role === "customer") {
              localStorage.removeItem("store_slug");
            } else {
              const slug =
                slugResponse?.slug ??
                slugResponse?.tenant_slug ??
                slugResponse?.data?.slug ??
                slugResponse?.data?.tenant_slug;
              if (slug) {
                localStorage.setItem("store_slug", slug);
              }
            }
          } catch (slugErr) {
            console.error("Failed to discover tenant slug:", slugErr);
          }
        }

        const successTitle = needsStoreSetup ? "Welcome" : "Success";
        const successText =
          needsStoreSetup && payload.loginMessage
            ? payload.loginMessage
            : "Login Successful";

        const nextPath = resolvePostLoginNavigationPath({
          has_active_subscription: hasPaidAccess,
          requires_store_setup: needsStoreSetup,
          store_setup_incomplete: setupIncomplete,
        });
        if (!hasPaidAccess) {
          setPlansEntryFromCheckout();
        }

        showSuccess(successTitle, successText, () => {
          setErrorMessage("");
          window.location.assign(nextPath);
        });

        window.setTimeout(() => {
          const current = window.location.pathname.toLowerCase();
          const target = nextPath.toLowerCase();
          if (
            current !== target &&
            current.replace(/\/$/, "") !== target.replace(/\/$/, "")
          ) {
            window.location.assign(nextPath);
          }
        }, 800);
      } else {
        let errMsg = "Login failed";
        let signupRequired = false;
        const payload = (result as { payload?: unknown }).payload;
        if (typeof payload === "string") {
          errMsg = payload;
        } else if (payload && typeof payload === "object") {
          const p = payload as { message?: string; code?: string; action?: string };
          errMsg = p.message || "Login failed";
          signupRequired =
            p.code === "tenant_signup_required" || p.action === "signup";
        }

        if (
          !signupRequired &&
          /sign up|no account found|shopper account|store is no longer active/i.test(
            errMsg
          )
        ) {
          signupRequired = true;
        }

        if (!signupRequired) {
          const offered = await offerSignupIfNonTenantEmail(trimmedEmail);
          if (offered) return;
        }

        setErrorMessage(errMsg);
        setShowSignupHint(signupRequired);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Something went wrong");
    }
  };

  // Clear server error when user types
  const onEmailChange = (v: string) => {
    setEmail(v);
    if (errorMessage) setErrorMessage("");
    if (showSignupHint) setShowSignupHint(false);
  };
  const onPasswordChange = (v: string) => {
    setPassword(v);
    if (errorMessage) setErrorMessage("");
    if (showSignupHint) setShowSignupHint(false);
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrorMessage("");
    setShowSignupHint(false);
    try {
      const trimmedEmail = email.trim();
      if (trimmedEmail && trimmedEmail.includes("@")) {
        const needsSignup = await offerSignupIfNonTenantEmail(trimmedEmail);
        if (needsSignup) {
          setGoogleLoading(false);
          redirectToSignup(trimmedEmail);
          return;
        }
      }
      await startTenantGoogleOAuth("/login");
    } catch (err: unknown) {
      setGoogleLoading(false);
      const message =
        err instanceof Error
          ? err.message
          : "Unable to continue with Google sign-in.";
      setErrorMessage(message);
    }
  };

  return (
    <AuthLayout>
      <div
        className="w-full max-w-md p-10 rounded-3xl
          backdrop-blur-lg border border-white/30 shadow-xl 
          bg-white/40 relative"
        style={{
          background:
            "linear-gradient(112deg, rgba(255, 255, 255, 0.00) 0%, rgba(113, 156, 191, 0.20) 98.3%)",
        }}
      >
        {/* Title */}
        <h2
          id="login-title"
          className="mx-auto w-[106px] h-[47px]
             flex items-center justify-center
             text-[40px] leading-[40px] font-semibold
             text-[#719CBF] font-raleway mb-10"
          style={{ letterSpacing: "0" }}
        >
          Login
        </h2>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6"
          role="form"
          aria-labelledby="login-title"
          noValidate
        >
          <div className="flex flex-col gap-[16px]">
            <input
              name="email"
              type="email"
              placeholder="Email"
              autoComplete="email"
              className="rounded-xl px-5 py-4 w-full
                bg-[rgba(18,75,122,0.14)]
                text-black placeholder:text-[#9ea5ad]
                focus:outline-none focus:ring-2 focus:ring-[#719CBF]
                border border-gray-300 transition-all font-raleway"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              required
              aria-required={true}
            />

            <div className="flex flex-col max-lg:gap-[16px] lg:gap-6">
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete="current-password"
                  className="rounded-xl px-5 py-4 w-full
                    bg-[rgba(18,75,122,0.14)]
                    text-black placeholder:text-[#9ea5ad]
                    focus:outline-none focus:ring-2 focus:ring-[#719CBF]
                    border border-gray-300 transition-all font-raleway"
                  value={password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  required
                  aria-required={true}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="
                    absolute right-4 top-1/2 -translate-y-1/2
                    text-[#9ea5ad]
                    hover:text-[#6A9ECF]
                    p-1 transition-colors duration-200
                    flex items-center justify-center
                  "
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/forget-password?email=${encodeURIComponent(email)}`)
                  }
                  className="text-[#42739A] hover:text-[#6A9ECF] 
                    hover:underline text-sm font-medium font-raleway"
                >
                  Forgot Password?
                </button>
              </div>
            </div>
          </div>

          {/* ERROR MESSAGE (shows under inputs) */}
          {errorMessage && (
            <p role="alert" className="text-red-500 text-sm font-raleway -mt-2">
              {errorMessage}
            </p>
          )}

          {showSignupHint && (
            <button
              type="button"
              onClick={() => redirectToSignup()}
              className="w-full py-3 rounded-xl font-semibold text-white
                bg-[#6A9ECF] hover:bg-[#5c91c4] shadow-md transition font-raleway -mt-2"
            >
              Sign up to create your store
            </button>
          )}

          <div className="flex flex-col gap-[16px]">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-bold text-white
                bg-[#719CBF] hover:bg-[#5c91c4]
                shadow-md transition font-raleway disabled:opacity-60 disabled:cursor-not-allowed"
              aria-busy={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full py-4 rounded-xl font-bold text-[#1f2937]
                bg-white hover:bg-gray-100 border border-gray-300
                shadow-md transition font-raleway disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {googleLoading ? "Connecting..." : "Sign In with Google"}
            </button>
          </div>

          <p className="text-center text-sm text-[#42739A] font-raleway">
            Don’t have an account?
            <span
              onClick={() => redirectToTenantAppPath("/email-verify")}
              className="text-[#6A9ECF] font-medium ml-1 hover:underline cursor-pointer"
              role="link"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  redirectToTenantAppPath("/email-verify");
              }}
            >
              Sign Up
            </span>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
}
