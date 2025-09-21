import { NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FolderOpen, 
  Terminal, 
  Settings,
  Plus,
  Play,
  Square
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Projects",
    href: "/projects",
    icon: FolderOpen,
  },
  {
    title: "Logs",
    href: "/logs",
    icon: Terminal,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar border-r border-sidebar-border">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <span className="text-white text-sm font-bold">N</span>
          </div>
          <span className="font-semibold text-sidebar-foreground text-lg">Nova</span>
        </div>
        <span className="text-xs text-sidebar-foreground/60">v1.0.0</span>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b border-sidebar-border">
        <Button 
          variant="default" 
          size="sm" 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors",
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground border border-sidebar-border shadow-card" 
                  : "text-sidebar-foreground/80"
              )}
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.title}
            </NavLink>
          );
        })}
      </nav>

      {/* Status Indicators */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-sidebar-foreground/60">Active Projects</span>
            <span className="text-sidebar-foreground font-medium">3</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-sidebar-foreground/60">Running Servers</span>
            <div className="flex items-center space-x-1">
              <div className="h-2 w-2 bg-success rounded-full"></div>
              <span className="text-sidebar-foreground font-medium">2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}