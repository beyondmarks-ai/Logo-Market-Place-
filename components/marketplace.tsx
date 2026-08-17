"use client";

import { useEffect, useRef, useState } from "react";
import { BackgroundAnimation } from "./background-animation";
import { LogoCatalog } from "./logo-catalog";
import { Sidebar } from "./sidebar";

export function Marketplace({ email, initialCredits }: { email: string; initialCredits: number }) {
  const [activeItem, setActiveItem] = useState("All Logos");
  const [credits, setCredits] = useState(initialCredits);
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      setHeaderHidden(currentY > 40 && currentY > lastScrollY.current);
      lastScrollY.current = currentY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="dashboard-shell" aria-label="Logo Market Place">
      <BackgroundAnimation />
      <header className={`top-header${headerHidden ? " top-header--hidden" : ""}`}>
        <h1>Logo Market Place</h1>
        <div className="home-actions">
          <span className="market-credit" aria-live="polite"><strong>{credits.toLocaleString()}</strong> credits</span>
          <a className="api-docs-link" href="/dashboard">Dashboard</a>
          <a className="api-docs-link" href="/pricing">Buy credits</a>
        </div>
        <span className="market-user">{email}</span>
      </header>
      <Sidebar activeItem={activeItem} onSelectItem={setActiveItem} />
      <LogoCatalog activeFilter={activeItem} onCreditsChange={setCredits} />
    </main>
  );
}
