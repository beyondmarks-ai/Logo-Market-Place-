"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
export function AccountNav() {
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => { fetch("/api/account/me").then((r) => setSignedIn(r.ok)).catch(() => undefined); }, []);
  return <nav className="account-nav" aria-label="Account navigation">
    <Link href="/">Logo Market Place</Link><span />
    <Link href="/developers">API docs</Link><Link href="/pricing">Pricing</Link>
    <Link className="nav-cta" href={signedIn ? "/dashboard" : "/signin"}>{signedIn ? "Dashboard" : "Sign in"}</Link>
  </nav>;
}
