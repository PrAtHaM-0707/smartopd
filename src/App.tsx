import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Index from "./pages/Index";
import Register from "./pages/Register";
import QueueStatus from "./pages/QueueStatus";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPatients from "./pages/AdminPatients";
import AdminDoctors from "./pages/AdminDoctors";
import AdminAuditLogs from "./pages/AdminAuditLogs";
import DoctorMyQueue from "./pages/DoctorMyQueue";
import QueueMonitor from "./pages/QueueMonitor";
import AdminRegister from "./pages/AdminRegister";
import AdminUserRegister from "./pages/AdminUserRegister";
import AuthGuard from "./components/AuthGuard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/register" element={<Register />} />
            <Route path="/queue" element={<QueueStatus />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={<AuthGuard><AdminDashboard /></AuthGuard>}
            />
            <Route
              path="/admin/patients"
              element={<AuthGuard><AdminPatients /></AuthGuard>}
            />
            <Route
              path="/admin/doctors"
              element={<AuthGuard><AdminDoctors /></AuthGuard>}
            />
            <Route
              path="/admin/audit-logs"
              element={<AuthGuard><AdminAuditLogs /></AuthGuard>}
            />
            <Route
              path="/admin/my-queue"
              element={<AuthGuard><DoctorMyQueue /></AuthGuard>}
            />
            <Route
              path="/admin/queue-monitor"
              element={<AuthGuard><QueueMonitor /></AuthGuard>}
            />
            <Route
              path="/admin/register"
              element={<AuthGuard><AdminRegister /></AuthGuard>}
            />
            <Route
              path="/admin/user-register"
              element={<AuthGuard><AdminUserRegister /></AuthGuard>}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
