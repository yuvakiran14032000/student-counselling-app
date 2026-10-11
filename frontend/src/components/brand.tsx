import Link from "next/link";
import { MoveUpRight } from "lucide-react";
export function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      className={`brand${light ? " brand-light" : ""}`}
      href="/"
      aria-label="Pathway home"
    >
      <span className="brand-symbol">
        <MoveUpRight size={22} strokeWidth={2.5} />
      </span>
      pathway<span className="brand-dot">.</span>
    </Link>
  );
}
