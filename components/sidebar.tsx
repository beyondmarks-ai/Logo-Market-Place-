"use client";

import { useState, type ReactNode } from "react";

type IconProps = {
  className?: string;
};

function DashboardIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="4.5" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="10.5" width="7" height="10" rx="1.5" />
    </svg>
  );
}

function AiApiIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="5" width="14" height="14" rx="4" />
      <path d="M9 14.8 11.35 9h1.3L15 14.8M9.8 13h4.4M8 2.75v2.1M12 2.75v2.1M16 2.75v2.1M8 19.15v2.1M12 19.15v2.1M16 19.15v2.1M2.75 8h2.1M2.75 12h2.1M2.75 16h2.1M19.15 8h2.1M19.15 12h2.1M19.15 16h2.1" />
    </svg>
  );
}

function AzureIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.7 18.5H6.2a4.2 4.2 0 0 1-.5-8.37A6.45 6.45 0 0 1 18 8.7a4.9 4.9 0 0 1-.2 9.8h-2.35" />
      <path d="m12 11-3.2 5.1h2.35V21l4.05-6.15h-2.55L14.2 11H12Z" />
    </svg>
  );
}

function VisualizeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20V10M10 20V4M16 20v-7M22 20V7" />
      <path d="M2.5 20.5h20" />
      <circle cx="4" cy="7" r="1.5" />
      <circle cx="10" cy="2.5" r="1.5" />
      <circle cx="16" cy="10" r="1.5" />
      <circle cx="22" cy="4.5" r="1.5" />
    </svg>
  );
}

function DocumentationIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4.5 4.5A3.5 3.5 0 0 1 8 3h4v17H8a3.5 3.5 0 0 0-3.5 1.5v-17ZM19.5 4.5A3.5 3.5 0 0 0 16 3h-4v17h4a3.5 3.5 0 0 1 3.5 1.5v-17Z" />
      <path d="M7 7h2.5M7 10h2.5M14.5 7H17M14.5 10H17" />
    </svg>
  );
}

function SettingsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9.6 3.7h4.8l.55 2.05c.5.2.97.47 1.4.8l2.05-.57 2.4 4.04-1.5 1.5a7 7 0 0 1 0 1.96l1.5 1.5-2.4 4.04-2.05-.57c-.43.33-.9.6-1.4.8l-.55 2.05H9.6l-.55-2.05a7.4 7.4 0 0 1-1.4-.8l-2.05.57-2.4-4.04 1.5-1.5a7 7 0 0 1 0-1.96l-1.5-1.5L5.6 5.98l2.05.57c.43-.33.9-.6 1.4-.8L9.6 3.7Z" />
      <circle cx="12" cy="12.5" r="2.6" />
    </svg>
  );
}

function NotificationsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M18 9.5a6 6 0 0 0-12 0c0 7-3 7-3 8.5h18c0-1.5-3-1.5-3-8.5Z" />
      <path d="M9.5 21h5a2.75 2.75 0 0 1-5 0Z" />
    </svg>
  );
}

function LogoutIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M13 5H6.8A1.8 1.8 0 0 0 5 6.8v10.4A1.8 1.8 0 0 0 6.8 19H13M14 9l3 3-3 3M9 12h8" />
    </svg>
  );
}

type NavButtonProps = {
  label: string;
  active: boolean;
  icon: ReactNode;
  onClick: () => void;
};

function NavButton({ label, active, icon, onClick }: NavButtonProps) {
  return (
    <button
      className={`nav-button${active ? " nav-button--active" : ""}`}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      type="button"
    >
      {icon}
      <span className="tooltip">{label}</span>
    </button>
  );
}

const navigation = [
  { label: "Dashboard", Icon: DashboardIcon },
  { label: "Request AI API", Icon: AiApiIcon },
  { label: "Request Azure Services", Icon: AzureIcon },
  { label: "Visualize", Icon: VisualizeIcon },
  { label: "Documentation", Icon: DocumentationIcon },
  { label: "Notifications", Icon: NotificationsIcon },
];

export function Sidebar() {
  const [activeItem, setActiveItem] = useState("Dashboard");
  const [showNotifications, setShowNotifications] = useState(false);

  const selectItem = (label: string) => {
    setActiveItem(label);
    if (label === "Notifications") {
      setShowNotifications((isOpen) => !isOpen);
      return;
    }
    setShowNotifications(false);
  };

  return (
    <aside className="sidebar" aria-label="Primary navigation">
      <nav className="sidebar-nav">
        <div className="nav-group">
          {navigation.map(({ label, Icon }) => (
            <NavButton
              key={label}
              label={label}
              active={activeItem === label}
              icon={<Icon className="nav-icon" />}
              onClick={() => selectItem(label)}
            />
          ))}
        </div>

        <div className="nav-group nav-group--bottom">
          <NavButton
            label="Settings"
            active={activeItem === "Settings"}
            icon={<SettingsIcon className="nav-icon" />}
            onClick={() => selectItem("Settings")}
          />
          <NavButton
            label="Log out"
            active={false}
            icon={<LogoutIcon className="nav-icon" />}
            onClick={() => undefined}
          />
        </div>
      </nav>

      <section
        className={`notifications-panel${
          showNotifications ? " notifications-panel--open" : ""
        }`}
        role="dialog"
        aria-label="Notifications"
        aria-live="polite"
        aria-hidden={!showNotifications}
        inert={!showNotifications}
      >
          <header className="notifications-header">
            <div>
              <p className="notifications-kicker">UPDATES</p>
              <h2>Notifications</h2>
            </div>
            <button
              className="notifications-close"
              type="button"
              aria-label="Close notifications"
              onClick={() => setShowNotifications(false)}
            >
              ×
            </button>
          </header>

          <div className="notifications-list">
            <article className="notification-item notification-item--new">
              <span className="notification-dot" />
              <div>
                <h3>AI API request approved</h3>
                <p>Your API access is ready to use.</p>
                <time>Just now</time>
              </div>
            </article>

            <article className="notification-item">
              <span className="notification-dot" />
              <div>
                <h3>Azure service updated</h3>
                <p>Your deployment configuration was saved.</p>
                <time>18 minutes ago</time>
              </div>
            </article>

            <article className="notification-item">
              <span className="notification-dot" />
              <div>
                <h3>New dashboard insights</h3>
                <p>Your latest visualization is available.</p>
                <time>2 hours ago</time>
              </div>
            </article>
          </div>
      </section>
    </aside>
  );
}
