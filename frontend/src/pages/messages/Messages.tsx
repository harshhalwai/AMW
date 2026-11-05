import { useAuth } from "../../contexts/auth";
import { Messages as StoreMessages, Customers, Notifications, type Message } from "../../services/store";
import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Section } from "@/components/ui-bits";
import { Send, UserCircle, MessageSquare, Check, CheckCheck, Sparkles, Phone } from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../utils/utils";

export function Messages() {
  const { session } = useAuth();
  const [selectedCustomerId, setSelectedCust] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [tick, setTick] = useState(0);

  const isCustomer = session?.role === "customer";
  const allMessages = StoreMessages.all();

  useEffect(() => {
    if (isCustomer && session) {
      setSelectedCust(session.userId);
    }
  }, [isCustomer, session]);

  const conversationPartners = useMemo(() => {
    if (isCustomer) return [];
    const customerMap = new Map<string, { id: string; name: string; mobile: string; unread: number }>();
    allMessages.forEach(m => {
      const existing = customerMap.get(m.customerId);
      const isUnread = !m.read && m.sentByRole === "customer";
      if (existing) {
        if (isUnread) existing.unread += 1;
      } else {
        customerMap.set(m.customerId, {
          id: m.customerId,
          name: m.customerName,
          mobile: m.customerMobile,
          unread: isUnread ? 1 : 0,
        });
      }
    });
    return Array.from(customerMap.values());
  }, [allMessages, isCustomer, tick]);

  const activeThread = useMemo(() => {
    if (!selectedCustomerId) return [];
    return allMessages
      .filter(m => m.customerId === selectedCustomerId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [allMessages, selectedCustomerId, tick]);

  useEffect(() => {
    if (!selectedCustomerId) return;
    const unreadFromPartner = activeThread.filter(m => {
      if (isCustomer) {
        return !m.read && m.sentByRole !== "customer";
      } else {
        return !m.read && m.sentByRole === "customer";
      }
    });
    if (unreadFromPartner.length > 0) {
      unreadFromPartner.forEach(m => StoreMessages.markRead(m.id));
    }
  }, [activeThread, selectedCustomerId, isCustomer]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) return toast.error("Please select a customer thread");
    if (!body.trim()) return toast.error("Please type a message");

    try {
      const targetCust = Customers.byId(selectedCustomerId);

      await StoreMessages.push({
        customer: targetCust?.pk || 0,
        subject: subject || "Support Consultation",
        body,
      });

      await Notifications.push({
        type: "message_sent",
        title: "Message Sent",
        message: `New message from ${session?.name || "User"}`,
        actorName: session?.name,
        actorRole: session?.role,
      });

      setBody("");
      setTick(t => t + 1);
      toast.success("Message delivered");
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FF5733]/15 text-[#FF784E] border border-[#FF5733]/30">
            Direct Messaging
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
          Support &amp; Customer Chat
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Real-time consultations between device owners and certified workshop technicians.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Thread selector */}
        {!isCustomer && (
          <div className="space-y-4">
            <Section title="Active Conversations" subtitle="Customer repair inquiries">
              <div className="space-y-2">
                {conversationPartners.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedCust(p.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3",
                      selectedCustomerId === p.id
                        ? "bg-[#181D29] border-[#FF5733] text-white shadow-sm"
                        : "bg-secondary/40 border-border text-muted-foreground hover:text-white hover:bg-secondary/70"
                    )}
                  >
                    <div className="size-9 rounded-xl bg-[#FF5733]/15 text-[#FF784E] grid place-items-center shrink-0 border border-[#FF5733]/30">
                      <UserCircle className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-xs text-white truncate flex items-center justify-between">
                        <span>{p.name}</span>
                        {p.unread > 0 && (
                          <span className="px-1.5 py-0.5 bg-[#FF5733] text-white text-[10px] rounded-full font-bold">
                            {p.unread}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">{p.mobile}</div>
                    </div>
                  </button>
                ))}

                {conversationPartners.length === 0 && (
                  <div className="text-xs text-muted-foreground text-center py-8">
                    No active support threads yet. Messages sent by customers will appear here.
                  </div>
                )}
              </div>
            </Section>
          </div>
        )}

        {/* Message Thread */}
        <div className={isCustomer ? "md:col-span-3 space-y-4" : "md:col-span-2 space-y-4"}>
          <Section
            title={isCustomer ? "Direct Workshop Support" : "Live Conversation"}
            subtitle={isCustomer ? "Ask our technicians about repair progress or part availability" : `Customer ID: ${selectedCustomerId || "Select thread"}`}
          >
            <div className="flex flex-col h-[420px]">
              {/* Message scroll area */}
              <div className="flex-1 overflow-y-auto space-y-3 p-3 border border-border/80 rounded-xl bg-[#080A0F]/70">
                {activeThread.map(m => {
                  const isMine = m.sentByRole === session?.role;
                  return (
                    <div key={m.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[80%] rounded-2xl p-3.5 text-xs shadow-card",
                          isMine
                            ? "bg-[#FF5733] text-white rounded-tr-none"
                            : "bg-[#151923] text-white rounded-tl-none border border-[#272B36]"
                        )}
                      >
                        <div className="text-[10px] opacity-75 mb-1 flex items-center justify-between gap-3 font-mono">
                          <span className="font-bold">{m.sentBy}</span>
                          <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        {m.subject && (
                          <div className="font-bold text-xs border-b border-white/20 pb-1 mb-1.5">
                            {m.subject}
                          </div>
                        )}
                        <p className="whitespace-pre-line leading-relaxed">{m.body}</p>
                        <div className="text-right text-[10px] opacity-70 mt-1 flex justify-end">
                          {m.read ? <CheckCheck className="size-3.5" /> : <Check className="size-3.5" />}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {(!selectedCustomerId || activeThread.length === 0) && (
                  <div className="text-center text-muted-foreground py-20 text-xs">
                    <MessageSquare className="size-8 mx-auto opacity-30 mb-2 text-[#FF5733]" />
                    Select a conversation thread or type a message below to reach out.
                  </div>
                )}
              </div>

              {/* Input Area */}
              {selectedCustomerId && (
                <form onSubmit={sendMessage} className="mt-4 space-y-2.5">
                  {!isCustomer && (
                    <Input
                      placeholder="Message Subject..."
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="bg-secondary/50 border-border text-white text-xs h-9 rounded-xl"
                    />
                  )}
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Type your message here..."
                      value={body}
                      onChange={e => setBody(e.target.value)}
                      rows={2}
                      required
                      className="bg-secondary/50 border-border text-white text-xs rounded-xl"
                    />
                    <Button
                      type="submit"
                      className="h-auto shrink-0 px-5 bg-[#FF5733] hover:bg-[#FF784E] text-white rounded-xl shadow-elegant"
                    >
                      <Send className="size-4" />
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
