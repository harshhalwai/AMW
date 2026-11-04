import type { ReactNode } from "react";
import { Smartphone } from "lucide-react";

export function AuthShell({ title, subtitle, icon, children }: { title: string; subtitle: string; icon: ReactNode; children: ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="hidden lg:flex flex-col justify-between p-12 gradient-dark text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-40"
          style={{ background: "radial-gradient(60% 50% at 30% 30%, oklch(0.55 0.18 258 / 0.5), transparent), radial-gradient(60% 60% at 80% 80%, oklch(0.45 0.18 290 / 0.4), transparent)" }} />
        <div className="relative flex items-center gap-3">
          <div className="size-11 rounded-xl gradient-primary grid place-items-center shadow-glow">
            <Smartphone className="size-5" />
          </div>
          <div>
            <div className="font-bold tracking-tight text-lg">Amit Mobile World</div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/60">Repair Operating System</div>
          </div>
        </div>
        <div className="relative">
          <h2 className="text-3xl font-bold leading-tight">Run your repair shop like the pros.</h2>
          <p className="mt-3 text-white/70 max-w-md">OTP-verified delivery, employee performance, customer portal & beautiful printable job sheets — all in one place.</p>
        </div>
        <div className="relative text-xs text-white/40">© {new Date().getFullYear()} AMW</div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md animate-slide-up p-8 rounded-3xl border border-border/80 bg-card shadow-elegant relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1.5 gradient-primary" />
          <div className="flex items-center gap-3 mb-8">
            <div className="size-11 rounded-xl bg-primary/10 text-primary grid place-items-center border border-primary/20">{icon}</div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">{title}</h1>
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
