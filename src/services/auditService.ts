import { supabase } from "@/lib/supabase";
import type { AuditLogEntry } from "@/types";

export const auditService = {

  async log(action: string, by: string, target: string, details: string) {
    await supabase.from("audit_logs").insert({
      action,
      performed_by: by,
      target,
      details
    });
  },

  async getAuditLog(): Promise<AuditLogEntry[]> {
    const { data } = await supabase.from("audit_logs").select("*").order("timestamp", { ascending: false });
    return (data || []).map(row => ({
      id: row.id,
      action: row.action,
      performedBy: row.performed_by,
      target: row.target,
      details: row.details,
      timestamp: row.timestamp
    }));
  }
};
