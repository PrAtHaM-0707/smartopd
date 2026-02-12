export interface AuditLogEntry {
  id: string;
  action: string;
  performedBy: string;
  target: string;
  details: string;
  timestamp: string;
}
