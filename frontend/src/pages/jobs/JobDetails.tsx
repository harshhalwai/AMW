import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/auth";
import { Jobs, Employees, Notifications, Otp, Shop, type Job, type RepairStatus, type DeliveryStatus } from "../../services/store";
import { apiRequest } from "../../api/api";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Section, StatusBadge } from "@/components/ui-bits";
import {
  ArrowLeft, Printer, ShieldAlert, Smartphone, Clock, CheckCircle2,
  User, Phone, Mail, FileText, Check, Star, AlertCircle, Wrench, RefreshCw,
  Send, CheckCheck, Lock, Sparkles, AlertTriangle
} from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";

export function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isPrint = searchParams.get("print") === "1";

  const { session } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState<Job | null>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [invoice, setInvoice] = useState<any>(null);

  // Form edit states
  const [assignedEmployeeId, setEmp] = useState("");
  const [repairStatus, setRepStatus] = useState<RepairStatus>("Pending");
  const [deliveryStatus, setDelStatus] = useState<DeliveryStatus>("Pending");
  const [amount, setAmt] = useState("");
  const [featuresInstalled, setFeatures] = useState("");
  const [passVal, setPassVal] = useState("");

  // OTP delivery verify
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");

  // Customer feedback
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchDetails = async () => {
      try {
        const jobs = Jobs.all();
        const found = jobs.find(j => j.id === id);
        if (found) {
          setJob(found);
          setEmp(found.assignedEmployeeId || "");
          setRepStatus(found.repairStatus);
          setDelStatus(found.deliveryStatus);
          setAmt(String(found.amount));
          setFeatures(found.featuresInstalled || "");
          setPassVal(found.passwordValue || "");
        }

        const timelineData = await apiRequest(`/api/jobs/${id}/timeline/`);
        setTimeline(timelineData);

        const invoiceData = await apiRequest(`/api/jobs/${id}/invoice/`);
        setInvoice(invoiceData);
      } catch (err) {
        console.error("Failed to load job details:", err);
      }
    };
    fetchDetails();
  }, [id, otpSent]);

  if (!job) {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto bg-card border border-border rounded-3xl shadow-elegant mt-20 animate-scale-in">
        <AlertCircle className="size-12 text-[#EF4444] mx-auto animate-pulse" />
        <h2 className="text-xl font-bold text-white">Repair Job Not Found</h2>
        <p className="text-xs text-muted-foreground">The job sheet number might be incorrect or removed.</p>
        <Button onClick={() => navigate("/app/jobs")} className="w-full bg-[#FF5733] text-white">
          Back to Jobs List
        </Button>
      </div>
    );
  }

  // Parse custom description JSON
  let imei = "N/A";
  let accessories = "None";
  let remarks = job.description || "";
  try {
    const parsed = JSON.parse(job.description);
    imei = parsed.imei || "N/A";
    accessories = parsed.accessories || "None";
    remarks = parsed.remarks || "";
  } catch {
    remarks = job.description || "";
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const original = Jobs.byId(job.id);
      const isStatusChanged = original?.repairStatus !== repairStatus;

      const serialisedDescription = JSON.stringify({
        remarks,
        imei,
        accessories,
      });

      await Jobs.upsert({
        ...job,
        assignedEmployeeId: assignedEmployeeId === "unassigned" ? undefined : assignedEmployeeId || undefined,
        repairStatus,
        deliveryStatus,
        amount: Number(amount),
        featuresInstalled,
        passwordValue: passVal,
        description: serialisedDescription,
        lastUpdatedBy: session?.name || "System",
        lastUpdatedAt: new Date().toISOString(),
      });

      if (isStatusChanged) {
        await Notifications.push({
          type: "repair_status",
          title: "Repair Status Updated",
          message: `Job ${job.jobSheetNo} status changed to "${repairStatus}" by ${session?.name}`,
          actorName: session?.name,
          actorRole: session?.role,
          jobSheetNo: job.jobSheetNo,
        });
      }

      toast.success("Job updated successfully!");
      setOtpSent(false);

      const timelineData = await apiRequest(`/api/jobs/${id}/timeline/`);
      setTimeline(timelineData);
    } catch (err: any) {
      toast.error(err.message || "Failed to update job");
    }
  };

  const sendOtp = async () => {
    try {
      const code = await Otp.generate(job.customerMobile, "delivery", job.id);
      toast.success("Verification OTP sent to customer!", {
        description: `Demo OTP: ${code}`,
        duration: 9000,
      });
      setOtpSent(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to generate OTP");
    }
  };

  const verifyDelivery = async () => {
    try {
      const success = await Otp.verify(job.customerMobile, otpInput, "delivery", job.id);
      if (!success) return toast.error("Invalid OTP code");

      const updated = await Jobs.deliver(job.id, otpInput);
      setJob(updated);
      setDelStatus("Delivered");

      await Notifications.push({
        type: "delivered",
        title: "Device Delivered",
        message: `Job sheet ${job.jobSheetNo} verified by OTP and marked delivered.`,
        actorName: session?.name,
        actorRole: session?.role,
        jobSheetNo: job.jobSheetNo,
      });

      toast.success("Device verified and delivered successfully!");
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP code");
    }
  };

  const handleRating = async () => {
    try {
      await Jobs.rate(job.id, stars, comment);
      toast.success("Thank you for your rating!");
      const jobs = Jobs.all();
      const updated = jobs.find(j => j.id === id);
      if (updated) setJob(updated);
    } catch (err: any) {
      toast.error(err.message || "Failed to submit rating");
    }
  };

  // Professional Invoice / Job Sheet PDF print view
  if (isPrint) {
    const shop = Shop.get();
    const assignedEmp = job.assignedEmployeeId ? Employees.byId(job.assignedEmployeeId) : null;
    const subtotal = job.amount;
    const gstRate = invoice?.tax_rate ? Number(invoice.tax_rate) : 18;
    const gstAmt = Math.round(subtotal * (gstRate / 100));
    const totalWithGst = subtotal + gstAmt;

    return (
      <div className="p-10 max-w-4xl mx-auto bg-white text-black font-sans print-area border border-gray-300 rounded-3xl my-6 shadow-card">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-300 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-gray-900">{shop.name}</h1>
            <p className="text-xs text-gray-600 max-w-xs">{shop.address || "Shop Address"}</p>
            <p className="text-[11px] text-gray-600 font-medium">Contact: {shop.contact} | Email: {shop.email}</p>
            {shop.gstin && <p className="text-[11px] text-gray-900 font-bold">GSTIN: {shop.gstin}</p>}
          </div>
          <div className="text-right space-y-2">
            <div className="bg-gray-100 px-4 py-2.5 rounded-2xl border border-gray-200 inline-block">
              <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold block">Tax Invoice / Sheet</span>
              <span className="text-lg font-mono font-black text-gray-900">{job.jobSheetNo}</span>
            </div>
            <p className="text-[11px] text-gray-600 font-semibold">Date: {new Date(job.jobDate).toLocaleDateString("en-IN")}</p>
          </div>
        </div>

        {/* Customer & Device Grid */}
        <div className="grid grid-cols-2 gap-8 my-6 text-xs leading-relaxed">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <h3 className="text-[10px] uppercase font-bold text-gray-500 mb-2 tracking-wider">Customer Details</h3>
            <p className="font-bold text-gray-900 text-sm">{job.customerName}</p>
            <p className="text-gray-700 font-medium mt-1">Mobile: {job.customerMobile}</p>
            {job.customerEmail && <p className="text-gray-700">Email: {job.customerEmail}</p>}
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200">
            <h3 className="text-[10px] uppercase font-bold text-gray-500 mb-2 tracking-wider">Device Intake Specifications</h3>
            <p className="font-bold text-gray-900 text-sm">{job.brand} {job.model} ({job.color || "N/A"})</p>
            <p className="text-gray-700 font-semibold">IMEI / Serial: <span className="font-mono">{imei}</span></p>
            <p className="text-gray-700">Lock Type: {job.passwordType} ({job.passwordValue || "None"})</p>
            <p className="text-gray-700 font-medium">Accessories: {accessories}</p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="border border-gray-300 rounded-2xl overflow-hidden mb-6 text-xs">
          <table className="w-full">
            <thead className="bg-gray-100 text-gray-700 font-bold">
              <tr className="border-b border-gray-300">
                <th className="p-3 text-left">Intake Fault &amp; Diagnosis Service</th>
                <th className="p-3 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="p-3">
                  <div className="font-bold text-gray-900">{job.fault}</div>
                  {remarks && <div className="text-gray-600 mt-1">Intake remarks: {remarks}</div>}
                  {job.featuresInstalled && (
                    <div className="text-blue-700 font-semibold mt-1">New components: {job.featuresInstalled}</div>
                  )}
                </td>
                <td className="p-3 text-right font-bold text-gray-900 font-mono">₹{subtotal.toLocaleString("en-IN")}</td>
              </tr>
              <tr className="bg-gray-50 border-t border-gray-200">
                <td className="p-2.5 text-right text-gray-600 font-bold">Subtotal</td>
                <td className="p-2.5 text-right text-gray-900 font-semibold font-mono">₹{subtotal.toLocaleString("en-IN")}</td>
              </tr>
              <tr className="bg-gray-50">
                <td className="p-2.5 text-right text-gray-600 font-bold">GST ({gstRate}%)</td>
                <td className="p-2.5 text-right text-gray-900 font-semibold font-mono">₹{gstAmt.toLocaleString("en-IN")}</td>
              </tr>
              <tr className="bg-gray-100 font-black border-t-2 border-gray-300 text-sm">
                <td className="p-3 text-right text-gray-900">Total Invoice Amount (Inc. GST)</td>
                <td className="p-3 text-right text-gray-900 font-mono">₹{totalWithGst.toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signature Area */}
        <div className="grid grid-cols-3 gap-6 items-end mt-16 pt-6 border-t border-gray-300 text-[10px] text-gray-600">
          <div>
            <div className="h-10 border-b border-gray-400 w-36 mb-2" />
            <p className="font-bold uppercase tracking-wider">Customer Signature</p>
            <p className="text-[9px]">Verified intake conditions &amp; lock details</p>
          </div>
          <div>
            <div className="h-10 border-b border-gray-400 w-36 mb-2" />
            <p className="font-bold uppercase tracking-wider">Technician Signature</p>
            <p className="text-[9px]">{assignedEmp?.name || "Assigned Technician"}</p>
          </div>
          <div className="text-right">
            <div className="h-10 border-b border-gray-400 w-36 ml-auto mb-2" />
            <p className="font-bold uppercase tracking-wider">Authorized Seal / Stamp</p>
            <p className="text-[9px]">{shop.name}</p>
          </div>
        </div>

        {/* Print controls */}
        <div className="mt-8 text-center no-print flex justify-center gap-3">
          <Button onClick={() => window.print()} className="bg-[#FF5733] hover:bg-[#FF784E] text-white shadow-elegant">
            <Printer className="size-4 mr-1.5" /> Print Invoice
          </Button>
          <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </div>
    );
  }

  const isOwner = session?.role === "owner";
  const isCustomer = session?.role === "customer";
  const assignedEmp = job.assignedEmployeeId ? Employees.byId(job.assignedEmployeeId) : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-12">
      {/* Upper Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground hover:text-white transition-colors"
        >
          <ArrowLeft className="size-4" /> Back to Jobs List
        </button>

        <div className="flex items-center gap-2">
          {session?.role !== "customer" && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-border rounded-xl text-xs hover:border-[#FF5733]"
            >
              <Link to={`/app/jobs/${job.id}?print=1`}>
                <Printer className="size-3.5 mr-1.5" /> Print Tax Invoice
              </Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Device & Diagnostic Details */}
        <div className="md:col-span-2 space-y-6">
          <Section
            title={`Repair Sheet: ${job.jobSheetNo}`}
            subtitle={`Registered on ${new Date(job.jobDate).toLocaleDateString("en-IN")}`}
            action={
              <div className="flex items-center gap-2">
                <StatusBadge status={job.repairStatus} />
                <StatusBadge status={job.deliveryStatus} />
              </div>
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Device Card */}
              <div className="space-y-3 bg-secondary/40 p-4 rounded-xl border border-border/80">
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/60 pb-1.5 flex items-center gap-1.5">
                  <Smartphone className="size-3.5 text-[#FF5733]" /> Device Specifications
                </h3>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Model</span>
                    <span className="font-bold text-white text-sm">{job.brand} {job.model}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Color</span>
                      <span className="text-white font-medium">{job.color || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Device Type</span>
                      <span className="text-white font-medium">{job.mobileType}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-semibold">IMEI / Serial</span>
                    <span className="font-mono text-white text-xs font-bold text-[#FF784E]">{imei}</span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <ShieldAlert className="size-3.5 text-[#F59E0B] shrink-0" />
                    <span className="text-muted-foreground">Lock: {job.passwordType} ({job.passwordValue || "None"})</span>
                  </div>
                </div>
              </div>

              {/* Customer Profile Card */}
              <div className="space-y-3 bg-secondary/40 p-4 rounded-xl border border-border/80">
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/60 pb-1.5 flex items-center gap-1.5">
                  <User className="size-3.5 text-[#FF5733]" /> Customer Contact
                </h3>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Customer Name</span>
                    <span className="font-bold text-white text-sm">{job.customerName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Mobile Number</span>
                    <span className="text-white font-mono font-medium flex items-center gap-1">
                      <Phone className="size-3 text-[#FF784E]" /> {job.customerMobile}
                    </span>
                  </div>
                  {job.customerEmail && (
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Email</span>
                      <span className="text-white flex items-center gap-1">
                        <Mail className="size-3 text-[#FF784E]" /> {job.customerEmail}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block font-semibold">Accessories Received</span>
                    <span className="text-[#FF784E] font-medium">{accessories}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnostic Logs & Condition */}
            <div className="border-t border-border mt-5 pt-4 space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Declared Defect</span>
                <div className="p-3 rounded-xl bg-secondary/50 border border-border/70 text-white font-semibold">
                  {job.fault}
                </div>
              </div>

              {remarks && (
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Intake Condition Remarks</span>
                  <p className="text-muted-foreground leading-relaxed bg-secondary/30 p-2.5 rounded-xl border border-border/60">
                    {remarks}
                  </p>
                </div>
              )}

              {job.featuresInstalled && (
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold block mb-1">Upgrades &amp; Installed Parts</span>
                  <p className="text-[#FF784E] font-bold">{job.featuresInstalled}</p>
                </div>
              )}
            </div>
          </Section>

          {/* Timeline View */}
          <Section title="Live Repair Progression Timeline" subtitle="Chronological audit records">
            <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-border">
              {timeline.map((log, idx) => (
                <div key={log.id || idx} className="flex gap-4 relative">
                  <div className="size-6 rounded-full border-2 border-[#151923] bg-[#FF5733] text-white grid place-items-center shadow-elegant z-10 shrink-0">
                    <Clock className="size-3" />
                  </div>
                  <div className="bg-secondary/40 p-3 rounded-xl border border-border/70 flex-1 text-xs">
                    <div className="font-bold text-white">{log.title || log.status}</div>
                    <div className="text-muted-foreground mt-0.5">{log.message || log.notes}</div>
                    <div className="text-[10px] text-[#A1A1AA] mt-1">
                      {new Date(log.created_at || log.createdAt).toLocaleString("en-IN")}
                      {log.actor_name && ` · Action by: ${log.actor_name}`}
                    </div>
                  </div>
                </div>
              ))}
              {timeline.length === 0 && (
                <p className="text-xs text-muted-foreground pl-8 py-2">No timeline status updates yet.</p>
              )}
            </div>
          </Section>
        </div>

        {/* Right Column: Actions & Delivery Verification */}
        <div className="space-y-6">
          {!isCustomer && (
            <Section title="Update Diagnostics &amp; Status">
              <form onSubmit={handleUpdate} className="space-y-3.5 text-xs">
                <div>
                  <Label>Assigned Technician</Label>
                  <Select value={assignedEmployeeId} onValueChange={setEmp} disabled={!isOwner}>
                    <SelectTrigger className="rounded-xl mt-1 bg-secondary/50 border-border">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#151923] border-[#272B36] text-white">
                      <SelectItem value="unassigned">Unassigned / Bench Queue</SelectItem>
                      {Employees.all().map(e => (
                        <SelectItem key={e.id} value={e.id}>{e.name} ({e.role})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <Label>Repair Status</Label>
                    <Select value={repairStatus} onValueChange={val => setRepStatus(val as RepairStatus)}>
                      <SelectTrigger className="rounded-xl mt-1 bg-secondary/50 border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#151923] border-[#272B36] text-white">
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Delivery Status</Label>
                    <Select value={deliveryStatus} onValueChange={val => setDelStatus(val as DeliveryStatus)} disabled={!isOwner}>
                      <SelectTrigger className="rounded-xl mt-1 bg-secondary/50 border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#151923] border-[#272B36] text-white">
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Ready for Delivery">Ready for Delivery</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <Label>Screen Lock PIN</Label>
                    <Input value={passVal} onChange={e => setPassVal(e.target.value)} className="rounded-xl mt-1 bg-secondary/50 border-border" />
                  </div>
                  <div>
                    <Label>Total Bill (₹)</Label>
                    <Input type="number" value={amount} onChange={e => setAmt(e.target.value)} className="rounded-xl mt-1 font-mono bg-secondary/50 border-border" />
                  </div>
                </div>

                <div>
                  <Label>Installed Upgrade Details</Label>
                  <Input value={featuresInstalled} onChange={e => setFeatures(e.target.value)} placeholder="e.g. 0-Cycle Battery, UV Screen Shield" className="rounded-xl mt-1 bg-secondary/50 border-border" />
                </div>

                <Button type="submit" className="w-full bg-[#FF5733] hover:bg-[#FF784E] text-white shadow-elegant rounded-xl">
                  <RefreshCw className="size-3.5 mr-1.5" /> Save Diagnostic Status
                </Button>
              </form>
            </Section>
          )}

          {/* OTP Delivery Verification Card */}
          {!isCustomer && job.deliveryStatus !== "Delivered" && (
            <Section title="OTP Delivery Verification" subtitle="Safe customer device handover">
              <div className="space-y-3.5 text-xs">
                <p className="text-muted-foreground leading-relaxed">
                  Generate an SMS/OTP sent to customer's mobile to authenticate handover.
                </p>
                {!otpSent ? (
                  <Button onClick={sendOtp} className="w-full bg-[#FF5733] hover:bg-[#FF784E] text-white shadow-elegant rounded-xl">
                    <Send className="size-3.5 mr-1.5" /> Send Delivery OTP Code
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label>Enter 6-Digit OTP</Label>
                      <Input
                        value={otpInput}
                        onChange={e => setOtpInput(e.target.value)}
                        maxLength={6}
                        placeholder="e.g. 123456"
                        className="rounded-xl mt-1 font-mono text-center text-base tracking-widest bg-secondary/50 border-border"
                      />
                    </div>
                    <Button onClick={verifyDelivery} className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-xl">
                      <CheckCircle2 className="size-3.5 mr-1.5" /> Verify &amp; Handover Phone
                    </Button>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Rating Section */}
          {isCustomer && job.repairStatus === "Completed" && !job.rating && (
            <Section title="Rate Your Service Experience">
              <div className="space-y-3.5 text-xs">
                <div className="flex gap-1.5 justify-center py-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setStars(star)}>
                      <Star className={`size-6 ${stars >= star ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
                <div>
                  <Label>Comments</Label>
                  <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="How was your device repaired?" className="rounded-xl mt-1 bg-secondary/50 border-border" />
                </div>
                <Button onClick={handleRating} className="w-full bg-[#FF5733] hover:bg-[#FF784E] text-white rounded-xl">
                  Submit Feedback
                </Button>
              </div>
            </Section>
          )}

          {job.rating && (
            <Section title="Customer Review">
              <div className="space-y-2 text-xs">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className={`size-3.5 ${job.rating!.stars >= star ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                  ))}
                </div>
                <p className="italic text-muted-foreground">"{job.rating.comment}"</p>
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
