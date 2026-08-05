"use client";

import {
  Award,
  BellPlus,
  Boxes,
  LayoutDashboard,
  Images,
  LogOut,
  Users,
  type LucideIcon,
} from "lucide-react";

type AdminSidebarProps = {
  activeItem: string;
  onSelectItem: (item: string) => void;
  onLogout: () => void;
};

const adminNavigation: Array<{ label: string; Icon: LucideIcon }> = [
  { label: "Admin Dashboard", Icon: LayoutDashboard },
  { label: "Manage Students", Icon: Users },
  { label: "Manage Resources", Icon: Boxes },
  { label: "Send Notifications", Icon: BellPlus },
  { label: "Provide Certificate", Icon: Award },
  { label: "Avatar Creator", Icon: Images },
];

export function AdminSidebar({ activeItem, onSelectItem, onLogout }: AdminSidebarProps) {
  return (
    <aside className="sidebar admin-sidebar" aria-label="Admin navigation">
      <nav className="sidebar-nav">
        <div className="nav-group">
          {adminNavigation.map(({ label, Icon }) => (
            <button
              className={`nav-button${activeItem === label ? " nav-button--active" : ""}`}
              type="button"
              aria-label={label}
              aria-current={activeItem === label ? "page" : undefined}
              onClick={() => onSelectItem(label)}
              key={label}
            >
              <Icon className="nav-icon" />
              <span className="tooltip">{label}</span>
            </button>
          ))}
        </div>

        <div className="nav-group nav-group--bottom">
          <button className="nav-button" type="button" aria-label="Log out" onClick={onLogout}>
            <LogOut className="nav-icon" />
            <span className="tooltip">Log out</span>
          </button>
        </div>
      </nav>
    </aside>
  );
}
