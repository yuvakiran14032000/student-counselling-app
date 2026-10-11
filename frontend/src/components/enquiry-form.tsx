"use client";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowUpRight, CheckCircle2, LoaderCircle } from "lucide-react";
import { enquirySchema, fieldErrors } from "@/lib/validation";
import { apiUrl } from "@/lib/api";
type CollegeOption = { id: number; slug: string; name: string; city: string };
type CollegeResponse = {
  colleges: CollegeOption[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};
const collegeLabel = (college: CollegeOption) => `${college.name} - ${college.city}`;
export function EnquiryForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [reference, setReference] = useState<number | null>(null);
  const [collegeSearch, setCollegeSearch] = useState("");
  const [selectedCollege, setSelectedCollege] = useState<CollegeOption | null>(null);
  const [collegeOptions, setCollegeOptions] = useState<CollegeOption[]>([]);
  const [collegeTotal, setCollegeTotal] = useState(0);
  const [collegeBusy, setCollegeBusy] = useState(false);
  const [collegeError, setCollegeError] = useState("");
  const selectedCollegeLabel = selectedCollege ? collegeLabel(selectedCollege) : "";
  const collegeStatus = useMemo(() => {
    if (collegeBusy) return "Searching colleges...";
    if (collegeError) return collegeError;
    if (selectedCollege && collegeSearch === selectedCollegeLabel) return "";
    if (collegeSearch.trim() && !collegeOptions.length) return "No matching colleges found.";
    if (collegeTotal > collegeOptions.length) return `Showing ${collegeOptions.length} of ${collegeTotal} matches. Keep typing to narrow the list.`;
    return "";
  }, [collegeBusy, collegeError, collegeOptions.length, collegeSearch, collegeTotal, selectedCollege, selectedCollegeLabel]);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setCollegeBusy(true);
      setCollegeError("");
      try {
        const params = new URLSearchParams({ search: collegeSearch.trim(), page: "1", pageSize: "8" });
        const response = await fetch(apiUrl(`/api/colleges?${params}`), { signal: controller.signal });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error?.message || "Unable to load colleges.");
        const data = body.data as CollegeResponse;
        setCollegeOptions(data.colleges);
        setCollegeTotal(data.total);
      } catch (e) {
        if (!controller.signal.aborted) {
          setCollegeOptions([]);
          setCollegeTotal(0);
          setCollegeError(e instanceof Error ? e.message : "Unable to load colleges.");
        }
      } finally {
        if (!controller.signal.aborted) setCollegeBusy(false);
      }
    }, 300);
    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [collegeSearch]);
  function updateCollege(value: string) {
    setCollegeSearch(value);
    const match = collegeOptions.find((college) => collegeLabel(college) === value);
    setSelectedCollege(match || null);
    if (errors.collegeId) setErrors(({ collegeId: _collegeId, ...rest }) => rest);
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const hasUnselectedCollege = collegeSearch.trim() && !selectedCollege;
    const data = { ...Object.fromEntries(form), collegeId: selectedCollege?.id || "", consent: form.get("consent") === "on" };
    const parsed = enquirySchema.safeParse(data);
    setErrors({}); setMessage("");
    if (hasUnselectedCollege) { setErrors({ collegeId: "Select a college from the results, or leave it blank." }); return; }
    if (!parsed.success) { setErrors(fieldErrors(parsed.error)); return; }
    setBusy(true);
    try {
      const response = await fetch(apiUrl("/api/enquiries"), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const body = await response.json();
      if (!response.ok) { setErrors(body.error?.fields || {}); setMessage(body.error?.message || "Unable to save your enquiry."); }
      else setReference(body.data.reference);
    } catch { setMessage("Connection interrupted. Please try again."); }
    finally { setBusy(false); }
  }
  if (reference) return <div className="enquiry-success" role="status"><CheckCircle2 size={44} /><h3>Your next chapter starts here.</h3><p>Your enquiry #{reference} has been saved. This is a demonstration platform, so no real counselling appointment will be arranged.</p><button className="button button-outline" onClick={() => { setReference(null); setCollegeSearch(""); setSelectedCollege(null); }}>Send another enquiry</button></div>;
  return <form className="enquiry-form" noValidate onSubmit={submit}>
    <div className="form-grid">{[{ name: "name", label: "Your name", placeholder: "e.g. Ananya Rao", auto: "name" }, { name: "phone", label: "Phone number", placeholder: "Your 10-digit number", auto: "tel" }, { name: "city", label: "Your city", placeholder: "e.g. Bangalore", auto: "address-level2" }].map(f => <div className="field" key={f.name}><label htmlFor={`enquiry-${f.name}`}>{f.label}</label><input id={`enquiry-${f.name}`} name={f.name} type={f.name === "phone" ? "tel" : "text"} autoComplete={f.auto} placeholder={f.placeholder} maxLength={f.name === "phone" ? 20 : 80} required aria-invalid={!!errors[f.name]} aria-describedby={errors[f.name] ? `${f.name}-error` : undefined} /><span className="field-error" id={`${f.name}-error`}>{errors[f.name]}</span></div>)}
    <div className="field"><label htmlFor="enquiry-college">College in mind?</label><input id="enquiry-college" name="collegeSearch" list="enquiry-college-results" value={collegeSearch} onChange={e => updateCollege(e.target.value)} onBlur={() => selectedCollege && setCollegeSearch(selectedCollegeLabel)} autoComplete="off" placeholder="Search college name or city" maxLength={191} aria-invalid={!!errors.collegeId} aria-describedby={errors.collegeId ? "college-error" : collegeStatus ? "college-status" : undefined} /><input type="hidden" name="collegeId" value={selectedCollege?.id || ""} /><datalist id="enquiry-college-results">{collegeOptions.map(c => <option value={collegeLabel(c)} key={c.id} />)}</datalist><span className="field-error" id="college-error">{errors.collegeId}</span>{collegeStatus && !errors.collegeId && <span className="field-hint" id="college-status">{collegeStatus}</span>}</div></div>
    <div className="honeypot" aria-hidden="true"><label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off" /></div>
    <label className="checkbox-label"><input name="consent" type="checkbox" required aria-describedby="consent-error" /> <span>I agree to share these details for this counselling enquiry.</span></label><span id="consent-error" className="field-error">{errors.consent}</span>
    {message && <div role="alert" className="alert alert-error">{message}</div>}
    <button className="button" type="submit" disabled={busy}>{busy ? <><LoaderCircle className="spin" size={18} /> Saving your enquiry…</> : <>Request free counselling <ArrowUpRight size={18} /></>}</button>
    <p className="form-note">Demo only. Please use fictional contact details.</p>
  </form>;
}
