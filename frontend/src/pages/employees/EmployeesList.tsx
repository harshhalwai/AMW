import { Employees, Jobs, type Employee } from "../../services/store";
import { useAuth } from "../../contexts/auth";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { StatCard, EmptyState, StatusBadge } from "@/components/ui-bits";
import {
  Search, Plus, UserPlus, Users, Wrench, ShieldAlert, Key, UserMinus,
  CheckCircle2, X, Phone, Mail, MapPin, IndianRupee, Pencil
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../utils/utils";

export function EmployeesList() {
  const { session } = useAuth();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Employee | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Technician");
  const [salary, setSalary] = useState("");
  const [password, setPassword] = useState("");
  const [tick, setTick] = useState(0);

  const list = Employees.all();
  const allJobs = Jobs.all();

  const visible = useMemo(() => {
    return list.filter(
      e =>
        e.name.toLowerCase().includes(q.toLowerCase()) ||
        e.id.toLowerCase().includes(q.toLowerCase()) ||
        e.role.toLowerCase().includes(q.toLowerCase())
    );
  }, [list, q, tick]);

  const totalPayroll = list.reduce((acc, e) => acc + (e.suspended ? 0 : e.salary), 0);
  const activeCount = list.filter(e => !e.suspended).length;

  const startEdit = (e: Employee) => {
    setEditing(e);
    setName(e.name);
    setAddress(e.address || "");
    setMobile(e.mobile);
    setEmail(e.email);
    setRole(e.role);
    setSalary(String(e.salary));
    setPassword("");
  };

  const startNew = () => {
    setEditing({
      pk: 0,
      id: "",
      name: "",
      address: "",
      mobile: "",
      email: "",
      joiningDate: "",
      salary: 0,
      role: "Technician",
    });
    setName("");
    setAddress("");
    setMobile("");
    setEmail("");
    setRole("Technician");
    setSalary("");
    setPassword("");
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile || !salary || !role) {
      return toast.error("Please fill in all required fields (Name, Mobile, Role, Salary)");
    }

    try {
      const isNew = !editing?.id;
      const finalId = editing?.id || "EMP" + Math.floor(Math.random() * 900 + 100);

      await Employees.upsert({
        ...editing!,
        id: finalId,
        name,
        address,
        mobile,
        email,
        role,
        salary: Number(salary),
        password: password || undefined,
      });

      toast.success(isNew ? `Technician account ${finalId} created!` : "Staff profile updated successfully!");
      setEditing(null);
      setTick(t => t + 1);
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    }
  };

  const toggleSuspension = async (emp: Employee) => {
    try {
      const nextState = !emp.suspended;
      await Employees.suspend(emp.pk, nextState);
      toast.success(nextState ? `${emp.name} suspended.` : `${emp.name} unsuspended.`);
      setTick(t => t + 1);
    } catch (err: any) {
      toast.error(err.message || "Failed to update suspension status");
    }
  };

  const handleDelete = async (emp: Employee) => {
    if (!confirm(`Are you absolutely sure you want to delete technician account ${emp.id}?`)) return;
    try {
      await Employees.remove(emp.pk);
      toast.success("Employee account removed");
      setTick(t => t + 1);
    } catch (err: any) {
      toast.error(err.message || "Failed to remove employee");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FF5733]/15 text-[#FF784E] border border-[#FF5733]/30">
              Staff Directory
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {list.length} technicians registered
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Technician &amp; Staff Management
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Configure employee roles, manage credentials, benchmark repair performance, and track payroll.
          </p>
        </div>

        {session?.role === "owner" && (
          <Button
            onClick={startNew}
            className="bg-[#FF5733] hover:bg-[#FF784E] text-white shadow-elegant rounded-xl text-xs font-bold px-4"
          >
            <Plus className="size-4 mr-1.5" /> Add Staff Member
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Active Technicians"
          value={activeCount}
          icon={<Users className="size-5" />}
          accent="primary"
          sub={`${list.length - activeCount} suspended`}
        />
        <StatCard
          label="Monthly Staff Payroll"
          value={`₹${totalPayroll.toLocaleString("en-IN")}`}
          icon={<IndianRupee className="size-5" />}
          accent="success"
          sub="Active salaries total"
        />
        <StatCard
          label="Total Serviced Devices"
          value={allJobs.length}
          icon={<Wrench className="size-5" />}
          accent="primary"
          sub="Store repair volume"
        />
      </div>

      {/* Search Bar */}
      <div className="relative bg-card p-3 rounded-2xl border border-border/80">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          className="pl-10 h-10 rounded-xl bg-secondary/50 border-border/60 text-white focus-visible:ring-[#FF5733] text-xs sm:text-sm"
          placeholder="Search staff by name, technician role, ID (e.g. EMP001)..."
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Table View (8 or 12 cols) */}
        <div className={editing ? "lg:col-span-8" : "lg:col-span-12"}>
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary/60 border-b border-border/80 text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                  <tr>
                    <th className="p-3.5">ID</th>
                    <th className="p-3.5">Technician</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Assigned Jobs</th>
                    <th className="p-3.5">Salary</th>
                    <th className="p-3.5">Status</th>
                    {session?.role === "owner" && <th className="p-3.5 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {visible.map(emp => {
                    const assignedJobs = allJobs.filter(j => j.assignedEmployeeId === emp.id);
                    const completedJobs = assignedJobs.filter(j => j.repairStatus === "Completed").length;

                    return (
                      <tr key={emp.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="p-3.5 font-mono text-xs text-[#FF784E] font-bold">{emp.id}</td>
                        <td className="p-3.5 font-bold text-white text-sm">
                          <div>{emp.name}</div>
                          <div className="text-[11px] text-muted-foreground font-mono font-normal">{emp.mobile}</div>
                        </td>
                        <td className="p-3.5 text-muted-foreground font-medium">{emp.role}</td>
                        <td className="p-3.5">
                          <span className="font-mono text-white font-bold">{completedJobs}</span>
                          <span className="text-muted-foreground text-[10px]"> / {assignedJobs.length} completed</span>
                        </td>
                        <td className="p-3.5 font-bold font-mono text-white">₹{emp.salary.toLocaleString("en-IN")}</td>
                        <td className="p-3.5">
                          {emp.suspended ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-500/15 text-red-400 border border-red-500/30">
                              Suspended
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                              Active
                            </span>
                          )}
                        </td>
                        {session?.role === "owner" && (
                          <td className="p-3.5 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => startEdit(emp)}
                                className="h-8 rounded-lg border-border text-xs text-white hover:border-[#FF5733]"
                              >
                                <Pencil className="size-3 mr-1" /> Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toggleSuspension(emp)}
                                className={cn(
                                  "h-8 rounded-lg border-border text-xs",
                                  emp.suspended ? "text-emerald-400 hover:border-emerald-500" : "text-amber-400 hover:border-amber-500"
                                )}
                              >
                                {emp.suspended ? "Activate" : "Suspend"}
                              </Button>
                              <button
                                onClick={() => handleDelete(emp)}
                                className="p-1.5 rounded-lg border border-border hover:bg-red-500/20 hover:border-red-500 text-muted-foreground hover:text-red-400"
                                title="Remove staff"
                              >
                                <UserMinus className="size-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {visible.length === 0 && (
            <EmptyState
              title="No technician profiles found"
              description="No staff members match your search query."
              action={
                <Button onClick={startNew} className="bg-[#FF5733] text-white">
                  <Plus className="size-4 mr-1.5" /> Add Staff Member
                </Button>
              }
            />
          )}
        </div>

        {/* Edit / Register Form Card */}
        {editing && (
          <div className="lg:col-span-4 rounded-2xl border border-border bg-card p-5 h-fit space-y-4 shadow-elegant animate-scale-in">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <UserPlus className="size-4 text-[#FF5733]" />
                {editing.id ? `Edit Staff Profile` : "Register Technician"}
              </h3>
              <button onClick={() => setEditing(null)} className="p-1 text-muted-foreground hover:text-white">
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={save} className="space-y-3.5 text-xs">
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Suresh Kumar"
                  required
                  className="mt-1 bg-secondary/50 border-border text-white"
                />
              </div>

              <div>
                <Label>Designation / Role *</Label>
                <Input
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="Senior Motherboard Tech / Screen Specialist"
                  required
                  className="mt-1 bg-secondary/50 border-border text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <Label>Salary (₹) *</Label>
                  <Input
                    type="number"
                    value={salary}
                    onChange={e => setSalary(e.target.value)}
                    placeholder="25000"
                    required
                    className="mt-1 font-mono bg-secondary/50 border-border text-white"
                  />
                </div>
                <div>
                  <Label>Mobile Number *</Label>
                  <Input
                    value={mobile}
                    onChange={e => setMobile(e.target.value)}
                    placeholder="9812345678"
                    required
                    className="mt-1 font-mono bg-secondary/50 border-border text-white"
                  />
                </div>
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="technician@email.com"
                  className="mt-1 bg-secondary/50 border-border text-white"
                />
              </div>

              <div>
                <Label>Residential Address</Label>
                <Input
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="Local city address..."
                  className="mt-1 bg-secondary/50 border-border text-white"
                />
              </div>

              <div>
                <Label>{editing.id ? "New Password (Leave blank to keep current)" : "Login Password *"}</Label>
                <Input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required={!editing.id}
                  placeholder={editing.id ? "••••••••" : "Temporary password"}
                  className="mt-1 bg-secondary/50 border-border text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditing(null)} className="flex-1 rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-[#FF5733] hover:bg-[#FF784E] text-white rounded-xl font-bold">
                  Save Account
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
