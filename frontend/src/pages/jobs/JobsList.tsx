import { Link, useNavigate } from "react-router-dom";
import { Jobs, Employees, Notifications, type Job } from "../../services/store";
import { useAuth } from "../../contexts/auth";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StatusBadge, EmptyState } from "@/components/ui-bits";
import {
  Eye, Pencil, Trash2, Printer, Search, Plus, Filter, Smartphone,
  FileSpreadsheet, Download, RefreshCw, Calendar, ChevronRight, User
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../utils/utils";

const filters = [
  "All",
  "Pending",
  "In Progress",
  "Ready for Delivery",
  "Completed",
  "Delivered",
  "Android",
  "Keypad",
  "iPhone",
] as const;

export function JobsList() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<typeof filters[number]>("All");
  const [tick, setTick] = useState(0);

  const all = Jobs.all();
  const scoped =
    session?.role === "employee"
      ? all.filter(j => j.assignedEmployeeId === session.userId)
      : session?.role === "customer"
      ? all.filter(j => j.customerId === session.userId)
      : all;

  const visible = useMemo(() => {
    let list = scoped;
    if (q.trim()) {
      const s = q.toLowerCase();
      list = list.filter(
        j =>
          j.jobSheetNo.toLowerCase().includes(s) ||
          j.customerName.toLowerCase().includes(s) ||
          j.customerMobile.includes(s) ||
          j.brand.toLowerCase().includes(s) ||
          j.model.toLowerCase().includes(s)
      );
    }
    if (filter !== "All") {
      list = list.filter(j => {
        if (filter === "Pending") return j.repairStatus === "Pending";
        if (filter === "In Progress") return j.repairStatus === "In Progress";
        if (filter === "Completed") return j.repairStatus === "Completed";
        if (filter === "Delivered") return j.deliveryStatus === "Delivered";
        if (filter === "Ready for Delivery") return j.deliveryStatus === "Ready for Delivery";
        return j.mobileType === filter;
      });
    }
    return list;
  }, [scoped, q, filter, tick]);

  const handleDelete = async (j: Job) => {
    if (!confirm(`Are you sure you want to delete job sheet ${j.jobSheetNo}?`)) return;
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
      toast.success(`Job ${j.jobSheetNo} deleted`);
      setTick(t => t + 1);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete job");
    }
  };

  const exportCSV = () => {
    const headers = ["Sheet No", "Date", "Customer", "Mobile", "Device", "Fault", "Amount", "Repair Status", "Delivery Status"];
    const rows = visible.map(j => [
      j.jobSheetNo,
      j.jobDate,
      `"${j.customerName}"`,
      j.customerMobile,
      `"${j.brand} ${j.model}"`,
      `"${j.fault}"`,
      j.amount,
      j.repairStatus,
      j.deliveryStatus,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AMW_Jobs_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Exported CSV successfully");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FF5733]/15 text-[#FF784E] border border-[#FF5733]/30">
              Service Registry
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              {visible.length} records found
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Repair Orders &amp; Intake Sheets
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage device intake tickets, technician assignments, diagnostic logs, and customer deliveries.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="border-border bg-card text-white hover:border-[#FF5733] rounded-xl text-xs"
          >
            <Download className="size-3.5 mr-1.5" /> Export CSV
          </Button>

          {session?.role !== "customer" && (
            <Button
              onClick={() => navigate("/app/jobs/new")}
              size="sm"
              className="bg-[#FF5733] hover:bg-[#FF784E] text-white shadow-elegant rounded-xl text-xs font-bold px-4"
            >
              <Plus className="size-4 mr-1.5" /> New Repair Job
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3 bg-card p-3 rounded-2xl border border-border/80">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            className="pl-10 h-10 rounded-xl bg-secondary/50 border-border/60 text-white focus-visible:ring-[#FF5733] text-xs sm:text-sm"
            placeholder="Search by sheet number, customer name, mobile, device brand or model..."
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <Filter className="size-3.5 text-muted-foreground shrink-0 ml-1 hidden sm:block" />
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap",
                filter === f
                  ? "bg-[#FF5733] text-white border-[#FF5733] shadow-elegant"
                  : "bg-secondary/40 text-muted-foreground border-border/70 hover:text-white hover:border-border"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block rounded-2xl border border-border bg-card overflow-hidden shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/60 border-b border-border/80 text-[11px] uppercase tracking-wider text-muted-foreground font-bold">
              <tr>
                <th className="p-3.5">Sheet #</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Mobile</th>
                <th className="p-3.5">Device</th>
                <th className="p-3.5">Reported Fault</th>
                <th className="p-3.5 text-right">Amount</th>
                <th className="p-3.5">Repair Status</th>
                <th className="p-3.5">Delivery Status</th>
                <th className="p-3.5">Technician</th>
                <th className="p-3.5">Updated</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {visible.map(j => {
                const emp = j.assignedEmployeeId ? Employees.byId(j.assignedEmployeeId) : null;
                return (
                  <tr key={j.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="p-3.5 font-mono text-white font-bold">{j.jobSheetNo}</td>
                    <td className="p-3.5 font-medium text-white">{j.customerName}</td>
                    <td className="p-3.5 text-muted-foreground font-mono">{j.customerMobile}</td>
                    <td className="p-3.5 text-white font-medium">{j.brand} {j.model}</td>
                    <td className="p-3.5 max-w-[180px] truncate text-muted-foreground">{j.fault}</td>
                    <td className="p-3.5 text-right font-black font-mono text-white">
                      ₹{j.amount.toLocaleString("en-IN")}
                    </td>
                    <td className="p-3.5"><StatusBadge status={j.repairStatus} /></td>
                    <td className="p-3.5"><StatusBadge status={j.deliveryStatus} /></td>
                    <td className="p-3.5 text-muted-foreground">{emp?.name ?? "—"}</td>
                    <td className="p-3.5 text-muted-foreground whitespace-nowrap">
                      {j.lastUpdatedAt ? new Date(j.lastUpdatedAt).toLocaleDateString("en-IN") : new Date(j.jobDate).toLocaleDateString("en-IN")}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <Link
                          to={`/app/jobs/${j.id}`}
                          className="p-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-white"
                          title="View Details"
                        >
                          <Eye className="size-3.5" />
                        </Link>
                        {session?.role !== "customer" && (
                          <>
                            <Link
                              to={`/app/jobs/${j.id}`}
                              className="p-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-white"
                              title="Edit Job"
                            >
                              <Pencil className="size-3.5" />
                            </Link>
                            <Link
                              to={`/app/jobs/${j.id}?print=1`}
                              className="p-1.5 rounded-lg border border-border hover:bg-secondary text-muted-foreground hover:text-white"
                              title="Print Job Sheet"
                            >
                              <Printer className="size-3.5" />
                            </Link>
                          </>
                        )}
                        {session?.role === "owner" && (
                          <button
                            onClick={() => handleDelete(j)}
                            className="p-1.5 rounded-lg border border-border hover:bg-red-500/20 hover:border-red-500 text-muted-foreground hover:text-red-400"
                            title="Delete Job"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile / Tablet Card View */}
      <div className="grid gap-3 lg:hidden">
        {visible.map(j => (
          <div
            key={j.id}
            className="rounded-2xl border border-border bg-card p-4 space-y-3 shadow-card"
          >
            <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
              <span className="font-mono text-xs font-bold text-[#FF784E]">{j.jobSheetNo}</span>
              <StatusBadge status={j.deliveryStatus === "Delivered" ? "Delivered" : j.repairStatus} />
            </div>

            <div className="flex items-start gap-3">
              <div className="size-10 rounded-xl bg-[#FF5733]/15 text-[#FF784E] border border-[#FF5733]/30 grid place-items-center shrink-0">
                <Smartphone className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-sm text-white">{j.brand} {j.model}</h3>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Customer: <span className="text-white font-medium">{j.customerName}</span> ({j.customerMobile})
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 truncate">
                  Fault: {j.fault}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
              <div>
                <span className="text-muted-foreground">Charge: </span>
                <span className="font-black font-mono text-white">₹{j.amount.toLocaleString("en-IN")}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Button asChild size="sm" variant="outline" className="h-8 rounded-lg text-xs border-border">
                  <Link to={`/app/jobs/${j.id}`}>View</Link>
                </Button>
                {session?.role !== "customer" && (
                  <Button asChild size="sm" className="h-8 rounded-lg text-xs bg-[#FF5733] hover:bg-[#FF784E] text-white">
                    <Link to={`/app/jobs/${j.id}?print=1`}>Print</Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {visible.length === 0 && (
        <EmptyState
          title="No repair jobs found"
          description="Try adjusting your search criteria or filter options."
          action={
            session?.role !== "customer" ? (
              <Button onClick={() => navigate("/app/jobs/new")} className="bg-[#FF5733] text-white">
                <Plus className="size-4 mr-1.5" /> Create New Job
              </Button>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
