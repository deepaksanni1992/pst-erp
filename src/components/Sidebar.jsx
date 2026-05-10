import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "../lib/cn.js";

/* ────────────────────────────────────────────────────────────────
 * Inline SVG icon — single primitive used by every nav row.
 * ──────────────────────────────────────────────────────────────── */
const Icon = ({ d, viewBox = "0 0 24 24", className = "" }) => (
  <svg
    aria-hidden="true"
    width="18"
    height="18"
    viewBox={viewBox}
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={cn("shrink-0", className)}
  >
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const ICONS = {
  dashboard: ["M3 12l9-9 9 9", "M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10"],
  sales:     ["M3 3v18h18", "M7 14l4-4 4 4 5-5"],
  purchase:  ["M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z", "M3 6h18", "M16 10a4 4 0 0 1-8 0"],
  inventory: ["M3 4h18v4H3z", "M5 8v12h14V8", "M10 12h4"],
  accounts:  ["M12 1v22", "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"],
  reports:   ["M21 21H3", "M7 17V9", "M12 17V5", "M17 17v-7"],
  masters:   ["M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"],
  admin:     ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z", "M9 12l2 2 4-4"],
  settings:  ["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"],
  chevronLeft:  ["M15 18l-6-6 6-6"],
  chevronRight: ["M9 18l6-6-6-6"],
  chevronDown:  ["M6 9l6 6 6-6"],
};

const NAV = [
  { id: "dashboard", to: "/dashboard", label: "Dashboard", icon: ICONS.dashboard },
  {
    id: "sales", label: "Sales", icon: ICONS.sales, to: "/sales",
    children: [
      { to: "/sales?tab=Quotation",              label: "Quotations" },
      { to: "/sales?tab=Order%20Acknowledgement", label: "Order Acknowledgements" },
      { to: "/sales?tab=Proforma%20Invoice",      label: "Proforma Invoices" },
      { to: "/sales?tab=Order%20Allocation",      label: "Order Allocation" },
      { to: "/sales?tab=Sales%20Invoice",         label: "Sales Invoices" },
      { to: "/sales?tab=Sales%20Dispatch",        label: "Sales Dispatch" },
      { to: "/sales?tab=Sales%20Return",          label: "Sales Returns" },
      { to: "/sales?tab=Customer%20Master",       label: "Customers" },
    ],
  },
  {
    id: "purchase", label: "Purchase", icon: ICONS.purchase, to: "/purchase",
    children: [
      { to: "/purchase?tab=orders",    label: "Purchase Orders" },
      { to: "/purchase?tab=suppliers", label: "Suppliers" },
      { to: "/purchase?tab=summary",   label: "PO Summary" },
    ],
  },
  {
    id: "inventory", label: "Inventory", icon: ICONS.inventory, to: "/inventory",
    children: [
      { to: "/inventory", label: "Stock View" },
      { to: "/store",     label: "GRN & Store" },
      { to: "/bom",       label: "BOM" },
      { to: "/kitting",   label: "Kitting" },
      { to: "/dekitting", label: "De-Kitting" },
      { to: "/logistics", label: "Logistics & Shipments" },
    ],
  },
  {
    id: "accounts", label: "Accounts", icon: ICONS.accounts, to: "/accounts",
    children: [
      { to: "/accounts?tab=customer-ledger", label: "Customer Ledger" },
      { to: "/accounts?tab=customer-statement", label: "Customer Statement" },
      { to: "/accounts?tab=outstanding",     label: "Outstanding" },
      { to: "/accounts?tab=aging",           label: "Aging Analysis" },
      { to: "/accounts?tab=payment-receipts", label: "Payments" },
      { to: "/accounts?tab=cash-bank",       label: "Cash & Bank" },
      { to: "/accounts?tab=journal",         label: "Journal" },
    ],
  },
  { id: "reports", to: "/reports", label: "Reports", icon: ICONS.reports },
  {
    id: "masters", label: "Masters", icon: ICONS.masters, to: "/items",
    children: [
      { to: "/items", label: "Item Master" },
    ],
  },
  {
    id: "admin", label: "Administration", icon: ICONS.admin, to: "/audit",
    children: [
      { to: "/audit",     label: "Audit Trail" },
      { to: "/documents", label: "Documents" },
    ],
  },
  {
    id: "settings", label: "Settings", icon: ICONS.settings, to: "/settings",
    children: [
      { to: "/company-settings", label: "Company Branding" },
      { to: "/settings",         label: "System Settings" },
    ],
  },
];

const OPEN_KEY = "pst_erp_sidebar_open_groups_v1";

function getInitialOpenGroups(pathname) {
  try {
    const saved = JSON.parse(localStorage.getItem(OPEN_KEY) || "null");
    if (saved && typeof saved === "object") return saved;
  } catch { /* ignore — fall through to default */ }
  // Default: open the group that contains the current route.
  const match = NAV.find(
    (n) =>
      Array.isArray(n.children) &&
      n.children.some((c) => pathname.startsWith(String(c.to).split("?")[0]))
  );
  return match ? { [match.id]: true } : {};
}

export default function Sidebar({ open, onClose, collapsed, onToggleCollapsed }) {
  const { pathname, search } = useLocation();
  const [openGroups, setOpenGroups] = useState(() => getInitialOpenGroups(pathname));

  useEffect(() => {
    try { localStorage.setItem(OPEN_KEY, JSON.stringify(openGroups)); } catch { /* ignore quota / private mode */ }
  }, [openGroups]);

  // Close mobile drawer on Esc
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") onClose?.(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const widthClass = collapsed
    ? "w-[var(--sidebar-w-collapsed)]"
    : "w-[var(--sidebar-w-expanded)]";

  function toggleGroup(id) {
    setOpenGroups((s) => ({ ...s, [id]: !s[id] }));
  }

  function isGroupActive(group) {
    if (!group.children) return false;
    return group.children.some((c) => {
      const path = String(c.to).split("?")[0];
      return pathname.startsWith(path);
    });
  }

  function isChildActive(child) {
    const [path, qs] = String(child.to).split("?");
    if (!pathname.startsWith(path)) return false;
    if (!qs) return true;
    // For ?tab=X children, match the active tab against current location.
    const u = new URLSearchParams(qs);
    const tab = u.get("tab");
    const currentTab = new URLSearchParams(search).get("tab");
    if (!tab) return true;
    return currentTab === tab;
  }

  const fullNav = useMemo(() => NAV, []);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 h-screen text-slate-100",
        "bg-pst-navy-900 border-r border-pst-navy-700/60",
        "transition-[width,transform] duration-200 ease-in-out",
        widthClass,
        "md:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
      )}
      aria-label="Primary"
    >
      {/* Brand */}
      <div
        className={cn(
          "flex h-[var(--topbar-h)] items-center border-b border-pst-navy-700/60",
          collapsed ? "justify-center px-2" : "justify-between px-4"
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            aria-hidden="true"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pst-orange text-white font-bold text-sm shadow-md"
          >
            PST
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="text-sm font-semibold leading-tight truncate">PST ERP</div>
              <div className="text-[11px] text-pst-navy-200 leading-tight truncate">
                Purestream Energy
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="md:hidden rounded-md px-2 py-1 text-xs border border-pst-navy-700 text-pst-navy-100 hover:bg-pst-navy-700"
        >
          ✕
        </button>
      </div>

      {/* Nav */}
      <nav
        className="overflow-y-auto px-2 py-3 max-h-[calc(100vh-var(--topbar-h)-3.5rem)]"
        aria-label="Main navigation"
      >
        {!collapsed && (
          <div className="mb-2 px-3 text-[10px] font-semibold tracking-[0.18em] uppercase text-pst-navy-300">
            Workspace
          </div>
        )}

        <ul className="space-y-1">
          {fullNav.map((item) => {
            const hasChildren = Array.isArray(item.children) && item.children.length > 0;
            const grpOpen = !!openGroups[item.id];
            const grpActive = isGroupActive(item);

            // Single-link section
            if (!hasChildren) {
              return (
                <li key={item.id}>
                  <NavLink
                    to={item.to}
                    end={item.to === "/dashboard"}
                    onClick={onClose}
                    title={collapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      cn(
                        "group relative flex items-center gap-3 rounded-lg text-sm font-medium transition-colors",
                        collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
                        isActive
                          ? "bg-pst-navy-700 text-white"
                          : "text-pst-navy-200 hover:bg-pst-navy-800 hover:text-white"
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span aria-hidden="true" className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-md bg-pst-orange" />
                        )}
                        <span className={cn(isActive ? "text-pst-orange" : "text-pst-navy-300 group-hover:text-pst-orange-soft", "transition-colors")}>
                          <Icon d={item.icon} />
                        </span>
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            }

            // Group with children
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => collapsed ? null : toggleGroup(item.id)}
                  title={collapsed ? item.label : undefined}
                  aria-expanded={grpOpen}
                  className={cn(
                    "group relative flex w-full items-center gap-3 rounded-lg text-sm font-medium transition-colors",
                    collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
                    grpActive
                      ? "bg-pst-navy-800 text-white"
                      : "text-pst-navy-200 hover:bg-pst-navy-800 hover:text-white"
                  )}
                >
                  {grpActive && (
                    <span aria-hidden="true" className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r-md bg-pst-orange" />
                  )}
                  <span className={cn(grpActive ? "text-pst-orange" : "text-pst-navy-300 group-hover:text-pst-orange-soft", "transition-colors")}>
                    <Icon d={item.icon} />
                  </span>
                  {!collapsed && (
                    <>
                      <span className="flex-1 truncate text-left">{item.label}</span>
                      <span aria-hidden="true" className={cn("transition-transform text-pst-navy-300", grpOpen ? "rotate-180" : "rotate-0")}>
                        <Icon d={ICONS.chevronDown} />
                      </span>
                    </>
                  )}
                </button>

                {/* Children — hidden when collapsed (icons-only mode) */}
                {!collapsed && (
                  <div
                    className={cn(
                      "grid overflow-hidden transition-[grid-template-rows] duration-200 ease-in-out",
                      grpOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                    )}
                  >
                    <ul className="min-h-0 mt-1 mb-1 space-y-0.5 pl-4">
                      {item.children.map((child) => {
                        const active = isChildActive(child);
                        return (
                          <li key={child.to}>
                            <NavLink
                              to={child.to}
                              onClick={onClose}
                              className={cn(
                                "group relative flex items-center gap-2 rounded-md px-3 py-1.5 text-[13px] transition-colors",
                                active
                                  ? "bg-pst-navy-700/70 text-white"
                                  : "text-pst-navy-300 hover:bg-pst-navy-800 hover:text-white"
                              )}
                            >
                              <span aria-hidden="true" className={cn(
                                "h-1.5 w-1.5 rounded-full transition-colors",
                                active ? "bg-pst-orange" : "bg-pst-navy-700 group-hover:bg-pst-orange-soft"
                              )} />
                              <span className="truncate">{child.label}</span>
                            </NavLink>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse / expand toggle (desktop only) */}
      <button
        type="button"
        onClick={onToggleCollapsed}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-20 hidden md:flex h-7 w-7 items-center justify-center rounded-full border border-pst-navy-700 bg-pst-navy-800 text-pst-navy-100 shadow-lg hover:bg-pst-navy-700 transition-colors"
      >
        <Icon d={collapsed ? ICONS.chevronRight : ICONS.chevronLeft} />
      </button>

      {/* Footer */}
      {!collapsed && (
        <div className="absolute bottom-0 left-0 right-0 border-t border-pst-navy-700/60 px-4 py-3 text-[11px] text-pst-navy-300">
          <div className="font-medium text-pst-navy-100">Purestream Energy FZE</div>
          <div>v1.0 · Industrial · Marine · Energy</div>
        </div>
      )}
    </aside>
  );
}
