import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { patientService } from "@/services/patientService";
import { departmentService } from "@/services/departmentService";
import { Patient, Department, Doctor } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const statusConfig = {
  waiting: { label: "Waiting", className: "bg-warning/10 text-warning border-warning/20" },
  "in-progress": { label: "In Progress", className: "bg-info/10 text-info border-info/20" },
  completed: { label: "Completed", className: "bg-success/10 text-success border-success/20" },
};

const AdminPatients = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filterDept, setFilterDept] = useState<string>("all");
  const [filterDoc, setFilterDoc] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    departmentService.getDepartments().then(setDepartments);
    departmentService.getDoctors().then(setDoctors);
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    const data = await patientService.getPatients(
      filterDept !== "all" ? filterDept : undefined,
      filterDoc !== "all" ? filterDoc : undefined
    );
    setPatients(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPatients();
  }, [filterDept, filterDoc]);

  const handleStatusChange = async (patientId: string, newStatus: Patient["status"]) => {
    await patientService.updatePatientStatus(patientId, newStatus);
    toast({ title: "Status updated", description: `Patient status changed to ${newStatus}.` });
    fetchPatients();
  };

  const getDeptName = (id: string) => departments.find((d) => d.id === id)?.name ?? id;
  const getDocName = (id: string) => doctors.find((d) => d.id === id)?.name ?? id;

  return (
    <AdminLayout>
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Patient List
            {!loading && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({patients.length} total)
              </span>
            )}
          </h2>
          <div className="flex gap-3">
            <Select value={filterDept} onValueChange={setFilterDept}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterDoc} onValueChange={setFilterDoc}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Doctors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Doctors</SelectItem>
                {doctors
                  .filter((d) => filterDept === "all" || d.departmentId === filterDept)
                  .map((d) => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : patients.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground bg-card border rounded-xl">
            <p className="text-lg font-medium">No patients found</p>
            <p className="text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="bg-card border rounded-xl shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Token</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="w-32">Status</TableHead>
                  <TableHead className="w-40">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => {
                  const status = statusConfig[patient.status];
                  return (
                    <TableRow key={patient.id}>
                      <TableCell className="font-bold text-primary">
                        {patient.tokenNumber}
                      </TableCell>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell className="text-muted-foreground">{patient.phone}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{getDeptName(patient.departmentId)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{getDocName(patient.doctorId)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={patient.type === "appointment" ? "bg-info/10 text-info border-info/20" : "bg-muted text-muted-foreground"}>
                          {patient.type === "appointment" ? "Appt" : "Walk-in"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={status.className}>
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {patient.status === "waiting" && (
                            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleStatusChange(patient.id, "in-progress")}>
                              Start
                            </Button>
                          )}
                          {patient.status === "in-progress" && (
                            <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => handleStatusChange(patient.id, "completed")}>
                              Complete
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPatients;
