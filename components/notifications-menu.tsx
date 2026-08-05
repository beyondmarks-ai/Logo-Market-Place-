"use client";

import { useEffect, useRef, useState } from "react";

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 9.5a6 6 0 0 0-12 0c0 7-3 7-3 8.5h18c0-1.5-3-1.5-3-8.5Z" />
      <path d="M9.5 21h5a2.75 2.75 0 0 1-5 0Z" />
    </svg>
  );
}

const notifications = [
  {
    title: "AI API request approved",
    message: "Your API access is ready to use.",
    time: "Just now",
    unread: true,
  },
  {
    title: "Azure service updated",
    message: "Your deployment configuration was saved.",
    time: "18 minutes ago",
    unread: false,
  },
  {
    title: "New dashboard insights",
    message: "Your latest visualization is available.",
    time: "2 hours ago",
    unread: false,
  },
];

export function NotificationsMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeMenu = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", closeMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <div className="notifications-menu" ref={menuRef}>
      <button
        className="notifications-trigger"
        type="button"
        aria-label="Notifications, 1 unread"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => setIsOpen((open) => !open)}
      >
        <BellIcon />
        <span className="notifications-unread" />
      </button>

      <section
        className={`notifications-popover${isOpen ? " notifications-popover--open" : ""}`}
        role="dialog"
        aria-label="Notifications"
        aria-hidden={!isOpen}
        inert={!isOpen}
      >
        <header className="notifications-popover-header">
          <div>
            <p>Inbox</p>
            <h2>Notifications</h2>
          </div>
          <button type="button" onClick={() => setIsOpen(false)}>
            Mark all as read
          </button>
        </header>

        <div className="notifications-popover-list">
          {notifications.map((notification) => (
            <article
              className={`notification-entry${notification.unread ? " notification-entry--unread" : ""}`}
              key={notification.title}
            >
              <span className="notification-entry-dot" />
              <div>
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <time>{notification.time}</time>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
