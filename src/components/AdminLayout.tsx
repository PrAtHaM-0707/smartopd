import { ReactNode, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Activity, LayoutDashboard, Users, LogOut, FileText, Stethoscope, ClipboardList, UserPlus, Monitor } from "lucide-react";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types";

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
}

const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  SUPER_ADMIN: [
    { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
    { title: "Patients", url: "/admin/patients", icon: Users },
    { title: "Doctors", url: "/admin/doctors", icon: Stethoscope },
    { title: "Audit Logs", url: "/admin/audit-logs", icon: FileText },
  ],
  DOCTOR: [
    { title: "Dashboard", url: "/admin/dashboard", icon: LayoutDashboard },
    { title: "My Queue", url: "/admin/my-queue", icon: ClipboardList },
  ],
  RECEPTIONIST: [
    { title: "Register Patient", url: "/admin/register", icon: UserPlus },
    { title: "Queue Monitor", url: "/admin/queue-monitor", icon: Monitor },
  ],
};

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const role = user?.role ?? "RECEPTIONIST";

  const navItems = useMemo(() => NAV_BY_ROLE[role] || NAV_BY_ROLE.RECEPTIONIST, [role]);

  const handleLogout = () => {
    authService.logout();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-5 border-b border-sidebar-border">
          <Link to="/admin/dashboard" className="flex items-center gap-2 font-bold text-lg">
            <div className="w-8 h-8 rounded-lg gradient-hero flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-sidebar-foreground">SmartOPD</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.url;
            return (
              <Link
                key={item.url}
                to={item.url}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-sidebar-border">
          {user && (
            <div className="px-3 py-2 mb-2">
              <p className="text-xs text-sidebar-foreground/50 truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/40 truncate">{role}</p>
            </div>
          )}
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="h-16 border-b bg-card/80 backdrop-blur-sm flex items-center px-6">
          <h1 className="text-lg font-semibold text-foreground">
            {navItems.find((i) => i.url === location.pathname)?.title ?? "Admin"}
          </h1>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
