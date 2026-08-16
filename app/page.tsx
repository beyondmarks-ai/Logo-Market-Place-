"use client";

import { useEffect, useRef, useState } from "react";
import { BackgroundAnimation } from "../components/background-animation";
import { LogoCatalog } from "../components/logo-catalog";
import { Sidebar } from "../components/sidebar";

export default function Home() {
  const [activeItem, setActiveItem] = useState("All Logos");
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const scrollingDown = currentY > lastScrollY.current;
      setHeaderHidden(currentY > 40 && scrollingDown);
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
      </header>
      <Sidebar activeItem={activeItem} onSelectItem={setActiveItem} />
      <LogoCatalog activeFilter={activeItem} />
    </main>
  );
}