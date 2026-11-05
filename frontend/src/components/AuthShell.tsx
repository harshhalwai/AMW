import type { ReactNode } from "react";
import { Smartphone, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export function AuthShell({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#080A0F] text-white">
      {/* Left Brand Showcase Banner */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-[#0B0E17] via-[#11141C] to-[#151923] border-r border-[#272B36] relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 50% at 30% 30%, #FF5733, transparent), radial-gradient(60% 60% at 80% 80%, #FF784E, transparent)",
          }}
        />

        <div className="relative flex items-center gap-3">
          <div className="size-11 rounded-xl bg-gradient-to-br from-[#FF5733] to-[#FF784E] grid place-items-center shadow-elegant">
            <Smartphone className="size-5 text-white" />
          </div>
          <div>
            <div className="font-extrabold tracking-tight text-lg flex items-center gap-1.5">
              <span>Amit Mobile World</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#FF5733]/20 text-[#FF784E] border border-[#FF5733]/30">
                ENTERPRISE
              </span>
            </div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-[#A1A1AA]">
              Repair Operating System
            </div>
          </div>
        </div>

        <div className="relative space-y-4 max-w-md">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF5733]/15 text-[#FF784E] border border-[#FF5733]/30 text-xs font-bold">
            <Sparkles className="size-3.5" /> Commercial Fintech Edition
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-white leading-tight">
            Next-generation smartphone repair management.
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            OTP-authenticated handovers, real-time diagnostic auditing, technician task benchmarks, and automated tax invoicing — designed for professional workshops.
          </p>

          <div className="pt-2 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-[#22C55E]" />
              <span>Multi-role access: Owner, Technician &amp; Retail Customer</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-[#22C55E]" />
              <span>Integrated stock inventory &amp; accessories catalog</span>
            </div>
          </div>
        </div>

        <div className="relative text-xs text-muted-foreground">
          © {new Date().getFullYear()} Amit Mobile World. All rights reserved.
        </div>
      </div>

      {/* Right Login Container */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md animate-slide-up p-8 rounded-3xl border border-[#272B36] bg-[#151923] shadow-card relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#FF5733] to-[#FF784E]" />
          <div className="flex items-center gap-3.5 mb-8">
            <div className="size-11 rounded-xl bg-[#FF5733]/15 text-[#FF784E] grid place-items-center border border-[#FF5733]/30">
              {icon}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">{title}</h1>
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            </div>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
