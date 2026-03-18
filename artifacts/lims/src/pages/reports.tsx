import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useListReports, useCreateReport, getListReportsQueryKey, type Report } from "@workspace/api-client-react";
import { Card, Button, Input, Table, Thead, Tbody, Tr, Th, Td, Badge, Dialog } from "@/components/ui";
import { FileText, Plus, Eye, Printer, Trash2, X } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface TestResultRow {
  parameter: string;
  result: string;
  unit: string;
  referenceRange: string;
}

interface PatientReportData {
  patientName: string;
  patientId: string;
  ageGender: string;
  contact: string;
  address: string;
  sampleId: string;
  sampleType: string;
  collectionDateTime: string;
  collectedBy: string;
  storageLocation: string;
  testName: string;
  testMethod: string;
  performedOn: string;
  labTechnician: string;
  testResults: TestResultRow[];
  interpretation: string;
  observations: string;
  doctorName: string;
  reportDate: string;
}

const defaultRow: TestResultRow = { parameter: "", result: "", unit: "", referenceRange: "" };

const defaultCbcRows: TestResultRow[] = [
  { parameter: "Hemoglobin", result: "", unit: "g/dL", referenceRange: "13–17" },
  { parameter: "WBC Count", result: "", unit: "/µL", referenceRange: "4,000–11,000" },
  { parameter: "Platelets", result: "", unit: "/µL", referenceRange: "150k–450k" },
  { parameter: "", result: "", unit: "", referenceRange: "" },
  { parameter: "", result: "", unit: "", referenceRange: "" },
];

