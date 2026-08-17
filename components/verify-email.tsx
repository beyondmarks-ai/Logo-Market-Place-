"use client";
import Link from "next/link"; import { useEffect, useState } from "react";
export function VerifyEmail({ token }: { token: string }) {
  const [state, setState] = useState<"loading" | "success" | "error">("loading"); const [message, setMessage] = useState("Verifying your email...");
  useEffect(() => { if (!token) { setState("error"); setMessage("The verification token is missing."); return; } fetch("/api/account/verify-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) }).then(async (r) => { const body = await r.json(); if (!r.ok) throw new Error(body.error?.message); setState("success"); setMessage("Email verified. Your 5 free credits are ready."); }).catch((e) => { setState("error"); setMessage(e.message || "Verification failed."); }); }, [token]);
  return <section className="auth-card auth-card--center"><div className={`status-orb status-orb--${state}`} /><h1>{state === "success" ? "You are verified" : state === "error" ? "Link unavailable" : "One moment"}</h1><p className="auth-subtitle">{message}</p>{state !== "loading" && <Link className="auth-primary-link" href={state === "success" ? "/dashboard" : "/signup"}>{state === "success" ? "Open dashboard" : "Create account"}</Link>}</section>;
}
