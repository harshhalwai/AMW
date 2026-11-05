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
  Jobs: "bg-[#FF5733]",
  Repair: "bg-[#FF784E]",
  Delivery: "bg-[#22C55E]",
  Customers: "bg-purple-400",
  Employees: "bg-sky-400",
  Messages: "bg-amber-400",
  Feedback: "bg-yellow-400",
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
    [items, cat]
  );
  const unread = items.filter(n => !n.read).length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        title="Notifications"
        className="relative size-9 rounded-xl border border-[#272B36] bg-[#151923] hover:bg-[#1C2230] text-white grid place-items-center transition-colors"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#FF5733] text-white text-[10px] font-bold grid place-items-center animate-pulse shadow-md font-mono">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-[min(92vw,380px)] bg-[#151923] border border-[#272B36] rounded-2xl shadow-elegant z-40 overflow-hidden text-xs animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#272B36] bg-[#11141C]">
              <div>
                <div className="font-bold text-white text-sm">Notifications</div>
                <div className="text-[11px] text-[#A1A1AA]">
                  {unread > 0 ? `${unread} unread events` : "All caught up"}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { Notifications.markAllRead(); refresh(); }}
                  title="Mark all as read"
                  className="p-1.5 rounded-lg hover:bg-[#1C2230] text-[#A1A1AA] hover:text-white"
                >
                  <Check className="size-3.5" />
                </button>
                <button
                  onClick={() => { if (confirm("Clear all notifications?")) { Notifications.clearAll(); refresh(); } }}
                  title="Clear all"
                  className="p-1.5 rounded-lg hover:bg-[#1C2230] text-[#A1A1AA] hover:text-rose-400"
                >
                  <Trash2 className="size-3.5" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-[#1C2230] text-[#A1A1AA] hover:text-white"
                >
                  <X className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Filter pills */}
            <div className="px-3 py-2 border-b border-[#272B36] flex items-center gap-1 overflow-x-auto bg-[#0B0E17]/50">
              <FilterIcon className="size-3.5 text-muted-foreground shrink-0" />
              {CATEGORIES.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCat(c.id)}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[10px] font-semibold whitespace-nowrap transition-colors",
                    cat === c.id
                      ? "bg-[#FF5733] text-white"
                      : "bg-[#181D29] text-muted-foreground hover:text-white"
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Notification list */}
            <div className="max-h-[55vh] overflow-y-auto divide-y divide-[#272B36]/60">
              {filtered.length === 0 ? (
                <div className="px-6 py-10 text-center text-muted-foreground">
                  <Bell className="size-8 mx-auto mb-2 opacity-30 text-[#FF5733]" />
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
                        "w-full text-left px-4 py-3 hover:bg-[#1C2230] transition-colors flex gap-3",
                        !n.read && "bg-[#FF5733]/5"
                      )}
                    >
                      <span className={cn("mt-1.5 size-2 rounded-full shrink-0", DOT[c])} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="text-xs font-bold text-white truncate">{n.title}</div>
                          {!n.read && <span className="size-1.5 rounded-full bg-[#FF5733] mt-1 shrink-0" />}
                        </div>
                        <div className="text-muted-foreground line-clamp-2 mt-0.5 text-[11px] leading-relaxed">
                          {n.message}
                        </div>
                        <div className="text-[10px] text-muted-foreground/80 mt-1 flex items-center gap-2 flex-wrap font-mono">
                          {n.jobSheetNo && <span className="text-[#FF784E] font-semibold">{n.jobSheetNo}</span>}
                          <span>{timeAgo(n.createdAt)}</span>
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
