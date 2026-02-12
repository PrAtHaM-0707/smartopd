import { supabase } from "@/lib/supabase";
import type { Appointment } from "@/types";

export const appointmentService = {

  async bookAppointment(patientId: string, doctorId: string, departmentId: string, date: string, timeSlot: string): Promise<Appointment> {
    const { data, error } = await supabase
      .from("appointments")
      .insert({
        patient_id: patientId,
        doctor_id: doctorId,
        department_id: departmentId,
        date,
        time_slot: timeSlot,
        status: "scheduled"
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      patientId: data.patient_id,
      doctorId: data.doctor_id,
      departmentId: data.department_id,
      date: data.date,
      timeSlot: data.time_slot,
      status: data.status,
      createdAt: data.created_at
    };
  },

  async getAppointments(doctorId?: string): Promise<Appointment[]> {
    let query = supabase.from("appointments").select("*").order("created_at", { ascending: false });

    if (doctorId) {
      query = query.eq("doctor_id", doctorId);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map(row => ({
      id: row.id,
      patientId: row.patient_id,
      doctorId: row.doctor_id,
      departmentId: row.department_id,
      date: row.date,
      timeSlot: row.time_slot,
      status: row.status as "scheduled" | "completed" | "cancelled" | "no-show",
      createdAt: row.created_at
    }));
  },

  async updateAppointmentStatus(appointmentId: string, status: "scheduled" | "completed" | "cancelled" | "no-show") {
    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", appointmentId);

    if (error) throw error;
  },

  async getAvailableSlots(doctorId: string, date: string): Promise<string[]> {
    // Get all appointments for this doctor on this date
    const { data: appointments } = await supabase
      .from("appointments")
      .select("time_slot")
      .eq("doctor_id", doctorId)
      .eq("date", date)
      .neq("status", "cancelled");

    const bookedSlots = new Set(appointments?.map(a => a.time_slot) || []);

    // Return slots that are not booked
    const allSlots = [
      "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
      "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
      "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM"
    ];

    return allSlots.filter(slot => !bookedSlots.has(slot));
  }
};
