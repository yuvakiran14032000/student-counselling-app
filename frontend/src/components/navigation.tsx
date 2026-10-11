"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Brand } from "./brand";
export function Navigation() {
  const [open, setOpen] = useState(false);
  return (
    <header className="site-header">
      <div className="container nav-inner">
        <Brand />
        <button
          className="icon-button mobile-toggle"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          aria-controls="main-navigation"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav
          id="main-navigation"
          aria-label="Main navigation"
          className={open ? "main-nav open" : "main-nav"}
        >
          <a href="#how-it-works" onClick={() => setOpen(false)}>
            How it works
          </a>
          <a href="#colleges" onClick={() => setOpen(false)}>
            Explore colleges
          </a>
          <Link href="/login">Log in</Link>
          <a
            className="button button-small"
            href="#counselling"
            onClick={() => setOpen(false)}
          >
            Let’s find your path <ArrowUpRight size={16} />
          </a>
        </nav>
      </div>
    </header>
  );
}
