"use client";
import Link from "next/link";
import { FormEvent, useState } from "react";
type Mode = "signup" | "signin" | "forgot" | "reset";
export function AuthForm({ mode, token = "" }: { mode: Mode; token?: string }) {
  const [message, setMessage] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const endpoint = mode === "signup" ? "signup" : mode === "signin" ? "signin" : mode === "forgot" ? "forgot-password" : "reset-password";
    try {
      const response = await fetch(`/api/account/${endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, token }) });
      const body = await response.json(); if (!response.ok) throw new Error(body.error?.message || "Something went wrong.");
      if (mode === "signin") { const next = new URLSearchParams(window.location.search).get("next"); window.location.href = next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard"; return; }
      setMessage(body.data?.message || "Done.");
      if (body.data?.previewUrl) setMessage(`${body.data.message} Development link: ${body.data.previewUrl}`);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Something went wrong."); } finally { setBusy(false); }
  }
  const title = { signup: "Create your account", signin: "Welcome back", forgot: "Reset your password", reset: "Choose a new password" }[mode];
  const subtitle = mode === "signup" ? "Verify your email and receive 5 free API calls." : mode === "signin" ? "Access your keys, credits, and usage ledger." : mode === "forgot" ? "We will email you a secure reset link." : "Use at least 12 characters for your new password.";
  return <section className="auth-card"><p className="auth-kicker">DEVELOPER ACCESS</p><h1>{title}</h1><p className="auth-subtitle">{subtitle}</p>
    <form onSubmit={submit}>
      {mode !== "reset" && <label>Email address<input name="email" type="email" autoComplete="email" required placeholder="you@company.com" /></label>}
      {(mode === "signup" || mode === "signin" || mode === "reset") && <label>Password<input name="password" type="password" minLength={12} maxLength={128} autoComplete={mode === "signin" ? "current-password" : "new-password"} required /></label>}
      {(mode === "signup" || mode === "reset") && <label>Confirm password<input name="confirmPassword" type="password" minLength={12} maxLength={128} autoComplete="new-password" required /></label>}
      {error && <p className="form-status form-error" role="alert">{error}</p>}{message && <p className="form-status form-success" role="status">{message}</p>}
      <button type="submit" disabled={busy}>{busy ? "Please wait..." : mode === "signup" ? "Create account" : mode === "signin" ? "Sign in" : mode === "forgot" ? "Send reset link" : "Update password"}</button>
    </form>
    <div className="auth-links">{mode === "signin" ? <><Link href="/forgot-password">Forgot password?</Link><Link href="/signup">Create account</Link></> : mode === "signup" ? <Link href="/signin">Already have an account? Sign in</Link> : <Link href="/signin">Back to sign in</Link>}</div>
  </section>;
}
