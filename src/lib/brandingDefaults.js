/**
 * Branding fallback values for PST ERP — Purestream Energy FZE.
 *
 * Whenever a tenant company in the database has empty fields for address / phone / email / website,
 * report headers/footers fall back to these constants so PDFs still render with sensible content.
 *
 * If a future company has its own branded layout (e.g. legacy "Okeanos" branch), add another resolver
 * branch in `getReportBranding` below — do NOT add hardcoded company checks elsewhere in the codebase.
 */

export const PST_BRAND = Object.freeze({
  legalName: "Purestream Energy FZE",
  shortName: "PST",
  displayName: "PST",
  subtitle: "Industrial · Marine · Energy Solutions",
  logoPath: "/brand/pst-icon.png",
  iconPath: "/pst-logo.png",
  address: "Hamriyah Free Zone, Sharjah, UAE",
  email: "info@purestreamenergy.com",
  phone: "+971-000000000",
  website: "www.purestreamenergy.com",
  trnNo: "",
  shipperBlockHtml: `Purestream Energy FZE<br/>Hamriyah Free Zone<br/>Sharjah, U.A.E.<br/>Tel :- +971-000000000<br/>Email: <a href="mailto:info@purestreamenergy.com">info@purestreamenergy.com</a>`,
  defaultBeneficiaryLine:
    "PURESTREAM ENERGY FZE, Hamriyah Free Zone, Sharjah, U.A.E.",
});

/** Legacy Okeanos branding kept so any prior data still renders correctly. */
const OKEANOS_BRAND = Object.freeze({
  legalName: "Okeanos FZE",
  displayName: "OKEANOS",
  subtitle: "Marine Engine Spares",
  logoPath: "/brand/okeanos-logo.png",
  address: "C1 Building, Ajman Freezone, Ajman, UAE",
  email: "Sales@okeanos.pro",
  phone: "+971-543050000",
  website: "www.okfze.com",
});

function pickFirst(...values) {
  for (const v of values) {
    const s = String(v ?? "").trim();
    if (s) return s;
  }
  return "";
}

/**
 * Resolve the branding bundle for a print/PDF view based on the active company.
 * Result is shaped to match `orderAllocationPrint` / `Sales.jsx` consumers (branded PST/Okeanos layouts).
 *
 * @param {string} companyName  active company.name
 * @param {object} [company]    full company doc (logo/address/phone/email/website/trnNo)
 */
export function getReportBranding(companyName, company = {}) {
  const lower = String(companyName || "").toLowerCase();
  const isOkeanos = lower.includes("okeanos");
  const isPst =
    !isOkeanos &&
    (lower.includes("purestream") || lower.includes("pst") || true);
  // ^ default everything else to the PST branded layout — single-tenant deployment.

  const useBrandedLayout = isPst || isOkeanos;
  const printLogo = isPst
    ? PST_BRAND.logoPath
    : isOkeanos
      ? OKEANOS_BRAND.logoPath
      : "";

  const companyDisplayName = isPst
    ? PST_BRAND.displayName
    : isOkeanos
      ? OKEANOS_BRAND.displayName
      : pickFirst(company?.name, company?.companyName, "-");

  const companySubtitle = isPst
    ? PST_BRAND.subtitle
    : isOkeanos
      ? OKEANOS_BRAND.subtitle
      : "";

  const reportAddress = pickFirst(
    company?.address,
    isPst ? PST_BRAND.address : isOkeanos ? OKEANOS_BRAND.address : "",
  );
  const reportEmail = pickFirst(
    company?.email,
    isPst ? PST_BRAND.email : isOkeanos ? OKEANOS_BRAND.email : "",
  );
  const reportPhone = pickFirst(
    company?.phone,
    isPst ? PST_BRAND.phone : isOkeanos ? OKEANOS_BRAND.phone : "",
  );
  const reportWebsite = pickFirst(
    company?.website,
    isPst ? PST_BRAND.website : isOkeanos ? OKEANOS_BRAND.website : "",
  );
  const reportFooterName = isPst
    ? PST_BRAND.legalName
    : isOkeanos
      ? OKEANOS_BRAND.legalName
      : pickFirst(company?.name, company?.companyName, companyDisplayName);
  const reportFooterSubline = "";

  return {
    isPst,
    isOkeanos,
    useBrandedLayout,
    printLogo,
    companyDisplayName,
    companySubtitle,
    reportAddress,
    reportEmail,
    reportPhone,
    reportWebsite,
    reportFooterName,
    reportFooterSubline,
  };
}
