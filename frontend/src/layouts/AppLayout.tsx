import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/auth";
import { useTheme } from "../contexts/theme";
import {
  LayoutDashboard, Users, Wrench, BarChart3, Settings, LogOut,
  Smartphone, Menu, Moon, Sun, UserCircle, Star, Plus, MessageSquare,
  Package, ChevronDown, Sparkles, Phone, Mail, MapPin, X, ArrowUpRight
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "../utils/utils";
import { Shop } from "../services/store";
import { NotificationBell } from "@/components/NotificationBell";

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const ownerNav: NavItem[] = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/products", label: "Products", icon: Package },
  { to: "/app/jobs", label: "Orders & Repairs", icon: Wrench },
  { to: "/app/customers", label: "Customers", icon: UserCircle },
  { to: "/app/employees", label: "Employees", icon: Users },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/feedback", label: "Feedback", icon: Star },
  { to: "/app/messages", label: "Messages", icon: MessageSquare },
  { to: "/app/settings", label: "Settings", icon: Settings },
];

const empNav: NavItem[] = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/products", label: "Products", icon: Package },
  { to: "/app/jobs", label: "Assigned Repairs", icon: Wrench },
  { to: "/app/customers", label: "Customers", icon: UserCircle },
  { to: "/app/messages", label: "Messages", icon: MessageSquare },
  { to: "/app/feedback", label: "Feedback", icon: Star },
];

const custNav: NavItem[] = [
  { to: "/app/dashboard", label: "My Repairs", icon: Smartphone },
  { to: "/app/products", label: "Store Catalog", icon: Package },
  { to: "/app/messages", label: "Support Chat", icon: MessageSquare },
  { to: "/app/feedback", label: "Rate Service", icon: Star },
];

