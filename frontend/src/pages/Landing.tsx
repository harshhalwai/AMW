import { Link, useNavigate } from "react-router-dom";
import {
  Smartphone, ShieldCheck, Wrench, UserCircle, ArrowRight, Sparkles, Star, CheckCircle2, ChevronDown, Phone, Mail, MapPin, Award, Activity
} from "lucide-react";
import { useAuth } from "../contexts/auth";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function Landing() {
  const { session } = useAuth();
  const navigate = useNavigate();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  
  useEffect(() => {
    if (session) {
      navigate("/app/dashboard");
    }
  }, [session, navigate]);

  const stats = [
    { label: "Happy Customers", value: "15,000+" },
    { label: "Devices Repaired", value: "32,000+" },
    { label: "Expert Technicians", value: "24+" },
    { label: "Years of Experience", value: "10+" },
  ];

  const services = [
    { title: "Screen Replacement", desc: "Premium OEM grade glass & OLED replacements with 90-day warranty.", icon: <Smartphone className="size-6 text-primary" /> },
    { title: "Battery Health Upgrade", desc: "Extend device life with brand new high-capacity batteries & calibrations.", icon: <Activity className="size-6 text-green-500" /> },
    { title: "Charging Port Repair", desc: "Fix USB-C or Lightning connectors and power delivery chipsets.", icon: <Wrench className="size-6 text-orange-500" /> },
    { title: "Motherboard Diagnostics", desc: "Micro-soldering, IC swaps, and recovery of completely dead phones.", icon: <ShieldCheck className="size-6 text-primary" /> },
    { title: "Water Damage Recovery", desc: "Ultrasonic cleaning & chemical washes to rescue liquid-damaged devices.", icon: <Sparkles className="size-6 text-blue-500" /> },
    { title: "Camera & Sensor Fixes", desc: "Restore blurry camera lenses, autofocus faults, and proximity sensors.", icon: <Award className="size-6 text-yellow-500" /> },
  ];

  const faqs = [
    { q: "How long does a typical mobile repair take?", a: "Most minor repairs (like display swaps or battery upgrades) are completed within 45 to 60 minutes. Complex motherboard diagnostics can take 1-3 business days." },
    { q: "Do you use original replacement parts?", a: "Yes, we use 100% original OEM specification parts sourced directly from trusted manufacturers. Every replacement is thoroughly tested before delivery." },
    { q: "Is there a warranty on your repair services?", a: "Absolutely! We provide a comprehensive 90-day warranty on all premium display & battery repairs. The warranty covers manufacturing defects and touch response issues." },
    { q: "How can I track the live status of my repair?", a: "Simply use our Customer Portal with your Job Sheet number and registered mobile number to see real-time updates and view the timeline of your device." },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 opacity-20 dark:opacity-30 pointer-events-none overflow-hidden"
        style={{ background: "radial-gradient(80% 50% at 10% 10%, oklch(0.55 0.18 258 / 0.3), transparent), radial-gradient(60% 60% at 90% 90%, oklch(0.45 0.16 290 / 0.2), transparent)" }} />

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl gradient-primary grid place-items-center shadow-glow">
              <Smartphone className="size-5 text-white" />
            </div>
            <div>
              <div className="font-bold tracking-tight text-base leading-none">AMW</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">Amit Mobile World</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-accent/40 font-medium">
              <Sparkles className="size-3 text-primary animate-pulse" /> Premium Repair OS v2.0
            </span>
            <Button asChild variant="outline" size="sm">
              <a href="#portals">Access Portals</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 pt-16 pb-20 lg:pt-24 lg:pb-32 grid lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6 text-left animate-slide-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
            <Award className="size-3.5" /> Delhi's Most Trusted Repair Workshop
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.05]">
            Repair Your Smartphone <span className="text-gradient">with Confidence</span>.
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
            Amit Mobile World (AMW) offers certified mobile diagnostics, genuine component upgrades, and live SMS/OTP-tracked repair management. Get your phone repaired by specialists.
          </p>
          <div className="flex flex-wrap gap-4 pt-2">
            <Button asChild size="lg" className="rounded-xl px-8 shadow-elegant">
              <a href="#portals">Book Repair Now</a>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-xl px-8">
              <Link to="/login/customer">Track Repair Status</Link>
            </Button>
          </div>
          
          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border/50 max-w-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-green-500 shrink-0" />
              <span className="text-xs font-medium text-muted-foreground">Original OEM Parts</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-green-500 shrink-0" />
              <span className="text-xs font-medium text-muted-foreground">90-Day Warranty</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-green-500 shrink-0" />
              <span className="text-xs font-medium text-muted-foreground">OTP-Verified Safety</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Preview */}
        <div className="lg:col-span-5 relative animate-fade-in">
          <div className="absolute inset-0 bg-primary/10 rounded-3xl filter blur-3xl" />
          <div className="relative glass border border-border/80 rounded-3xl p-6 shadow-elegant space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Repair Diagnostics</span>
              <span className="size-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-accent/40 p-3.5 rounded-xl border border-border/40">
                <Smartphone className="size-5 text-primary shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground">Active Order</div>
                  <div className="text-sm font-bold truncate">iPhone 14 Pro Max</div>
                </div>
                <div className="px-2.5 py-1 bg-primary/15 text-primary rounded-full text-[10px] font-bold">In Progress</div>
              </div>
              <div className="flex items-center gap-3 bg-accent/40 p-3.5 rounded-xl border border-border/40">
                <Wrench className="size-5 text-orange-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-muted-foreground">Diagnostics Fault</div>
                  <div className="text-sm font-bold truncate">Digitizer Screen Glass Shattered</div>
                </div>
              </div>
              <div className="bg-accent/30 p-4 rounded-2xl border border-border/30 space-y-3">
                <div className="text-xs font-bold text-muted-foreground">Live Timeline</div>
                <div className="flex gap-2">
                  <span className="size-2 rounded-full bg-green-500 shrink-0 mt-1" />
                  <div className="text-xs">
                    <span className="font-semibold block">Job sheet registered</span>
                    <span className="text-[10px] text-muted-foreground">Assigned to Tech #24</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="bg-accent/40 border-y border-border/50 py-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, idx) => (
            <div key={idx} className="text-center space-y-1">
              <div className="text-3xl sm:text-4xl font-extrabold text-primary">{s.value}</div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services Cards */}
      <section className="max-w-7xl mx-auto px-6 py-20 lg:py-28 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Our Repair Services</h2>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
            Professional solutions for all hardware and software smartphone defects.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((ser, idx) => (
            <div key={idx} className="group p-6 rounded-2xl bg-card border border-border hover:shadow-elegant hover:-translate-y-1 transition-all duration-350">
              <div className="size-12 rounded-xl bg-accent/80 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                {ser.icon}
              </div>
              <h3 className="font-bold text-lg mb-2">{ser.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{ser.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Portals Access Section */}
      <section id="portals" className="relative py-20 lg:py-28 bg-accent/10 border-y border-border/40 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 space-y-12 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Access Customer &amp; Staff Portals</h2>
            <p className="text-muted-foreground text-sm sm:text-base">
              Choose your role below to manage jobs, upload photos, or track repair status.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <PortalCard to="/login/owner" title="Owner Administration" desc="Monitor sales volumes, configure pricing models, and track staff efficiency."
              icon={<ShieldCheck className="size-6 text-primary" />} hint="owner / owner123" />
            <PortalCard to="/login/employee" title="Technician Portal" desc="Manage active repairs, write diagnostic remarks, and execute OTP deliveries."
              icon={<Wrench className="size-6 text-orange-500" />} hint="EMP001 / emp123" />
            <PortalCard to="/login/customer" title="Customer Portal" desc="Track repair status in real-time, view live history, and print invoices."
              icon={<UserCircle className="size-6 text-emerald-500" />} hint="9123456780 / AMW-1000" />
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      <section className="max-w-7xl mx-auto px-6 py-20 lg:py-28 space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">What Our Customers Say</h2>
          <p className="text-muted-foreground text-sm">Real reviews from Google and local diagnostic sheets</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <ReviewCard name="Amit Sharma" device="iPhone 13 Pro Display Swap" comment="Absolutely brilliant service! Replaced my display in 45 minutes right in front of me. Highly professional setup." stars={5} />
          <ReviewCard name="Priya Patel" device="Samsung Galaxy S22 Battery Fix" comment="Very transparent system. I could track the progress of my repair online using the OTP portal. Highly recommended!" stars={5} />
          <ReviewCard name="Rohan Das" device="OnePlus Nord Motherboard Repair" comment="Other shops said my phone was dead forever. AMW micro-soldered it back to life. Truly expert technicians." stars={5} />
        </div>
      </section>

      {/* FAQs Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 lg:py-28 space-y-10">
        <div className="text-center space-y-3">
          <h2 className="text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
          <p className="text-muted-foreground text-sm">Everything you need to know about our service center workflows</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const open = activeFaq === idx;
            return (
              <div key={idx} className="rounded-xl border border-border bg-card overflow-hidden">
                <button onClick={() => setActiveFaq(open ? null : idx)}
                  className="w-full text-left p-5 flex items-center justify-between font-bold text-sm sm:text-base hover:bg-accent/40 transition-colors">
                  <span>{faq.q}</span>
                  <ChevronDown className={`size-4 text-muted-foreground transition-transform duration-250 ${open ? "rotate-180" : ""}`} />
                </button>
                {open && (
                  <div className="p-5 pt-0 text-xs sm:text-sm text-muted-foreground border-t border-border/40 bg-accent/10 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="border-t border-border bg-card/60">
        <div className="max-w-7xl mx-auto px-6 py-12 grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="size-9 rounded-lg gradient-primary grid place-items-center">
                <Smartphone className="size-4 text-white" />
              </div>
              <div className="font-extrabold tracking-tight">AMW - Amit Mobile World</div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Premium mobile diagnostic and repair center based in Delhi. Trusted by thousands for rapid servicing and OEM reliability.
            </p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3">Workshop Hours</h4>
            <ul className="text-xs text-muted-foreground space-y-1.5 font-medium">
              <li>Mon - Sat: 10:00 AM - 08:30 PM</li>
              <li className="text-primary">Sunday: Closed (Weekly off)</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3">Quick Links</h4>
            <ul className="text-xs text-muted-foreground space-y-1.5 font-medium">
              <li><Link to="/login/customer" className="hover:text-foreground">Track Device</Link></li>
              <li><a href="#portals" className="hover:text-foreground">Staff Login</a></li>
              <li><a href="#portals" className="hover:text-foreground">Book Service</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-3">Contact Support</h4>
            <ul className="text-xs text-muted-foreground space-y-2">
              <li className="flex items-start gap-2"><Phone className="size-3.5 mt-0.5 text-primary" /> +91 98100 12345</li>
              <li className="flex items-start gap-2"><Mail className="size-3.5 mt-0.5 text-primary" /> support@amitmobileworld.in</li>
              <li className="flex items-start gap-2"><MapPin className="size-3.5 mt-0.5 text-primary" /> Shop 12, Main Market, Sector 5, New Delhi</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Amit Mobile World (AMW) · Premium Repair Management Edition.
        </div>
      </footer>
    </div>
  );
}

function PortalCard({ to, title, desc, icon, hint }: { to: string; title: string; desc: string; icon: React.ReactNode; hint: string }) {
  return (
    <Link to={to} className="group flex flex-col justify-between p-6 rounded-2xl bg-card border border-border hover:shadow-elegant hover:border-primary/50 transition-all duration-350">
      <div>
        <div className="size-11 rounded-xl bg-accent/80 flex items-center justify-center mb-4">{icon}</div>
        <h3 className="font-extrabold text-base mb-1 group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
      </div>
      <div className="mt-6 flex items-center justify-between text-[10px]">
        <span className="text-muted-foreground">Demo: <span className="font-mono bg-accent px-1.5 py-0.5 rounded border border-border">{hint}</span></span>
        <span className="inline-flex items-center gap-1 text-primary font-bold group-hover:translate-x-1 transition-transform">
          Enter <ArrowRight className="size-3" />
        </span>
      </div>
    </Link>
  );
}

function ReviewCard({ name, device, comment, stars }: { name: string; device: string; comment: string; stars: number }) {
  return (
    <div className="p-6 rounded-2xl bg-card border border-border shadow-card space-y-3">
      <div className="flex gap-0.5">
        {Array.from({ length: stars }).map((_, i) => (
          <Star key={i} className="size-4 fill-yellow-500 text-yellow-500" />
        ))}
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground italic font-medium">"{comment}"</p>
      <div className="pt-2 border-t border-border/50 flex justify-between items-center">
        <div>
          <div className="text-xs font-bold">{name}</div>
          <div className="text-[10px] text-muted-foreground">{device}</div>
        </div>
        <div className="size-7 rounded-full bg-accent text-primary font-bold grid place-items-center text-xs">
          {name.charAt(0)}
        </div>
      </div>
    </div>
  );
}