function PrintableReport({ data, title, createdAt }: { data: PatientReportData; title: string; createdAt: string }) {
  return (
    <div className="report-print-root bg-white text-gray-900 font-sans p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-2xl font-bold tracking-wide uppercase text-gray-900">Patient Laboratory Report</h1>
        <p className="text-sm text-gray-500 mt-1">Generated via Laboratory Information System</p>
        <p className="text-xs text-gray-400 mt-0.5">Report Date: {data.reportDate || formatDate(createdAt)}</p>
      </div>

      {/* Patient Information */}
      <Section title="🧑 Patient Information">
        <Grid2>
          <Field label="Patient Name" value={data.patientName} />
          <Field label="Patient ID" value={data.patientId} />
          <Field label="Age / Gender" value={data.ageGender} />
          <Field label="Contact" value={data.contact} />
        </Grid2>
        <Field label="Address" value={data.address} />
      </Section>

      {/* Sample Information */}
      <Section title="🏥 Sample Information">
        <Grid2>
          <Field label="Sample ID" value={data.sampleId} />
          <Field label="Sample Type" value={data.sampleType} />
          <Field label="Collection Date & Time" value={data.collectionDateTime} />
          <Field label="Collected By" value={data.collectedBy} />
        </Grid2>
        <Field label="Storage Location" value={data.storageLocation} />
      </Section>

      {/* Test Details */}
      <Section title="🔬 Test Details">
        <Grid2>
          <Field label="Test Name" value={data.testName} />
          <Field label="Test Method" value={data.testMethod} />
          <Field label="Performed On" value={data.performedOn} />
          <Field label="Lab Technician" value={data.labTechnician} />
        </Grid2>
      </Section>

      {/* Test Results */}
      <Section title="📊 Test Results">
        <table className="w-full border-collapse text-sm mt-2">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Parameter</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Result</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Unit</th>
              <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Reference Range</th>
            </tr>
          </thead>
          <tbody>
            {data.testResults.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="border border-gray-300 px-3 py-2">{row.parameter}</td>
                <td className="border border-gray-300 px-3 py-2 font-medium">{row.result}</td>
                <td className="border border-gray-300 px-3 py-2 text-gray-600">{row.unit}</td>
                <td className="border border-gray-300 px-3 py-2 text-gray-600">{row.referenceRange}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      {/* Interpretation */}
      <Section title="🧠 Interpretation / Remarks">
        <div className="min-h-[80px] border border-gray-300 rounded p-3 text-sm whitespace-pre-wrap">
          {data.interpretation || <span className="text-gray-400">—</span>}
        </div>
      </Section>

      {/* Observations */}
      <Section title="⚠️ Observations">
        <p className="text-xs text-gray-600 mb-1 font-medium">Any abnormalities detected:</p>
        <div className="min-h-[64px] border border-gray-300 rounded p-3 text-sm whitespace-pre-wrap">
          {data.observations || <span className="text-gray-400">None</span>}
        </div>
      </Section>

      {/* Doctor Authorization */}
      <Section title="👨‍⚕️ Doctor / Lab Authorization">
        <Grid2>
          <Field label="Doctor Name" value={data.doctorName} />
          <Field label="Date" value={data.reportDate} />
        </Grid2>
        <div className="mt-4 pt-8 border-t border-dashed border-gray-300">
          <p className="text-xs text-gray-500">Signature: ___________________________________</p>
        </div>
      </Section>

      {/* System Notes */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-400 space-y-0.5">
        <p>🔐 Report generated via Laboratory Information System</p>
        <p>🔐 Sample tracking and audit logs maintained</p>
        <p>🔐 Report Title: {title}</p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="text-sm font-bold uppercase tracking-widest text-gray-700 bg-gray-100 px-3 py-1.5 rounded mb-3 border-l-4 border-gray-400">{title}</h2>
      <div className="px-1 space-y-2">{children}</div>
    </div>
  );
}

function Grid2({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-x-6 gap-y-2">{children}</div>;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-xs text-gray-500 font-medium">{label}: </span>
      <span className="text-sm font-medium text-gray-900">{value || <span className="text-gray-300">—</span>}</span>
    </div>
  );
}

function ReportViewer({ report, onClose }: { report: Report; onClose: () => void }) {
  let data: PatientReportData | null = null;
  try { data = JSON.parse(report.content || "{}"); } catch {}

  const handlePrint = () => {
    const printContents = document.getElementById("report-print-area")?.innerHTML;
    const win = window.open("", "_blank");
    if (!win || !printContents) return;
    win.document.write(`
      <html><head><title>${report.title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ccc; padding: 8px 12px; }
        th { background: #f3f4f6; font-weight: 600; }
        tr:nth-child(even) td { background: #f9fafb; }
        .grid-cols-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 24px; }
        h1 { font-size: 1.4rem; font-weight: bold; text-align: center; }
        h2 { font-size: 0.75rem; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; background: #f3f4f6; padding: 6px 12px; border-left: 4px solid #9ca3af; margin-bottom: 12px; }
        .min-h-\\[80px\\], .min-h-\\[64px\\] { min-height: 64px; border: 1px solid #ccc; border-radius: 4px; padding: 8px; white-space: pre-wrap; }
        .text-xs { font-size: 0.75rem; } .text-sm { font-size: 0.875rem; }
        .text-gray-400 { color: #9ca3af; } .text-gray-500 { color: #6b7280; } .text-gray-600 { color: #4b5563; }
        .border-t { border-top: 1px solid #e5e7eb; } .border-b-2 { border-bottom: 2px solid #1f2937; }
        .mb-6 { margin-bottom: 1.5rem; } .mb-5 { margin-bottom: 1.25rem; } .mb-3 { margin-bottom: 0.75rem; }
        .mt-6 { margin-top: 1.5rem; } .mt-4 { margin-top: 1rem; } .pt-8 { padding-top: 2rem; }
        .text-center { text-align: center; } .pb-4 { padding-bottom: 1rem; }
        .uppercase { text-transform: uppercase; }
        @media print { body { -webkit-print-color-adjust: exact; } }
      </style>
      </head><body>${printContents}</body></html>
    `);
    win.document.close();
    win.print();
  };

  if (!data) {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="bg-card border border-white/10 rounded-xl p-8 text-center">
          <p className="text-muted-foreground">Could not parse report data.</p>
          <Button className="mt-4" onClick={onClose}>Close</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      <div className="flex items-center justify-between px-6 py-3 bg-card border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-primary" />
          <span className="font-medium text-white">{report.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" /> Print / Export PDF
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-6">
        <div id="report-print-area">
          <PrintableReport data={data} title={report.title} createdAt={report.createdAt} />
        </div>
      </div>
    </div>
  );
}

function ReportForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const { mutateAsync: createReport } = useCreateReport();
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<TestResultRow[]>(defaultCbcRows);
  const [form, setForm] = useState<PatientReportData>({
    patientName: "", patientId: "", ageGender: "", contact: "", address: "",
    sampleId: "", sampleType: "", collectionDateTime: "", collectedBy: "", storageLocation: "",
    testName: "", testMethod: "", performedOn: new Date().toISOString().split("T")[0], labTechnician: "",
    testResults: [],
    interpretation: "", observations: "",
    doctorName: "", reportDate: new Date().toISOString().split("T")[0],
  });

  const set = (field: keyof PatientReportData, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const updateRow = (i: number, field: keyof TestResultRow, value: string) => {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  };

  const addRow = () => setRows(prev => [...prev, { ...defaultRow }]);
  const removeRow = (i: number) => setRows(prev => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!form.patientName) { toast.error("Patient name is required"); return; }
    setSaving(true);
    try {
      const payload: PatientReportData = { ...form, testResults: rows };
      await createReport({
        data: {
          reportType: "test_results",
          title: `Lab Report – ${form.patientName}${form.testName ? ` (${form.testName})` : ""}`,
          content: JSON.stringify(payload),
          sampleId: form.sampleId ? parseInt(form.sampleId) || undefined : undefined,
        }
      });
      toast.success("Patient report saved successfully");
      onSaved();
    } catch {
      toast.error("Failed to save report");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 bg-card border-b border-white/10 flex-shrink-0">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" /> New Patient Laboratory Report
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Report"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto py-6">
        <div className="max-w-3xl mx-auto space-y-6 px-4">

          {/* Patient Information */}
          <FormSection title="🧑 Patient Information">
            <FormGrid>
              <LabeledInput label="Patient Name *" value={form.patientName} onChange={v => set("patientName", v)} placeholder="Full name" />
              <LabeledInput label="Patient ID" value={form.patientId} onChange={v => set("patientId", v)} placeholder="e.g. PAT-00123" />
              <LabeledInput label="Age / Gender" value={form.ageGender} onChange={v => set("ageGender", v)} placeholder="e.g. 34 / Male" />
              <LabeledInput label="Contact" value={form.contact} onChange={v => set("contact", v)} placeholder="Phone or email" />
            </FormGrid>
            <LabeledInput label="Address" value={form.address} onChange={v => set("address", v)} placeholder="Full address" />
          </FormSection>

          {/* Sample Information */}
          <FormSection title="🏥 Sample Information">
            <FormGrid>
              <LabeledInput label="Sample ID" value={form.sampleId} onChange={v => set("sampleId", v)} placeholder="e.g. SAMPLE-00001" />
              <LabeledInput label="Sample Type" value={form.sampleType} onChange={v => set("sampleType", v)} placeholder="e.g. Blood, Urine, Tissue" />
              <LabeledInput label="Collection Date & Time" value={form.collectionDateTime} onChange={v => set("collectionDateTime", v)} type="datetime-local" />
              <LabeledInput label="Collected By" value={form.collectedBy} onChange={v => set("collectedBy", v)} placeholder="Phlebotomist / Technician name" />
            </FormGrid>
            <LabeledInput label="Storage Location" value={form.storageLocation} onChange={v => set("storageLocation", v)} placeholder="e.g. Freezer A, Rack 2, Slot 5" />
          </FormSection>

          {/* Test Details */}
          <FormSection title="🔬 Test Details">
            <FormGrid>
              <LabeledInput label="Test Name" value={form.testName} onChange={v => set("testName", v)} placeholder="e.g. Complete Blood Count" />
              <LabeledInput label="Test Method" value={form.testMethod} onChange={v => set("testMethod", v)} placeholder="e.g. Automated Hematology Analyzer" />
              <LabeledInput label="Performed On" value={form.performedOn} onChange={v => set("performedOn", v)} type="date" />
              <LabeledInput label="Lab Technician" value={form.labTechnician} onChange={v => set("labTechnician", v)} placeholder="Technician name" />
            </FormGrid>
          </FormSection>

          {/* Test Results */}
          <FormSection title="📊 Test Results">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left text-xs text-muted-foreground font-medium pb-2 pr-2">Parameter</th>
                    <th className="text-left text-xs text-muted-foreground font-medium pb-2 pr-2">Result</th>
                    <th className="text-left text-xs text-muted-foreground font-medium pb-2 pr-2">Unit</th>
                    <th className="text-left text-xs text-muted-foreground font-medium pb-2 pr-2">Reference Range</th>
                    <th className="w-8" />
                  </tr>
                </thead>
                <tbody className="space-y-1">
                  {rows.map((row, i) => (
                    <tr key={i}>
                      <td className="pr-2 pb-2">
                        <Input value={row.parameter} onChange={e => updateRow(i, "parameter", e.target.value)} placeholder="e.g. Hemoglobin" className="h-9 text-sm" />
                      </td>
                      <td className="pr-2 pb-2">
                        <Input value={row.result} onChange={e => updateRow(i, "result", e.target.value)} placeholder="Value" className="h-9 text-sm" />
                      </td>
                      <td className="pr-2 pb-2">
                        <Input value={row.unit} onChange={e => updateRow(i, "unit", e.target.value)} placeholder="g/dL" className="h-9 text-sm" />
                      </td>
                      <td className="pr-2 pb-2">
                        <Input value={row.referenceRange} onChange={e => updateRow(i, "referenceRange", e.target.value)} placeholder="e.g. 13–17" className="h-9 text-sm" />
                      </td>
                      <td className="pb-2">
                        <button onClick={() => removeRow(i)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                          <X className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button variant="outline" size="sm" onClick={addRow} className="mt-2">
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Row
            </Button>
          </FormSection>

          {/* Interpretation */}
          <FormSection title="🧠 Interpretation / Remarks">
            <textarea
              className="flex min-h-[100px] w-full rounded-lg glass-input px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none"
              placeholder="Clinical interpretation and remarks..."
              value={form.interpretation}
              onChange={e => set("interpretation", e.target.value)}
            />
          </FormSection>

          {/* Observations */}
          <FormSection title="⚠️ Observations">
            <p className="text-xs text-muted-foreground mb-2">Any abnormalities detected:</p>
            <textarea
              className="flex min-h-[80px] w-full rounded-lg glass-input px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none"
              placeholder="Describe any abnormalities or notable findings..."
              value={form.observations}
              onChange={e => set("observations", e.target.value)}
            />
          </FormSection>

          {/* Doctor Authorization */}
          <FormSection title="👨‍⚕️ Doctor / Lab Authorization">
            <FormGrid>
              <LabeledInput label="Doctor Name" value={form.doctorName} onChange={v => set("doctorName", v)} placeholder="Dr. Full Name" />
              <LabeledInput label="Report Date" value={form.reportDate} onChange={v => set("reportDate", v)} type="date" />
            </FormGrid>
          </FormSection>

          <div className="flex justify-end gap-3 pb-8">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Report"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card/60 border border-white/5 rounded-xl p-5 space-y-4">
      <h3 className="text-sm font-semibold text-white/80 border-b border-white/10 pb-2">{title}</h3>
      {children}
    </div>
  );
}

function FormGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>;
}

function LabeledInput({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-muted-foreground mb-1">{label}</label>
      <Input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

export default function Reports() {
  const queryClient = useQueryClient();
  const { data: reports, isLoading } = useListReports();
  const [showForm, setShowForm] = useState(false);
  const [viewingReport, setViewingReport] = useState<Report | null>(null);

  const handleSaved = () => {
    queryClient.invalidateQueries({ queryKey: getListReportsQueryKey() });
    setShowForm(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "test_results": return "success";
      case "audit": return "info";
      case "inventory": return "warning";
      default: return "default";
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-display font-semibold text-white">Reports Library</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Generate and view patient laboratory reports</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" /> New Patient Report
          </Button>
        </div>

        <Card className="overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground animate-pulse">Loading reports...</div>
          ) : (
            <Table>
              <Thead>
                <Tr>
                  <Th>Report Title</Th>
                  <Th>Type</Th>
                  <Th>Sample Ref</Th>
                  <Th>Generated</Th>
                  <Th className="text-right">Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {reports?.map(report => (
                  <Tr key={report.id}>
                    <Td className="font-medium text-white">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                        {report.title}
                      </div>
                    </Td>
                    <Td>
                      <Badge variant={getTypeColor(report.reportType)} className="capitalize">
                        {report.reportType.replace("_", " ")}
                      </Badge>
                    </Td>
                    <Td className="text-muted-foreground font-mono text-xs">
                      {report.sampleId ? `SAMPLE-${String(report.sampleId).padStart(5, "0")}` : "—"}
                    </Td>
                    <Td className="text-muted-foreground text-sm">{formatDate(report.createdAt)}</Td>
                    <Td className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setViewingReport(report)}>
                        <Eye className="w-4 h-4 mr-1.5" /> View
                      </Button>
                    </Td>
                  </Tr>
                ))}
                {reports?.length === 0 && (
                  <Tr>
                    <Td colSpan={5} className="text-center py-12 text-muted-foreground">
                      <FileText className="w-8 h-8 mx-auto mb-3 opacity-30" />
                      <p>No reports yet. Generate your first patient report.</p>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          )}
        </Card>
      </div>

      {showForm && (
        <ReportForm onClose={() => setShowForm(false)} onSaved={handleSaved} />
      )}

      {viewingReport && (
        <ReportViewer report={viewingReport} onClose={() => setViewingReport(null)} />
      )}
    </>
  );
}
