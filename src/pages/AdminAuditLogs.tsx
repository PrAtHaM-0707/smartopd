import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { auditService } from "@/services/auditService";
import { AuditLogEntry } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auditService.getAuditLog().then((data) => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
      " " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Audit Logs
          {!loading && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({logs.length} entries)
            </span>
          )}
        </h2>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground bg-card border rounded-xl">
            <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-lg font-medium">No audit logs</p>
            <p className="text-sm mt-1">Actions will appear here once activity occurs</p>
          </div>
        ) : (
          <div className="bg-card border rounded-xl shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-44">Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Performed By</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-muted-foreground text-sm">{formatDate(log.timestamp)}</TableCell>
                    <TableCell className="font-medium">{log.action}</TableCell>
                    <TableCell className="text-muted-foreground">{log.performedBy}</TableCell>
                    <TableCell className="text-muted-foreground">{log.target}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{log.details}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminAuditLogs;
