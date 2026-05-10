import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/AppLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { Skeleton } from "./components/ui/skeleton.jsx";

/* Eager — small entry pages */
import Login from "./pages/Login.jsx";
import CompanySelect from "./pages/CompanySelect.jsx";
import Dashboard from "./pages/Dashboard.jsx";

/* Lazy — heavy operational pages get their own chunks */
const ItemMaster           = lazy(() => import("./pages/ItemMaster.jsx"));
const ProcurementFoundation = lazy(() => import("./pages/ProcurementFoundation.jsx"));
const Sales                = lazy(() => import("./pages/Sales.jsx"));
const Inventory            = lazy(() => import("./pages/Inventory.jsx"));
const Store                = lazy(() => import("./pages/StoreModule.jsx"));
const Logistics            = lazy(() => import("./pages/Logistics.jsx"));
const Accounts             = lazy(() => import("./pages/Accounts.jsx"));
const BOMPage              = lazy(() => import("./pages/BOM.jsx"));
const Kitting              = lazy(() => import("./pages/Kitting.jsx"));
const DeKitting            = lazy(() => import("./pages/DeKitting.jsx"));
const Documents            = lazy(() => import("./pages/Documents.jsx"));
const AuditTrail           = lazy(() => import("./pages/AuditTrail.jsx"));
const Settings             = lazy(() => import("./pages/Settings.jsx"));
const Reports              = lazy(() => import("./pages/Reports.jsx"));
const CompanySettings      = lazy(() => import("./pages/CompanySettings.jsx"));

function PageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-7 w-1/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}

function Lazy({ children }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/select-company" element={<CompanySelect />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"        element={<Dashboard />} />

          <Route path="items"            element={<Lazy><ItemMaster /></Lazy>} />
          <Route path="purchase"         element={<Lazy><ProcurementFoundation /></Lazy>} />
          <Route path="sales"            element={<Lazy><Sales /></Lazy>} />
          <Route path="store"            element={<Lazy><Store /></Lazy>} />
          <Route path="inventory"        element={<Lazy><Inventory /></Lazy>} />
          <Route path="logistics"        element={<Lazy><Logistics /></Lazy>} />
          <Route path="accounts"         element={<Lazy><Accounts /></Lazy>} />
          <Route path="documents"        element={<Lazy><Documents /></Lazy>} />
          <Route path="bom"              element={<Lazy><BOMPage /></Lazy>} />
          <Route path="kitting"          element={<Lazy><Kitting /></Lazy>} />
          <Route path="dekitting"        element={<Lazy><DeKitting /></Lazy>} />
          <Route path="audit"            element={<Lazy><AuditTrail /></Lazy>} />
          <Route path="reports"          element={<Lazy><Reports /></Lazy>} />
          <Route path="settings"         element={<Lazy><Settings /></Lazy>} />
          <Route path="company-settings" element={<Lazy><CompanySettings /></Lazy>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
