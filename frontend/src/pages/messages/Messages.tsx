import { useAuth } from "../../contexts/auth";
import { Messages as StoreMessages, Customers, Notifications, type Message } from "../../services/store";
import { useState, useMemo, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Section } from "@/components/ui-bits";
import { Send, UserCircle, Shield, Sparkles, MessageSquare, Check, CheckCheck } from "lucide-react";
import { toast } from "sonner";

export function Messages() {
  const { session } = useAuth();
  const [selectedCustomerId, setSelectedCust] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [tick, setTick] = useState(0);

  const isCustomer = session?.role === "customer";
  const allMessages = StoreMessages.all();

  // If customer, auto-select them and filter thread
  useEffect(() => {
    if (isCustomer && session) {
      setSelectedCust(session.userId);
    }
  }, [isCustomer, session]);

  // Unique customers with messages (for Owner/Employee)
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
  }, [allMessages, isCustomer]);

  // Active message thread
  const activeThread = useMemo(() => {
    if (!selectedCustomerId) return [];
    return allMessages
      .filter(m => m.customerId === selectedCustomerId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }, [allMessages, selectedCustomerId]);

  // Mark active thread read
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
        subject: subject || "Support Update",
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
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support Message Threads</h1>
        <p className="text-sm text-muted-foreground">Direct messaging between client and workshop technicians</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Thread selector */}
        {!isCustomer && (
          <div className="space-y-4">
            <Section title="Conversations">
              <div className="space-y-2">
                {conversationPartners.map(p => (
                  <button key={p.id} onClick={() => setSelectedCust(p.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex items-center gap-3 ${
                      selectedCustomerId === p.id ? "bg-primary/10 border-primary" : "border-border hover:bg-accent/40"
                    }`}>
                    <div className="size-9 rounded-full bg-primary/10 text-primary grid place-items-center shrink-0">
                      <UserCircle className="size-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate flex items-center justify-between">
                        <span>{p.name}</span>
                        {p.unread > 0 && <span className="px-1.5 py-0.5 bg-primary text-primary-foreground text-[10px] rounded-full font-bold">{p.unread}</span>}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">{p.mobile}</div>
                    </div>
                  </button>
                ))}
                {conversationPartners.length === 0 && (
                  <div className="text-xs text-muted-foreground text-center py-6">No support threads started yet.</div>
                )}
              </div>
            </Section>
          </div>
        )}

        {/* Message Thread */}
        <div className={isCustomer ? "md:col-span-3 space-y-4" : "md:col-span-2 space-y-4"}>
          <Section title={isCustomer ? "Support Chat" : "Thread Details"}>
            <div className="flex flex-col h-[400px]">
              {/* Message scroll area */}
              <div className="flex-1 overflow-y-auto space-y-3 p-2 border border-border rounded-lg bg-accent/10">
                {activeThread.map(m => {
                  const isMine = m.sentByRole === session?.role;
                  return (
                    <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] rounded-xl p-3 text-sm shadow-card ${
                        isMine ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card text-foreground rounded-tl-none border border-border"
                      }`}>
                        <div className="text-[10px] opacity-60 mb-0.5 flex items-center justify-between gap-2 font-mono">
                          <span>{m.sentBy}</span>
                          <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        <div className="font-bold text-xs border-b border-white/20 pb-0.5 mb-1">{m.subject}</div>
                        <p className="whitespace-pre-line leading-relaxed">{m.body}</p>
                        <div className="text-right text-[10px] opacity-60 mt-0.5 flex justify-end">
                          {m.read ? <CheckCheck className="size-3" /> : <Check className="size-3" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {(!selectedCustomerId || activeThread.length === 0) && (
                  <div className="text-center text-muted-foreground py-16">
                    <MessageSquare className="size-8 mx-auto opacity-30 mb-2 animate-bounce" />
                    Select a thread or send a message to start conversation.
                  </div>
                )}
              </div>

              {/* Input Area */}
              {selectedCustomerId && (
                <form onSubmit={sendMessage} className="mt-4 space-y-3">
                  {!isCustomer && (
                    <Input placeholder="Message Subject" value={subject} onChange={e => setSubject(e.target.value)} />
                  )}
                  <div className="flex gap-2">
                    <Textarea placeholder="Type support message here…" value={body} onChange={e => setBody(e.target.value)} rows={2} required />
                    <Button type="submit" className="h-auto shrink-0 px-5"><Send className="size-4" /></Button>
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
