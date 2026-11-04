import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/auth";
import { useTheme } from "../contexts/theme";
import {
  LayoutDashboard, Users, Wrench, BarChart3, Settings, LogOut,
  Smartphone, Menu, Moon, Sun, UserCircle, Star, Plus, MessageSquare, Mail, Phone, MapPin, ChevronDown,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "../utils/utils";
import { Shop } from "../services/store";
import { NotificationBell } from "@/components/NotificationBell";

interface NavItem { to: string; label: string; icon: React.ComponentType<{ className?: string }>; }

const ownerNav: NavItem[] = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/jobs", label: "Jobs", icon: Wrench },
  { to: "/app/customers", label: "Customers", icon: UserCircle },
  { to: "/app/employees", label: "Employees", icon: Users },
  { to: "/app/analytics", label: "Reports", icon: BarChart3 },
  { to: "/app/feedback", label: "Feedback", icon: Star },
  { to: "/app/messages", label: "Messages", icon: MessageSquare },
  { to: "/app/settings", label: "Settings", icon: Settings },
];
const empNav: NavItem[] = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/jobs", label: "Jobs", icon: Wrench },
  { to: "/app/customers", label: "Customers", icon: UserCircle },
  { to: "/app/feedback", label: "Feedback", icon: Star },
  { to: "/app/messages", label: "Messages", icon: MessageSquare },
];
const custNav: NavItem[] = [
  { to: "/app/dashboard", label: "My Repairs", icon: Smartphone },
  { to: "/app/messages", label: "Messages", icon: MessageSquare },
  { to: "/app/feedback", label: "Feedback", icon: Star },
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

  const handleLogout = () => { signOut(); navigate("/"); };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform lg:translate-x-0 lg:static",
        openMobile ? "translate-x-0" : "-translate-x-full",
      )}>
        <div className="h-16 flex items-center gap-3 px-5 border-b border-sidebar-border">
          <div className="size-10 rounded-xl gradient-primary grid place-items-center shadow-glow">
            <Smartphone className="size-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-bold tracking-tight">AMW</div>
            <div className="text-[10px] uppercase tracking-widest text-sidebar-foreground/60">Repair OS</div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map(item => {
            const active = pathname === item.to || (item.to !== "/app/dashboard" && pathname.startsWith(item.to));
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpenMobile(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-elegant"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="size-9 rounded-full bg-sidebar-accent grid place-items-center font-semibold">
              {session.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium truncate">{session.name}</div>
              <div className="text-[11px] capitalize text-sidebar-foreground/60">{session.role}</div>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-md hover:bg-sidebar-accent/70" title="Sign out">
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {openMobile && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setOpenMobile(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0">
        {/* Top navbar */}
        <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="h-16 flex items-center gap-3 px-4 lg:px-8">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpenMobile(true)}>
              <Menu className="size-5" />
            </Button>
            <div className="flex items-center gap-2 mr-2">
              <div className="size-8 rounded-lg gradient-primary grid place-items-center">
                <Smartphone className="size-4 text-primary-foreground" />
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-bold tracking-tight leading-none">AMW</div>
                <div className="text-[9px] uppercase tracking-widest text-muted-foreground">Amit Mobile World</div>
              </div>
            </div>

            {/* Desktop top nav */}
            <nav className="hidden xl:flex items-center gap-1 ml-4">
              {nav.map(item => {
                const active = pathname === item.to || (item.to !== "/app/dashboard" && pathname.startsWith(item.to));
                return (
                  <Link key={item.to} to={item.to}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                      active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
                    )}>
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex-1" />

            {session.role !== "customer" && (
              <Button asChild variant="default" size="sm" className="hidden sm:inline-flex">
                <Link to="/app/jobs/new"><Plus className="size-4" /> New Job</Link>
              </Button>
            )}
            <Button variant="outline" size="icon" onClick={toggle} title="Toggle theme">
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
            {session.role !== "customer" && <NotificationBell />}
            {/* Profile dropdown */}
            <div className="relative">
              <button onClick={() => setOpenTopMobile(v => !v)} className="flex items-center gap-2 px-2 py-1.5 rounded-md border border-border hover:bg-accent text-sm">
                <div className="size-7 rounded-full bg-primary/10 text-primary grid place-items-center text-xs font-semibold">
                  {session.name.charAt(0)}
                </div>
                <span className="hidden sm:inline text-xs font-medium">{session.name.split(" ")[0]}</span>
                <ChevronDown className="size-3.5 text-muted-foreground" />
              </button>
              {openTopMobile && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setOpenTopMobile(false)} />
                  <div className="absolute right-0 mt-1 w-48 bg-popover border border-border rounded-lg shadow-elegant z-40 overflow-hidden">
                    <div className="px-3 py-2 border-b border-border">
                      <div className="text-sm font-medium truncate">{session.name}</div>
                      <div className="text-[11px] capitalize text-muted-foreground">{session.role}</div>
                    </div>
                    <Link to="/app/dashboard" onClick={() => setOpenTopMobile(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent">
                      <UserCircle className="size-4" /> Profile
                    </Link>
                    {(session.role === "owner") && (
                      <Link to="/app/settings" onClick={() => setOpenTopMobile(false)} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent">
                        <Settings className="size-4" /> Settings
                      </Link>
                    )}
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent text-destructive">
                      <LogOut className="size-4" /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          {/* Mobile bottom-of-nav scroller for top nav (visible on small) */}
          <div className="xl:hidden border-t border-border overflow-x-auto">
            <nav className="flex items-center gap-1 px-3 py-2 min-w-max">
              {nav.map(item => {
                const active = pathname === item.to || (item.to !== "/app/dashboard" && pathname.startsWith(item.to));
                return (
                  <Link key={item.to} to={item.to}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors",
                      active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50",
                    )}>
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 animate-fade-in">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-card/40 mt-6">
          <div className="px-4 lg:px-8 py-8 grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="size-9 rounded-lg gradient-primary grid place-items-center">
                  <Smartphone className="size-4 text-primary-foreground" />
                </div>
                <div>
                  <div className="font-bold tracking-tight">{shop.name || "Amit Mobile World (AMW)"}</div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Repair Management</div>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Professional mobile repair shop management — fast, transparent and secure repairs for every device.
              </p>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">About Us</div>
              <ul className="space-y-1.5 text-sm">
                <li className="text-muted-foreground">Trusted repair shop since 2018</li>
                <li className="text-muted-foreground">Authorized parts &amp; warranty</li>
                <li className="text-muted-foreground">All brands serviced</li>
              </ul>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Quick Links</div>
              <ul className="space-y-1.5 text-sm">
                <li><Link to="/app/dashboard" className="text-muted-foreground hover:text-foreground">Dashboard</Link></li>
                <li><Link to="/app/jobs" className="text-muted-foreground hover:text-foreground">Jobs</Link></li>
                <li><Link to="/app/feedback" className="text-muted-foreground hover:text-foreground">Feedback</Link></li>
                <li><Link to="/app/messages" className="text-muted-foreground hover:text-foreground">Messages</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Contact / Support</div>
              <ul className="space-y-1.5 text-sm">
                <li className="flex items-start gap-2 text-muted-foreground"><Phone className="size-3.5 mt-0.5" /> {shop.contact || "+91 98100 12345"}</li>
                <li className="flex items-start gap-2 text-muted-foreground"><Mail className="size-3.5 mt-0.5" /> {shop.email || "support@amitmobileworld.in"}</li>
                <li className="flex items-start gap-2 text-muted-foreground"><MapPin className="size-3.5 mt-0.5" /> {shop.address || "Shop 12, Main Market, Sector 5, New Delhi"}</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border px-4 lg:px-8 py-3 text-center text-[11px] text-muted-foreground">
            © {new Date().getFullYear()} {shop.name || "Amit Mobile World (AMW)"}. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
