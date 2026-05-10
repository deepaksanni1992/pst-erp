import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Button } from "./ui/button.jsx";
import { DropdownMenu, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "./ui/dropdown-menu.jsx";
import { Tooltip } from "./ui/tooltip.jsx";

function Icon({ d, viewBox = "0 0 24 24", size = 18 }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
}

const ICONS = {
  menu:    "M3 6h18M3 12h18M3 18h18",
  search:  ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z", "m21 21-4.3-4.3"],
  bell:    ["M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9", "M13.73 21a2 2 0 0 1-3.46 0"],
  logout:  ["M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4", "M16 17l5-5-5-5", "M21 12H9"],
  user:    ["M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2", "M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  settings: ["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"],
};

export default function Topbar({ onMenuClick }) {
  const nav = useNavigate();
  const { auth, logout, selectCompany } = useAuth();

  function onLogout() {
    logout();
    nav("/login");
  }

  async function onSwitchCompany(e) {
    const nextCompanyId = e.target.value;
    if (!nextCompanyId || nextCompanyId === auth?.company?.id) return;
    try {
      await selectCompany(nextCompanyId);
      nav("/dashboard");
    } catch (err) {
      window.alert(err.message || "Failed to switch company");
    }
  }

  const userName = auth?.user?.name || auth?.user?.username || "User";
  const userInitials = String(userName)
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 h-[var(--topbar-h)] border-b border-pst-steel-200 bg-white/85 backdrop-blur-md">
      <div className="flex h-full items-center justify-between gap-3 px-4 md:px-6">
        {/* Left: menu button + brand area + company badge */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg border border-pst-steel-200 text-pst-navy-700 hover:bg-pst-steel-100 transition-colors"
          >
            <Icon d={ICONS.menu} />
          </button>

          <div className="hidden lg:block min-w-0">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-pst-steel-500">
              Purestream Energy FZE
            </div>
            <div className="text-sm font-semibold text-pst-navy-800 truncate">
              PST ERP Workspace
            </div>
          </div>

          {auth?.company?.name && (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-pst-navy-100 px-2.5 py-1 text-[11px] font-medium text-pst-navy-700 ring-1 ring-inset ring-pst-navy-200">
              <span className="h-1.5 w-1.5 rounded-full bg-pst-orange" />
              {auth.company.name}
              <span className="text-pst-navy-500">· {auth.company.code}</span>
            </span>
          )}
        </div>

        {/* Center: global search */}
        <div className="relative hidden md:flex flex-1 max-w-xl">
          <span aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-pst-steel-400">
            <Icon d={ICONS.search} />
          </span>
          <input
            type="search"
            placeholder="Search items, customers, invoices…"
            className="h-9 w-full rounded-lg border border-pst-steel-200 bg-white pl-9 pr-16 text-sm text-pst-navy-800 placeholder:text-pst-steel-400 focus:border-pst-orange focus:ring-2 focus:ring-pst-orange/30 outline-none transition"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden lg:inline-flex h-5 items-center rounded border border-pst-steel-200 bg-pst-steel-50 px-1.5 text-[10px] font-medium text-pst-steel-500">
            ⌘K
          </kbd>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          {!!auth?.companies?.length && auth.companies.length > 1 && (
            <select
              className="hidden md:block h-9 rounded-lg border border-pst-steel-200 bg-white px-3 text-sm text-pst-navy-800 hover:border-pst-steel-300 focus:border-pst-orange focus:ring-2 focus:ring-pst-orange/30 outline-none transition"
              value={auth?.company?.id || ""}
              onChange={onSwitchCompany}
              aria-label="Switch company"
            >
              {auth.companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          )}

          <Tooltip content="Notifications" side="bottom">
            <button
              type="button"
              aria-label="Notifications"
              className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-pst-steel-200 bg-white text-pst-navy-700 hover:border-pst-steel-300 hover:bg-pst-steel-50 transition-colors"
            >
              <Icon d={ICONS.bell} />
              <span aria-hidden="true" className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-pst-orange ring-2 ring-white" />
            </button>
          </Tooltip>

          <DropdownMenu
            align="right"
            trigger={
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-pst-steel-200 bg-white px-2 py-1 pr-3 hover:border-pst-steel-300 transition-colors"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-pst-navy-700 text-[11px] font-semibold text-white">
                  {userInitials || "U"}
                </span>
                <span className="hidden md:flex flex-col leading-tight text-left">
                  <span className="text-[12px] font-medium text-pst-navy-800">{userName}</span>
                  <span className="text-[10px] text-pst-steel-500 capitalize">
                    {String(auth?.user?.role || "user").replace(/_/g, " ")}
                  </span>
                </span>
              </button>
            }
          >
            <DropdownMenuLabel>Signed in as {userName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => nav("/company-settings")}>
              <Icon d={ICONS.settings} size={14} /> Company settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => nav("/settings")}>
              <Icon d={ICONS.user} size={14} /> System settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem destructive onClick={onLogout}>
              <Icon d={ICONS.logout} size={14} /> Logout
            </DropdownMenuItem>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
