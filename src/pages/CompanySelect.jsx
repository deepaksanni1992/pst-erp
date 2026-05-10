import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function CompanySelect() {
  const nav = useNavigate();
  const { auth, selectCompany } = useAuth();
  const [companyId, setCompanyId] = useState(auth?.companies?.[0]?.id || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const companies = useMemo(() => auth?.companies || [], [auth?.companies]);

  async function onSubmit(e) {
    e.preventDefault();
    if (!companyId) return;
    setError("");
    setLoading(true);
    try {
      await selectCompany(companyId);
      nav("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Failed to select company");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-pst-steel-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-pst-steel-200 bg-white p-7 shadow-[var(--shadow-pst-card)]">
        <div className="mb-5 flex items-center gap-3">
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

        <h1 className="text-xl font-semibold text-pst-navy-800">Select company</h1>
        <p className="mt-1 text-sm text-pst-steel-500">
          Choose your working company for this session.
        </p>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div className="space-y-2">
            {companies.map((c) => (
              <label
                key={c.id}
                className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition ${
                  companyId === c.id
                    ? "border-pst-orange bg-pst-orange-100/60 ring-1 ring-pst-orange/40"
                    : "border-pst-steel-200 hover:border-pst-steel-300"
                }`}
              >
                <div>
                  <div className="text-sm font-semibold text-pst-navy-800">{c.name}</div>
                  <div className="text-[11px] uppercase tracking-widest text-pst-steel-500">
                    Code · {c.code}
                  </div>
                </div>
                <input
                  type="radio"
                  name="company"
                  checked={companyId === c.id}
                  onChange={() => setCompanyId(c.id)}
                  className="accent-pst-orange"
                />
              </label>
            ))}
          </div>
          <button
            disabled={loading || !companyId}
            className="w-full rounded-lg bg-pst-navy-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-pst-navy-700 disabled:opacity-60 transition-colors"
          >
            {loading ? "Continuing…" : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
