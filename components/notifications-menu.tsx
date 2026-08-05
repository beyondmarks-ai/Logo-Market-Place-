"use client";

import { useEffect, useRef, useState } from "react";
import type { StudentNotification } from "../lib/access-automation";

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 9.5a6 6 0 0 0-12 0c0 7-3 7-3 8.5h18c0-1.5-3-1.5-3-8.5Z" />
      <path d="M9.5 21h5a2.75 2.75 0 0 1-5 0Z" />
    </svg>
  );
}

type NotificationsMenuProps = {
  notifications: StudentNotification[];
  onMarkAllRead: () => void;
};

function notificationTime(createdAt: string) {
  const elapsed = Math.max(0, Date.now() - new Date(createdAt).getTime());
  if (elapsed < 60_000) return "Just now";
  if (elapsed < 3_600_000) return `${Math.floor(elapsed / 60_000)} minutes ago`;
  if (elapsed < 86_400_000) return `${Math.floor(elapsed / 3_600_000)} hours ago`;
  return new Date(createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function NotificationsMenu({ notifications, onMarkAllRead }: NotificationsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter((notification) => notification.unread).length;

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
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        onClick={() => setIsOpen((open) => !open)}
      >
        <BellIcon />
        {unreadCount > 0 && <span className="notifications-unread" />}
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
          <button type="button" disabled={unreadCount === 0} onClick={onMarkAllRead}>
            Mark all as read
          </button>
        </header>

        <div className="notifications-popover-list">
          {notifications.length === 0 && <div className="notifications-empty">No notifications yet.</div>}
          {notifications.map((notification) => (
            <article
              className={`notification-entry${notification.unread ? " notification-entry--unread" : ""}`}
              key={notification.id}
            >
              <span className="notification-entry-dot" />
              <div>
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <time>{notificationTime(notification.createdAt)}</time>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
