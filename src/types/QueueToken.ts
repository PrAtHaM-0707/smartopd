export interface QueueState {
  currentToken: number;
  waitingCount: number;
  totalRegistered: number;
  estimatedWaitMinutes: number;
  departmentId: string;
  doctorId: string;
}

export interface QueueEntry {
  tokenNumber: number;
  patientName: string;
  type: "walk-in" | "appointment";
  appointmentTime?: string;
  status: "waiting" | "in-progress" | "completed";
  estimatedWaitMinutes: number;
}
