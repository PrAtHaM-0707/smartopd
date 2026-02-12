import { supabase } from "@/lib/supabase";
import type { Patient, RegistrationResult } from "@/types";
import { auditService } from "./auditService";
import { log, error } from "@/lib/logger";

export const patientService = {
  async registerPatient(
    name: string,
    phone: string,
    departmentId: string,
    doctorId: string,
    type: "walk-in" | "appointment",
    appointmentTime?: string
  ): Promise<RegistrationResult> {

    log("Registering patient", name);

    const { data: patient, error: e } = await supabase
      .from("patients")
      .insert({
        name,
        phone,
        department_id: departmentId,
        doctor_id: doctorId,
        type,
        appointment_time: appointmentTime,
      })
      .select()
      .single();

    if (e) throw e;

    const token = Math.floor(100 + Math.random() * 900);

    const { error: tokenError } = await supabase.from("queue_tokens").insert({
      patient_id: patient.id,
      doctor_id: doctorId,
      token_number: token,
      status: "waiting",
    });

    if (tokenError) throw tokenError;

    await supabase.from("patients")
      .update({ token_number: token })
      .eq("id", patient.id);

    log("Patient registered", token);

    return {
      success: true,
      patient: mapPatient(patient, token),
    };
  },

  async getPatients(departmentId?: string, doctorId?: string) {
    let query = supabase.from("patients").select("*");
    
    if (departmentId) {
      query = query.eq("department_id", departmentId);
    }
    if (doctorId) {
      query = query.eq("doctor_id", doctorId);
    }
    
    const { data, error: e } = await query.order("registered_at", { ascending: false });
    if (e) {
      error("Error fetching patients", e);
      return [];
    }
    return (data || []).map(row => mapPatient(row));
  },

  async updatePatientStatus(patientId: string, status: "waiting" | "in-progress" | "completed") {
    // Get patient name for audit log
    const { data: patient } = await supabase
      .from("patients")
      .select("name, token_number")
      .eq("id", patientId)
      .single();

    const { error: e } = await supabase
      .from("patients")
      .update({ status })
      .eq("id", patientId);

    if (e) {
      error("Error updating patient status", e);
      throw e;
    }

    // Also update the corresponding queue token status
    await supabase
      .from("queue_tokens")
      .update({ status })
      .eq("patient_id", patientId);

    // Log audit
    if (patient) {
      await auditService.log(
        "UPDATE_PATIENT_STATUS",
        "STAFF",
        `${patient.name} (Token ${patient.token_number})`,
        `Status changed to ${status}`
      );
    }
  }
};

type PatientRow = {
  id: string;
  name: string;
  phone: string;
  token_number: number | null;
  department_id: string;
  doctor_id: string;
  type: "walk-in" | "appointment";
  appointment_time?: string | null;
  status: "waiting" | "in-progress" | "completed";
  registered_at: string;
  sms: boolean;
  whatsapp: boolean;
};

function mapPatient(row: PatientRow, overrideToken?: number): Patient {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    tokenNumber: overrideToken ?? row.token_number ?? 0,
    departmentId: row.department_id,
    doctorId: row.doctor_id,
    type: row.type,
    appointmentTime: row.appointment_time ?? undefined,
    status: row.status,
    registeredAt: row.registered_at,
    notificationPreferences: {
      sms: row.sms,
      whatsapp: row.whatsapp,
    },
  };
}
