"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowUpRight, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { signupSchema, loginSchema, fieldErrors } from "@/lib/validation";
import { apiUrl } from "@/lib/api";
export function AuthForm({ mode }: { mode: "signup" | "login" }) {
  const signup = mode === "signup";
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [registered, setRegistered] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setErrors({}); setMessage("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const parsed = (signup ? signupSchema : loginSchema).safeParse(values);
    if (!parsed.success) { setErrors(fieldErrors(parsed.error)); return; }
    setBusy(true);
    try {
      const response = await fetch(apiUrl(`/api/auth/${mode}`), { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) });
      const body = await response.json();
      if (!response.ok) { setErrors(body.error?.fields || {}); setMessage(body.error?.message || "Something went wrong. Please try again."); }
      else if (signup) setRegistered(true);
      else { router.replace("/dashboard"); router.refresh(); }
    } catch { setMessage("Unable to connect. Check your connection and try again."); }
    finally { setBusy(false); }
  }
  if (registered) return <div className="registration-success" role="status"><h2>You’re all set.</h2><p>Your account is ready. Log in to explore the counselling dashboard.</p><Link className="button" href="/login">Continue to login <ArrowUpRight size={18} /></Link></div>;
  return <form className="auth-form" onSubmit={submit} noValidate>
    {signup && <div className="field"><label htmlFor="name">Full name</label><input name="name" id="name" autoComplete="name" placeholder="Your full name" maxLength={80} required aria-invalid={!!errors.name} aria-describedby="name-error" /><span className="field-error" id="name-error">{errors.name}</span></div>}
    <div className="field"><label htmlFor="email">Email address</label><input name="email" id="email" type="email" autoComplete="email" placeholder="you@example.com" maxLength={191} required aria-invalid={!!errors.email} aria-describedby="email-error" /><span className="field-error" id="email-error">{errors.email}</span></div>
    <div className="field"><label htmlFor="password">Password</label><div className="password-field"><input name="password" id="password" type={visible ? "text" : "password"} autoComplete={signup ? "new-password" : "current-password"} placeholder={signup ? "Create a password" : "Enter your password"} required aria-invalid={!!errors.password} aria-describedby={signup ? "password-hint password-error" : "password-error"} /><button className="password-toggle" type="button" onClick={() => setVisible(!visible)} aria-label={visible ? "Hide password" : "Show password"}>{visible ? <EyeOff size={19} /> : <Eye size={19} />}</button></div>{signup && <span className="field-hint" id="password-hint">At least 8 characters. Use a unique password.</span>}<span className="field-error" id="password-error">{errors.password}</span></div>
    {message && <div className="alert alert-error" role="alert">{message}</div>}
    <button className="button full-width" disabled={busy} type="submit">{busy ? <><LoaderCircle className="spin" size={18} /> {signup ? "Creating account…" : "Logging in…"}</> : <>{signup ? "Create your account" : "Log in to dashboard"}<ArrowUpRight size={18} /></>}</button>
    <p className="auth-switch">{signup ? "Already have an account?" : "New to Pathway?"} <Link href={signup ? "/login" : "/signup"}>{signup ? "Log in" : "Create an account"}</Link></p>
  </form>;
}
