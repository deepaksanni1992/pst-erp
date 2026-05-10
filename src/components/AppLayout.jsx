import { useEffect, useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Topbar from "./Topbar.jsx";

const COLLAPSED_KEY = "pst_erp_sidebar_collapsed_v1";

const ROUTE_TITLES = {
  "/dashboard":       { eyebrow: "Overview",        title: "Dashboard" },
  "/sales":           { eyebrow: "Operations",      title: "Sales" },
  "/purchase":        { eyebrow: "Operations",      title: "Purchase" },
  "/inventory":       { eyebrow: "Operations",      title: "Inventory" },
  "/store":           { eyebrow: "Operations",      title: "Store & GRN" },
  "/logistics":       { eyebrow: "Operations",      title: "Logistics & Shipments" },
  "/accounts":        { eyebrow: "Finance",         title: "Accounts" },
  "/reports":         { eyebrow: "Insights",        title: "Reports" },
  "/items":           { eyebrow: "Master Data",     title: "Item Master" },
  "/bom":             { eyebrow: "Master Data",     title: "Bill of Materials" },
  "/kitting":         { eyebrow: "Master Data",     title: "Kitting" },
  "/dekitting":       { eyebrow: "Master Data",     title: "De-Kitting" },
  "/audit":           { eyebrow: "Administration",  title: "Audit Trail" },
  "/documents":       { eyebrow: "Administration",  title: "Documents" },
  "/settings":        { eyebrow: "Configuration",   title: "System Settings" },
  "/company-settings":{ eyebrow: "Configuration",   title: "Company Settings" },
};

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSED_KEY) === "1";
    } catch { return false; }
  });
  const { pathname } = useLocation();

  useEffect(() => {
    try { localStorage.setItem(COLLAPSED_KEY, collapsed ? "1" : "0"); } catch { /* ignore quota / private mode */ }
  }, [collapsed]);

  const route = useMemo(() => {
    const exact = ROUTE_TITLES[pathname];
    if (exact) return exact;
    const match = Object.entries(ROUTE_TITLES).find(([k]) => pathname.startsWith(k) && k !== "/");
    return match ? match[1] : { eyebrow: "PST ERP", title: "" };
  }, [pathname]);

  // Keep document.title synced — premium product feel.
  useEffect(() => {
    document.title = route.title
      ? `${route.title} · PST ERP`
      : "PST ERP — Purestream Energy";
  }, [route.title]);

  return (
    <div className="min-h-screen bg-pst-steel-50 text-slate-900">
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-pst-navy-900/55 backdrop-blur-[2px] md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((v) => !v)}
      />

      <div
        className={[
          "flex min-h-screen flex-1 flex-col transition-[margin] duration-200 ease-in-out",
          collapsed
            ? "md:ml-[var(--sidebar-w-collapsed)]"
            : "md:ml-[var(--sidebar-w-expanded)]",
        ].join(" ")}
      >
        <Topbar onMenuClick={() => setSidebarOpen((v) => !v)} />

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px] pst-fade-in">
            <Outlet />
          </div>
        </main>

        <footer className="border-t border-pst-steel-200 bg-white px-6 py-3 text-[11px] text-pst-steel-500">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between">
            <span>© {new Date().getFullYear()} Purestream Energy FZE — PST ERP</span>
            <span className="hidden sm:inline">Industrial · Marine · Energy</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
