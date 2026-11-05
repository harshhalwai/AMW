import { cn } from "../utils/utils";
import type { ReactNode } from "react";
import { TrendingUp, TrendingDown, Inbox } from "lucide-react";

export function StatCard({
  label,
  value,
  icon,
  accent = "primary",
  sub,
  trend,
}: {
  label: string;
  value: ReactNode;
  icon: ReactNode;
  accent?: "primary" | "success" | "warning" | "destructive";
  sub?: string;
  trend?: { value: string; positive?: boolean };
}) {
  const accentStyles: Record<string, { ring: string; badge: string; iconBg: string; text: string }> = {
    primary: {
      ring: "from-[#FF5733]/15 to-transparent border-[#FF5733]/30",
      badge: "text-[#FF5733] bg-[#FF5733]/10 border-[#FF5733]/25",
      iconBg: "bg-[#FF5733]/15 text-[#FF5733] border-[#FF5733]/30",
      text: "text-[#FF5733]",
    },
    success: {
      ring: "from-[#22C55E]/15 to-transparent border-[#22C55E]/30",
      badge: "text-[#22C55E] bg-[#22C55E]/10 border-[#22C55E]/25",
      iconBg: "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/30",
      text: "text-[#22C55E]",
    },
    warning: {
      ring: "from-[#F59E0B]/15 to-transparent border-[#F59E0B]/30",
      badge: "text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/25",
      iconBg: "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30",
      text: "text-[#F59E0B]",
    },
    destructive: {
      ring: "from-[#EF4444]/15 to-transparent border-[#EF4444]/30",
      badge: "text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/25",
      iconBg: "bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30",
      text: "text-[#EF4444]",
    },
  };

  const style = accentStyles[accent] ?? accentStyles.primary;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card p-5 shadow-card hover:border-[#FF5733]/40 hover:-translate-y-0.5 transition-all duration-300 group">
      {/* Subtle radial ambient glow */}
      <div className={cn("absolute -right-8 -top-8 size-28 rounded-full bg-gradient-to-br blur-2xl opacity-40 group-hover:opacity-70 transition-opacity", style.ring)} />
      
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-2 text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono">
            {value}
          </div>
          
          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {trend && (
              <span className={cn(
                "inline-flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded border",
                trend.positive ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/25" : "text-rose-400 bg-rose-500/10 border-rose-500/25"
              )}>
                {trend.positive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
                {trend.value}
              </span>
            )}
            {sub && <span className="text-[11px] text-muted-foreground truncate">{sub}</span>}
          </div>
        </div>

        <div className={cn("size-11 rounded-xl grid place-items-center border group-hover:scale-105 transition-transform shrink-0", style.iconBg)}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function Section({
  title,
  subtitle,
  action,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-2xl border border-border bg-card shadow-card overflow-hidden", className)}>
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/80 bg-secondary/40 backdrop-blur-sm">
        <div>
          <h2 className="font-bold tracking-tight text-sm sm:text-base text-foreground flex items-center gap-2">
            {title}
          </h2>
          {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </section>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "Pending": "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30",
    "In Progress": "bg-[#FF5733]/15 text-[#FF784E] border-[#FF5733]/35",
    "Ready for Delivery": "bg-sky-500/15 text-sky-400 border-sky-500/35",
    "Completed": "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30",
    "Delivered": "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/35",
    "Cancelled": "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30",
    "In Stock": "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30",
    "Low Stock": "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30",
    "Out of Stock": "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30",
  };

  const dots: Record<string, string> = {
    "Pending": "bg-[#F59E0B]",
    "In Progress": "bg-[#FF5733] animate-pulse",
    "Ready for Delivery": "bg-sky-400 animate-pulse",
    "Completed": "bg-[#22C55E]",
    "Delivered": "bg-[#22C55E]",
    "Cancelled": "bg-[#EF4444]",
    "In Stock": "bg-[#22C55E]",
    "Low Stock": "bg-[#F59E0B] animate-pulse",
    "Out of Stock": "bg-[#EF4444]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border",
        map[status] ?? "bg-muted text-muted-foreground border-border"
      )}
    >
      <span className={cn("size-1.5 rounded-full shrink-0", dots[status] ?? "bg-muted-foreground")} />
      {status}
    </span>
  );
}

export function EmptyState({
  title = "No data found",
  description = "No records match the current criteria.",
  action,
  icon,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="py-12 px-4 text-center flex flex-col items-center justify-center space-y-3">
      <div className="size-12 rounded-2xl bg-secondary/80 border border-border/80 grid place-items-center text-muted-foreground">
        {icon || <Inbox className="size-6 text-muted-foreground/60" />}
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground max-w-sm">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

export function SkeletonLoader({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-secondary/60 rounded-xl border border-border/40 w-full" />
      ))}
    </div>
  );
}
