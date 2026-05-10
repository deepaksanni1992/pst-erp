import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function EyeIcon({ off }) {
  return off ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export default function Login() {
  const nav = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function onChange(e) {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      const emailInput = String(formData.get("email") || "").trim();
      const passwordInput = String(formData.get("password") || "");
      const email = emailInput || form.email.trim();
      const password = passwordInput || form.password;

      const data = await login(email, password);
      if (data?.requiresCompanySelection) nav("/select-company");
      else nav("/dashboard");
    } catch (e2) {
      setError(e2.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full bg-pst-steel-50 grid grid-cols-1 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-pst-navy-900 text-white p-12">
        {/* Subtle pattern */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 25% 20%, #fff 1px, transparent 1.5px), radial-gradient(circle at 75% 80%, #f97316 1px, transparent 1.5px)",
            backgroundSize: "60px 60px, 80px 80px",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(249,115,22,0.18) 0%, rgba(249,115,22,0) 70%)",
          }}
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -left-32 w-[480px] h-[480px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(70,112,184,0.25) 0%, rgba(70,112,184,0) 70%)",
          }}
        />

        <div className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-pst-orange text-white font-bold shadow-lg">
            PST
          </div>
          <div>
            <div className="text-lg font-semibold leading-tight">PST ERP</div>
            <div className="text-[11px] uppercase tracking-[0.2em] text-pst-navy-200">
              Purestream Energy FZE
            </div>
          </div>
        </div>

        <div className="relative space-y-5 max-w-md">
          <h1 className="text-3xl font-semibold leading-tight">
            Premium ERP for industrial,
            <br /> marine &amp; energy operations.
          </h1>
          <p className="text-sm text-pst-navy-200 leading-relaxed">
            Run quotation-to-cash, procurement, inventory, accounts and logistics
            from a single, modern enterprise workspace built for Purestream Energy.
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-pst-navy-700">
            {[
              ["Modules", "14+"],
              ["Workflows", "Sales · Purchase · GRN"],
              ["Reports", "Live"],
            ].map(([k, v]) => (
              <div key={k}>
                <div className="text-pst-orange font-semibold text-base">{v}</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-pst-navy-200">{k}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative text-[11px] text-pst-navy-300">
          © {new Date().getFullYear()} Purestream Energy FZE. All rights reserved.
        </div>
      </div>

      {/* Login form */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pst-orange text-white font-bold shadow">
              PST
            </div>
            <div>
              <div className="text-base font-semibold text-pst-navy-800">PST ERP</div>
              <div className="text-[11px] uppercase tracking-widest text-pst-steel-500">
                Purestream Energy FZE
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-pst-navy-800">Welcome back</h2>
          <p className="mt-1 text-sm text-pst-steel-500">
            Sign in with your PST ERP credentials to continue.
          </p>

          {error && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <form
            onSubmit={onSubmit}
            className="mt-6 space-y-4"
            autoComplete="new-password"
          >
            <input type="text" name="fakeEmail" autoComplete="username" className="hidden" tabIndex={-1} aria-hidden="true" />
            <input type="password" name="fakePassword" autoComplete="current-password" className="hidden" tabIndex={-1} aria-hidden="true" />

            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-widest text-pst-steel-500 mb-1.5">
                Username or email
              </label>
              <input
                id="email"
                name="email"
                value={form.email}
                onChange={onChange}
                placeholder="e.g. admin or admin@purestreamenergy.com"
                autoComplete="new-password"
                autoCapitalize="none"
                spellCheck="false"
                className="w-full rounded-lg border border-pst-steel-200 bg-white px-3.5 py-2.5 text-sm text-pst-navy-800 placeholder:text-pst-steel-400 focus:border-pst-orange focus:ring-2 focus:ring-pst-orange/30 outline-none transition"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-widest text-pst-steel-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={onChange}
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-pst-steel-200 bg-white px-3.5 py-2.5 pr-10 text-sm text-pst-navy-800 placeholder:text-pst-steel-400 focus:border-pst-orange focus:ring-2 focus:ring-pst-orange/30 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded text-pst-steel-500 hover:text-pst-navy-700 hover:bg-pst-steel-100"
                  aria-label={showPwd ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  <EyeIcon off={showPwd} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-lg bg-pst-navy-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-pst-navy-700 disabled:opacity-60 transition-colors"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>

            <div className="pt-2 text-center text-[11px] text-pst-steel-500">
              Need access? Contact your PST ERP administrator.
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
