import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Ticket, Users, RefreshCw, Clock } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { queueService } from "@/services/queueService";
import { departmentService } from "@/services/departmentService";
import { QueueState, Department, Doctor } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const QueueMonitor = () => {
  const [queue, setQueue] = useState<QueueState | null>(null);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedDoc, setSelectedDoc] = useState("");

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
    const data = await queueService.getQueueStatus(selectedDept, selectedDoc);
    setQueue(data);
    setLoading(false);
  }, [selectedDept, selectedDoc]);

  useEffect(() => {
    if (selectedDoc) {
      setLoading(true);
      fetchQueue();
      const interval = setInterval(fetchQueue, 5000);
      return () => clearInterval(interval);
    } else {
      setQueue(null);
      setLoading(false);
    }
  }, [selectedDoc, fetchQueue]);

  return (
    <AdminLayout>
      <div className="max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Queue Monitor</h2>
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <RefreshCw className="w-3 h-3 animate-spin text-primary" />
              Auto-updating every 5 seconds
            </p>
          </div>
          <div className="flex gap-3">
            <Select value={selectedDept} onValueChange={setSelectedDept}>
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDoc} onValueChange={setSelectedDoc}>
              <SelectTrigger className="w-[180px]">
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
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-xl" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-28 rounded-xl" />
              <Skeleton className="h-28 rounded-xl" />
            </div>
          </div>
        ) : queue ? (
          <div className="space-y-4">
            <motion.div
              key={queue.currentToken}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-card border rounded-xl p-8 text-center shadow-card"
            >
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-2">
                <Ticket className="w-4 h-4 text-primary" />
                Now Serving
              </div>
              <p className="text-7xl font-extrabold text-primary animate-pulse-soft">{queue.currentToken}</p>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border rounded-xl p-6 text-center shadow-card">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-1">
                  <Users className="w-4 h-4 text-warning" />
                  Waiting
                </div>
                <p className="text-4xl font-bold text-foreground">{queue.waitingCount}</p>
              </div>
              <div className="bg-card border rounded-xl p-6 text-center shadow-card">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-1">
                  <Clock className="w-4 h-4 text-info" />
                  Est. Wait
                </div>
                <p className="text-4xl font-bold text-foreground">{queue.estimatedWaitMinutes}<span className="text-lg text-muted-foreground ml-1">min</span></p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </AdminLayout>
  );
};

export default QueueMonitor;
