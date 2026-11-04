import { useAuth } from "../../contexts/auth";
import { Jobs, Employees, Customers } from "../../services/store";
import { apiRequest } from "../../api/api";
import { Section, StatCard } from "@/components/ui-bits";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from "recharts";
import { IndianRupee, TrendingUp, Users, Smartphone, FileText, RefreshCw } from "lucide-react";
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
      acc[j.brand] = (acc[j.brand] || 0) + 1; return acc;
    }, {});
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [jobs]);

  // Employee breakdown
  const employeePerformance = useMemo(() => {
    const list = Employees.all();
    return list.map(e => {
      const assignedJobs = jobs.filter(j => j.assignedEmployeeId === e.id);
      const completedRepairs = assignedJobs.filter(j => j.repairStatus === "Completed").length;
      const performanceValue = assignedJobs.length > 0 ? Math.round((completedRepairs / assignedJobs.length) * 100) : 0;
      return {
        name: e.name,
        role: e.role,
        assigned: assignedJobs.length,
        completed: completedRepairs,
        rating: assignedJobs.reduce((acc, curr) => acc + (curr.rating?.stars || 0), 0) / (assignedJobs.filter(j => j.rating).length || 1),
      };
    }).sort((a, b) => b.completed - a.completed);
  }, [jobs]);

  const COLORS = ["oklch(0.55 0.18 258)", "oklch(0.62 0.16 155)", "oklch(0.78 0.16 80)", "oklch(0.45 0.15 258)"];

  const handleExportPDF = () => {
    window.print();
    toast.success("Printing report page (PDF)...");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytical Reports</h1>
          <p className="text-sm text-muted-foreground font-medium">Business sales reports & employee performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchReports} disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button size="sm" onClick={handleExportPDF}>
            <FileText className="size-4" /> Export Report
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Delivered Income" value={`₹${totalRevenue.toLocaleString("en-IN")}`} icon={<IndianRupee className="size-5" />} accent="success" />
        <StatCard label="Pending Deliveries" value={pending} icon={<Smartphone className="size-5" />} accent="warning" />
        <StatCard label="Completed Repairs" value={completed} icon={<TrendingUp className="size-5" />} accent="primary" />
        <StatCard label="Registered Customers" value={Customers.all().length} icon={<Users className="size-5" />} accent="primary" />
      </div>

      {reportData && (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Section title="Monthly Sales Trends">
              <div className="h-72">
                <ResponsiveContainer>
                  <LineChart data={reportData.monthly_sales}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                    <Line type="monotone" dataKey="sales" stroke="oklch(0.55 0.18 258)" strokeWidth={2.5} name="Sales (₹)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Section>
          </div>
          <Section title="Brand Share">
            <div className="h-72">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={brandData.slice(0, 5)} dataKey="value" nameKey="name" innerRadius={40} outerRadius={70} paddingAngle={2}>
                    {brandData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Section title="Employee Work Performance">
          <div className="space-y-4">
            {employeePerformance.map((emp, i) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-lg border border-border">
                <div>
                  <div className="font-semibold text-sm">{emp.name}</div>
                  <div className="text-xs text-muted-foreground">{emp.role}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-primary">{emp.completed} / {emp.assigned} completed</div>
                  <div className="text-xs text-muted-foreground">Rating: {emp.rating ? `${emp.rating.toFixed(1)} ★` : "None"}</div>
                </div>
              </div>
            ))}
            {employeePerformance.length === 0 && (
              <p className="text-sm text-muted-foreground">No staff members found.</p>
            )}
          </div>
        </Section>
        
        {reportData && (
          <Section title="Device Type Summary">
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={Object.entries(reportData.device_types || {}).map(([name, value]) => ({ name, value }))}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                  <Bar dataKey="value" fill="oklch(0.62 0.16 155)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
