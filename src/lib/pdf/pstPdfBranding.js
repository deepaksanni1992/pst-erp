/**
 * PST ERP — premium PDF / print HTML helpers.
 *
 * These helpers emit small reusable HTML chunks that any print template
 * (Quotation, OA, PI, Sales Invoice, PO, Packing List, GRN) can drop in
 * to get a consistent header / footer with:
 *   • two-line brand strip (navy + orange)
 *   • dynamic company logo, address, phone, email, TRN
 *   • document title, document number, date, optional QR placeholder
 *   • signature & stamp boxes + bank details + page footer
 *
 * Inputs are deliberately permissive:
 *   - `company` may come from the active Company doc OR from
 *     `getReportBranding()` (lib/brandingDefaults.js).
 *   - `branding` is the optional COMPANY.PRINT_BRANDING setting saved
 *     from the Company Settings page (theme color, footer, signature).
 */

const FALLBACK = {
  themeColor:  "#0b1e3f",
  accentColor: "#f97316",
  steelColor:  "#94a3b8",
  hairlineColor: "#e2e8f0",
  brandName:   "Purestream Energy FZE",
  brandSubtitle: "Industrial · Marine · Energy",
  pdfFooter:   "© Purestream Energy FZE — PST ERP. Generated digitally; no signature required.",
};

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pickColors(branding) {
  return {
    theme:    branding?.themeColor || FALLBACK.themeColor,
    accent:   branding?.accentColor || FALLBACK.accentColor,
    steel:    FALLBACK.steelColor,
    hairline: FALLBACK.hairlineColor,
  };
}

/* ────────────────────────────────────────────────────────────────
 * CSS — paste this once at the top of your print HTML.
 * ──────────────────────────────────────────────────────────────── */
export function pstPrintCss(branding) {
  const c = pickColors(branding);
  return `
    .pst-pdf {
      font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
      color: #0f172a;
      font-size: 11.5px;
      line-height: 1.45;
    }
    .pst-pdf-header {
      position: relative;
      padding: 20px 28px 16px;
      background: #ffffff;
      border-bottom: 1.5px solid ${c.theme};
    }
    .pst-pdf-header::after {
      content: "";
      position: absolute; left: 28px; right: 28px; bottom: 6px;
      height: 2px;
      background: linear-gradient(90deg, ${c.theme} 0%, ${c.theme} 70%, ${c.accent} 100%);
      border-radius: 2px;
    }
    .pst-pdf-headtop {
      display: flex; gap: 16px; align-items: flex-start; justify-content: space-between;
    }
    .pst-pdf-brand {
      display: flex; gap: 14px; align-items: center;
    }
    .pst-pdf-brand img {
      max-height: 56px; max-width: 200px; object-fit: contain;
    }
    .pst-pdf-brand .pst-brand-fallback {
      width: 56px; height: 56px; border-radius: 12px;
      background: ${c.accent}; color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-weight: 700; font-size: 16px; letter-spacing: 0.04em;
    }
    .pst-pdf-brand-meta { line-height: 1.25; }
    .pst-pdf-brand-name { font-size: 16px; font-weight: 700; color: ${c.theme}; }
    .pst-pdf-brand-sub  { font-size: 10px; color: ${c.steel}; letter-spacing: 0.06em; text-transform: uppercase; }

    .pst-pdf-doc {
      text-align: right; min-width: 220px;
    }
    .pst-pdf-doc-title {
      font-size: 18px; font-weight: 700; color: ${c.theme}; letter-spacing: 0.02em;
    }
    .pst-pdf-doc-meta { font-size: 11px; color: #475569; margin-top: 2px; }
    .pst-pdf-doc-meta b { color: #0f172a; }

    .pst-pdf-contact {
      margin-top: 12px; font-size: 10.5px; color: #475569;
      display: flex; gap: 18px; flex-wrap: wrap;
    }
    .pst-pdf-contact b { color: #0f172a; font-weight: 600; }

    /* Body */
    .pst-pdf-body { padding: 18px 28px; }
    .pst-section { margin-top: 14px; }
    .pst-section-title {
      font-size: 11px; font-weight: 700; color: ${c.theme};
      letter-spacing: 0.10em; text-transform: uppercase; margin-bottom: 6px;
      padding-bottom: 4px; border-bottom: 1px solid ${c.hairline};
    }

    /* Tables */
    .pst-table { width: 100%; border-collapse: collapse; }
    .pst-table th, .pst-table td { padding: 8px 10px; vertical-align: top; }
    .pst-table thead th {
      background: ${c.theme}; color: #fff;
      font-size: 10px; letter-spacing: 0.10em; text-transform: uppercase;
      text-align: left;
    }
    .pst-table tbody td { border-bottom: 1px solid ${c.hairline}; font-size: 11px; }
    .pst-table tbody tr:nth-child(even) td { background: #f8fafc; }

    /* Footer area */
    .pst-pdf-foot {
      padding: 12px 28px 18px; border-top: 1px solid ${c.hairline};
      color: #475569; font-size: 10px;
    }
    .pst-pdf-foot-cols {
      display: grid; grid-template-columns: 1fr 1fr; gap: 24px;
    }
    .pst-pdf-foot-bank b { color: #0f172a; font-weight: 600; }
    .pst-pdf-foot-sig {
      display: grid; grid-template-columns: 1fr 1fr; gap: 16px; align-items: end;
    }
    .pst-pdf-foot-sig-box {
      border-top: 1px solid #94a3b8; padding-top: 6px; min-height: 64px;
      font-size: 10px; color: #475569;
    }
    .pst-pdf-foot-stamp-box {
      border: 1px dashed #cbd5e1; border-radius: 8px; min-height: 64px;
      display: flex; align-items: center; justify-content: center;
      color: ${c.steel}; font-size: 10px; letter-spacing: 0.10em; text-transform: uppercase;
    }

    .pst-pdf-pagefoot {
      margin-top: 8px; padding-top: 8px;
      border-top: 1px solid ${c.hairline};
      display: flex; justify-content: space-between;
      font-size: 9.5px; color: ${c.steel}; letter-spacing: 0.04em;
    }

    /* QR placeholder — actual QR can be drawn at runtime by the consumer */
    .pst-qr-box {
      width: 60px; height: 60px;
      border: 1px solid ${c.hairline}; border-radius: 6px;
      background:
        repeating-conic-gradient(${c.theme} 0% 25%, #ffffff 0% 50%) 0 / 12px 12px;
      opacity: 0.65;
    }
  `;
}

