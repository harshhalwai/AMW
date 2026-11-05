import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/auth";
import { Jobs, Employees, Notifications, Customers, type MobileType, type PasswordType } from "../../services/store";
import { apiRequest } from "../../api/api";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Smartphone, ShieldAlert, User, DollarSign, Upload, Sparkles, Plus,
  Check, ArrowLeft, Layers, ShieldCheck, IndianRupee, KeyRound
} from "lucide-react";
import { toast } from "sonner";
import { PatternInput } from "@/components/PatternInput";
import { cn } from "@/utils/utils";

const ACCESSORIES_OPTIONS = ["Charger", "SIM Card", "Memory Card", "Case / Cover", "Original Box", "Invoice"];

export function NewJob() {
  const { session } = useAuth();
  const navigate = useNavigate();

  // Customer State
  const [customerName, setName] = useState("");
  const [customerMobile, setMobile] = useState("");
  const [customerEmail, setEmail] = useState("");

  // Device State
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");
  const [mobileType, setType] = useState<MobileType>("Android");
  const [imei, setImei] = useState("");

  // Security State
  const [passwordType, setPassType] = useState<PasswordType>("PIN");
  const [passwordValue, setPassVal] = useState("");

  // Job Details State
  const [fault, setFault] = useState("");
  const [description, setDesc] = useState("");
  const [featuresInstalled, setFeatures] = useState("");
  const [amount, setAmt] = useState("");
  const [empId, setEmpId] = useState("");
  const [pic, setPic] = useState("");
  const [uploading, setUploading] = useState(false);

  // Accessories checklist
  const [selectedAccessories, setSelectedAccessories] = useState<string[]>([]);

  // Customer Autocomplete Suggestions
  const [mobileSuggestions, setMobileSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (customerMobile.trim().length >= 4) {
      const list = Customers.all();
      const matched = list.filter(c => c.mobile.includes(customerMobile));
      setMobileSuggestions(matched.map(c => c.mobile));
    } else {
      setMobileSuggestions([]);
    }
  }, [customerMobile]);

  const selectMobileSuggestion = (val: string) => {
    setMobile(val);
    setMobileSuggestions([]);
    const c = Customers.byMobileOrEmail(val);
    if (c) {
      setName(c.name);
      setEmail(c.email);
      toast.success("Existing customer details auto-filled!");
    }
  };

  const handleAccessoryToggle = (acc: string) => {
    setSelectedAccessories(prev =>
      prev.includes(acc) ? prev.filter(x => x !== acc) : [...prev, acc]
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await apiRequest("/api/jobs/upload/", {
        method: "POST",
        body: formData,
        headers: {},
      });
      setPic(res.url);
      toast.success("Photo uploaded successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerMobile || !customerName || !brand || !model || !fault || !amount) {
      return toast.error("Please fill in all required fields (Mobile, Name, Brand, Model, Fault, Amount).");
    }

    try {
      // 1. Check or register customer
      const existing = Customers.byMobileOrEmail(customerMobile);
      const customerId = existing ? existing.id : "CUST-" + Math.floor(Math.random() * 900000 + 100000);
      if (!existing) {
        await Customers.upsert({
          pk: 0,
          id: customerId,
          name: customerName,
          mobile: customerMobile,
          email: customerEmail,
        });
      }

      // 2. Next job sheet number
      const count = Jobs.all().length;
      const nextNo = "AMW-" + (1000 + count);

      // 3. Serialize extra details into the description string dynamically
      const serialisedDescription = JSON.stringify({
        remarks: description,
        imei: imei || "N/A",
        accessories: selectedAccessories.join(", "),
      });

      // 4. Save job sheet
      await Jobs.upsert({
        id: "new-job-temp-id-" + Date.now(),
        jobSheetNo: nextNo,
        jobDate: new Date().toISOString(),
        customerId,
        customerName,
        customerMobile,
        customerEmail,
        brand,
        model,
        color,
        mobileType,
        passwordType,
        passwordValue,
        fault,
        description: serialisedDescription,
        featuresInstalled,
        amount: Number(amount),
        repairStatus: "Pending",
        deliveryStatus: "Pending",
        assignedEmployeeId: empId === "unassigned" ? undefined : empId || undefined,
        createdAt: new Date().toISOString(),
      });

      await Notifications.push({
        type: "job_added",
        title: "New Job Added",
        message: `${session?.name || "Owner"} created Job sheet ${nextNo} (${brand} ${model})`,
        actorName: session?.name,
        actorRole: session?.role,
        jobSheetNo: nextNo,
      });

      toast.success(`Job ${nextNo} registered successfully!`);
      navigate("/app/jobs");
    } catch (err: any) {
      toast.error(err.message || "Failed to create job");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-white transition-colors mb-1"
          >
            <ArrowLeft className="size-3.5" /> Back to list
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Create New Repair Intake
          </h1>
          <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
            Amit Mobile World · Certified Intake Sheet
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} className="rounded-xl border-border text-xs">
            Cancel
          </Button>
          <Button type="submit" className="bg-[#FF5733] hover:bg-[#FF784E] text-white shadow-elegant rounded-xl text-xs font-bold px-4">
            <Plus className="size-4 mr-1.5" /> Register Job Sheet
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer Details */}
        <div className="space-y-4 p-5 sm:p-6 rounded-2xl border border-border bg-card shadow-card">
          <div className="flex items-center gap-2 font-bold text-white border-b border-border/60 pb-3 text-sm">
            <User className="size-4 text-[#FF5733]" /> Customer Information
          </div>

          <div className="relative">
            <Label>Customer Mobile *</Label>
            <Input
              value={customerMobile}
              onChange={e => setMobile(e.target.value)}
              placeholder="e.g. 9810012345"
              required
              className="rounded-xl mt-1 bg-secondary/50 border-border text-white"
            />
            {mobileSuggestions.length > 0 && (
              <div className="absolute z-10 w-full bg-[#151923] border border-border rounded-xl mt-1.5 shadow-elegant overflow-hidden max-h-40 overflow-y-auto">
                {mobileSuggestions.map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => selectMobileSuggestion(m)}
                    className="w-full text-left px-4 py-2 text-xs hover:bg-[#1C2230] transition-colors flex justify-between items-center text-white"
                  >
                    <span>{m}</span>
                    <span className="text-[10px] uppercase font-bold text-[#FF784E]">Auto-fill</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <Label>Customer Full Name *</Label>
            <Input
              value={customerName}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Rahul Verma"
              required
              className="rounded-xl mt-1 bg-secondary/50 border-border text-white"
            />
          </div>

          <div>
            <Label>Email Address</Label>
            <Input
              type="email"
              value={customerEmail}
              onChange={e => setEmail(e.target.value)}
              placeholder="customer@email.com"
              className="rounded-xl mt-1 bg-secondary/50 border-border text-white"
            />
          </div>
        </div>

        {/* Device Details */}
        <div className="space-y-4 p-5 sm:p-6 rounded-2xl border border-border bg-card shadow-card">
          <div className="flex items-center gap-2 font-bold text-white border-b border-border/60 pb-3 text-sm">
            <Smartphone className="size-4 text-[#FF5733]" /> Device Specifications
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Brand *</Label>
              <Input
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="Apple, Samsung..."
                required
                className="rounded-xl mt-1 bg-secondary/50 border-border text-white"
              />
            </div>
            <div>
              <Label>Model *</Label>
              <Input
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="iPhone 15, S24..."
                required
                className="rounded-xl mt-1 bg-secondary/50 border-border text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Device Color</Label>
              <Input
                value={color}
                onChange={e => setColor(e.target.value)}
                placeholder="Natural Titanium, Black..."
                className="rounded-xl mt-1 bg-secondary/50 border-border text-white"
              />
            </div>
            <div>
              <Label>Device Category</Label>
              <Select value={mobileType} onValueChange={val => setType(val as MobileType)}>
                <SelectTrigger className="rounded-xl mt-1 bg-secondary/50 border-border text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#151923] border-[#272B36] text-white">
                  <SelectItem value="Android">Android</SelectItem>
                  <SelectItem value="iPhone">iPhone</SelectItem>
                  <SelectItem value="Keypad">Keypad</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>IMEI / Serial Number</Label>
            <Input
              value={imei}
              onChange={e => setImei(e.target.value)}
              placeholder="15-digit IMEI or Serial"
              className="rounded-xl mt-1 font-mono text-xs bg-secondary/50 border-border text-white"
            />
          </div>
        </div>

        {/* Security & Screen Lock */}
        <div className="space-y-4 p-5 sm:p-6 rounded-2xl border border-border bg-card shadow-card">
          <div className="flex items-center gap-2 font-bold text-white border-b border-border/60 pb-3 text-sm">
            <KeyRound className="size-4 text-[#FF5733]" /> Security &amp; Screen Lock
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Lock Type</Label>
              <Select value={passwordType} onValueChange={val => setPassType(val as PasswordType)}>
                <SelectTrigger className="rounded-xl mt-1 bg-secondary/50 border-border text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#151923] border-[#272B36] text-white">
                  <SelectItem value="PIN">PIN</SelectItem>
                  <SelectItem value="Password">Password</SelectItem>
                  <SelectItem value="Pattern">Pattern</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {passwordType !== "Pattern" ? (
              <div>
                <Label>Lock Password / PIN Code</Label>
                <Input
                  value={passwordValue}
                  onChange={e => setPassVal(e.target.value)}
                  placeholder="Enter PIN or code"
                  className="rounded-xl mt-1 bg-secondary/50 border-border text-white font-mono"
                />
              </div>
            ) : (
              <div>
                <Label>Pattern Sequence</Label>
                <div className="mt-1">
                  <PatternInput value={passwordValue} onChange={setPassVal} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Pricing & Staff Assignment */}
        <div className="space-y-4 p-5 sm:p-6 rounded-2xl border border-border bg-card shadow-card">
          <div className="flex items-center gap-2 font-bold text-white border-b border-border/60 pb-3 text-sm">
            <Layers className="size-4 text-[#FF5733]" /> Pricing &amp; Assignment
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Estimated Charge (₹) *</Label>
              <Input
                type="number"
                value={amount}
                onChange={e => setAmt(e.target.value)}
                placeholder="2500"
                required
                className="rounded-xl mt-1 font-mono bg-secondary/50 border-border text-white"
              />
            </div>
            <div>
              <Label>Assign Technician</Label>
              <Select value={empId} onValueChange={setEmpId}>
                <SelectTrigger className="rounded-xl mt-1 bg-secondary/50 border-border text-white">
                  <SelectValue placeholder="Assign staff" />
                </SelectTrigger>
                <SelectContent className="bg-[#151923] border-[#272B36] text-white">
                  <SelectItem value="unassigned">Unassigned / Bench Queue</SelectItem>
                  {Employees.all().map(e => (
                    <SelectItem key={e.id} value={e.id}>{e.name} ({e.role})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="mb-2 block">Accessories Received With Phone</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ACCESSORIES_OPTIONS.map(acc => {
                const selected = selectedAccessories.includes(acc);
                return (
                  <button
                    type="button"
                    key={acc}
                    onClick={() => handleAccessoryToggle(acc)}
                    className={cn(
                      "px-3 py-2 rounded-xl text-xs font-semibold border transition-all text-left flex items-center justify-between",
                      selected
                        ? "bg-[#FF5733]/15 border-[#FF5733] text-[#FF784E]"
                        : "bg-secondary/40 border-border text-muted-foreground hover:text-white"
                    )}
                  >
                    <span>{acc}</span>
                    {selected && <Check className="size-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Diagnosis & Problem Description */}
      <div className="space-y-4 p-5 sm:p-6 rounded-2xl border border-border bg-card shadow-card">
        <div className="flex items-center gap-2 font-bold text-white border-b border-border/60 pb-3 text-sm">
          <ShieldCheck className="size-4 text-[#FF5733]" /> Diagnosis &amp; Description
        </div>

        <div>
          <Label>Declared Fault / Issue *</Label>
          <Input
            value={fault}
            onChange={e => setFault(e.target.value)}
            placeholder="e.g. Digitizer shattered, Touch not working, Charging slow"
            required
            className="rounded-xl mt-1 bg-secondary/50 border-border text-white"
          />
        </div>

        <div>
          <Label>Physical Condition / Scratch Remarks</Label>
          <Textarea
            value={description}
            onChange={e => setDesc(e.target.value)}
            placeholder="Note minor scratches, rear glass condition, bezel dents..."
            className="rounded-xl mt-1 bg-secondary/50 border-border text-white"
            rows={3}
          />
        </div>

        <div>
          <Label>New Upgrades / Features to Install</Label>
          <Input
            value={featuresInstalled}
            onChange={e => setFeatures(e.target.value)}
            placeholder="e.g. OEM Battery + Matte Screen Protector"
            className="rounded-xl mt-1 bg-secondary/50 border-border text-white"
          />
        </div>

        {/* Upload Image */}
        <div className="space-y-3 pt-2">
          <Label>Device Intake Photos</Label>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded-xl cursor-pointer hover:bg-secondary transition-colors text-xs text-white">
              <Upload className="size-4 text-[#FF784E]" />
              <span className="font-semibold">{uploading ? "Uploading..." : "Upload Device Image"}</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" disabled={uploading} />
            </label>
            {pic && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-bold border border-emerald-500/30">
                <Check className="size-3.5" /> Uploaded successfully
              </span>
            )}
          </div>
          {pic && (
            <div className="mt-3 relative w-48 h-32 border border-border rounded-xl overflow-hidden shadow-elegant">
              <img src={pic.startsWith("http") ? pic : `http://localhost:8000${pic}`} alt="Preview" className="size-full object-cover" />
            </div>
          )}
        </div>
      </div>
    </form>
  );
}
