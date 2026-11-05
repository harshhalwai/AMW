import { Shop } from "../../services/store";
import { useAuth } from "../../contexts/auth";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Section } from "@/components/ui-bits";
import { Sparkles, Home, Phone, Mail, Award, Check, Settings as SettingsIcon, ShieldCheck } from "lucide-react";
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
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FF5733]/15 text-[#FF784E] border border-[#FF5733]/30">
            System Configuration
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
          Store &amp; Invoicing Settings
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Configure business profile metadata, tax IDs, invoice footers, and official customer contacts.
        </p>
      </div>

      <Section title="AMW Enterprise Profile" subtitle="Tax invoice and print header information">
        <form onSubmit={save} className="space-y-4 text-xs sm:text-sm">
          <div>
            <Label>Shop Legal Business Name *</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={!isOwner}
              required
              className="mt-1 bg-secondary/50 border-border text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Primary Contact Numbers *</Label>
              <Input
                value={contact}
                onChange={e => setContact(e.target.value)}
                disabled={!isOwner}
                required
                className="mt-1 bg-secondary/50 border-border text-white font-mono"
              />
            </div>
            <div>
              <Label>Official Support Email</Label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={!isOwner}
                className="mt-1 bg-secondary/50 border-border text-white"
              />
            </div>
          </div>

          <div>
            <Label>Taxpayer Identification Number (GSTIN)</Label>
            <Input
              value={gstin}
              onChange={e => setGstin(e.target.value)}
              placeholder="e.g. 07AAAAA0000A1Z5"
              disabled={!isOwner}
              className="mt-1 bg-secondary/50 border-border text-white font-mono"
            />
          </div>

          <div>
            <Label>Shop Full Physical Address</Label>
            <Textarea
              value={address}
              onChange={e => setAddress(e.target.value)}
              disabled={!isOwner}
              rows={3}
              placeholder="Shop No., Market / Arcade, Street, City, State, ZIP..."
              className="mt-1 bg-secondary/50 border-border text-white"
            />
          </div>

          {isOwner && (
            <div className="pt-2">
              <Button type="submit" className="w-full bg-[#FF5733] hover:bg-[#FF784E] text-white shadow-elegant rounded-xl font-bold">
                <Check className="size-4 mr-1.5" /> Save Business Configuration
              </Button>
            </div>
          )}
        </form>
      </Section>
    </div>
  );
}
