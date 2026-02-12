import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Activity } from "lucide-react";

interface PublicLayoutProps {
  children: ReactNode;
}

const PublicLayout = ({ children }: PublicLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-9 h-9 rounded-lg gradient-hero flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-foreground">SmartOPD</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link to="/register" className="text-muted-foreground hover:text-foreground transition-colors">
              Register
            </Link>
            <Link to="/queue" className="text-muted-foreground hover:text-foreground transition-colors">
              Queue Status
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-card py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="w-4 h-4 text-primary" />
              <span>SmartOPD — Digital Queue Management</span>
            </div>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
              <Link to="/register" className="hover:text-foreground transition-colors">Register</Link>
              <Link to="/queue" className="hover:text-foreground transition-colors">Queue</Link>
              <Link to="/admin/login" className="hover:text-foreground transition-colors">Admin</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
