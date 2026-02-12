import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Ticket, Users, ArrowRight, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import AdminLayout from "@/components/AdminLayout";
import { queueService } from "@/services/queueService";
import { departmentService } from "@/services/departmentService";
import { QueueState, Department, Doctor, QueueEntry } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminDashboard = () => {
  const [queue, setQueue] = useState<QueueState | null>(null);
  const [entries, setEntries] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [calling, setCalling] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedDoc, setSelectedDoc] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    departmentService.getDepartments().then((depts) => {
      setDepartments(depts);
      if (depts.length > 0) setSelectedDept(depts[0].id);
    });
  }, []);

  useEffect(() => {
    if (selectedDept) {
      departmentService.getDoctors(selectedDept).then((docs) => {
        setDoctors(docs);
        if (docs.length > 0) {
          setSelectedDoc(docs[0].id);
        } else {
          setSelectedDoc("");
        }
      });
    }
  }, [selectedDept]);

  const fetchQueue = useCallback(async () => {
    if (!selectedDoc) return;
    const [data, queueEntries] = await Promise.all([
      queueService.getQueueStatus(selectedDept, selectedDoc),
      queueService.getQueueEntries(selectedDoc),
    ]);
    setQueue(data);
    setEntries(queueEntries);
    setLoading(false);
  }, [selectedDept, selectedDoc]);

  useEffect(() => {
    if (selectedDoc) {
      setLoading(true);
      fetchQueue();
    } else {
      setQueue(null);
      setEntries([]);
      setLoading(false);
    }
  }, [selectedDoc, fetchQueue]);

  const handleCallNext = async () => {
    setCalling(true);
    const { newToken } = await queueService.callNextPatient(selectedDoc);
    toast({
      title: `Token ${newToken} called`,
      description: "The next patient has been notified.",
    });
    await fetchQueue();
    setCalling(false);
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">Overview</h2>
          <div className="flex gap-3">
            <Select value={selectedDept} onValueChange={setSelectedDept}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDoc} onValueChange={setSelectedDoc}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
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
                  Waiting Patients
                </div>
                <p className="text-5xl font-extrabold text-foreground">{queue.waitingCount}</p>
              </div>

              <div className="bg-card border rounded-xl p-6 shadow-card">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Clock className="w-4 h-4 text-info" />
                  Est. Wait Time
                </div>
                <p className="text-5xl font-extrabold text-foreground">
                  {queue.estimatedWaitMinutes}
                  <span className="text-lg text-muted-foreground ml-1">min</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <Button onClick={handleCallNext} size="lg" className="gap-2" disabled={calling}>
                {calling ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {calling ? "Calling..." : "Call Next Patient"}
              </Button>
            </div>

            {/* Queue table */}
            {entries.length > 0 && (
              <div className="bg-card border rounded-xl shadow-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">Token</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Est. Wait</TableHead>
                      <TableHead className="w-28">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry) => (
                      <TableRow key={entry.tokenNumber}>
                        <TableCell className="font-bold text-primary">{entry.tokenNumber}</TableCell>
                        <TableCell className="font-medium">{entry.patientName}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={entry.type === "appointment" ? "bg-info/10 text-info border-info/20" : "bg-muted text-muted-foreground"}>
                            {entry.type === "appointment" ? "Appointment" : "Walk-in"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{entry.appointmentTime || "—"}</TableCell>
                        <TableCell className="text-muted-foreground">{entry.estimatedWaitMinutes} min</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            entry.status === "in-progress" ? "bg-info/10 text-info border-info/20" :
                            entry.status === "completed" ? "bg-success/10 text-success border-success/20" :
                            "bg-warning/10 text-warning border-warning/20"
                          }>
                            {entry.status === "in-progress" ? "In Progress" : entry.status === "completed" ? "Completed" : "Waiting"}
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

export default AdminDashboard;
