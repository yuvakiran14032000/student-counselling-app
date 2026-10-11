import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";
import { Brand } from "./brand";
import { CampusArt } from "./campus-art";
import { AuthForm } from "./auth-form";
export function AuthShell({ mode }: { mode: "signup" | "login" }) {
  const signup = mode === "signup";
  return (
    <main className="auth-layout" id="main">
      <aside className="auth-story">
        <Brand light />
        <div className="auth-story-copy">
          <Compass size={40} strokeWidth={1} />
          <p className="eyebrow">EVERY GREAT JOURNEY STARTS SOMEWHERE</p>
          <h1>
            A little clarity.
            <br />
            <em>
              A world of
              <br />
              possibility.
            </em>
          </h1>
          <p>A space to connect student interests with their next chapter.</p>
        </div>
        <div className="auth-art">
          <CampusArt />
        </div>
        <span className="auth-story-footer">
          YOUR NEXT CHAPTER IS STILL UNWRITTEN ↗
        </span>
      </aside>
      <section className="auth-main">
        <Link className="back-link" href="/">
          <ArrowLeft size={16} /> Back to Pathway
        </Link>
        <div className="auth-content">
          <span className="eyebrow">
            {signup ? "LET’S GET STARTED" : "GOOD TO SEE YOU AGAIN"}
          </span>
          <h2>{signup ? "Make room for possibility." : "Welcome back."}</h2>
          <p className="auth-description">
            {signup
              ? "Create an account to explore your counselling workspace."
              : "Log in to pick up where you left off."}
          </p>
          <AuthForm mode={mode} />
          <div className="auth-demo-note">
            Demo workspace · Registered users can view all counselling leads.
            Please use fictional information.
          </div>
        </div>
      </section>
    </main>
  );
}
