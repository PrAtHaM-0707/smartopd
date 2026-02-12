import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { authService } from "@/services/authService";

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

export default AuthGuard;
