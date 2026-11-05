import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../contexts/auth";
import { Otp } from "../../services/store";
import { apiRequest } from "../../api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, ArrowLeft, Smartphone, KeyRound } from "lucide-react";
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
  const [loading, setLoading] = useState(false);

  const loginBySheet = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
      toast.error(err.message || "Invalid customer credentials");
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    try {
      const code = await Otp.generate(otpId, "login");
      toast.success(`OTP code dispatched`, {
        description: `Demo OTP: ${code}`,
        duration: 9000,
      });
      setOtpStep(true);
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Customer Portal"
      subtitle="Track your active repairs, view inspection timeline & download bills"
      icon={<UserCircle className="size-5 text-emerald-400" />}
    >
      <Tabs defaultValue="sheet" className="w-full">
        <TabsList className="grid grid-cols-2 w-full bg-secondary/60 border border-border rounded-xl p-1">
          <TabsTrigger value="sheet" className="rounded-lg text-xs font-semibold data-[state=active]:bg-[#FF5733] data-[state=active]:text-white">
            Job Sheet #
          </TabsTrigger>
          <TabsTrigger value="otp" className="rounded-lg text-xs font-semibold data-[state=active]:bg-[#FF5733] data-[state=active]:text-white">
            SMS / OTP
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sheet">
          <form onSubmit={loginBySheet} className="space-y-4 mt-4 text-xs">
            <div>
              <Label>Registered Mobile or Email</Label>
              <Input
                value={identifier}
                onChange={e => setId(e.target.value)}
                className="mt-1 bg-secondary/50 border-border text-white rounded-xl font-mono"
                required
              />
            </div>
            <div>
              <Label>Job Sheet Number</Label>
              <Input
                value={sheet}
                onChange={e => setSheet(e.target.value)}
                placeholder="e.g. AMW-1000"
                className="mt-1 bg-secondary/50 border-border text-white rounded-xl font-mono"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF5733] hover:bg-[#FF784E] text-white shadow-elegant rounded-xl font-bold h-10 mt-2"
            >
              {loading ? "Verifying..." : "Track My Repair"}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="otp">
          <div className="space-y-4 mt-4 text-xs">
            <div>
              <Label>Registered Mobile Number</Label>
              <Input
                value={otpId}
                onChange={e => setOtpId(e.target.value)}
                placeholder="9123456780"
                className="mt-1 bg-secondary/50 border-border text-white rounded-xl font-mono"
              />
            </div>
            {otpStep && (
              <div>
                <Label>Enter 6-Digit OTP</Label>
                <Input
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value)}
                  maxLength={6}
                  placeholder="e.g. 123456"
                  className="mt-1 font-mono text-center tracking-widest text-base bg-secondary/50 border-border text-white rounded-xl"
                />
              </div>
            )}
            {!otpStep ? (
              <Button
                type="button"
                className="w-full bg-[#FF5733] hover:bg-[#FF784E] text-white shadow-elegant rounded-xl font-bold h-10 mt-2"
                onClick={sendOtp}
              >
                Send OTP Code
              </Button>
            ) : (
              <Button
                type="button"
                disabled={loading}
                className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-xl font-bold h-10 mt-2"
                onClick={verifyOtp}
              >
                {loading ? "Verifying..." : "Verify & Sign In"}
              </Button>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-6 pt-4 border-t border-[#272B36] flex items-center justify-between text-[11px]">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-white transition-colors"
        >
          <ArrowLeft className="size-3" /> Back to Store
        </Link>
        <span className="text-muted-foreground">
          Demo: <span className="font-mono text-[#FF784E] font-bold">9123456780 / AMW-1000</span>
        </span>
      </div>
    </AuthShell>
  );
}