/* ────────────────────────────────────────────────────────────────
 * <header> — premium PDF header
 * ──────────────────────────────────────────────────────────────── */
export function pstPdfHeader({
  company,                 // { name, shortName, logoUrl, address, phone, email, trnNo, currency }
  branding,                // optional PRINT_BRANDING setting value
  documentTitle = "DOCUMENT",
  documentNo    = "",
  documentDate  = "",
  rightExtraHtml = "",
  showQrPlaceholder = false,
}) {
  // Colors are applied via the shared CSS (pstPrintCss). No need to inline them here.
  const shortLetters = (company?.shortName ||
    String(company?.name || FALLBACK.brandName).split(/\s+/).slice(0, 2).map((w) => w[0]).join("")).toUpperCase();

  const logo = company?.logoUrl
    ? `<img src="${escapeHtml(company.logoUrl)}" alt="logo" />`
    : `<span class="pst-brand-fallback">${escapeHtml(shortLetters || "PST")}</span>`;

  const brandName    = escapeHtml(company?.name || branding?.pdfHeaderText || FALLBACK.brandName);
  const brandSubtitle = escapeHtml(branding?.subtitle || FALLBACK.brandSubtitle);

  const addressLine = escapeHtml(company?.address || "");
  const phoneLine   = escapeHtml(company?.phone || "");
  const emailLine   = escapeHtml(company?.email || "");
  const trnLine     = company?.trnNo ? `TRN: <b>${escapeHtml(company.trnNo)}</b>` : "";

  const docDateHtml = documentDate
    ? `<div class="pst-pdf-doc-meta">Date: <b>${escapeHtml(documentDate)}</b></div>` : "";
  const docNoHtml = documentNo
    ? `<div class="pst-pdf-doc-meta">Document No: <b>${escapeHtml(documentNo)}</b></div>` : "";

  const qrHtml = showQrPlaceholder
    ? `<div style="margin-top:10px; display:flex; justify-content:flex-end;"><div class="pst-qr-box" aria-hidden="true"></div></div>`
    : "";

  return `
    <div class="pst-pdf-header">
      <div class="pst-pdf-headtop">
        <div class="pst-pdf-brand">
          ${logo}
          <div class="pst-pdf-brand-meta">
            <div class="pst-pdf-brand-name">${brandName}</div>
            <div class="pst-pdf-brand-sub">${brandSubtitle}</div>
          </div>
        </div>
        <div class="pst-pdf-doc">
          <div class="pst-pdf-doc-title">${escapeHtml(documentTitle)}</div>
          ${docNoHtml}
          ${docDateHtml}
          ${rightExtraHtml || ""}
          ${qrHtml}
        </div>
      </div>
      <div class="pst-pdf-contact">
        ${addressLine ? `<div><b>Address:</b> ${addressLine}</div>` : ""}
        ${phoneLine ? `<div><b>Phone:</b> ${phoneLine}</div>` : ""}
        ${emailLine ? `<div><b>Email:</b> ${emailLine}</div>` : ""}
        ${trnLine ? `<div>${trnLine}</div>` : ""}
      </div>
    </div>
  `;
}

