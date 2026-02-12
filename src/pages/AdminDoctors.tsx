import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { departmentService } from "@/services/departmentService";
import { Department, Doctor } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      departmentService.getDoctors(),
      departmentService.getDepartments(),
    ]).then(([docs, depts]) => {
      setDoctors(docs);
      setDepartments(depts);
      setLoading(false);
    });
  }, []);

  const getDeptName = (id: string) => departments.find((d) => d.id === id)?.name ?? id;

  return (
    <AdminLayout>
      <div className="max-w-5xl">
        <h2 className="text-xl font-semibold text-foreground mb-6">
          Doctors
          {!loading && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({doctors.length} total)
            </span>
          )}
        </h2>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="bg-card border rounded-xl shadow-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {doctors.map((doctor) => (
                  <TableRow key={doctor.id}>
                    <TableCell className="font-medium">{doctor.name}</TableCell>
                    <TableCell className="text-muted-foreground">{getDeptName(doctor.departmentId)}</TableCell>
                    <TableCell className="text-muted-foreground">{doctor.specialization}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={doctor.available ? "bg-success/10 text-success border-success/20" : "bg-destructive/10 text-destructive border-destructive/20"}>
                        {doctor.available ? "Available" : "Unavailable"}
                      </Badge>
                    </TableCell>
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

export default AdminDoctors;
