"use client";

import {
  Circle,
  Cloud,
  Grid3X3,
  Moon,
  Palette,
  Sun,
  Tag,
  Type,
  type LucideIcon,
} from "lucide-react";

type NavButtonProps = {
  label: string;
  active: boolean;
  icon: LucideIcon;
  onClick: () => void;
};

function NavButton({ label, active, icon: Icon, onClick }: NavButtonProps) {
  return (
    <button
      className={`nav-button${active ? " nav-button--active" : ""}`}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
      type="button"
    >
      <Icon className="nav-icon" aria-hidden="true" />
      <span className="tooltip">{label}</span>
    </button>
  );
}

const primaryNavigation = [
  { label: "All Logos", Icon: Grid3X3 },
  { label: "Color SVG", Icon: Palette },
  { label: "Mono SVG", Icon: Circle },
  { label: "Light SVG", Icon: Sun },
  { label: "Dark SVG", Icon: Moon },
  { label: "Wordmarks", Icon: Type },
];

const collectionNavigation = [
  { label: "Brand Logos", Icon: Tag },
  { label: "Cloud Icons", Icon: Cloud },
];

type SidebarProps = {
  activeItem: string;
  onSelectItem: (label: string) => void;
};

export function Sidebar({ activeItem, onSelectItem }: SidebarProps) {
  return (
    <aside className="sidebar" aria-label="Logo filters">
      <nav className="sidebar-nav">
        <div className="nav-group">
          {primaryNavigation.map(({ label, Icon }) => (
            <NavButton
              key={label}
              label={label}
              active={activeItem === label}
              icon={Icon}
              onClick={() => onSelectItem(label)}
            />
          ))}
        </div>

        <div className="nav-group nav-group--bottom">
          {collectionNavigation.map(({ label, Icon }) => (
            <NavButton
              key={label}
              label={label}
              active={activeItem === label}
              icon={Icon}
              onClick={() => onSelectItem(label)}
            />
          ))}
        </div>
      </nav>
    </aside>
  );
}