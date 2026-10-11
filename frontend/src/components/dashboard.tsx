"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, CalendarDays, ChevronLeft, ChevronRight, CircleAlert, LayoutDashboard, LogOut, MapPin, RefreshCw, Search, Users, X } from "lucide-react";
import { Brand } from "./brand";
import { formatDate } from "@/lib/dates";
import { apiUrl } from "@/lib/api";
type User = { id: number; name: string; email: string };
type Summary = { total: number; thisWeek: number; topCity: string | null; topCityCount: number };
type Leads = { leads: { id: number; name: string; phone: string; city: string; createdAt: string }[]; total: number; page: number; pageSize: number; cities: string[] };
export function Dashboard({ user }: { user: User }) {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [summaryError, setSummaryError] = useState("");
  const [summaryBusy, setSummaryBusy] = useState(true);
  const [data, setData] = useState<Leads | null>(null);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const [logoutBusy, setLogoutBusy] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const goToLogin = useCallback(() => { router.replace("/login"); router.refresh(); }, [router]);
  useEffect(() => { const timer = setTimeout(() => { setQuery(search.trim()); setPage(1); }, 300); return () => clearTimeout(timer); }, [search]);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setSummaryBusy(true); setSummaryError("");
      try {
        const response = await fetch(apiUrl("/api/dashboard/summary"), { credentials: "include", signal: controller.signal });
        if (response.status === 401) { goToLogin(); return; }
        const body = await response.json();
        if (!response.ok) throw new Error(body.error?.message || "Unable to load your summary.");
        setSummary(body.data);
      } catch (e) { if (!controller.signal.aborted) setSummaryError(e instanceof Error ? e.message : "Unable to load your summary."); }
      finally { if (!controller.signal.aborted) setSummaryBusy(false); }
    }
    void load(); return () => controller.abort();
  }, [revision, goToLogin]);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setBusy(true); setError("");
      try {
        const response = await fetch(apiUrl(`/api/leads?${new URLSearchParams({ search: query, city, page: String(page) })}`), { credentials: "include", signal: controller.signal });
        if (response.status === 401) { goToLogin(); return; }
        const body = await response.json();
        if (!response.ok) throw new Error(body.error?.message || "Unable to load leads.");
        setData(body.data);
      } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : "Unable to load leads. Check your connection."); }
      finally { if (!controller.signal.aborted) setBusy(false); }
    }
    void load(); return () => controller.abort();
  }, [query, city, page, revision, goToLogin]);
  async function logout() {
    setLogoutBusy(true); setLogoutError("");
    try {
      const response = await fetch(apiUrl("/api/auth/logout"), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: "{}" });
      if (!response.ok) throw new Error();
      goToLogin();
    } catch { setLogoutError("Couldn’t log out. Please try again."); setLogoutBusy(false); }
  }
  const filtered = Boolean(query || city);
  const clear = () => { setSearch(""); setQuery(""); setCity(""); setPage(1); };
  return <div className="dashboard-layout"><aside className="dashboard-sidebar"><Brand /><div className="workspace-label">YOUR WORKSPACE</div><nav aria-label="Dashboard navigation"><Link href="/dashboard" className="sidebar-active" aria-current="page"><LayoutDashboard size={18} /> Overview</Link><Link href="/#colleges"><CompassIcon /> Explore colleges <ArrowUpRight size={14} /></Link><Link href="/"><ArrowUpRight size={18} /> Visit website</Link></nav><div className="sidebar-note"><span className="tiny-dot" /><strong>Every lead is a new beginning.</strong><p>A little guidance can make a big difference.</p></div><div className="sidebar-bottom"><span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span><div><strong>{user.name}</strong><span>Demo member</span></div></div></aside>
    <div className="dashboard-main"><header className="dashboard-topbar"><span><span className="breadcrumb-muted">Workspace</span> / Overview</span><button className="button button-outline button-small" onClick={logout} disabled={logoutBusy}><LogOut size={16} /> {logoutBusy ? "Logging out…" : "Log out"}</button></header>
    <main id="main" className="dashboard-content">{logoutError && <div className="alert alert-error" role="alert">{logoutError}</div>}<div className="dashboard-heading"><div><p className="eyebrow">A LITTLE CLARITY, ALL IN ONE PLACE</p><h1>Hello, {user.name.split(" ")[0]}<span className="greeting-dot">.</span></h1><p>Here’s where your students’ next chapters begin.</p></div><button className="button button-outline button-small" onClick={() => setRevision(v => v + 1)} disabled={busy || summaryBusy}><RefreshCw size={15} className={busy || summaryBusy ? "spin" : ""} /> Refresh</button></div>
      {summaryError ? <div role="alert" className="alert alert-error summary-error">{summaryError}<button className="text-link" onClick={() => setRevision(v => v + 1)}>Retry summary</button></div> : <div className="summary-grid" aria-busy={summaryBusy}>{[{ label: "Total leads", value: summary?.total, detail: "Every enquiry, in one place", icon: Users, accent: true }, { label: "Leads this week", value: summary?.thisWeek, detail: "Since Monday · UTC", icon: CalendarDays }, { label: "Top city", value: summary?.topCity || "No leads yet", detail: summary?.topCity ? `${summary.topCityCount} enquiries from this city` : "Your first enquiry starts the story", icon: MapPin }].map(card => <article className={`summary-card ${card.accent ? "summary-primary" : ""}`} key={card.label}><div className="summary-label">{card.label}<card.icon size={20} strokeWidth={1.5} /></div>{summaryBusy ? <span className="skeleton summary-skeleton" /> : <strong className="summary-value">{card.value}</strong>}<p>{card.detail}</p></article>)}</div>}
      <section className="leads-panel" aria-labelledby="leads-title"><div className="leads-title-row"><div><h2 id="leads-title">Your leads <span className="count-badge">{busy ? "…" : error ? "—" : data?.total ?? 0}</span></h2><p>A first conversation. A future full of possibility.</p></div><span className="table-note">Newest first · Dates in UTC</span></div><div className="filters"><div className="search-box"><Search size={19} /><label className="sr-only" htmlFor="lead-search">Search leads</label><input id="lead-search" placeholder="Search name, phone or city…" maxLength={80} value={search} onChange={e => setSearch(e.target.value)} />{search && <button aria-label="Clear search" className="clear-search" onClick={() => setSearch("")}><X size={15} /></button>}</div><div className="city-filter"><MapPin size={17} /><label className="sr-only" htmlFor="city-filter">Filter by city</label><select id="city-filter" value={city} onChange={e => { setCity(e.target.value); setPage(1); }}><option value="">All cities</option>{data?.cities.map(c => <option key={c}>{c}</option>)}</select></div>{filtered && <button className="text-link clear-filters" onClick={clear}>Clear filters</button>}</div>
      <div className="table-container" aria-busy={busy}>{busy ? <div className="table-loading" role="status" aria-label="Loading leads">{Array.from({ length: 5 }, (_, i) => <div className="skeleton-row" key={i}><span className="skeleton" /><span className="skeleton" /><span className="skeleton" /></div>)}<span className="sr-only">Loading leads…</span></div> : error ? <div className="table-state" role="alert"><CircleAlert size={32} /><h3>We couldn’t load your leads.</h3><p>{error}</p><button className="button button-outline button-small" onClick={() => setRevision(v => v + 1)}><RefreshCw size={16} /> Try again</button></div> : !data?.leads.length ? <div className="table-state" role="status"><Search size={32} /><h3>{filtered ? "No leads match just yet." : "Your next conversation starts here."}</h3><p>{filtered ? "Try another name, phone number or city, or clear your filters." : "New counselling enquiries will appear here when students get in touch."}</p>{filtered ? <button className="button button-outline button-small" onClick={clear}>Clear filters</button> : <Link className="button button-outline button-small" href="/#counselling">Open enquiry form <ArrowUpRight size={16} /></Link>}</div> : <table><caption className="sr-only">Counselling leads sorted by most recent enquiry</caption><thead><tr><th scope="col">Student</th><th scope="col">Phone number</th><th scope="col">City</th><th scope="col">Enquiry date</th></tr></thead><tbody>{data.leads.map((lead, i) => <tr key={lead.id}><td data-label="Student"><div className="student-cell"><span className={`avatar avatar-${i % 4}`}>{lead.name.split(" ").map(n => n[0]).slice(0, 2).join("")}</span><strong>{lead.name}</strong></div></td><td data-label="Phone number" className="phone-cell">{lead.phone}</td><td data-label="City"><span className="city-pill">{lead.city}</span></td><td data-label="Enquiry date">{formatDate(lead.createdAt)}</td></tr>)}</tbody></table>}</div>
      {!busy && !error && !!data?.total && <div className="pagination"><span>Showing {(page - 1) * data.pageSize + 1}–{Math.min(page * data.pageSize, data.total)} of {data.total} leads</span><div><button className="icon-button" aria-label="Previous page" disabled={page === 1} onClick={() => setPage(v => v - 1)}><ChevronLeft size={18} /></button><span>Page {page} of {Math.ceil(data.total / data.pageSize)}</span><button className="icon-button" aria-label="Next page" disabled={page * data.pageSize >= data.total} onClick={() => setPage(v => v + 1)}><ChevronRight size={18} /></button></div></div>}</section><p className="dashboard-disclaimer">Demo workspace · All registered users share this view. Seeded names and phone numbers are fictional.</p>
    </main></div></div>;
}
function CompassIcon() { return <MapPin size={18} />; }
