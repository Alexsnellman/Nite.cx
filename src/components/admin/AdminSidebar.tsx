import { NavLink } from "react-router-dom";
import { MapPin, Globe, Calendar, Users, Zap, Mail, Eye, Building2 } from "lucide-react";

const navItems = [
  { to: "/admin", icon: Calendar, label: "Dashboard" },
  { to: "/admin/preview", icon: Eye, label: "Events" },
  { to: "/admin/cities", icon: MapPin, label: "Cities" },
  { to: "/admin/organizers", icon: Users, label: "Organizers" },
  { to: "/admin/sources", icon: Globe, label: "Sources" },
  { to: "/admin/extract", icon: Zap, label: "AI Intelligence" },
  { to: "/admin/outreach", icon: Mail, label: "Outreach" },
];

export function AdminSidebar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-card border-r border-border flex flex-col z-50">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-gradient">NITE</h1>
        <p className="text-xs text-muted-foreground mt-1">Event Intelligence Engine</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary/15 text-primary glow-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Building2 className="h-3 w-3" />
          <span>Lovable Cloud</span>
        </div>
      </div>
    </aside>
  );
}
