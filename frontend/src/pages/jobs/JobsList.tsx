import { Link, useNavigate } from "react-router-dom";
import { Jobs, Employees, Notifications, type Job } from "../../services/store";
import { useAuth } from "../../contexts/auth";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui-bits";
import { Eye, Pencil, Trash2, Printer, Search, Plus, Filter } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../utils/utils";

const filters = ["All", "Pending", "Ready for Delivery", "Completed", "Delivered", "Android", "Keypad", "iPhone"] as const;

export function JobsList() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<typeof filters[number]>("All");
  const [tick, setTick] = useState(0);

  const all = Jobs.all();
  const scoped = session?.role === "employee"
    ? all.filter(j => j.assignedEmployeeId === session.userId)
    : session?.role === "customer"
      ? all.filter(j => j.customerId === session.userId)
      : all;

  const visible = useMemo(() => {
    let list = scoped;
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(j =>
        j.jobSheetNo.toLowerCase().includes(s) ||
        j.customerName.toLowerCase().includes(s) ||
        j.customerMobile.includes(s) ||
        j.brand.toLowerCase().includes(s),
      );
    }
    if (filter !== "All") {
      list = list.filter(j =>
        filter === "Pending" ? j.repairStatus === "Pending" :
        filter === "Completed" ? j.repairStatus === "Completed" :
        filter === "Delivered" ? j.deliveryStatus === "Delivered" :
        filter === "Ready for Delivery" ? j.deliveryStatus === "Ready for Delivery" :
        j.mobileType === filter,
      );
    }
    return list;
  }, [scoped, q, filter, tick]);

  const handleDelete = async (j: Job) => {
    if (!confirm(`Delete job ${j.jobSheetNo}?`)) return;
    try {
      await Jobs.remove(j.id);
      await Notifications.push({
        type: "job_deleted",
        title: "Job Deleted",
        message: `${session?.name || "Owner"} deleted Job ${j.jobSheetNo} (${j.brand} ${j.model})`,
        actorName: session?.name,
        actorRole: session?.role,
        jobSheetNo: j.jobSheetNo,
      });
      toast.success("Job deleted");
      setTick(t => t + 1);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete job");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search by sheet no, customer, mobile, brand…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        {session?.role !== "customer" && (
          <Button onClick={() => navigate("/app/jobs/new")}><Plus className="size-4" /> New Job</Button>
        )}
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="size-4 text-muted-foreground shrink-0" />
        {filters.map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap",
              filter === f ? "bg-primary text-primary-foreground border-primary shadow-elegant" : "border-border hover:bg-accent",
            )}>
            {f}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left p-3">Sheet</th>
                <th className="text-left p-3">Customer</th>
                <th className="text-left p-3">Mobile</th>
                <th className="text-left p-3">Device</th>
                <th className="text-left p-3">Fault</th>
                <th className="text-left p-3">New Features</th>
                <th className="text-right p-3">Amount</th>
                <th className="text-left p-3">Repair</th>
                <th className="text-left p-3">Delivery</th>
                <th className="text-left p-3">Employee</th>
                <th className="text-left p-3">Last Updated By</th>
                <th className="text-left p-3">Updated Date</th>
                <th className="text-right p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map(j => {
                const emp = j.assignedEmployeeId ? Employees.byId(j.assignedEmployeeId) : null;
                return (
                  <tr key={j.id} className="border-t border-border hover:bg-accent/30">
                    <td className="p-3 font-mono text-xs">{j.jobSheetNo}</td>
                    <td className="p-3">{j.customerName}</td>
                    <td className="p-3 text-muted-foreground">{j.customerMobile}</td>
                    <td className="p-3">{j.brand} {j.model}</td>
                    <td className="p-3 max-w-[160px] truncate">{j.fault}</td>
                    <td className="p-3 max-w-[160px] truncate text-xs text-muted-foreground">{j.featuresInstalled || "—"}</td>
                    <td className="p-3 text-right font-semibold">₹{j.amount.toLocaleString("en-IN")}</td>
                    <td className="p-3"><StatusBadge status={j.repairStatus} /></td>
                    <td className="p-3"><StatusBadge status={j.deliveryStatus} /></td>
                    <td className="p-3 text-muted-foreground text-xs">{emp?.name ?? "—"}</td>
                    <td className="p-3 text-muted-foreground text-xs">{j.lastUpdatedBy || "—"}</td>
                    <td className="p-3 text-muted-foreground text-xs whitespace-nowrap">{j.lastUpdatedAt ? new Date(j.lastUpdatedAt).toLocaleDateString("en-IN") : "—"}</td>
                    <td className="p-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/app/jobs/${j.id}`} className="p-2 rounded-md hover:bg-accent" title="View"><Eye className="size-4" /></Link>
                        {session?.role !== "customer" && (
                          <>
                            <Link to={`/app/jobs/${j.id}`} className="p-2 rounded-md hover:bg-accent" title="Edit"><Pencil className="size-4" /></Link>
                            <Link to={`/app/jobs/${j.id}?print=1`} className="p-2 rounded-md hover:bg-accent" title="Print"><Printer className="size-4" /></Link>
                          </>
                        )}
                        {session?.role === "owner" && (
                          <button onClick={() => handleDelete(j)} className="p-2 rounded-md hover:bg-destructive/10 text-destructive" title="Delete"><Trash2 className="size-4" /></button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {visible.length === 0 && (
                <tr><td colSpan={14} className="p-8 text-center text-muted-foreground">No jobs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
