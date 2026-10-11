import type { Metadata } from "next";
import { DashboardGate } from "@/components/dashboard-gate";
export const metadata: Metadata = {
  title: "Your workspace",
  robots: { index: false, follow: false },
};
export default function DashboardPage() {
  return <DashboardGate />;
}
