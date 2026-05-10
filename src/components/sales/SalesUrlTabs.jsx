/**
 * Sales workspace tab labels ↔ URL ?tab= query slugs.
 * Presentation-free helpers — keep routing logic out of UI components.
 */

/** Ordered tab strip (must match Sales.jsx workspace). */
export const SALES_TAB_ORDER = [
  "Customer Master",
  "Quotation",
  "Order Acknowledgement",
  "Proforma Invoice",
  "Order Allocation",
  "RTS",
  "Sales Invoice",
  "Sales Dispatch",
  "Sales Return",
  "Reports",
];

const URL_SLUG_TO_TAB = {
  customer: "Customer Master",
  quotation: "Quotation",
  oa: "Order Acknowledgement",
  pi: "Proforma Invoice",
  allocation: "Order Allocation",
  rts: "RTS",
  invoice: "Sales Invoice",
  dispatch: "Sales Dispatch",
  return: "Sales Return",
  reports: "Reports",
};

const TAB_TO_URL_SLUG = Object.fromEntries(
  Object.entries(URL_SLUG_TO_TAB).map(([slug, label]) => [label, slug])
);

/** Short labels for narrow tab buttons. */
export function salesTabShortLabel(tab) {
  if (tab === "Order Acknowledgement") return "Order Ack.";
  if (tab === "Proforma Invoice") return "Proforma";
  return tab;
}

/**
 * @param {string|null|undefined} raw ?tab= value
 * @returns {string} Internal tab label from SALES_TAB_ORDER
 */
export function normalizeSalesTabParam(raw) {
  if (raw == null || String(raw).trim() === "") return "Quotation";
  const k = String(raw).toLowerCase().trim();
  if (URL_SLUG_TO_TAB[k]) return URL_SLUG_TO_TAB[k];
  if (SALES_TAB_ORDER.includes(raw)) return raw;
  return "Quotation";
}

/**
 * @param {string} tab Internal tab label
 * @returns {string} URL slug for ?tab=
 */
export function internalTabToUrlSlug(tab) {
  return TAB_TO_URL_SLUG[tab] || "quotation";
}
