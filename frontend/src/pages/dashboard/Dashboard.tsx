import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/auth";
import { Jobs, Employees, Customers } from "../../services/store";
import { StatCard, Section, StatusBadge } from "@/components/ui-bits";
import {
  IndianRupee, Wrench, CheckCircle2, Clock, Truck, Users, UserCircle, TrendingUp, Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend,
} from "recharts";
import { useMemo } from "react";

const fmt = (n: number) => "₹" + n.toLocaleString("en-IN");
const isSameDay = (a: string, b: Date) => new Date(a).toDateString() === b.toDateString();

export function Dashboard() {
  const { session } = useAuth();
  if (!session) return null;

  if (session.role === "customer") return <CustomerDashboard />;
  if (session.role === "employee") return <EmployeeDashboard />;
  return <OwnerDashboard />;
}

function OwnerDashboard() {
  const jobs = Jobs.all();
  const today = new Date();
  const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
  const weekStart = new Date(); weekStart.setDate(today.getDate() - 7);
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const yearStart = new Date(today.getFullYear(), 0, 1);

  const sum = (filter: (j: typeof jobs[number]) => boolean) => jobs.filter(filter).reduce((a, b) => a + b.amount, 0);
  const todaySales = sum(j => isSameDay(j.jobDate, today));
  const yesterdaySales = sum(j => isSameDay(j.jobDate, yesterday));
  const weeklySales = sum(j => new Date(j.jobDate) >= weekStart);
  const monthlySales = sum(j => new Date(j.jobDate) >= monthStart);
  const yearlySales = sum(j => new Date(j.jobDate) >= yearStart);
  const totalRevenue = jobs.filter(j => j.deliveryStatus === "Delivered").reduce((a, b) => a + b.amount, 0);

  const pending = jobs.filter(j => j.deliveryStatus === "Pending").length;
  const delivered = jobs.filter(j => j.deliveryStatus === "Delivered").length;
  const completed = jobs.filter(j => j.repairStatus === "Completed").length;

  // Revenue last 14 days
  const revenueData = useMemo(() => {
    const arr: { day: string; revenue: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(); d.setDate(today.getDate() - i);
      const total = jobs.filter(j => isSameDay(j.jobDate, d)).reduce((a, b) => a + b.amount, 0);
      arr.push({ day: d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }), revenue: total });
    }
    return arr;
  }, [jobs]);

  const brandCounts = Object.entries(jobs.reduce<Record<string, number>>((acc, j) => {
    acc[j.brand] = (acc[j.brand] || 0) + 1; return acc;
  }, {})).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 6);

  const statusData = [
    { name: "Pending", value: jobs.filter(j => j.repairStatus === "Pending").length },
    { name: "In Progress", value: jobs.filter(j => j.repairStatus === "In Progress").length },
    { name: "Completed", value: jobs.filter(j => j.repairStatus === "Completed").length },
  ];
  const COLORS = ["oklch(0.78 0.16 80)", "oklch(0.55 0.18 258)", "oklch(0.62 0.16 155)"];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <StatCard label="Today's Sales" value={fmt(todaySales)} icon={<IndianRupee className="size-5" />} accent="primary" sub={`Yesterday: ${fmt(yesterdaySales)}`} />
        <StatCard label="This Week" value={fmt(weeklySales)} icon={<TrendingUp className="size-5" />} accent="success" />
        <StatCard label="This Month" value={fmt(monthlySales)} icon={<TrendingUp className="size-5" />} accent="primary" />
        <StatCard label="This Year" value={fmt(yearlySales)} icon={<TrendingUp className="size-5" />} accent="success" />
        <StatCard label="Total Revenue" value={fmt(totalRevenue)} icon={<IndianRupee className="size-5" />} accent="success" sub="Delivered jobs" />
        <StatCard label="Pending Jobs" value={pending} icon={<Clock className="size-5" />} accent="warning" />
        <StatCard label="Delivered" value={delivered} icon={<Truck className="size-5" />} accent="success" />
        <StatCard label="Completed Repairs" value={completed} icon={<CheckCircle2 className="size-5" />} accent="primary" />
        <StatCard label="Employees" value={Employees.all().length} icon={<Users className="size-5" />} accent="primary" />
        <StatCard label="Customers" value={Customers.all().length} icon={<UserCircle className="size-5" />} accent="primary" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Section title="Revenue — last 14 days">
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={revenueData}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.55 0.18 258)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="oklch(0.55 0.18 258)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="revenue" stroke="oklch(0.55 0.18 258)" strokeWidth={2.5} dot={false} fill="url(#rev)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </div>
        <Section title="Repair Status">
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Most Repaired Brands">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={brandCounts}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Bar dataKey="value" fill="oklch(0.55 0.18 258)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
        <Section title="Recent Jobs" action={<Button asChild variant="outline" size="sm"><Link to="/app/jobs">View all</Link></Button>}>
          <div className="space-y-3">
            {jobs.slice(0, 5).map(j => (
              <Link to={`/app/jobs/${j.id}`} key={j.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors">
                <div className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center"><Smartphone className="size-4" /></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{j.brand} {j.model} · {j.customerName}</div>
                  <div className="text-xs text-muted-foreground truncate">{j.jobSheetNo} · {j.fault}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{fmt(j.amount)}</div>
                  <StatusBadge status={j.deliveryStatus === "Delivered" ? "Delivered" : j.repairStatus} />
                </div>
              </Link>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}

function EmployeeDashboard() {
  const { session } = useAuth();
  if (!session) return null;
  const all = Jobs.all().filter(j => j.assignedEmployeeId === session.userId);
  const assigned = all.length;
  const pending = all.filter(j => j.repairStatus !== "Completed").length;
  const completed = all.filter(j => j.repairStatus === "Completed").length;
  const delivered = all.filter(j => j.deliveryStatus === "Delivered").length;
  const today = new Date();
  const todays = all.filter(j => isSameDay(j.jobDate, today)).length;

  const brandCounts = Object.entries(all.reduce<Record<string, number>>((acc, j) => {
    acc[j.brand] = (acc[j.brand] || 0) + 1; return acc;
  }, {})).map(([name, value]) => ({ name, value }));

  const monthly = useMemo(() => {
    const arr: { month: string; repairs: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(); d.setMonth(today.getMonth() - i);
      const count = all.filter(j => {
        const jd = new Date(j.jobDate);
        return jd.getMonth() === d.getMonth() && jd.getFullYear() === d.getFullYear();
      }).length;
      arr.push({ month: d.toLocaleDateString("en", { month: "short" }), repairs: count });
    }
    return arr;
  }, [all]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Assigned Jobs" value={assigned} icon={<Wrench className="size-5" />} accent="primary" />
        <StatCard label="Pending" value={pending} icon={<Clock className="size-5" />} accent="warning" />
        <StatCard label="Completed" value={completed} icon={<CheckCircle2 className="size-5" />} accent="success" />
        <StatCard label="Delivered" value={delivered} icon={<Truck className="size-5" />} accent="success" />
        <StatCard label="Today's Jobs" value={todays} icon={<Smartphone className="size-5" />} accent="primary" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Most Repaired Brands">
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={brandCounts}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Bar dataKey="value" fill="oklch(0.55 0.18 258)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>
        <Section title="Monthly Repairs">
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="repairs" stroke="oklch(0.62 0.16 155)" strokeWidth={2.5} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      <Section title="My Recent Jobs" action={<Button asChild variant="outline" size="sm"><Link to="/app/jobs">View all</Link></Button>}>
        <div className="space-y-3">
          {all.slice(0, 6).map(j => (
            <Link to={`/app/jobs/${j.id}`} key={j.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent/50">
              <div className="size-10 rounded-lg bg-primary/10 text-primary grid place-items-center"><Smartphone className="size-4" /></div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{j.brand} {j.model}</div>
                <div className="text-xs text-muted-foreground truncate">{j.jobSheetNo} · {j.customerName}</div>
              </div>
              <StatusBadge status={j.deliveryStatus === "Delivered" ? "Delivered" : j.repairStatus} />
            </Link>
          ))}
          {all.length === 0 && <p className="text-sm text-muted-foreground">No jobs assigned yet.</p>}
        </div>
      </Section>
    </div>
  );
}

function CustomerDashboard() {
  const { session } = useAuth();
  if (!session) return null;
  const myJobs = Jobs.all().filter(j => j.customerId === session.userId);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Repairs" value={myJobs.length} icon={<Wrench className="size-5" />} accent="primary" />
        <StatCard label="In Service" value={myJobs.filter(j => j.deliveryStatus !== "Delivered").length} icon={<Clock className="size-5" />} accent="warning" />
        <StatCard label="Delivered" value={myJobs.filter(j => j.deliveryStatus === "Delivered").length} icon={<Truck className="size-5" />} accent="success" />
      </div>
      <Section title="My Repair Jobs">
        <div className="space-y-3">
          {myJobs.map(j => (
            <Link to={`/app/jobs/${j.id}`} key={j.id} className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent/50">
              <div className="size-12 rounded-xl bg-primary/10 text-primary grid place-items-center"><Smartphone className="size-5" /></div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{j.brand} {j.model}</div>
                <div className="text-xs text-muted-foreground">{j.jobSheetNo} · {new Date(j.jobDate).toLocaleDateString("en-IN")} · {j.fault}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{fmt(j.amount)}</div>
                <StatusBadge status={j.deliveryStatus === "Delivered" ? "Delivered" : j.repairStatus} />
              </div>
            </Link>
          ))}
          {myJobs.length === 0 && <p className="text-sm text-muted-foreground">No repairs yet.</p>}
        </div>
      </Section>
    </div>
  );
}
