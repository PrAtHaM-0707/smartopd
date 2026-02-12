export interface Patient {
  id: string;
  name: string;
  phone: string;
  tokenNumber: number;
  departmentId: string;
  doctorId: string;
  type: "walk-in" | "appointment";
  appointmentTime?: string;
  status: "waiting" | "in-progress" | "completed";
  registeredAt: string;
  notificationPreferences: {
    sms: boolean;
    whatsapp: boolean;
  };
}
