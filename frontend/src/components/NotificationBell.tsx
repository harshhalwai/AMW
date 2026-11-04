import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, Check, Trash2, Filter as FilterIcon, X } from "lucide-react";
import { Notifications, NOTIFICATIONS_EVENT, type Notification, type NotificationType } from "../services/store";
import { cn } from "../utils/utils";

const CATEGORIES = [
  { id: "All", label: "All" },
  { id: "Jobs", label: "Jobs" },
  { id: "Repair", label: "Repair" },
  { id: "Delivery", label: "Delivery" },
  { id: "Customers", label: "Customers" },
  { id: "Employees", label: "Employees" },
  { id: "Messages", label: "Messages" },
  { id: "Feedback", label: "Feedback" },
] as const;
type Cat = typeof CATEGORIES[number]["id"];

const CAT_OF: Record<NotificationType, Cat> = {
  job_added: "Jobs",
  job_updated: "Jobs",
  job_deleted: "Jobs",
  repair_completed: "Repair",
  repair_status: "Repair",
  delivery_status: "Delivery",
  delivered: "Delivery",
  otp_sent: "Delivery",
  customer_updated: "Customers",
  employee_added: "Employees",
  employee_updated: "Employees",
  message_sent: "Messages",
  feedback_submitted: "Feedback",
  rating_submitted: "Feedback",
};

const DOT: Record<Cat, string> = {
  All: "bg-muted-foreground",
  Jobs: "bg-blue-500",
  Repair: "bg-amber-500",
  Delivery: "bg-emerald-500",
  Customers: "bg-violet-500",
  Employees: "bg-pink-500",
  Messages: "bg-cyan-500",
  Feedback: "bg-yellow-500",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-IN");
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [cat, setCat] = useState<Cat>("All");
  const ref = useRef<HTMLDivElement>(null);

  const refresh = () => setItems(Notifications.all());

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener(NOTIFICATIONS_EVENT, onChange);
    window.addEventListener("storage", onChange);
    const t = setInterval(refresh, 8000);
    return () => {
      window.removeEventListener(NOTIFICATIONS_EVENT, onChange);
      window.removeEventListener("storage", onChange);
      clearInterval(t);
    };
  }, []);

  const filtered = useMemo(
    () => (cat === "All" ? items : items.filter(n => CAT_OF[n.type] === cat)),
    [items, cat],
  );
  const unread = items.filter(n => !n.read).length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        title="Notifications"
        className="relative size-9 rounded-md border border-border hover:bg-accent grid place-items-center transition-colors"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold grid place-items-center animate-pulse">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-[min(92vw,380px)] bg-popover border border-border rounded-xl shadow-elegant z-40 overflow-hidden animate-in fade-in slide-in-from-top-2">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div>
                <div className="text-sm font-semibold">Notifications</div>
                <div className="text-[11px] text-muted-foreground">
                  {unread > 0 ? `${unread} unread` : "All caught up"}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { Notifications.markAllRead(); refresh(); }}
                  title="Mark all as read"
                  className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"
                >
                  <Check className="size-4" />
                </button>
                <button
                  onClick={() => { if (confirm("Clear all notifications?")) { Notifications.clearAll(); refresh(); } }}
                  title="Clear all"
                  className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"
                >
                  <Trash2 className="size-4" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-md hover:bg-accent text-muted-foreground"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Filter */}
            <div className="px-3 py-2 border-b border-border flex items-center gap-1 overflow-x-auto">
              <FilterIcon className="size-3.5 text-muted-foreground shrink-0" />
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCat(c.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-colors",
                    cat === c.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent",
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="max-h-[60vh] overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-muted-foreground">
                  <Bell className="size-8 mx-auto mb-2 opacity-30" />
                  No notifications {cat !== "All" ? `in ${cat}` : "yet"}.
                </div>
              ) : (
                filtered.map(n => {
                  const c = CAT_OF[n.type];
                  return (
                    <button
                      key={n.id}
                      onClick={() => { if (!n.read) { Notifications.markRead(n.id); refresh(); } }}
                      className={cn(
                        "w-full text-left px-4 py-3 border-b border-border/60 hover:bg-accent/50 transition-colors flex gap-3",
                        !n.read && "bg-primary/5",
                      )}
                    >
                      <span className={cn("mt-1.5 size-2 rounded-full shrink-0", DOT[c])} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-sm font-medium truncate">{n.title}</div>
                          {!n.read && <span className="size-1.5 rounded-full bg-primary mt-1.5 shrink-0" />}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</div>
                        <div className="text-[10px] text-muted-foreground/80 mt-1 flex items-center gap-2 flex-wrap">
                          {n.actorName && (
                            <span className="font-medium text-foreground/70">
                              {n.actorName}{n.actorRole ? ` (${n.actorRole})` : ""}
                            </span>
                          )}
                          {n.jobSheetNo && <span>· {n.jobSheetNo}</span>}
                          <span>· {timeAgo(n.createdAt)}</span>
                          <span className="ml-auto px-1.5 py-0.5 rounded bg-muted text-[9px] uppercase tracking-wide">{c}</span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
