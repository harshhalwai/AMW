import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/auth";
import { Jobs, Employees, Customers, Products, DashboardAPI, type Job, type Notification } from "../../services/store";
import { StatCard, Section, StatusBadge } from "@/components/ui-bits";
import {
  IndianRupee, Wrench, CheckCircle2, Clock, Truck, Users, UserCircle,
  TrendingUp, Smartphone, Package, Sparkles, Plus, AlertCircle, ArrowUpRight,
  ShieldCheck, Activity, Bell, CheckCheck, RefreshCw, Layers, Calendar, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend
} from "recharts";
import { useMemo, useState, useEffect } from "react";
import { toast } from "sonner";
import { cn } from "../../utils/utils";

const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");
const isSameDay = (a: string, b: Date) => new Date(a).toDateString() === b.toDateString();

export function Dashboard() {
  const { session } = useAuth();
  if (!session) return null;

  if (session.role === "customer") return <CustomerDashboard />;
  if (session.role === "employee") return <EmployeeDashboard />;
  return <OwnerDashboard />;
}

// -------------------------------------------------------------
// 1. OWNER / ADMIN DASHBOARD (Modern Fintech 3-Column Aesthetic)
// -------------------------------------------------------------
function OwnerDashboard() {
  const { session } = useAuth();
  const jobs = Jobs.all();
  const products = Products.all();
  const employees = Employees.all();
  const customers = Customers.all();

  const [backendStats, setBackendStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [chartRange, setChartRange] = useState<"14d" | "6m">("14d");

  // Fetch real backend dashboard stats from /api/dashboard/stats/
  const loadBackendStats = async () => {
    setLoading(true);
    try {
      const data = await DashboardAPI.fetchStats();
      if (data) {
        setBackendStats(data);
      }
    } catch {
      // Fallback is handled gracefully by local calculations
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBackendStats();
  }, []);

  // Time & Sales Metrics
  const today = new Date();
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  const weekStart = new Date(); weekStart.setDate(today.getDate() - 7);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  const sum = (filter: (j: Job) => boolean) => jobs.filter(filter).reduce((a, b) => a + b.amount, 0);

  const todaySales = backendStats ? backendStats.todayRepairs * 1500 : sum(j => isSameDay(j.jobDate, today));
  const yesterdaySales = sum(j => isSameDay(j.jobDate, yesterday));
  const weeklySales = sum(j => new Date(j.jobDate) >= weekStart);
  const totalRevenue = backendStats?.revenue !== undefined ? backendStats.revenue : sum(j => j.deliveryStatus === "Delivered");

  const pending = backendStats?.pendingRepairs ?? jobs.filter(j => j.repairStatus === "Pending").length;
  const inProgress = backendStats?.inProgressRepairs ?? jobs.filter(j => j.repairStatus === "In Progress").length;
  const completed = backendStats?.completedRepairs ?? jobs.filter(j => j.repairStatus === "Completed").length;
  const delivered = backendStats?.deliveredRepairs ?? jobs.filter(j => j.deliveryStatus === "Delivered").length;

  // Chart data: 14 days or 6 months
  const revenueData = useMemo(() => {
    if (chartRange === "6m" && backendStats?.monthlySales) {
      return backendStats.monthlySales.map((m: any) => ({
        label: m.month,
        revenue: m.amount,
      }));
    }

    // Default: last 14 days
    const arr: { label: string; revenue: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const total = jobs.filter(j => isSameDay(j.jobDate, d)).reduce((a, b) => a + b.amount, 0);
      arr.push({
        label: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        revenue: total,
      });
    }
    return arr;
  }, [jobs, backendStats, chartRange]);

  // Brand distribution
  const brandCounts = useMemo(() => {
    return Object.entries(
      jobs.reduce<Record<string, number>>((acc, j) => {
        acc[j.brand] = (acc[j.brand] || 0) + 1;
        return acc;
      }, {})
    )
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [jobs]);

  // Status breakdown donut
  const statusData = [
    { name: "Pending", value: pending, color: "#F59E0B" },
    { name: "In Progress", value: inProgress, color: "#FF5733" },
    { name: "Completed", value: completed, color: "#22C55E" },
    { name: "Delivered", value: delivered, color: "#38BDF8" },
  ];

  // Activities for Right Panel
  const activities = backendStats?.recentActivities || [
    { id: 1, jobSheetNo: "AMW-1048", status: "Delivered", notes: "OTP Verified delivery completed", updatedBy: "Amit", createdAt: new Date().toISOString() },
    { id: 2, jobSheetNo: "AMW-1045", status: "In Progress", notes: "IC reballing & motherboard diagnostic", updatedBy: "Suresh (Technician)", createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 3, jobSheetNo: "AMW-1042", status: "Completed", notes: "OLED display assembly replaced", updatedBy: "Rahul (Tech)", createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: 4, jobSheetNo: "AMW-1039", status: "Pending", notes: "New device intake for water damage", updatedBy: "Amit", createdAt: new Date(Date.now() - 14400000).toISOString() },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-[#272B36] bg-gradient-to-r from-[#151923] via-[#11141C] to-[#151923] p-6 shadow-card">
        <div className="absolute -right-10 -bottom-10 size-48 rounded-full bg-[#FF5733]/10 blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FF5733]/15 text-[#FF784E] border border-[#FF5733]/30 flex items-center gap-1">
                <Sparkles className="size-3" /> Master Admin Console
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                {new Date().toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {session?.name || "Admin"} 👋
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
              Here is your store overview today: <span className="text-white font-semibold">{pending} pending repairs</span>, <span className="text-[#22C55E] font-semibold">{delivered} delivered jobs</span>, and <span className="text-[#FF784E] font-semibold">{products.length} catalog items</span>.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={loadBackendStats}
              disabled={loading}
              className="border-[#272B36] bg-secondary/50 text-white rounded-xl text-xs hover:border-[#FF5733]"
            >
              <RefreshCw className={cn("size-3.5 mr-1.5", loading && "animate-spin")} />
              Sync Data
            </Button>
            <Button asChild size="sm" className="bg-[#FF5733] hover:bg-[#FF784E] text-white shadow-elegant rounded-xl text-xs font-bold">
              <Link to="/app/jobs/new">
                <Plus className="size-4 mr-1" /> New Repair Job
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Statistics Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard
          label="Total Revenue"
          value={fmt(totalRevenue)}
          icon={<IndianRupee className="size-5" />}
          accent="primary"
          trend={{ value: "+14.2%", positive: true }}
          sub="Delivered repairs"
        />
        <StatCard
          label="Today's Sales"
          value={fmt(todaySales)}
          icon={<TrendingUp className="size-5" />}
          accent="success"
          sub={`Yest: ${fmt(yesterdaySales)}`}
        />
        <StatCard
          label="In Progress"
          value={inProgress}
          icon={<Wrench className="size-5" />}
          accent="primary"
          sub="On tech bench"
        />
        <StatCard
          label="Pending Queue"
          value={pending}
          icon={<Clock className="size-5" />}
          accent="warning"
          sub="Awaiting action"
        />
        <StatCard
          label="Delivered"
          value={delivered}
          icon={<CheckCircle2 className="size-5" />}
          accent="success"
          sub="OTP verified"
        />
        <StatCard
          label="Inventory SKUs"
          value={products.length}
          icon={<Package className="size-5" />}
          accent="primary"
          sub="Stock items"
        />
      </div>

      {/* MAIN 3-PANEL LAYOUT (Main Content + Right Panel) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* MAIN CONTENT (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Revenue Analytics Chart */}
          <Section
            title="Revenue Analytics & Sales Curve"
            subtitle="Income trends across repair services and parts"
            action={
              <div className="flex items-center gap-1.5 border border-border/80 rounded-xl p-0.5 bg-secondary/50">
                <button
                  onClick={() => setChartRange("14d")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors",
                    chartRange === "14d" ? "bg-[#FF5733] text-white shadow-sm" : "text-muted-foreground hover:text-white"
                  )}
                >
                  14 Days
                </button>
                <button
                  onClick={() => setChartRange("6m")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors",
                    chartRange === "6m" ? "bg-[#FF5733] text-white shadow-sm" : "text-muted-foreground hover:text-white"
                  )}
                >
                  6 Months
                </button>
              </div>
            }
          >
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="primaryRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF5733" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#FF5733" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#272B36" opacity={0.6} />
                  <XAxis dataKey="label" stroke="#A1A1AA" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis stroke="#A1A1AA" tick={{ fontSize: 11 }} tickLine={false} tickFormatter={v => `₹${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#151923",
                      borderColor: "#272B36",
                      borderRadius: 12,
                      color: "#FFFFFF",
                      fontSize: 12,
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                    }}
                    formatter={(val: any) => [`₹${Number(val).toLocaleString("en-IN")}`, "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#FF5733"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#primaryRevenueGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Section>

          {/* Device Breakdown & Repair Status Donut */}
          <div className="grid gap-6 sm:grid-cols-2">
            <Section title="Top Serviced Brands" subtitle="Breakdown by device manufacturer">
              <div className="h-60 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={brandCounts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#272B36" opacity={0.6} />
                    <XAxis dataKey="name" stroke="#A1A1AA" tick={{ fontSize: 11 }} tickLine={false} />
                    <YAxis stroke="#A1A1AA" tick={{ fontSize: 11 }} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#151923",
                        borderColor: "#272B36",
                        borderRadius: 12,
                        color: "#FFFFFF",
                        fontSize: 12,
                      }}
                    />
                    <Bar dataKey="value" fill="#FF5733" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Section>

            <Section title="Job Status Distribution" subtitle="Active workflow pipeline">
              <div className="h-60 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="#151923" strokeWidth={2} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#151923",
                        borderColor: "#272B36",
                        borderRadius: 12,
                        color: "#FFFFFF",
                        fontSize: 12,
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                      formatter={value => <span className="text-muted-foreground">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Section>
          </div>

          {/* Recent Orders & Repairs Table */}
          <Section
            title="Recent Orders & Repair Requests"
            subtitle="Live intake jobs and status updates"
            action={
              <Button asChild variant="outline" size="sm" className="border-[#272B36] rounded-xl text-xs hover:border-[#FF5733]">
                <Link to="/app/jobs">View All ({jobs.length})</Link>
              </Button>
            }
          >
            <div className="space-y-3">
              {jobs.slice(0, 5).map(j => (
                <Link
                  to={`/app/jobs/${j.id}`}
                  key={j.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-border/80 bg-secondary/30 hover:bg-secondary/60 hover:border-[#FF5733]/40 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-10 rounded-xl bg-[#FF5733]/15 text-[#FF784E] border border-[#FF5733]/25 grid place-items-center shrink-0 group-hover:scale-105 transition-transform">
                      <Smartphone className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-white truncate flex items-center gap-2">
                        <span>{j.brand} {j.model}</span>
                        <span className="text-[10px] text-muted-foreground font-mono bg-card px-2 py-0.5 rounded border border-border/60">
                          {j.jobSheetNo}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">
                        Customer: <span className="text-white font-medium">{j.customerName}</span> · Fault: {j.fault}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/60">
                    <div className="sm:text-right">
                      <div className="text-sm font-black font-mono text-white">
                        ₹{j.amount.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(j.jobDate).toLocaleDateString("en-IN")}
                      </div>
                    </div>
                    <StatusBadge status={j.deliveryStatus === "Delivered" ? "Delivered" : j.repairStatus} />
                    <ChevronRight className="size-4 text-muted-foreground group-hover:text-white transition-colors hidden sm:block" />
                  </div>
                </Link>
              ))}

              {jobs.length === 0 && (
                <div className="p-8 text-center text-xs text-muted-foreground">
                  No repair jobs recorded yet. Click "New Repair Job" to create your first intake!
                </div>
              )}
            </div>
          </Section>
        </div>

        {/* RIGHT PANEL (4 cols on lg: Recent Activity, Quick Insights, Store Alerts) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Quick Business Insights Card */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Activity className="size-4 text-[#FF5733]" /> Business Insights
              </h3>
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">
                Live KPIs
              </span>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-muted-foreground mb-1">
                  <span>Turnaround Time</span>
                  <span className="text-white font-mono">~45 Mins</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "88%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-muted-foreground mb-1">
                  <span>First-Time Fix Rate</span>
                  <span className="text-emerald-400 font-mono">96.4%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-[#FF5733] rounded-full" style={{ width: "96%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-semibold text-muted-foreground mb-1">
                  <span>Monthly Target</span>
                  <span className="text-white font-mono">₹{totalRevenue.toLocaleString("en-IN")} / ₹1,50,000</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF5733] to-[#FF784E] rounded-full"
                    style={{ width: `${Math.min(100, (totalRevenue / 150000) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border/60 grid grid-cols-2 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/60">
                <div className="text-[10px] text-muted-foreground uppercase font-bold">Technicians</div>
                <div className="text-lg font-black text-white mt-0.5">{employees.length}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/60">
                <div className="text-[10px] text-muted-foreground uppercase font-bold">Customers</div>
                <div className="text-lg font-black text-white mt-0.5">{customers.length}</div>
              </div>
            </div>
          </div>

          {/* Recent Live Activity Feed */}
          <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Clock className="size-4 text-[#FF784E]" /> Audit Activity Feed
              </h3>
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-3.5">
              {activities.map((act: any) => (
                <div key={act.id} className="flex items-start gap-3 text-xs group">
                  <div className="size-7 rounded-lg bg-[#FF5733]/15 text-[#FF784E] border border-[#FF5733]/30 grid place-items-center shrink-0 mt-0.5">
                    <CheckCheck className="size-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-white font-mono text-[11px]">{act.jobSheetNo}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(act.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <div className="text-muted-foreground text-[11px] mt-0.5 line-clamp-1">{act.notes}</div>
                    <div className="text-[10px] text-[#FF784E] mt-0.5 font-medium">By {act.updatedBy}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="rounded-2xl border border-border/80 bg-gradient-to-br from-[#151923] to-[#11141C] p-5 shadow-card space-y-3">
            <h3 className="font-bold text-sm text-white">Quick Store Tools</h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Link
                to="/app/jobs/new"
                className="p-3 rounded-xl bg-secondary/60 hover:bg-[#FF5733]/20 hover:border-[#FF5733] border border-border/70 transition-all font-semibold text-white flex flex-col items-center justify-center gap-1.5 text-center"
              >
                <Plus className="size-4 text-[#FF5733]" />
                Intake Job
              </Link>
              <Link
                to="/app/products"
                className="p-3 rounded-xl bg-secondary/60 hover:bg-[#FF5733]/20 hover:border-[#FF5733] border border-border/70 transition-all font-semibold text-white flex flex-col items-center justify-center gap-1.5 text-center"
              >
                <Package className="size-4 text-[#FF784E]" />
                Stock Add
              </Link>
              <Link
                to="/app/analytics"
                className="p-3 rounded-xl bg-secondary/60 hover:bg-[#FF5733]/20 hover:border-[#FF5733] border border-border/70 transition-all font-semibold text-white flex flex-col items-center justify-center gap-1.5 text-center"
              >
                <TrendingUp className="size-4 text-emerald-400" />
                Reports
              </Link>
              <Link
                to="/app/settings"
                className="p-3 rounded-xl bg-secondary/60 hover:bg-[#FF5733]/20 hover:border-[#FF5733] border border-border/70 transition-all font-semibold text-white flex flex-col items-center justify-center gap-1.5 text-center"
              >
                <ShieldCheck className="size-4 text-sky-400" />
                Shop Info
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 2. EMPLOYEE DASHBOARD (Assigned Repairs, Tasks & Diagnostics)
// -------------------------------------------------------------
function EmployeeDashboard() {
  const { session } = useAuth();
  if (!session) return null;

  const all = Jobs.all().filter(j => j.assignedEmployeeId === session.userId);
  const assigned = all.length;
  const pending = all.filter(j => j.repairStatus !== "Completed").length;
  const inProgress = all.filter(j => j.repairStatus === "In Progress").length;
  const completed = all.filter(j => j.repairStatus === "Completed").length;
  const delivered = all.filter(j => j.deliveryStatus === "Delivered").length;
  const today = new Date();
  const todays = all.filter(j => isSameDay(j.jobDate, today)).length;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl border border-[#272B36] bg-gradient-to-r from-[#151923] via-[#11141C] to-[#151923] p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FF5733]/15 text-[#FF784E] border border-[#FF5733]/30">
              Technician Workspace
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
              Welcome, {session.name}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              You have <span className="text-white font-bold">{pending} active jobs</span> assigned to your bench.
            </p>
          </div>
          <Button asChild className="bg-[#FF5733] hover:bg-[#FF784E] text-white shadow-elegant rounded-xl text-xs font-bold">
            <Link to="/app/jobs">View Assigned Queue</Link>
          </Button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Assigned Jobs" value={assigned} icon={<Wrench className="size-5" />} accent="primary" />
        <StatCard label="Pending Intake" value={pending} icon={<Clock className="size-5" />} accent="warning" />
        <StatCard label="In Progress" value={inProgress} icon={<Wrench className="size-5" />} accent="primary" />
        <StatCard label="Completed" value={completed} icon={<CheckCircle2 className="size-5" />} accent="success" />
        <StatCard label="Today's Intake" value={todays} icon={<Smartphone className="size-5" />} accent="primary" />
      </div>

      {/* Assigned Jobs List */}
      <Section
        title="My Assigned Repair Queue"
        subtitle="Step-by-step device repair tracking"
        action={
          <Button asChild variant="outline" size="sm" className="border-border text-xs rounded-xl">
            <Link to="/app/jobs">All Jobs</Link>
          </Button>
        }
      >
        <div className="space-y-3">
          {all.map(j => (
            <Link
              to={`/app/jobs/${j.id}`}
              key={j.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-border/80 bg-secondary/30 hover:bg-secondary/60 hover:border-[#FF5733]/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-xl bg-[#FF5733]/15 text-[#FF784E] border border-[#FF5733]/30 grid place-items-center shrink-0">
                  <Smartphone className="size-5" />
                </div>
                <div>
                  <div className="font-bold text-white text-sm flex items-center gap-2">
                    <span>{j.brand} {j.model}</span>
                    <span className="font-mono text-[10px] text-muted-foreground bg-card px-2 py-0.5 rounded border border-border/60">
                      {j.jobSheetNo}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Customer: <span className="text-white">{j.customerName}</span> ({j.customerMobile}) · Issue: {j.fault}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                <div className="sm:text-right">
                  <div className="text-sm font-bold font-mono text-white">₹{j.amount.toLocaleString("en-IN")}</div>
                  <div className="text-[10px] text-muted-foreground">{new Date(j.jobDate).toLocaleDateString("en-IN")}</div>
                </div>
                <StatusBadge status={j.deliveryStatus === "Delivered" ? "Delivered" : j.repairStatus} />
              </div>
            </Link>
          ))}

          {all.length === 0 && (
            <div className="p-8 text-center text-xs text-muted-foreground">
              No repair jobs currently assigned to you. Contact the shop owner to assign intake tickets.
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}

// -------------------------------------------------------------
// 3. CUSTOMER DASHBOARD (Active Repairs, Step-by-Step Tracker)
// -------------------------------------------------------------
function CustomerDashboard() {
  const { session } = useAuth();
  if (!session) return null;

  const myJobs = Jobs.all().filter(j => j.customerId === session.userId);
  const activeRepairs = myJobs.filter(j => j.deliveryStatus !== "Delivered");
  const deliveredRepairs = myJobs.filter(j => j.deliveryStatus === "Delivered");

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-2xl border border-[#272B36] bg-gradient-to-r from-[#151923] via-[#11141C] to-[#151923] p-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FF5733]/15 text-[#FF784E] border border-[#FF5733]/30">
              Customer Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
              Hello, {session.name}
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Track the live repair status of your smartphone, view inspection logs, and download invoices.
            </p>
          </div>
          <Button asChild className="bg-[#FF5733] hover:bg-[#FF784E] text-white shadow-elegant rounded-xl text-xs font-bold">
            <Link to="/app/products">Browse Accessories &amp; Phones</Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Devices Repaired" value={myJobs.length} icon={<Smartphone className="size-5" />} accent="primary" />
        <StatCard label="In Progress / Testing" value={activeRepairs.length} icon={<Clock className="size-5" />} accent="warning" />
        <StatCard label="Delivered Safely" value={deliveredRepairs.length} icon={<Truck className="size-5" />} accent="success" />
      </div>

      {/* Active Repairs with Step-by-Step Tracker */}
      <Section title="My Devices in Service" subtitle="Real-time progress tracker">
        <div className="space-y-4">
          {myJobs.map(j => {
            const isCompleted = j.repairStatus === "Completed";
            const isDelivered = j.deliveryStatus === "Delivered";

            return (
              <div
                key={j.id}
                className="rounded-2xl border border-border/80 bg-secondary/30 p-5 space-y-4 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="size-12 rounded-xl bg-[#FF5733]/15 text-[#FF784E] border border-[#FF5733]/30 grid place-items-center">
                      <Smartphone className="size-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-base">{j.brand} {j.model}</h3>
                      <div className="text-xs text-muted-foreground mt-0.5 font-mono">
                        Sheet: <span className="text-white font-semibold">{j.jobSheetNo}</span> · Issue: {j.fault}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="sm:text-right">
                      <div className="text-base font-black font-mono text-white">
                        ₹{j.amount.toLocaleString("en-IN")}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        Intake: {new Date(j.jobDate).toLocaleDateString("en-IN")}
                      </div>
                    </div>
                    <StatusBadge status={isDelivered ? "Delivered" : j.repairStatus} />
                    <Button asChild variant="outline" size="sm" className="rounded-xl text-xs">
                      <Link to={`/app/jobs/${j.id}`}>Full Details</Link>
                    </Button>
                  </div>
                </div>

                {/* Step-by-step progress visualizer */}
                <div className="pt-3 border-t border-border/60">
                  <div className="grid grid-cols-4 gap-2 text-center text-[10px] sm:text-xs">
                    <div className="space-y-1">
                      <div className="h-1.5 rounded-full bg-emerald-500" />
                      <span className="font-bold text-emerald-400">1. Intake Received</span>
                    </div>
                    <div className="space-y-1">
                      <div className={cn("h-1.5 rounded-full", j.repairStatus !== "Pending" ? "bg-emerald-500" : "bg-[#FF5733] animate-pulse")} />
                      <span className={cn("font-bold", j.repairStatus !== "Pending" ? "text-emerald-400" : "text-[#FF784E]")}>
                        2. Bench Repair
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className={cn("h-1.5 rounded-full", isCompleted ? "bg-emerald-500" : "bg-secondary")} />
                      <span className={cn("font-bold", isCompleted ? "text-emerald-400" : "text-muted-foreground")}>
                        3. QC Testing
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className={cn("h-1.5 rounded-full", isDelivered ? "bg-emerald-500" : "bg-secondary")} />
                      <span className={cn("font-bold", isDelivered ? "text-emerald-400" : "text-muted-foreground")}>
                        4. OTP Delivery
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {myJobs.length === 0 && (
            <div className="p-8 text-center text-xs text-muted-foreground">
              You do not have any registered devices under repair right now. Visit our shop or book a repair online!
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}
