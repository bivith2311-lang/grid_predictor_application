import { Outlet, Link, useLocation } from "react-router-dom";
import { useGrid } from "@/contexts/GridContext";
import {
  LayoutDashboard, Radio, Brain, BarChart3, AlertTriangle,
  Settings, User, LogOut, Sun, Moon, Zap, Menu, X, Map, FlaskConical,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/data-streams", icon: Radio, label: "Data Streams" },
  { to: "/predictions", icon: Brain, label: "Predictions" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/alerts", icon: AlertTriangle, label: "Alerts" },
  { to: "/grid-map", icon: Map, label: "Grid Map" },
  { to: "/simulation", icon: FlaskConical, label: "Simulation" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function AppLayout() {
  const { user, logout, darkMode, toggleDarkMode, alerts, gridHealthScore } = useGrid();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const criticalAlerts = alerts.filter((a) => a.severity === "critical" && !a.acknowledged).length;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-sidebar border-r border-sidebar-border transform transition-transform md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <Zap className="h-7 w-7 text-sidebar-primary" />
            <div>
              <h1 className="font-bold text-sidebar-primary-foreground text-sm">PowerGrid AI</h1>
              <p className="text-[10px] text-sidebar-foreground/60">Failure Prediction Platform</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                {item.label === "Alerts" && criticalAlerts > 0 && (
                  <span className="ml-auto bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {criticalAlerts}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Health Score */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="grid-card bg-sidebar-accent/30 border-sidebar-border">
            <p className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60 mb-1">Grid Health</p>
            <div className="flex items-end gap-2">
              <span className={`kpi-value ${gridHealthScore > 70 ? "text-success" : gridHealthScore > 40 ? "text-warning" : "text-destructive"}`}>
                {gridHealthScore}%
              </span>
            </div>
            <div className="mt-2 h-1.5 bg-sidebar-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  gridHealthScore > 70 ? "bg-success" : gridHealthScore > 40 ? "bg-warning" : "bg-destructive"
                }`}
                style={{ width: `${gridHealthScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* User */}
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-2">
            <Link to="/profile" className="flex items-center gap-2 flex-1 min-w-0" onClick={() => setSidebarOpen(false)}>
              <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center">
                <User className="h-4 w-4 text-sidebar-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-sidebar-foreground truncate">{user?.name || "User"}</p>
                <p className="text-[10px] text-sidebar-foreground/50 capitalize">{user?.role || "engineer"}</p>
              </div>
            </Link>
            <button onClick={toggleDarkMode} className="p-1.5 rounded text-sidebar-foreground/50 hover:text-sidebar-foreground">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button onClick={logout} className="p-1.5 rounded text-sidebar-foreground/50 hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-12 flex items-center gap-3 px-4 border-b border-border bg-card md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-1">
            <Menu className="h-5 w-5" />
          </button>
          <Zap className="h-5 w-5 text-primary" />
          <span className="font-semibold text-sm">PowerGrid AI</span>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
