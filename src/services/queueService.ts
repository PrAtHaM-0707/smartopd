import { supabase } from "@/lib/supabase";
import { departmentService } from "./departmentService";
import { auditService } from "./auditService";
import { log, error } from "@/lib/logger";

export const queueService = {

  async getQueueStatus(_: string | undefined, doctorId: string) {
    const { data, error: e } = await supabase
      .from("queue_tokens")
      .select("*")
      .eq("doctor_id", doctorId)
      .neq("status", "completed")
      .order("created_at");

    if (e) {
      error("Error fetching queue status", e);
      return {
        currentToken: 0,
        waitingCount: 0,
        totalRegistered: 0,
        estimatedWaitMinutes: 0,
        departmentId: "",
        doctorId
      };
    }

    const current = data?.find(t => t.status === "in-progress") ?? data?.[0];
    const waiting = data?.filter(t => t.status === "waiting").length ?? 0;

    return {
      currentToken: current?.token_number ?? 0,
      waitingCount: waiting,
      totalRegistered: data?.length ?? 0,
      estimatedWaitMinutes: waiting * departmentService.getConsultationTime(),
      departmentId: "",
      doctorId
    };
  },

  async getQueueEntries(doctorId: string) {
    const { data, error: e } = await supabase
      .from("queue_tokens")
      .select("*, patients(name)")
      .eq("doctor_id", doctorId)
      .neq("status", "completed")
      .order("created_at");

    if (e) {
      error("Error fetching queue entries", e);
      return [];
    }

    return (data || []).map((r, i) => ({
      tokenNumber: r.token_number,
      patientName: (r.patients as unknown as { name: string } | null)?.name ?? "Unknown",
      type: "walk-in" as const,
      status: r.status as "waiting" | "in-progress" | "completed",
      estimatedWaitMinutes: i * departmentService.getConsultationTime(),
    }));
  },

  async callNextPatient(doctorId: string) {
    log("Calling next", doctorId);

    // 1. Mark current in-progress as completed
    await supabase.from("queue_tokens")
      .update({ status: "completed" })
      .eq("doctor_id", doctorId)
      .eq("status", "in-progress");

    // Also update patient status
    const { data: currentPatient } = await supabase
      .from("queue_tokens")
      .select("patient_id")
      .eq("doctor_id", doctorId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (currentPatient) {
      await supabase.from("patients")
        .update({ status: "completed" })
        .eq("id", currentPatient.patient_id);
    }

    // 2. Get next waiting token
    const { data: nextToken } = await supabase.from("queue_tokens")
      .select("*")
      .eq("doctor_id", doctorId)
      .eq("status", "waiting")
      .order("created_at")
      .limit(1)
      .maybeSingle();

    if (nextToken) {
      await supabase.from("queue_tokens")
        .update({ status: "in-progress" })
        .eq("id", nextToken.id);
      
      // Update patient status
      await supabase.from("patients")
        .update({ status: "in-progress" })
        .eq("id", nextToken.patient_id);

      // Log audit
      await auditService.log(
        "CALL_NEXT_PATIENT",
        doctorId,
        `Token ${nextToken.token_number}`,
        `Called next patient in queue`
      );
      
      return { newToken: nextToken.token_number };
    }

    return { newToken: 0 };
  }
};
