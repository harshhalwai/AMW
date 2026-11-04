import { cn } from "../utils/utils";
import type { ReactNode } from "react";

export function StatCard({
  label, value, icon, accent, sub,
}: { label: string; value: ReactNode; icon: ReactNode; accent?: "primary" | "success" | "warning" | "destructive"; sub?: string }) {
  const ring: Record<string, string> = {
    primary: "from-primary/15 to-primary/0 text-primary border-primary/20",
    success: "from-success/15 to-success/0 text-success border-success/20",
    warning: "from-warning/15 to-warning/0 text-warning border-warning/20",
    destructive: "from-destructive/15 to-destructive/0 text-destructive border-destructive/20",
  };
  const a = ring[accent ?? "primary"];
  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-card hover:shadow-elegant hover:-translate-y-1 transition-all duration-300 group">
      <div className={cn("absolute -right-8 -top-8 size-32 rounded-full bg-gradient-to-br blur-2xl opacity-60 group-hover:opacity-80 transition-opacity", a)} />
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="min-w-0">
          <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
          <div className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-foreground">{value}</div>
          {sub && <div className="mt-1 text-[11px] font-semibold text-muted-foreground">{sub}</div>}
        </div>
        <div className={cn("size-11 rounded-2xl grid place-items-center bg-accent/40 border group-hover:scale-110 transition-transform", a)}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-card shadow-card overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-border bg-accent/15">
        <h2 className="font-extrabold tracking-tight text-sm sm:text-base">{title}</h2>
        {action}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "Pending": "bg-warning/10 text-warning border-warning/30",
    "In Progress": "bg-primary/10 text-primary border-primary/30",
    "Ready for Delivery": "bg-primary/10 text-primary border-primary/30",
    "Completed": "bg-success/10 text-success border-success/30",
    "Delivered": "bg-success/10 text-success border-success/30",
  };

  const dots: Record<string, string> = {
    "Pending": "bg-warning",
    "In Progress": "bg-primary animate-pulse",
    "Ready for Delivery": "bg-primary animate-pulse",
    "Completed": "bg-success",
    "Delivered": "bg-success",
  };

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border", map[status] ?? "bg-muted text-muted-foreground border-border")}>
      <span className={cn("size-1.5 rounded-full shrink-0", dots[status] ?? "bg-muted-foreground")} />
      {status}
    </span>
  );
}
