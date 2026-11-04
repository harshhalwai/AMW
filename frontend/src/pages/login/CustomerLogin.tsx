import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../contexts/auth";
import { Otp } from "../../services/store";
import { apiRequest } from "../../api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/AuthShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function CustomerLogin() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [identifier, setId] = useState("9123456780");
  const [sheet, setSheet] = useState("AMW-1000");
  const [otpStep, setOtpStep] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [otpId, setOtpId] = useState("9123456780");

  const loginBySheet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest("/api/auth/login/", {
        method: "POST",
        body: JSON.stringify({
          role: "customer",
          username: identifier,
          job_sheet_no: sheet,
        }),
      });

      const sessionObj = {
        role: "customer" as const,
        userId: String(res.user.customer_profile?.customer_id || res.user.username),
        name: res.user.name,
      };

      await signIn(sessionObj, res.tokens.access, res.tokens.refresh);
      toast.success(`Welcome ${res.user.name}`);
      navigate("/app/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    }
  };

  const sendOtp = async () => {
    try {
      const code = await Otp.generate(otpId, "login");
      toast.success(`OTP sent successfully`, { description: `Demo OTP: ${code}`, duration: 8000 });
      setOtpStep(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await apiRequest("/api/auth/login/", {
        method: "POST",
        body: JSON.stringify({
          role: "customer",
          username: otpId,
          otp_code: otpInput,
        }),
      });

      const sessionObj = {
        role: "customer" as const,
        userId: String(res.user.customer_profile?.customer_id || res.user.username),
        name: res.user.name,
      };

      await signIn(sessionObj, res.tokens.access, res.tokens.refresh);
      toast.success(`Welcome ${res.user.name}`);
      navigate("/app/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Invalid OTP code");
    }
  };

  return (
    <AuthShell title="Customer Login" subtitle="Track your repair status" icon={<UserCircle className="size-5" />}>
      <Tabs defaultValue="sheet" className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="sheet">Job Sheet</TabsTrigger>
          <TabsTrigger value="otp">OTP</TabsTrigger>
        </TabsList>
        <TabsContent value="sheet">
          <form onSubmit={loginBySheet} className="space-y-4 mt-4">
            <div>
              <Label>Mobile or Email</Label>
              <Input value={identifier} onChange={e => setId(e.target.value)} />
            </div>
            <div>
              <Label>Job Sheet Number</Label>
              <Input value={sheet} onChange={e => setSheet(e.target.value)} />
            </div>
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
        </TabsContent>
        <TabsContent value="otp">
          <div className="space-y-4 mt-4">
            <div>
              <Label>Mobile or Email</Label>
              <Input value={otpId} onChange={e => setOtpId(e.target.value)} />
            </div>
            {otpStep && (
              <div>
                <Label>Enter OTP</Label>
                <Input value={otpInput} onChange={e => setOtpInput(e.target.value)} maxLength={6} />
              </div>
            )}
            {!otpStep
              ? <Button type="button" className="w-full" onClick={sendOtp}>Send OTP</Button>
              : <Button type="button" className="w-full" onClick={verifyOtp}>Verify & sign in</Button>}
          </div>
        </TabsContent>
      </Tabs>
      <div className="mt-6 flex justify-between text-xs">
        <Link to="/" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3" /> All portals</Link>
        <span className="text-muted-foreground">Demo: <span className="font-mono">9123456780 / AMW-1000</span></span>
      </div>
    </AuthShell>
  );
}
