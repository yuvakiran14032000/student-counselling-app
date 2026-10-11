import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
export const metadata: Metadata = { title: "Create an account" };
export default function Signup() { return <AuthShell mode="signup" />; }
