import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AdminLayout from "@/components/AdminLayout";
import { patientService } from "@/services/patientService";
import { departmentService } from "@/services/departmentService";
import { Patient, Department, Doctor, TimeSlot } from "@/types";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminRegister = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [visitType, setVisitType] = useState<"walk-in" | "appointment">("walk-in");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Patient | null>(null);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    departmentService.getDepartments().then(setDepartments);
  }, []);

  useEffect(() => {
    if (departmentId) {
      departmentService.getDoctors(departmentId).then(setDoctors);
      setDoctorId("");
    }
  }, [departmentId]);

  useEffect(() => {
    if (doctorId && visitType === "appointment") {
      departmentService.getTimeSlots(doctorId, new Date().toISOString().split("T")[0]).then(setTimeSlots);
      setSelectedSlot("");
    }
  }, [doctorId, visitType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await patientService.registerPatient(name, phone, departmentId, doctorId, visitType, visitType === "appointment" ? selectedSlot : undefined);
      setResult(res.patient);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setPhone("");
    setDepartmentId("");
    setDoctorId("");
    setVisitType("walk-in");
    setSelectedSlot("");
    setResult(null);
  };

  const isFormValid = name && phone && departmentId && doctorId && (visitType === "walk-in" || selectedSlot);

  return (
    <AdminLayout>
      <div className="max-w-md">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <h2 className="text-xl font-semibold text-foreground mb-6">Register Patient</h2>
              <form onSubmit={handleSubmit} className="space-y-5 bg-card p-6 rounded-xl border shadow-card">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="Patient name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Department</Label>
                  <Select value={departmentId} onValueChange={setDepartmentId}>
                    <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {departmentId && (
                  <div className="space-y-2">
                    <Label>Doctor</Label>
                    <Select value={doctorId} onValueChange={setDoctorId}>
                      <SelectTrigger><SelectValue placeholder="Select doctor" /></SelectTrigger>
                      <SelectContent>
                        {doctors.filter((d) => d.available).map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {doctorId && (
                  <div className="space-y-2">
                    <Label>Visit Type</Label>
                    <div className="flex gap-2">
                      <Button type="button" variant={visitType === "walk-in" ? "default" : "outline"} size="sm" className="flex-1" onClick={() => setVisitType("walk-in")}>Walk-in</Button>
                      <Button type="button" variant={visitType === "appointment" ? "default" : "outline"} size="sm" className="flex-1 gap-1" onClick={() => setVisitType("appointment")}><Calendar className="w-3.5 h-3.5" />Appointment</Button>
                    </div>
                  </div>
                )}
                {visitType === "appointment" && doctorId && (
                  <div className="space-y-2">
                    <Label>Time Slot</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((slot) => (
                        <Button key={slot.id} type="button" variant={selectedSlot === slot.time ? "default" : "outline"} size="sm" disabled={!slot.available} onClick={() => setSelectedSlot(slot.time)} className="text-xs">{slot.time}</Button>
                      ))}
                    </div>
                  </div>
                )}
                <Button type="submit" className="w-full gap-2" disabled={loading || !isFormValid}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {loading ? "Registering..." : "Register Patient"}
                </Button>
              </form>
            </motion.div>
          ) : (
            <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-card p-8 rounded-xl border shadow-card">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Registered!</h2>
              <p className="text-muted-foreground mt-2">Token: <span className="text-4xl font-extrabold text-primary">{result.tokenNumber}</span></p>
              {result.appointmentTime && <p className="text-sm text-muted-foreground mt-1">Appointment: {result.appointmentTime}</p>}
              <Button onClick={resetForm} className="mt-6">Register Another</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

export default AdminRegister;
