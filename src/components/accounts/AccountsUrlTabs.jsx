/**
 * Accounts workspace tab ids ↔ URL ?tab= slugs (modern readable + legacy short ids).
 * No data fetching — routing helpers only.
 */

export const ACCOUNTS_TAB_IDS = [
  "overview",
  "ar",
  "ap",
  "cust",
  "statement",
  "supp",
  "payrcpt",
  "payv",
  "si",
  "pi",
  "cash",
  "journal",
  "outstanding",
  "aging",
  "alloc",
  "reports",
  "sd",
  "bank",
];

/** Modern / readable aliases → internal tab id */
const SLUG_TO_TAB = {
  overview: "overview",
  "customer-ledger": "cust",
  "supplier-ledger": "supp",
  receipts: "payrcpt",
  "payment-receipts": "payrcpt",
  outstanding: "outstanding",
  aging: "aging",
  "sales-invoices": "si",
  "purchase-invoices": "pi",
  "cash-bank": "cash",
  "journal-entries": "journal",
  "bank-details": "bank",
  "sales-dispatches": "sd",
  "customer-statement": "statement",
  "supplier-payments": "payv",
  allocation: "alloc",
  reconciliation: "alloc",
  "ar-dashboard": "ar",
  "ap-dashboard": "ap",
};

/** Preferred slug written to URL for each internal id (backward-compatible bookmarks keep working). */
const TAB_TO_SLUG = {
  overview: "overview",
  ar: "ar",
  ap: "ap",
  cust: "customer-ledger",
  statement: "statement",
  supp: "supplier-ledger",
  payrcpt: "receipts",
  payv: "payv",
  si: "si",
  pi: "pi",
  cash: "cash",
  journal: "journal",
  outstanding: "outstanding",
  aging: "aging",
  alloc: "alloc",
  reports: "reports",
  sd: "sd",
  bank: "bank",
};

/**
 * @param {string|null|undefined} raw ?tab= query value
 * @returns {string} Internal tab id (default **si** — matches historic default)
 */
export function normalizeAccountsTabParam(raw) {
  if (raw == null || String(raw).trim() === "") return "si";
  const k = String(raw).toLowerCase().trim();
  if (SLUG_TO_TAB[k]) return SLUG_TO_TAB[k];
  if (ACCOUNTS_TAB_IDS.includes(k)) return k;
  return "si";
}

/**
 * @param {string} tabId Internal tab id
 * @returns {string} URL slug for ?tab=
 */
export function internalAccountsTabToSlug(tabId) {
  return TAB_TO_SLUG[tabId] || tabId;
}
