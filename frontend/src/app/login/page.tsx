import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
export const metadata: Metadata = { title: "Log in" };
export default function Login() {
  return <AuthShell mode="login" />;
}
