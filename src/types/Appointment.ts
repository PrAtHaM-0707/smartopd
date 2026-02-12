export interface TimeSlot {
  id: string;
  time: string; // e.g. "09:00 AM"
  available: boolean;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  departmentId: string;
  date: string;
  timeSlot: string;
  status: "scheduled" | "completed" | "cancelled" | "no-show";
  createdAt: string;
}
