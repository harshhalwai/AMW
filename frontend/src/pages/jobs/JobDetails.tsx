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
  ArrowLeft, Printer, ShieldAlert, Smartphone, Clock, CheckCircle2, User, Phone, Mail, FileText, Check, Star, AlertCircle, Wrench, RefreshCw, Send, CheckCheck, Landmark
} from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { toast } from "sonner";
import { PatternInput } from "@/components/PatternInput";

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
        <AlertCircle className="size-12 text-destructive mx-auto animate-pulse" />
        <h2 className="text-xl font-bold">Repair Job not found</h2>
        <p className="text-xs text-muted-foreground">The job sheet number might be incorrect or removed.</p>
        <Button onClick={() => navigate("/app/jobs")} className="w-full">Back to jobs</Button>
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

      // Preserving custom JSON payload structure
      const serialisedDescription = JSON.stringify({
        remarks,
        imei,
        accessories,
      });

      await Jobs.upsert({
        ...job,
        assignedEmployeeId: assignedEmployeeId || undefined,
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
        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b-2 border-gray-300 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tight text-gray-800">{shop.name}</h1>
            <p className="text-xs text-gray-500 max-w-xs">{shop.address || "Shop Address"}</p>
            <p className="text-[11px] text-gray-500 font-medium">Contact: {shop.contact} | Email: {shop.email}</p>
            {shop.gstin && <p className="text-[11px] text-primary font-bold">GSTIN: {shop.gstin}</p>}
          </div>
          <div className="text-right space-y-2">
            <div className="bg-gray-100 px-4 py-2.5 rounded-2xl border border-gray-200 inline-block">
              <span className="text-[9px] uppercase tracking-wider text-gray-400 font-bold block">Job Sheet / Invoice</span>
              <span className="text-lg font-mono font-black text-gray-700">{job.jobSheetNo}</span>
            </div>
            <p className="text-[11px] text-gray-500 font-semibold">Date of intake: {new Date(job.jobDate).toLocaleDateString("en-IN")}</p>
          </div>
        </div>

        {/* Customer & Device Grid */}
        <div className="grid grid-cols-2 gap-8 my-6 text-xs leading-relaxed">
          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
            <h3 className="text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-wider">Customer Details</h3>
            <p className="font-bold text-gray-800 text-sm">{job.customerName}</p>
            <p className="text-gray-600 font-medium mt-1">Mobile: {job.customerMobile}</p>
            {job.customerEmail && <p className="text-gray-600">Email: {job.customerEmail}</p>}
          </div>
          <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
            <h3 className="text-[10px] uppercase font-bold text-gray-400 mb-2 tracking-wider">Device Intake Details</h3>
            <p className="font-bold text-gray-800 text-sm">{job.brand} {job.model} ({job.color || "N/A"})</p>
            <p className="text-gray-600 font-semibold">IMEI / Serial: <span className="font-mono">{imei}</span></p>
            <p className="text-gray-600">Lock Type: {job.passwordType} ({job.passwordValue || "None"})</p>
            <p className="text-gray-600 font-medium">Accessories: {accessories}</p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="border border-gray-200 rounded-2xl overflow-hidden mb-6 text-xs">
          <table className="w-full">
            <thead className="bg-gray-50 text-gray-500 font-bold">
              <tr className="border-b border-gray-200">
                <th className="p-3 text-left">Intake Fault &amp; Diagnosis Remarks</th>
                <th className="p-3 text-right">Estimated Charge</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="p-3">
                  <div className="font-bold text-gray-800">{job.fault}</div>
                  {remarks && <div className="text-gray-500 mt-1">Condition remarks: {remarks}</div>}
                  {job.featuresInstalled && (
                    <div className="text-blue-600 font-semibold mt-1">Installed upgrades: {job.featuresInstalled}</div>
                  )}
                </td>
                <td className="p-3 text-right font-bold text-gray-800">₹{subtotal.toLocaleString("en-IN")}</td>
              </tr>
              <tr className="bg-gray-50/50 border-t border-gray-200">
                <td className="p-2.5 text-right text-gray-500 font-bold">Subtotal</td>
                <td className="p-2.5 text-right text-gray-800 font-semibold">₹{subtotal.toLocaleString("en-IN")}</td>
              </tr>
              <tr className="bg-gray-50/50">
                <td className="p-2.5 text-right text-gray-500 font-bold">GST ({gstRate}%)</td>
                <td className="p-2.5 text-right text-gray-800 font-semibold">₹{gstAmt.toLocaleString("en-IN")}</td>
              </tr>
              <tr className="bg-gray-50/50 font-black border-t border-gray-200 text-sm">
                <td className="p-3 text-right text-gray-700">Total Bill Amount (Inc. GST)</td>
                <td className="p-3 text-right text-gray-900">₹{totalWithGst.toLocaleString("en-IN")}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signature Area */}
        <div className="grid grid-cols-3 gap-6 items-end mt-16 pt-6 border-t border-gray-200 text-[10px] text-gray-500">
          <div>
            <div className="h-10 border-b border-gray-300 w-36 mb-2" />
            <p className="font-bold uppercase tracking-wider">Customer Signature</p>
            <p className="text-[9px]">Verified intake conditions &amp; lock details</p>
          </div>
          <div>
            <div className="h-10 border-b border-gray-300 w-36 mb-2" />
            <p className="font-bold uppercase tracking-wider">Technician Signature</p>
            <p className="text-[9px]">{assignedEmp?.name || "Assigned staff"}</p>
          </div>
          <div className="text-right">
            <div className="h-10 border-b border-gray-300 w-36 ml-auto mb-2" />
            <p className="font-bold uppercase tracking-wider">Authorized Seal / Stamp</p>
            <p className="text-[9px]">{shop.name}</p>
          </div>
        </div>

        {/* Terms */}
        <div className="mt-8 pt-4 border-t border-gray-100 text-[9px] text-gray-400 space-y-1">
          <p>1. Warranty: 90 days repair warranty on premium parts. No warranty on water-damaged motherboards.</p>
          <p>2. AMW takes no responsibility for data loss during repair. Please back up your device beforehand.</p>
          <p>3. Devices not claimed within 30 days of completion notification carry a storage penalty.</p>
        </div>

        {/* Print controls */}
        <div className="mt-8 text-center no-print flex justify-center gap-3">
          <Button onClick={() => window.print()} className="shadow-elegant"><Printer className="size-4" /> Print Document</Button>
          <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
        </div>
      </div>
    );
  }

  const isOwner = session?.role === "owner";
  const isEmployee = session?.role === "employee";
  const isCustomer = session?.role === "customer";
  const assignedEmp = job.assignedEmployeeId ? Employees.byId(job.assignedEmployeeId) : null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-12">
      {/* Upper Navigation bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
        <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to list
        </button>
        <div className="flex items-center gap-2">
          {session?.role !== "customer" && (
            <Button asChild variant="outline" size="sm" className="rounded-xl">
              <Link to={`/app/jobs/${job.id}?print=1`}><Printer className="size-4" /> Print Invoice</Link>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left main details */}
        <div className="md:col-span-2 space-y-6">
          <Section title={`Intake Sheet ${job.jobSheetNo}`}
            action={
              <div className="flex items-center gap-2">
                <StatusBadge status={job.repairStatus} />
                <StatusBadge status={job.deliveryStatus} />
              </div>
            }>
            
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Device Card */}
              <div className="space-y-3.5 bg-accent/30 p-4.5 rounded-2xl border border-border/40">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border/30 pb-1.5 flex items-center gap-1.5">
                  <Smartphone className="size-3.5 text-primary" /> Device Specifications
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-muted-foreground font-bold block uppercase">Device Brand &amp; Model</span>
                    <span className="font-bold text-sm">{job.brand} {job.model}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-muted-foreground font-bold block uppercase">Color</span>
                      <span className="text-xs font-semibold">{job.color || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground font-bold block uppercase">Type</span>
                      <span className="text-xs font-semibold">{job.mobileType}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground font-bold block uppercase">IMEI / Serial Number</span>
                    <span className="font-mono text-xs font-bold text-primary">{imei}</span>
                  </div>
                  <div className="flex items-start gap-2 pt-1">
                    <ShieldAlert className="size-4 text-warning shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold">Lock: {job.passwordType}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">Code: {job.passwordValue || "None"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Card */}
              <div className="space-y-3.5 bg-accent/30 p-4.5 rounded-2xl border border-border/40">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest border-b border-border/30 pb-1.5 flex items-center gap-1.5">
                  <User className="size-3.5 text-primary" /> Customer Profile
                </h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-[10px] text-muted-foreground font-bold block uppercase">Full Name</span>
                    <span className="font-bold text-sm">{job.customerName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground font-bold block uppercase">Mobile Number</span>
                    <span className="text-xs font-semibold inline-flex items-center gap-1"><Phone className="size-3 text-muted-foreground" /> {job.customerMobile}</span>
                  </div>
                  {job.customerEmail && (
                    <div>
                      <span className="text-[10px] text-muted-foreground font-bold block uppercase">Email Address</span>
                      <span className="text-xs font-semibold inline-flex items-center gap-1 truncate max-w-full"><Mail className="size-3 text-muted-foreground shrink-0" /> {job.customerEmail}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] text-muted-foreground font-bold block uppercase">Accessories Received</span>
                    <span className="text-xs font-semibold block text-primary mt-0.5">{accessories}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Diagnostic Logs & Remarks */}
            <div className="border-t border-border mt-6 pt-5 space-y-4">
              <div>
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Declared Issue / Fault</h4>
                <p className="text-sm font-bold text-foreground bg-accent/20 px-3 py-2 rounded-xl border border-border/30">{job.fault}</p>
              </div>
              {remarks && (
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Intake Remarks / Physical Condition</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{remarks}</p>
                </div>
              )}
              {job.featuresInstalled && (
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Upgrades &amp; Features Installed</h4>
                  <p className="text-xs text-primary font-bold">{job.featuresInstalled}</p>
                </div>
              )}
              {job.picture && (
                <div>
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Device Intake Image</h4>
                  <div className="relative w-72 h-44 border border-border rounded-2xl overflow-hidden shadow-elegant bg-muted">
                    <img src={job.picture.startsWith("http") ? job.picture : `http://localhost:8000${job.picture}`} alt="Device" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>
          </Section>

          {/* Timeline View */}
          <Section title="Live Repair Timeline">
            <div className="space-y-5 relative before:absolute before:left-3 before:top-2.5 before:bottom-2.5 before:w-[2px] before:bg-border">
              {timeline.map((log, idx) => (
                <div key={log.id || idx} className="flex gap-4 relative animate-fade-in">
                  <div className="size-6 rounded-full border-2 border-background bg-primary text-white grid place-items-center shadow-elegant z-10 shrink-0">
                    <Clock className="size-3" />
                  </div>
                  <div className="bg-accent/25 p-3 rounded-2xl border border-border/30 flex-1">
                    <div className="text-xs font-bold text-foreground">{log.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{log.message}</div>
                    <div className="text-[10px] text-muted-foreground/80 mt-1">
                      {new Date(log.created_at || log.createdAt).toLocaleString("en-IN")}
                      {log.actor_name && ` · Action by: ${log.actor_name} (${log.actor_role})`}
                    </div>
                  </div>
                </div>
              ))}
              {timeline.length === 0 && (
                <p className="text-xs text-muted-foreground pl-8 py-3">No timeline status updates yet.</p>
              )}
            </div>
          </Section>
        </div>

        {/* Action sidebar details */}
        <div className="space-y-6">
          {!isCustomer && (
            <Section title="Update Status">
              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <Label>Assigned Technician</Label>
                  <Select value={assignedEmployeeId} onValueChange={setEmp} disabled={!isOwner}>
                    <SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned / Hold</SelectItem>
                      {Employees.all().map(e => (
                        <SelectItem key={e.id} value={e.id}>{e.name} ({e.role})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Repair Status</Label>
                    <Select value={repairStatus} onValueChange={val => setRepStatus(val as RepairStatus)}>
                      <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Delivery Status</Label>
                    <Select value={deliveryStatus} onValueChange={val => setDelStatus(val as DeliveryStatus)} disabled={!isOwner}>
                      <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Ready for Delivery">Ready for Delivery</SelectItem>
                        <SelectItem value="Delivered">Delivered</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Screen Lock PIN</Label>
                    <Input value={passVal} onChange={e => setPassVal(e.target.value)} className="rounded-xl mt-1" />
                  </div>
                  <div>
                    <Label>Bill Charge (₹)</Label>
                    <Input type="number" value={amount} onChange={e => setAmt(e.target.value)} className="rounded-xl mt-1" />
                  </div>
                </div>
                <div>
                  <Label>New Upgrades / Upgrades</Label>
                  <Input value={featuresInstalled} onChange={e => setFeatures(e.target.value)} placeholder="e.g. Liquid protection layer" className="rounded-xl mt-1" />
                </div>
                <Button type="submit" className="w-full rounded-xl"><RefreshCw className="size-4" /> Save Diagnostics</Button>
              </form>
            </Section>
          )}

          {/* OTP Delivery Verification */}
          {!isCustomer && job.deliveryStatus !== "Delivered" && (
            <Section title="Security OTP Verify">
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">Authenticate customer device ownership prior to delivery.</p>
                {!otpSent ? (
                  <Button className="w-full rounded-xl" onClick={sendOtp}><Send className="size-4" /> Send OTP Code</Button>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label>Enter 6-Digit OTP</Label>
                      <Input value={otpInput} onChange={e => setOtpInput(e.target.value)} maxLength={6} placeholder="Enter verification code" className="rounded-xl mt-1" />
                    </div>
                    <Button className="w-full rounded-xl" onClick={verifyDelivery}><CheckCircle2 className="size-4" /> Verify &amp; Handover</Button>
                  </div>
                )}
              </div>
            </Section>
          )}

          {/* Customer Rating Portal */}
          {isCustomer && job.repairStatus === "Completed" && !job.rating && (
            <Section title="Submit Feedback">
              <div className="space-y-4">
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button key={star} onClick={() => setStars(star)}>
                      <Star className={`size-7 ${stars >= star ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
                <div>
                  <Label>Write Review</Label>
                  <Textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="How was your service experience?" className="rounded-xl mt-1" />
                </div>
                <Button className="w-full rounded-xl" onClick={handleRating}>Submit Rating</Button>
              </div>
            </Section>
          )}

          {/* Review display if present */}
          {job.rating && (
            <Section title="Customer Rating">
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star key={star} className={`size-4 ${job.rating!.stars >= star ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                  ))}
                </div>
                <p className="text-xs italic text-muted-foreground font-medium">"{job.rating.comment}"</p>
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
