"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiUrl } from "@/lib/api";
import { Dashboard } from "./dashboard";
export function DashboardGate() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { fetch(apiUrl("/api/auth/me"), { credentials: "include" }).then(async response => { if (response.status === 401) { router.replace("/login"); return; } const body = await response.json(); if (!response.ok) throw new Error(body.error?.message || "Unable to load your session."); setUser(body.data); }).catch(e => setError(e instanceof Error ? e.message : "Unable to load your session.")); }, [router]);
  if (error) return <main id="main" className="page-state"><h1>Session unavailable.</h1><p>{error}</p></main>;
  if (!user) return <main id="main" className="page-state"><span className="eyebrow">PATHWAY WORKSPACE</span><h1>Getting things ready…</h1><p>Loading your counselling dashboard.</p></main>;
  return <Dashboard user={user} />;
}
