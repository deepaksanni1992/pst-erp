import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost, apiPut } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { toast } from "../lib/toast.js";

import { PageHeader } from "../components/ui/page-header.jsx";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../components/ui/card.jsx";
import { Section } from "../components/ui/section.jsx";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs.jsx";
import { Input } from "../components/ui/input.jsx";
import { Label } from "../components/ui/label.jsx";
import { Textarea } from "../components/ui/textarea.jsx";
import { Select } from "../components/ui/select.jsx";
import { Button } from "../components/ui/button.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { EmptyState } from "../components/ui/empty-state.jsx";
import { Skeleton } from "../components/ui/skeleton.jsx";
import { Separator } from "../components/ui/separator.jsx";

const NS = "COMPANY";
const PRINT_KEY = "PRINT_BRANDING";

const DEFAULT_PRINT_BRANDING = {
  themeColor: "#0b1e3f",
  accentColor: "#f97316",
  pdfHeaderText: "Purestream Energy FZE",
  pdfFooterText: "© Purestream Energy FZE — Industrial · Marine · Energy",
  emailFooterText:
    "This is a system-generated email from PST ERP — Purestream Energy FZE. Please do not reply.",
  invoiceTerms: "Payment due within 30 days from invoice date.",
  signatureName: "",
  signatureTitle: "",
  bankIban: "",
  bankSwift: "",
};

function emptyBank() {
  return {
    label: "",
    accountName: "",
    accountNo: "",
    iban: "",
    swift: "",
    bankName: "",
    bankAddress: "",
    branch: "",
    currency: "USD",
    isPrimary: false,
  };
}

function buildFormState(current) {
  return {
    name: current.name || "",
    shortName: current.shortName || "",
    code: current.code || "",
    logoUrl: current.logoUrl || "",
    address: current.address || "",
    country: current.country || "United Arab Emirates",
    email: current.email || "",
    phone: current.phone || "",
    trnNo: current.trnNo || "",
    registrationNo: current.registrationNo || "",
    currency: current.currency || "USD",
    defaultCurrency: current.defaultCurrency || current.currency || "USD",
    timezone: current.timezone || "Asia/Dubai",
    bankDetails: Array.isArray(current.bankDetails) ? current.bankDetails : [],
    isActive: current.isActive !== false,
  };
}

/**
 * Inner form/branding editor — keyed by `current._id` from the parent so its
 * useState initializers run again whenever the active company changes,
 * removing the need for any "set-state-in-effect" pattern.
 */
