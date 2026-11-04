import { Employees, type Employee } from "../../services/store";
import { useAuth } from "../../contexts/auth";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Plus, UserPlus, ShieldAlert, Key, UserMinus } from "lucide-react";
import { toast } from "sonner";

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
  const visible = list.filter(e =>
    e.name.toLowerCase().includes(q.toLowerCase()) ||
    e.id.toLowerCase().includes(q.toLowerCase()) ||
    e.role.toLowerCase().includes(q.toLowerCase()),
  );

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
    setEditing({ pk: 0, id: "", name: "", address: "", mobile: "", email: "", joiningDate: "", salary: 0, role: "Technician" });
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
    if (!name || !mobile || !salary || !role) return toast.error("Please fill in all required fields");

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

      toast.success(isNew ? `Employee account ${finalId} created!` : "Employee profile updated successfully!");
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
      toast.success(nextState ? `${emp.name} suspended successfully.` : `${emp.name} unsuspended successfully.`);
      setTick(t => t + 1);
    } catch (err: any) {
      toast.error(err.message || "Failed to update suspension status");
    }
  };

  const handleDelete = async (emp: Employee) => {
    if (!confirm(`Are you absolutely sure you want to delete employee account ${emp.id}?`)) return;
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
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Staff Management</h1>
          <p className="text-sm text-muted-foreground">Manage system access roles, salaries, and details</p>
        </div>
        {session?.role === "owner" && (
          <Button onClick={startNew}><Plus className="size-4" /> Add Staff Member</Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by name, role, ID…" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl border border-border bg-card overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left p-3">Employee ID</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Role</th>
                  <th className="text-right p-3">Salary</th>
                  <th className="text-left p-3">Status</th>
                  {session?.role === "owner" && <th className="text-right p-3">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {visible.map(emp => (
                  <tr key={emp.id} className="border-t border-border hover:bg-accent/30">
                    <td className="p-3 font-mono text-xs">{emp.id}</td>
                    <td className="p-3 font-semibold">{emp.name}</td>
                    <td className="p-3 text-muted-foreground text-xs">{emp.role}</td>
                    <td className="p-3 text-right">₹{emp.salary.toLocaleString("en-IN")}</td>
                    <td className="p-3">
                      {emp.suspended ? (
                        <span className="px-2 py-0.5 bg-destructive/15 text-destructive rounded-full text-xs font-semibold">Suspended</span>
                      ) : (
                        <span className="px-2 py-0.5 bg-success/15 text-success rounded-full text-xs font-semibold">Active</span>
                      )}
                    </td>
                    {session?.role === "owner" && (
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button variant="ghost" size="sm" onClick={() => startEdit(emp)}>Edit</Button>
                          <Button variant="outline" size="sm" onClick={() => toggleSuspension(emp)} className={emp.suspended ? "text-success" : "text-warning"}>
                            {emp.suspended ? "Activate" : "Suspend"}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(emp)} className="text-destructive hover:bg-destructive/10"><UserMinus className="size-3.5" /></Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No employee records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit / Add employee Form */}
        {editing && (
          <div className="p-5 rounded-2xl border border-border bg-card h-fit space-y-4 shadow-elegant animate-scale-in">
            <div className="flex items-center gap-2 font-semibold text-primary">
              <UserPlus className="size-4" />
              {editing.id ? `Edit Profile` : "Register Employee"}
            </div>
            <form onSubmit={save} className="space-y-4">
              <div>
                <Label>Full Name *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div>
                <Label>Role *</Label>
                <Input value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Technician, Senior Repairer" required />
              </div>
              <div>
                <Label>Monthly Salary (₹) *</Label>
                <Input type="number" value={salary} onChange={e => setSalary(e.target.value)} required />
              </div>
              <div>
                <Label>Mobile Number *</Label>
                <Input value={mobile} onChange={e => setMobile(e.target.value)} required />
              </div>
              <div>
                <Label>Email Address</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div>
                <Label>Residential Address</Label>
                <Input value={address} onChange={e => setAddress(e.target.value)} />
              </div>
              <div>
                <Label>{editing.id ? "New Password (Leave blank to keep current)" : "Password"}</Label>
                <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required={!editing.id} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Save</Button>
                <Button type="button" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
