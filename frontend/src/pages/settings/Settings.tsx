import { Shop } from "../../services/store";
import { useAuth } from "../../contexts/auth";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Section } from "@/components/ui-bits";
import { Sparkles, Home, Phone, Mail, Award, Check } from "lucide-react";
import { toast } from "sonner";

export function Settings() {
  const { session } = useAuth();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [gstin, setGstin] = useState("");

  const isOwner = session?.role === "owner";

  useEffect(() => {
    const s = Shop.get();
    setName(s.name);
    setAddress(s.address);
    setContact(s.contact);
    setEmail(s.email);
    setGstin(s.gstin || "");
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return toast.error("Shop name is required");

    try {
      await Shop.set({
        name,
        address,
        contact,
        email,
        gstin: gstin || undefined,
      });
      toast.success("Shop settings updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update shop profile");
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
        <p className="text-sm text-muted-foreground font-medium">Configure global shop invoices and contact metadata</p>
      </div>

      <Section title="Shop Business Details">
        <form onSubmit={save} className="space-y-4">
          <div>
            <Label>Shop Name *</Label>
            <Input value={name} onChange={e => setName(e.target.value)} disabled={!isOwner} required />
          </div>
          <div>
            <Label>Contact Numbers *</Label>
            <Input value={contact} onChange={e => setContact(e.target.value)} disabled={!isOwner} required />
          </div>
          <div>
            <Label>Contact Email</Label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={!isOwner} />
          </div>
          <div>
            <Label>Taxpayer Identification Number (GSTIN)</Label>
            <Input value={gstin} onChange={e => setGstin(e.target.value)} placeholder="e.g. 22AAAAA0000A1Z5" disabled={!isOwner} />
          </div>
          <div>
            <Label>Shop Full Address</Label>
            <Textarea value={address} onChange={e => setAddress(e.target.value)} disabled={!isOwner} rows={3} placeholder="Line 1, Line 2, State, ZIP..." />
          </div>
          {isOwner && (
            <Button type="submit" className="w-full"><Check className="size-4" /> Save Business Profile</Button>
          )}
        </form>
      </Section>
    </div>
  );
}
