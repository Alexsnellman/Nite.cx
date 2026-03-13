import { useLocation, useNavigate } from "react-router-dom";
import { Flame, Search, Ticket, MessageCircle, User } from "lucide-react";

const tabs = [
  { path: "/", icon: Flame, label: "Feed" },
  { path: "/search", icon: Search, label: "Search" },
  { path: "/tickets", icon: Ticket, label: "Tickets" },
  { path: "/chat", icon: MessageCircle, label: "Chat" },
  { path: "/profile", icon: User, label: "Profile" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide nav on scanner, auth, and admin pages
  if (["/admin-scan", "/login", "/signup", "/reset-password"].includes(location.pathname) || location.pathname.startsWith("/chat/") || location.pathname.startsWith("/admin")) return null;

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 border-t border-border bg-background/90 backdrop-blur-xl safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className="text-[10px] font-mono font-medium tracking-wider uppercase">
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
