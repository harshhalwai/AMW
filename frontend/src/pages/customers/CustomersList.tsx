import { Customers, type Customer } from "../../services/store";
import { useAuth } from "../../contexts/auth";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Search, Plus, UserPlus, Mail, Phone, UserCircle } from "lucide-react";
import { toast } from "sonner";

export function CustomersList() {
  const { session } = useAuth();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Customer | null>(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [tick, setTick] = useState(0);

  const list = Customers.all();
  const visible = list.filter(c =>
    c.name.toLowerCase().includes(q.toLowerCase()) ||
    c.mobile.includes(q) ||
    c.email.toLowerCase().includes(q.toLowerCase()),
  );

  const startEdit = (c: Customer) => {
    setEditing(c);
    setName(c.name);
    setMobile(c.mobile);
    setEmail(c.email);
  };

  const startNew = () => {
    setEditing({ pk: 0, id: "", name: "", mobile: "", email: "" });
    setName("");
    setMobile("");
    setEmail("");
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !mobile) return toast.error("Name and mobile are required");

    try {
      const id = editing?.id || "CUST-" + Math.floor(Math.random() * 900000 + 100000);
      await Customers.upsert({
        pk: editing?.pk || 0,
        id,
        name,
        mobile,
        email,
      });

      toast.success(editing?.id ? "Customer details updated!" : "New customer registered successfully!");
      setEditing(null);
      setTick(t => t + 1);
    } catch (err: any) {
      toast.error(err.message || "Failed to save customer");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Management</h1>
          <p className="text-sm text-muted-foreground">Register and manage customer profiles</p>
        </div>
        {session?.role !== "customer" && (
          <Button onClick={startNew}><Plus className="size-4" /> New Customer</Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by name, mobile, email…" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 rounded-2xl border border-border bg-card overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="text-left p-3">Customer ID</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Mobile</th>
                  <th className="text-left p-3">Email</th>
                  {session?.role !== "customer" && <th className="text-right p-3">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {visible.map(c => (
                  <tr key={c.id} className="border-t border-border hover:bg-accent/30">
                    <td className="p-3 font-mono text-xs">{c.id}</td>
                    <td className="p-3 font-medium">{c.name}</td>
                    <td className="p-3 text-muted-foreground">{c.mobile}</td>
                    <td className="p-3 text-muted-foreground text-xs">{c.email || "—"}</td>
                    {session?.role !== "customer" && (
                      <td className="p-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => startEdit(c)}>Edit</Button>
                      </td>
                    )}
                  </tr>
                ))}
                {visible.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No customers found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit / New Side Form */}
        {editing && (
          <div className="p-5 rounded-2xl border border-border bg-card h-fit space-y-4 shadow-elegant animate-scale-in">
            <div className="flex items-center gap-2 font-semibold text-primary">
              <UserPlus className="size-4" />
              {editing.id ? `Edit Customer` : "Add New Customer"}
            </div>
            <form onSubmit={save} className="space-y-4">
              {editing.id && (
                <div>
                  <Label>Customer ID</Label>
                  <Input value={editing.id} disabled />
                </div>
              )}
              <div>
                <Label>Full Name *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div>
                <Label>Mobile Number *</Label>
                <Input value={mobile} onChange={e => setMobile(e.target.value)} required />
              </div>
              <div>
                <Label>Email Address</Label>
                <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
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