function CompanyEditor({ current, initialBranding }) {
  const qc = useQueryClient();
  const [form, setForm] = useState(() => buildFormState(current));
  const [branding, setBranding] = useState(() => ({ ...DEFAULT_PRINT_BRANDING, ...initialBranding }));

  const saveCompany = useMutation({
    mutationFn: (payload) => apiPut(`/admin/companies/${current._id}`, payload),
    onSuccess: () => {
      toast.success("Company details saved");
      qc.invalidateQueries({ queryKey: ["companies-list-settings"] });
    },
    onError: (err) => toast.error(err?.message || "Failed to save company"),
  });

  const saveBranding = useMutation({
    mutationFn: (payload) =>
      apiPost("/admin/settings", { namespace: NS, key: PRINT_KEY, value: payload }),
    onSuccess: () => {
      toast.success("Branding saved");
      qc.invalidateQueries({ queryKey: ["company-print-branding"] });
    },
    onError: (err) => toast.error(err?.message || "Failed to save branding"),
  });

  function setField(k, v) { setForm((s) => ({ ...s, [k]: v })); }
  function setBrand(k, v) { setBranding((s) => ({ ...s, [k]: v })); }
  function setBank(idx, k, v) {
    setForm((s) => ({
      ...s,
      bankDetails: s.bankDetails.map((b, i) => (i === idx ? { ...b, [k]: v } : b)),
    }));
  }
  function addBank()    { setForm((s) => ({ ...s, bankDetails: [...s.bankDetails, emptyBank()] })); }
  function removeBank(i){ setForm((s) => ({ ...s, bankDetails: s.bankDetails.filter((_, idx) => idx !== i) })); }
  function setPrimary(i){
    setForm((s) => ({
      ...s,
      bankDetails: s.bankDetails.map((b, idx) => ({ ...b, isPrimary: idx === i })),
    }));
  }

  return (
    <Tabs defaultValue="profile">
      <TabsList>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="banking">Banking</TabsTrigger>
        <TabsTrigger value="branding">Branding & print</TabsTrigger>
      </TabsList>

      {/* PROFILE */}
      <TabsContent value="profile">
        <div className="grid gap-4 lg:grid-cols-3">
          <Section title="Identity" description="Legal entity and contact details displayed across the system." className="lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Legal name</Label>
                <Input value={form.name} onChange={(e) => setField("name", e.target.value)} />
              </div>
              <div>
                <Label>Short name</Label>
                <Input
                  value={form.shortName}
                  onChange={(e) => setField("shortName", e.target.value)}
                  placeholder="e.g. PST"
                />
              </div>
              <div>
                <Label>Code</Label>
                <Input value={form.code} onChange={(e) => setField("code", e.target.value)} />
              </div>
              <div>
                <Label>Country</Label>
                <Input value={form.country} onChange={(e) => setField("country", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label>Address</Label>
                <Textarea
                  rows={2}
                  value={form.address}
                  onChange={(e) => setField("address", e.target.value)}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
              </div>
              <div>
                <Label>TRN / Tax No.</Label>
                <Input value={form.trnNo} onChange={(e) => setField("trnNo", e.target.value)} />
              </div>
              <div>
                <Label>Registration No.</Label>
                <Input value={form.registrationNo} onChange={(e) => setField("registrationNo", e.target.value)} />
              </div>
              <div>
                <Label>Default currency</Label>
                <Select
                  value={form.defaultCurrency || form.currency}
                  onChange={(e) => {
                    setField("currency", e.target.value);
                    setField("defaultCurrency", e.target.value);
                  }}
                >
                  {["USD", "AED", "EUR", "GBP", "INR", "SAR", "OMR", "QAR", "KWD"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label>Timezone</Label>
                <Select value={form.timezone} onChange={(e) => setField("timezone", e.target.value)}>
                  {["Asia/Dubai", "Asia/Riyadh", "Asia/Kolkata", "Europe/London", "America/New_York", "UTC"].map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </Select>
              </div>
            </div>

            <Separator className="my-5" />
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setForm(buildFormState(current))}
              >
                Reset
              </Button>
              <Button
                size="sm"
                onClick={() => saveCompany.mutate(form)}
                disabled={saveCompany.isPending}
              >
                {saveCompany.isPending ? "Saving…" : "Save profile"}
              </Button>
            </div>
          </Section>

          <Section title="Logo" description="Used in the app shell, login screen, and PDF header.">
            <div className="space-y-3">
              <div className="rounded-xl border border-dashed border-pst-steel-300 bg-pst-steel-50 p-3 flex items-center justify-center min-h-[140px]">
                {form.logoUrl ? (
                  <img
                    src={form.logoUrl}
                    alt="Company logo"
                    className="max-h-32 max-w-full object-contain"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                ) : (
                  <span className="text-xs text-pst-steel-500">No logo set</span>
                )}
              </div>
              <div>
                <Label>Logo URL</Label>
                <Input
                  placeholder="/pst-logo.png  or  https://…"
                  value={form.logoUrl}
                  onChange={(e) => setField("logoUrl", e.target.value)}
                />
                <p className="mt-1 text-[11px] text-pst-steel-500">
                  Use an absolute URL or a static path (e.g. <code>/pst-logo.png</code>).
                </p>
              </div>
            </div>
          </Section>
        </div>
      </TabsContent>

      {/* BANKING */}
      <TabsContent value="banking">
        <Section
          title="Bank profiles"
          description="Multiple accounts allowed. Marked-primary profile appears as the default on PI / SI footers."
          actions={
            <Button size="sm" variant="outline" onClick={addBank}>
              + Add bank profile
            </Button>
          }
        >
          {form.bankDetails.length === 0 ? (
            <EmptyState
              title="No bank profiles"
              description="Add at least one for invoice and PI footers to populate."
              action={<Button size="sm" onClick={addBank}>Add bank profile</Button>}
            />
          ) : (
            <div className="space-y-4">
              {form.bankDetails.map((b, i) => (
                <Card key={i} className="overflow-visible">
                  <CardHeader className="flex flex-row items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CardTitle>{b.label || `Bank profile #${i + 1}`}</CardTitle>
                      {b.isPrimary ? <Badge tone="success">Primary</Badge> : null}
                    </div>
                    <div className="flex items-center gap-2">
                      {!b.isPrimary && (
                        <Button size="sm" variant="ghost" onClick={() => setPrimary(i)}>Make primary</Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => removeBank(i)}>Remove</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label>Label (e.g. USD operating)</Label>
                        <Input value={b.label} onChange={(e) => setBank(i, "label", e.target.value)} />
                      </div>
                      <div>
                        <Label>Currency</Label>
                        <Select value={b.currency || "USD"} onChange={(e) => setBank(i, "currency", e.target.value)}>
                          {["USD", "AED", "EUR", "GBP", "INR"].map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </Select>
                      </div>
                      <div>
                        <Label>Account name</Label>
                        <Input value={b.accountName} onChange={(e) => setBank(i, "accountName", e.target.value)} />
                      </div>
                      <div>
                        <Label>Account number</Label>
                        <Input value={b.accountNo} onChange={(e) => setBank(i, "accountNo", e.target.value)} />
                      </div>
                      <div>
                        <Label>IBAN</Label>
                        <Input value={b.iban} onChange={(e) => setBank(i, "iban", e.target.value)} />
                      </div>
                      <div>
                        <Label>SWIFT</Label>
                        <Input value={b.swift} onChange={(e) => setBank(i, "swift", e.target.value)} />
                      </div>
                      <div>
                        <Label>Bank name</Label>
                        <Input value={b.bankName} onChange={(e) => setBank(i, "bankName", e.target.value)} />
                      </div>
                      <div>
                        <Label>Branch</Label>
                        <Input value={b.branch} onChange={(e) => setBank(i, "branch", e.target.value)} />
                      </div>
                      <div className="sm:col-span-2">
                        <Label>Bank address</Label>
                        <Textarea rows={2} value={b.bankAddress} onChange={(e) => setBank(i, "bankAddress", e.target.value)} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <Separator className="my-5" />
          <div className="flex justify-end">
            <Button size="sm" onClick={() => saveCompany.mutate(form)} disabled={saveCompany.isPending}>
              {saveCompany.isPending ? "Saving…" : "Save banking"}
            </Button>
          </div>
        </Section>
      </TabsContent>

      {/* BRANDING */}
      <TabsContent value="branding">
        <div className="grid gap-4 lg:grid-cols-3">
          <Section title="Theme & colors" description="Used as accent in PDFs and email templates." className="lg:col-span-1">
            <div className="space-y-4">
              <div>
                <Label>Theme color (navy)</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="h-9 w-12 rounded-md border border-pst-steel-200"
                    value={branding.themeColor || "#0b1e3f"}
                    onChange={(e) => setBrand("themeColor", e.target.value)}
                  />
                  <Input value={branding.themeColor} onChange={(e) => setBrand("themeColor", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Accent color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    className="h-9 w-12 rounded-md border border-pst-steel-200"
                    value={branding.accentColor || "#f97316"}
                    onChange={(e) => setBrand("accentColor", e.target.value)}
                  />
                  <Input value={branding.accentColor} onChange={(e) => setBrand("accentColor", e.target.value)} />
                </div>
              </div>
            </div>
          </Section>

          <Section title="PDF & email" description="Header / footer text used by Sales Invoice, Quotation, OA and PI templates." className="lg:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label>PDF header text</Label>
                <Input value={branding.pdfHeaderText} onChange={(e) => setBrand("pdfHeaderText", e.target.value)} />
              </div>
              <div>
                <Label>Signature — name</Label>
                <Input value={branding.signatureName} onChange={(e) => setBrand("signatureName", e.target.value)} />
              </div>
              <div>
                <Label>Signature — title</Label>
                <Input value={branding.signatureTitle} onChange={(e) => setBrand("signatureTitle", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label>Invoice terms (default)</Label>
                <Textarea rows={2} value={branding.invoiceTerms} onChange={(e) => setBrand("invoiceTerms", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label>PDF footer text</Label>
                <Textarea rows={2} value={branding.pdfFooterText} onChange={(e) => setBrand("pdfFooterText", e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <Label>Email footer</Label>
                <Textarea rows={2} value={branding.emailFooterText} onChange={(e) => setBrand("emailFooterText", e.target.value)} />
              </div>
            </div>
            <Separator className="my-5" />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={() => saveBranding.mutate(branding)}
                disabled={saveBranding.isPending}
              >
                {saveBranding.isPending ? "Saving…" : "Save branding"}
              </Button>
            </div>
          </Section>
        </div>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>How dynamic settings flow</CardTitle>
            <CardDescription>
              These values are picked up automatically by every PDF and the app shell.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 text-[12.5px] text-pst-steel-700 sm:grid-cols-2">
              <li>• <b>Logo, address, email, phone, TRN</b> → Sales Invoice, Quotation, OA, PI shipper block.</li>
              <li>• <b>Bank profiles</b> → PI / SI footer (matched by currency).</li>
              <li>• <b>PDF header / footer text</b> → printed on every PDF page.</li>
              <li>• <b>Theme / accent colors</b> → page-footer stripe and brand title in PDFs.</li>
              <li>• <b>Signature & title</b> → Authorised signatory line on Sales Invoice / PI.</li>
              <li>• <b>Email footer</b> → outbound notifications and shared portal links.</li>
            </ul>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default function CompanySettings() {
  const { auth } = useAuth();
  const activeId = auth?.company?.id;

  const companies = useQuery({
    queryKey: ["companies-list-settings"],
    queryFn: () => apiGet("/admin/companies"),
  });

  const current = useMemo(() => {
    const list = companies.data?.items || companies.data || [];
    return list.find((c) => String(c._id) === String(activeId)) || list[0] || null;
  }, [companies.data, activeId]);

  /* Print/email branding kept in the generic Setting store under namespace=COMPANY */
  const printBranding = useQuery({
    queryKey: ["company-print-branding", activeId],
    queryFn: () => apiGet(`/admin/settings?namespace=${NS}`),
    enabled: Boolean(activeId),
  });
  const initialBranding = useMemo(() => {
    const items = printBranding.data?.items || [];
    const doc = items.find((i) => i.key === PRINT_KEY);
    return doc?.value || {};
  }, [printBranding.data]);

  if (companies.isLoading || printBranding.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Configuration" title="Company settings" description="Loading…" />
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="mt-3 h-4 w-2/3" />
            <Skeleton className="mt-6 h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!current) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="Configuration" title="Company settings" />
        <EmptyState
          title="No company yet"
          description="Run the seed script `npm run seed:company` from the backend folder to create Purestream Energy FZE."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Configuration"
        title="Company settings"
        description="Centralised branding, contact, banking and print settings. Used by all PDFs, emails, and the app shell."
        actions={
          <Badge tone="navy">
            Editing: {current.name} ({current.code})
          </Badge>
        }
      />

      {/* `key` resets the editor's local state cleanly when the user switches company */}
      <CompanyEditor
        key={current._id}
        current={current}
        initialBranding={initialBranding}
      />
    </div>
  );
}
