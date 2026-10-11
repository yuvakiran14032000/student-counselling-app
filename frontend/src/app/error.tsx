"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main id="main" className="page-state"><p className="eyebrow">LET’S TRY THAT AGAIN</p><h1>A small detour.</h1><p>We couldn’t load this page. Please try again in a moment.</p><button className="button" onClick={reset}>Try again</button><Link href="/" className="text-link">Back to Pathway</Link></main>;
}