import type { Patient } from "./Patient";

export type { Patient } from "./Patient";
export type { Department } from "./Department";
export type { Doctor } from "./Doctor";
export type { Appointment, TimeSlot } from "./Appointment";
export type { QueueState, QueueEntry } from "./QueueToken";
export type { UserRole, AdminUser } from "./UserRole";
export type { AuditLogEntry } from "./AuditLog";

export interface RegistrationResult {
  success: boolean;
  patient: Patient;
}
