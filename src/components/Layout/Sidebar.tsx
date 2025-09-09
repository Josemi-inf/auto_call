import { NavLink, useLocation } from "react-router-dom";
import { 
  Users, 
  GitBranch, 
  AlertTriangle, 
  BarChart3, 
  Home,
  Activity,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import logoImage from "@/assets/leadflow-logo.png";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Leads", href: "/leads", icon: Users },
  { name: "Workflows", href: "/workflows", icon: GitBranch },
  { name: "Estadísticas", href: "/stats", icon: BarChart3 },
  { name: "Errores", href: "/errors", icon: AlertTriangle },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden">
            <img 
              src={logoImage} 
              alt="LeadFlow Logo" 
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">LeadFlow</h1>
            <p className="text-xs text-muted-foreground">CRM Manager</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-6">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-smooth",
                isActive
                  ? "bg-primary text-primary-foreground shadow-custom-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-4 w-4 shrink-0 transition-smooth",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground group-hover:text-sidebar-foreground"
                )}
              />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
            <span className="text-xs font-semibold text-primary-foreground">A</span>
          </div>
          <div className="text-sm">
            <p className="font-medium text-sidebar-foreground">Admin User</p>
            <p className="text-muted-foreground text-xs">admin@leadflow.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}