import { supabase } from "@/lib/supabase";
import type { AdminUser, UserRole } from "@/types";

const STORAGE_KEY = "smartopd_admin";

export const authService = {
  async register(email: string, password: string, name: string, role: UserRole): Promise<{ success: boolean; user: AdminUser | null }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    });

    if (error || !data.user) {
      return { success: false, user: null };
    }

    const user: AdminUser = {
      email: data.user.email!,
      name,
      role,
      isAuthenticated: true,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

    return { success: true, user };
  },

  async login(email: string, password: string): Promise<{ success: boolean; user: AdminUser | null }> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return { success: false, user: null };
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("name, role")
      .eq("id", data.user.id)
      .single();

    const user: AdminUser = {
      email: data.user.email!,
      name: profile?.name || data.user.email!,
      role: (profile?.role as UserRole) || "RECEPTIONIST",
      isAuthenticated: true,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));

    return { success: true, user };
  },

  async logout() {
    await supabase.auth.signOut();
    localStorage.removeItem(STORAGE_KEY);
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem(STORAGE_KEY);
  },

  getCurrentUser(): AdminUser | null {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data);
  },

  getRole(): UserRole | null {
    return authService.getCurrentUser()?.role ?? null;
  },
};
