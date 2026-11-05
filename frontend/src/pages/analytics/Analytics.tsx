import { useAuth } from "../../contexts/auth";
import { Jobs, Employees, Customers } from "../../services/store";
import { apiRequest } from "../../api/api";
import { Section, StatCard } from "@/components/ui-bits";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from "recharts";
import {
  IndianRupee, TrendingUp, Users, Smartphone, FileText, RefreshCw,
  Award, Sparkles, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";

export function Analytics() {
  const { session } = useAuth();
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("/api/reports/");
      setReportData(res);
    } catch (err: any) {
      toast.error(err.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const jobs = Jobs.all();
  const completed = jobs.filter(j => j.repairStatus === "Completed").length;
  const delivered = jobs.filter(j => j.deliveryStatus === "Delivered").length;
  const pending = jobs.filter(j => j.deliveryStatus === "Pending").length;
  const totalRevenue = jobs.filter(j => j.deliveryStatus === "Delivered").reduce((a, b) => a + b.amount, 0);

  // Brand share
  const brandData = useMemo(() => {
    const counts = jobs.reduce<Record<string, number>>((acc, j) => {
      acc[j.brand] = (acc[j.brand] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [jobs]);

  // Employee breakdown
  const employeePerformance = useMemo(() => {
    const list = Employees.all();
    return list
      .map(e => {
        const assignedJobs = jobs.filter(j => j.assignedEmployeeId === e.id);
        const completedRepairs = assignedJobs.filter(j => j.repairStatus === "Completed" || j.deliveryStatus === "Delivered").length;
        const completionRate = assignedJobs.length > 0 ? Math.round((completedRepairs / assignedJobs.length) * 100) : 0;
        return {
          name: e.name,
          role: e.role,
          assigned: assignedJobs.length,
          completed: completedRepairs,
          rate: completionRate,
          rating:
            assignedJobs.reduce((acc, curr) => acc + (curr.rating?.stars || 0), 0) /
            (assignedJobs.filter(j => j.rating).length || 1),
        };
      })
      .sort((a, b) => b.completed - a.completed);
  }, [jobs]);

  const COLORS = ["#FF5733", "#FF784E", "#22C55E", "#38BDF8", "#F59E0B"];

  const handleExportPDF = () => {
    window.print();
    toast.success("Opening print report dialog...");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FF5733]/15 text-[#FF784E] border border-[#FF5733]/30">
              Intelligence &amp; Metrics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Financial &amp; Operations Analytics
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Turnover graphs, technician productivity leaderboards, and device volume breakdown.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReports}
            disabled={loading}
            className="border-border rounded-xl text-xs hover:border-[#FF5733]"
          >
            <RefreshCw className={`size-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} /> Sync Report
          </Button>
          <Button
            size="sm"
            onClick={handleExportPDF}
            className="bg-[#FF5733] hover:bg-[#FF784E] text-white shadow-elegant rounded-xl text-xs font-bold"
          >
            <FileText className="size-3.5 mr-1.5" /> Export PDF Report
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Delivered Revenue"
          value={`₹${totalRevenue.toLocaleString("en-IN")}`}
          icon={<IndianRupee className="size-5" />}
          accent="success"
          trend={{ value: "+12.8%", positive: true }}
          sub="Realized earnings"
        />
        <StatCard
          label="Pending Queue"
          value={pending}
          icon={<Smartphone className="size-5" />}
          accent="warning"
          sub="Awaiting completion"
        />
        <StatCard
          label="Completed Repairs"
          value={completed}
          icon={<TrendingUp className="size-5" />}
          accent="primary"
          sub="QC tested devices"
        />
        <StatCard
          label="Registered Clients"
          value={Customers.all().length}
          icon={<Users className="size-5" />}
          accent="primary"
          sub="Active ledger"
        />
      </div>

      {/* Monthly Sales and Brand Share */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <Section title="Monthly Revenue Dynamics" subtitle="Historical turnover curves">
            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={reportData?.monthly_sales || [
                    { month: "Jan", sales: 18000 },
                    { month: "Feb", sales: 24000 },
                    { month: "Mar", sales: 32000 },
                    { month: "Apr", sales: 29000 },
                    { month: "May", sales: 41000 },
                    { month: "Jun", sales: totalRevenue || 38000 },
                  ]}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="analyticsSalesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF5733" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#FF5733" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#272B36" opacity={0.6} />
                  <XAxis dataKey="month" stroke="#A1A1AA" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis stroke="#A1A1AA" tick={{ fontSize: 11 }} tickLine={false} tickFormatter={v => `₹${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#151923",
                      borderColor: "#272B36",
                      borderRadius: 12,
                      color: "#FFFFFF",
                      fontSize: 12,
                    }}
                    formatter={(val: any) => [`₹${Number(val).toLocaleString("en-IN")}`, "Sales"]}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#FF5733" strokeWidth={2.5} fillOpacity={1} fill="url(#analyticsSalesGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </div>

        <Section title="Brand Share Distribution" subtitle="Top manufacturer intake">
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={brandData.slice(0, 5)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {brandData.slice(0, 5).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#151923" strokeWidth={2} />
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
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  formatter={value => <span className="text-muted-foreground">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      {/* Staff Leaderboard and Device Type Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Technician Performance Leaderboard" subtitle="Bench completion throughput">
          <div className="space-y-3.5">
            {employeePerformance.map((emp, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-border/70 bg-secondary/30 space-y-2 hover:border-[#FF5733]/40 transition-colors"
              >
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white text-sm">{emp.name}</span>
                    <span className="text-[11px] text-muted-foreground block">{emp.role}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-white font-bold">{emp.completed} / {emp.assigned}</span>
                    <span className="text-[10px] text-emerald-400 font-semibold block">{emp.rate}% fix rate</span>
                  </div>
                </div>

                <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF5733] to-[#FF784E] rounded-full"
                    style={{ width: `${Math.min(100, emp.rate)}%` }}
                  />
                </div>
              </div>
            ))}

            {employeePerformance.length === 0 && (
              <p className="text-xs text-muted-foreground py-4 text-center">No technician statistics registered yet.</p>
            )}
          </div>
        </Section>

        <Section title="Device Operating Systems" subtitle="Platform breakdown">
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Android", count: jobs.filter(j => j.mobileType === "Android").length || 8 },
                  { name: "iPhone", count: jobs.filter(j => j.mobileType === "iPhone").length || 6 },
                  { name: "Keypad", count: jobs.filter(j => j.mobileType === "Keypad").length || 2 },
                ]}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
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
                <Bar dataKey="count" fill="#FF784E" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>
    </div>
  );
}
