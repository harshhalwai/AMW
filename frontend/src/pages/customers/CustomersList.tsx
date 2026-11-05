import { Customers, Jobs, type Customer } from "../../services/store";
import { useAuth } from "../../contexts/auth";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { StatCard, EmptyState } from "@/components/ui-bits";
import {
  Search, Plus, UserPlus, Mail, Phone, UserCircle, Wrench,
  Pencil, ChevronRight, X, Smartphone
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export function CustomersList() {
  const { session } = useAuth();
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<Customer | null>(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [tick, setTick] = useState(0);

  const list = Customers.all();
  const allJobs = Jobs.all();

  const visible = useMemo(() => {
    return list.filter(
      c =>
        c.name.toLowerCase().includes(q.toLowerCase()) ||
        c.mobile.includes(q) ||
        c.email.toLowerCase().includes(q.toLowerCase()) ||
        c.id.toLowerCase().includes(q.toLowerCase())
    );
  }, [list, q, tick]);

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
    if (!name.trim() || !mobile.trim()) {
      return toast.error("Customer name and mobile number are required");
    }

    try {
      const id = editing?.id || "CUST-" + Math.floor(Math.random() * 900000 + 100000);
      await Customers.upsert({
        pk: editing?.pk || 0,
        id,
        name: name.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
      });

      toast.success(editing?.id ? "Customer profile updated!" : "New customer registered successfully!");
      setEditing(null);
      setTick(t => t + 1);
    } catch (err: any) {
      toast.error(err.message || "Failed to save customer");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FF5733]/15 text-[#FF784E] border border-[#FF5733]/30">
              Customer Directory
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {list.length} clients registered
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Customer Profiles &amp; Ledger
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage customer contact records, service history, and communications.
          </p>
        </div>

        {session?.role !== "customer" && (
          <Button
            onClick={startNew}
            className="bg-[#FF5733] hover:bg-[#FF784E] text-white shadow-elegant rounded-xl text-xs font-bold px-4"
          >
            <Plus className="size-4 mr-1.5" /> Register New Customer
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Registered Clients"
          value={list.length}
          icon={<UserCircle className="size-5" />}
          accent="primary"
          sub="Active customer accounts"
        />
        <StatCard
          label="Total Intake Jobs"
          value={allJobs.length}
          icon={<Wrench className="size-5" />}
          accent="success"
          sub="Lifetime service tickets"
        />
        <StatCard
          label="Repeat Clients"
          value={
            list.filter(c => allJobs.filter(j => j.customerId === c.id || j.customerMobile === c.mobile).length > 1).length
          }
          icon={<Smartphone className="size-5" />}
          accent="primary"
          sub="Multiple devices repaired"
        />
      </div>

      {/* Search Input */}
      <div className="relative bg-card p-3 rounded-2xl border border-border/80">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          className="pl-10 h-10 rounded-xl bg-secondary/50 border-border/60 text-white focus-visible:ring-[#FF5733] text-xs sm:text-sm"
          placeholder="Search by client name, mobile number, email, or Customer ID..."
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Table / Card List (8 or 12 cols) */}
        <div className={editing ? "lg:col-span-8" : "lg:col-span-12"}>
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary/60 border-b border-border/80 text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
                  <tr>
                    <th className="p-3.5">Customer ID</th>
                    <th className="p-3.5">Name</th>
                    <th className="p-3.5">Mobile Number</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5 text-center">Service History</th>
                    {session?.role !== "customer" && <th className="p-3.5 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {visible.map(c => {
                    const clientJobs = allJobs.filter(
                      j => j.customerId === c.id || j.customerMobile === c.mobile
                    );

                    return (
                      <tr key={c.id} className="hover:bg-secondary/30 transition-colors">
                        <td className="p-3.5 font-mono text-[#FF784E] font-bold text-xs">{c.id}</td>
                        <td className="p-3.5 font-bold text-white text-sm">{c.name}</td>
                        <td className="p-3.5 font-mono text-muted-foreground flex items-center gap-1.5">
                          <Phone className="size-3 text-[#FF784E]" /> {c.mobile}
                        </td>
                        <td className="p-3.5 text-muted-foreground">{c.email || "—"}</td>
                        <td className="p-3.5 text-center">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FF5733]/15 text-[#FF784E] border border-[#FF5733]/30">
                            {clientJobs.length} {clientJobs.length === 1 ? "repair" : "repairs"}
                          </span>
                        </td>
                        {session?.role !== "customer" && (
                          <td className="p-3.5 text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => startEdit(c)}
                              className="h-8 rounded-lg border-border text-xs text-white hover:border-[#FF5733]"
                            >
                              <Pencil className="size-3 mr-1" /> Edit
                            </Button>
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
              title="No customer profiles found"
              description="No customers match your search query."
              action={
                <Button onClick={startNew} className="bg-[#FF5733] text-white">
                  <Plus className="size-4 mr-1.5" /> Add Customer
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
                {editing.id ? `Edit Customer Details` : "Add New Customer"}
              </h3>
              <button onClick={() => setEditing(null)} className="p-1 text-muted-foreground hover:text-white">
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={save} className="space-y-3.5 text-xs">
              {editing.id && (
                <div>
                  <Label>Customer ID</Label>
                  <Input value={editing.id} disabled className="mt-1 font-mono text-xs bg-secondary/30" />
                </div>
              )}
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Priya Patel"
                  required
                  className="mt-1 bg-secondary/50 border-border text-white"
                />
              </div>
              <div>
                <Label>Mobile Number *</Label>
                <Input
                  value={mobile}
                  onChange={e => setMobile(e.target.value)}
                  placeholder="e.g. 9812345678"
                  required
                  className="mt-1 bg-secondary/50 border-border text-white font-mono"
                />
              </div>
              <div>
                <Label>Email Address</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="client@gmail.com"
                  className="mt-1 bg-secondary/50 border-border text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditing(null)} className="flex-1 rounded-xl">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-[#FF5733] hover:bg-[#FF784E] text-white rounded-xl font-bold">
                  Save Client
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
