import { supabase } from "@/lib/supabase";
import type { Department, Doctor, TimeSlot } from "@/types";

const SLOTS = [
"09:00 AM","09:30 AM","10:00 AM","10:30 AM",
"11:00 AM","11:30 AM","12:00 PM","12:30 PM",
"02:00 PM","02:30 PM","03:00 PM","03:30 PM"
];

export const departmentService = {
  async getDepartments(): Promise<Department[]> {
    const { data, error } = await supabase.from("departments").select("*").order("name");
    if (error) {
      console.error("Error fetching departments:", error);
      return [];
    }
    return data || [];
  },

  async getDoctors(deptId?: string): Promise<Doctor[]> {
    let q = supabase.from("doctors").select("*");
    if (deptId) q = q.eq("department_id", deptId);
    
    const { data, error } = await q.order("name");
    if (error) {
      console.error("Error fetching doctors:", error);
      return [];
    }
    
    return (data || []).map(row => ({
      id: row.id,
      name: row.name,
      departmentId: row.department_id,
      specialization: row.specialization,
      available: row.available
    }));
  },

  async getTimeSlots(doctorId?: string, date?: string): Promise<TimeSlot[]> {
    // In a real app, you'd check appointments for the doctor on that date
    // For now, we return the static slots but could filter by availability
    if (doctorId && date) {
      // Import appointmentService here to avoid circular dependency
      const { appointmentService } = await import("./appointmentService");
      const availableSlots = await appointmentService.getAvailableSlots(doctorId, date);
      return SLOTS.map((t, i) => ({
        id: `slot-${i}`,
        time: t,
        available: availableSlots.includes(t)
      }));
    }

    return SLOTS.map((t, i) => ({
      id: `slot-${i}`,
      time: t,
      available: true
    }));
  },

  getConsultationTime() {
    return 7; // Estimated minutes per patient
  }
};