export function AppLayout() {
  const { session, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [openMobile, setOpenMobile] = useState(false);
  const [openTopMobile, setOpenTopMobile] = useState(false);

  if (!session) return null;
  const nav = session.role === "owner" ? ownerNav : session.role === "employee" ? empNav : custNav;
  const shop = Shop.get();

  const handleLogout = () => {
    signOut();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-[#080A0F] text-white">
      {/* LEFT SIDEBAR (Desktop) */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-[#0B0E17] text-white border-r border-[#202533] transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static",
          openMobile ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand / Logo */}
        <div className="h-18 flex items-center justify-between px-5 border-b border-[#202533]/80">
          <Link to="/app/dashboard" className="flex items-center gap-3 group">
            <div className="size-10 rounded-xl bg-gradient-to-br from-[#FF5733] to-[#FF784E] grid place-items-center shadow-elegant group-hover:scale-105 transition-transform">
              <Smartphone className="size-5 text-white" />
            </div>
            <div>
              <div className="font-extrabold tracking-tight text-base flex items-center gap-1.5">
                <span>AMW</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#FF5733]/20 text-[#FF784E] border border-[#FF5733]/30">
                  PRO
                </span>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-[#A1A1AA]">
                Amit Mobile World
              </div>
            </div>
          </Link>
          <button
            onClick={() => setOpenMobile(false)}
            className="p-1 rounded-lg text-muted-foreground hover:text-white lg:hidden"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          <div className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
            Navigation
          </div>
          {nav.map(item => {
            const active =
              pathname === item.to ||
              (item.to !== "/app/dashboard" && pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpenMobile(false)}
                className={cn(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 group",
                  active
                    ? "bg-[#181D29] text-white border border-[#FF5733]/40 shadow-sm"
                    : "text-[#A1A1AA] hover:bg-[#151923] hover:text-white"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <item.icon
                    className={cn(
                      "size-4 shrink-0 transition-colors",
                      active ? "text-[#FF5733]" : "text-[#A1A1AA] group-hover:text-white"
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {active && (
                  <span className="size-1.5 rounded-full bg-[#FF5733] shadow-glow" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Customer Public Store Link */}
        <div className="px-3 py-2 border-t border-[#202533]/80">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-muted-foreground hover:bg-[#151923] hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="size-3.5 text-[#FF784E]" />
              Visit Store Front
            </span>
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>

        {/* User Card */}
        <div className="p-3 border-t border-[#202533]">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-[#151923]/70 border border-[#272B36]">
            <div className="size-9 rounded-xl bg-gradient-to-br from-[#FF5733]/20 to-[#FF784E]/10 border border-[#FF5733]/30 grid place-items-center font-bold text-[#FF784E] text-xs">
              {session.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">{session.name}</div>
              <div className="text-[10px] capitalize text-[#FF784E] font-semibold">{session.role}</div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {openMobile && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setOpenMobile(false)}
        />
      )}

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* TOP NAVBAR */}
        <header className="sticky top-0 z-20 border-b border-[#272B36] bg-[#080A0F]/85 backdrop-blur-xl">
          <div className="h-16 flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-white hover:bg-secondary"
                onClick={() => setOpenMobile(true)}
              >
                <Menu className="size-5" />
              </Button>

              <div className="hidden sm:flex items-center gap-2">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs text-muted-foreground font-medium">AMW Repair OS</span>
                <span className="text-xs text-muted-foreground/60">•</span>
                <span className="text-xs text-muted-foreground font-mono">v2.5 Live</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {session.role !== "customer" && (
                <Button
                  asChild
                  size="sm"
                  className="bg-[#FF5733] hover:bg-[#FF784E] text-white shadow-elegant rounded-xl text-xs font-bold px-3 sm:px-4"
                >
                  <Link to="/app/jobs/new">
                    <Plus className="size-4 mr-1" />
                    <span>New Job</span>
                  </Link>
                </Button>
              )}

              {session.role !== "customer" && <NotificationBell />}

              <Button
                variant="outline"
                size="icon"
                onClick={toggle}
                className="border-[#272B36] bg-card hover:bg-secondary text-white rounded-xl"
                title="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </Button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setOpenTopMobile(v => !v)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-[#272B36] hover:bg-card text-xs font-semibold text-white transition-colors"
                >
                  <div className="size-7 rounded-lg bg-[#FF5733]/20 text-[#FF784E] border border-[#FF5733]/30 grid place-items-center text-xs font-bold">
                    {session.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:inline font-medium">{session.name.split(" ")[0]}</span>
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                </button>

                {openTopMobile && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setOpenTopMobile(false)} />
                    <div className="absolute right-0 mt-2 w-52 bg-[#151923] border border-[#272B36] rounded-2xl shadow-elegant z-40 overflow-hidden text-xs animate-scale-in">
                      <div className="p-3 border-b border-[#272B36] bg-[#11141C]">
                        <div className="font-bold text-white truncate">{session.name}</div>
                        <div className="text-[10px] capitalize text-[#FF784E] mt-0.5">{session.role} Portal</div>
                      </div>
                      <Link
                        to="/app/dashboard"
                        onClick={() => setOpenTopMobile(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2.5 text-[#A1A1AA] hover:text-white hover:bg-[#1C2230] transition-colors"
                      >
                        <UserCircle className="size-4 text-[#FF5733]" /> Dashboard Home
                      </Link>
                      {session.role === "owner" && (
                        <Link
                          to="/app/settings"
                          onClick={() => setOpenTopMobile(false)}
                          className="flex items-center gap-2.5 px-3.5 py-2.5 text-[#A1A1AA] hover:text-white hover:bg-[#1C2230] transition-colors"
                        >
                          <Settings className="size-4 text-[#FF5733]" /> Shop Settings
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-rose-400 hover:bg-rose-500/10 border-t border-[#272B36] transition-colors text-left"
                      >
                        <LogOut className="size-4" /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 animate-fade-in max-w-7xl mx-auto w-full">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-[#272B36] bg-[#0B0E17]/60 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid gap-8 md:grid-cols-4 text-xs">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="size-8 rounded-lg bg-[#FF5733] grid place-items-center">
                  <Smartphone className="size-4 text-white" />
                </div>
                <div>
                  <div className="font-bold text-white tracking-tight">{shop.name || "Amit Mobile World (AMW)"}</div>
                  <div className="text-[9px] uppercase tracking-widest text-[#FF784E]">Enterprise Repair OS</div>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed mt-2">
                Certified smartphone diagnostics, genuine OEM parts warranty, and live OTP verification.
              </p>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white mb-2.5">
                Quick Navigation
              </div>
              <ul className="space-y-1.5 text-muted-foreground">
                <li><Link to="/app/dashboard" className="hover:text-white transition-colors">Analytics Dashboard</Link></li>
                <li><Link to="/app/products" className="hover:text-white transition-colors">Products &amp; Inventory</Link></li>
                <li><Link to="/app/jobs" className="hover:text-white transition-colors">Repair Orders</Link></li>
                <li><Link to="/app/feedback" className="hover:text-white transition-colors">Customer Feedback</Link></li>
              </ul>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white mb-2.5">
                Support &amp; Location
              </div>
              <ul className="space-y-1.5 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Phone className="size-3.5 text-[#FF784E] mt-0.5 shrink-0" />
                  <span>{shop.contact || "+91 98100 12345"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="size-3.5 text-[#FF784E] mt-0.5 shrink-0" />
                  <span>{shop.email || "support@amitmobileworld.in"}</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin className="size-3.5 text-[#FF784E] mt-0.5 shrink-0" />
                  <span>{shop.address || "Shop 12, Main Market, Sector 5, New Delhi"}</span>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white mb-2.5">
                Live Status
              </div>
              <div className="p-3 rounded-xl bg-[#151923] border border-[#272B36] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">API Server:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Database:</span>
                  <span className="text-white font-mono">amw_db</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-[#272B36]/80 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-muted-foreground gap-2">
            <span>© {new Date().getFullYear()} Amit Mobile World. All rights reserved.</span>
            <span>Fintech Dashboard Aesthetic • Dark UI v2.5</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
