import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Pathway — A little clarity. A world of possibility.",
    template: "%s | Pathway",
  },
  description:
    "Explore your interests, discover colleges, and take the next step with student counselling. A local demonstration project.",
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