/* ────────────────────────────────────────────────────────────────
 * <footer> — bank details + signature/stamp + page footer
 * ──────────────────────────────────────────────────────────────── */
export function pstPdfFooter({
  company,
  branding,
  bankCurrency = "USD",   // pick the matching bank profile
  showBank = true,
  showSignature = true,
  notes = "",
}) {
  const bankList = Array.isArray(company?.bankDetails) ? company.bankDetails : [];
  const matched =
    bankList.find((b) => String(b.currency || "").toUpperCase() === String(bankCurrency).toUpperCase() && b.isPrimary) ||
    bankList.find((b) => String(b.currency || "").toUpperCase() === String(bankCurrency).toUpperCase()) ||
    bankList.find((b) => b.isPrimary) ||
    bankList[0] ||
    null;

  const bankHtml = showBank && matched
    ? `<div class="pst-pdf-foot-bank">
        <div class="pst-section-title" style="margin-bottom:4px">Bank details — ${escapeHtml(matched.currency || bankCurrency)}</div>
        ${matched.accountName ? `<div><b>Account:</b> ${escapeHtml(matched.accountName)}</div>` : ""}
        ${matched.accountNo ? `<div><b>Account No:</b> ${escapeHtml(matched.accountNo)}</div>` : ""}
        ${matched.iban ? `<div><b>IBAN:</b> ${escapeHtml(matched.iban)}</div>` : ""}
        ${matched.swift ? `<div><b>SWIFT:</b> ${escapeHtml(matched.swift)}</div>` : ""}
        ${matched.bankName ? `<div><b>Bank:</b> ${escapeHtml(matched.bankName)}</div>` : ""}
        ${matched.bankAddress ? `<div>${escapeHtml(matched.bankAddress)}</div>` : ""}
      </div>`
    : showBank
      ? `<div class="pst-pdf-foot-bank"><div class="pst-section-title" style="margin-bottom:4px">Bank details</div><div style="color:#94a3b8">No bank profile configured.</div></div>`
      : "";

  const signatureHtml = showSignature
    ? `<div class="pst-pdf-foot-sig">
        <div class="pst-pdf-foot-sig-box">
          Authorised signature<br/>
          <b>${escapeHtml(branding?.signatureName || company?.name || "")}</b><br/>
          <span style="color:#94a3b8">${escapeHtml(branding?.signatureTitle || "")}</span>
        </div>
        <div class="pst-pdf-foot-stamp-box">Company stamp</div>
      </div>`
    : "";

  const notesHtml = notes
    ? `<div style="margin-top:10px"><b>Notes:</b> ${escapeHtml(notes)}</div>`
    : "";

  const pageFooter = escapeHtml(branding?.pdfFooterText || FALLBACK.pdfFooter);

  return `
    <div class="pst-pdf-foot">
      <div class="pst-pdf-foot-cols">
        ${bankHtml}
        ${signatureHtml}
      </div>
      ${notesHtml}
      <div class="pst-pdf-pagefoot">
        <span>${pageFooter}</span>
        <span>Generated · ${new Date().toLocaleString()}</span>
      </div>
    </div>
  `;
}

/* Convenience: a complete <html><head><style>…</style></head><body>…</body></html>
 * wrapper that consumers can just pipe to a window.open / iframe / printer. */
export function pstPdfDocument({
  title = "PST ERP — Document",
  bodyHtml,
  branding,
}) {
  const css = pstPrintCss(branding);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    @page { size: A4; margin: 14mm; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body { background: #fff; }
    ${css}
  </style>
</head>
<body class="pst-pdf">
  ${bodyHtml || ""}
</body>
</html>`;
}
