import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Ticket, ArrowRight, Loader2, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AdminLayout from "@/components/AdminLayout";
import { queueService } from "@/services/queueService";
import { authService } from "@/services/authService";
import { QueueState, QueueEntry } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const DoctorMyQueue = () => {
  const [queue, setQueue] = useState<QueueState | null>(null);
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [calling, setCalling] = useState(false);
  const { toast } = useToast();

  // TEMP doctor mapping
  const doctorId =
    authService.getCurrentUser()?.email?.includes("doc-5")
      ? "doc-5"
      : authService.getCurrentUser()?.email?.includes("doc-4")
      ? "doc-4"
      : "doc-1";

  const fetchQueue = useCallback(async () => {
    const [data, queueEntries] = await Promise.all([
      queueService.getQueueStatus(undefined, doctorId),
      queueService.getQueueEntries(doctorId),
    ]);

    setQueue(data);
    setEntries(queueEntries);
    setLoading(false);
  }, [doctorId]);

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, [fetchQueue]);

  const handleCallNext = async () => {
    setCalling(true);
    const { newToken } = await queueService.callNextPatient(doctorId);
    toast({ title: `Token ${newToken} called`, description: "Next patient notified." });
    await fetchQueue();
    setCalling(false);
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl">
        <h2 className="text-xl font-semibold text-foreground mb-6">My Queue</h2>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-4">
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
            <Skeleton className="h-36 rounded-xl" />
          </div>
        ) : queue ? (
          <>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <motion.div
                key={queue.currentToken}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-card border rounded-xl p-6 shadow-card"
              >
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Ticket className="w-4 h-4 text-primary" />
                  Current Token
                </div>
                <p className="text-5xl font-extrabold text-primary">{queue.currentToken}</p>
              </motion.div>

              <div className="bg-card border rounded-xl p-6 shadow-card">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Users className="w-4 h-4 text-warning" />
                  Waiting
                </div>
                <p className="text-5xl font-extrabold text-foreground">{queue.waitingCount}</p>
              </div>

              <div className="bg-card border rounded-xl p-6 shadow-card">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Clock className="w-4 h-4 text-info" />
                  Est. Wait
                </div>
                <p className="text-5xl font-extrabold text-foreground">
                  {queue.estimatedWaitMinutes}
                  <span className="text-lg text-muted-foreground ml-1">min</span>
                </p>
              </div>
            </div>

            <Button onClick={handleCallNext} size="lg" className="gap-2 mb-6" disabled={calling}>
              {calling ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {calling ? "Calling..." : "Call Next Patient"}
            </Button>

            {entries.length > 0 && (
              <div className="bg-card border rounded-xl shadow-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Token</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Wait</TableHead>
                      <TableHead className="w-28">Status</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry.tokenNumber}>
                        <TableCell className="font-bold text-primary">{entry.tokenNumber}</TableCell>
                        <TableCell className="font-medium">{entry.patientName}</TableCell>

                        <TableCell>
                          <Badge variant="outline">
                            {entry.type === "appointment" ? "Appt" : "Walk-in"}
                          </Badge>
                        </TableCell>

                        <TableCell>{entry.estimatedWaitMinutes} min</TableCell>

                        <TableCell>
                          <Badge variant="outline">
                            {entry.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default DoctorMyQueue;
