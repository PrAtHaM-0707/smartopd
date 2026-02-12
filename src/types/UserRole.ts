export type UserRole = "SUPER_ADMIN" | "DOCTOR" | "RECEPTIONIST";

export interface AdminUser {
  email: string;
  name: string;
  role: UserRole;
  isAuthenticated: boolean;
}
