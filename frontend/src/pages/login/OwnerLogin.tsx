import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../contexts/auth";
import { apiRequest } from "../../api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowLeft, KeyRound, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/AuthShell";

export function OwnerLogin() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [id, setId] = useState("owner");
  const [password, setPassword] = useState("owner123");
  const [forgot, setForgot] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiRequest("/api/auth/login/", {
        method: "POST",
        body: JSON.stringify({
          role: "owner",
          username: id,
          password: password,
        }),
      });

      const sessionObj = {
        role: "owner" as const,
        userId: String(res.user.id),
        name: res.user.name,
      };

      await signIn(sessionObj, res.tokens.access, res.tokens.refresh);
      toast.success("Welcome back, Store Owner");
      navigate("/app/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Store Owner Login"
      subtitle="Full administrative control over AMW Repair OS"
      icon={<ShieldCheck className="size-5 text-[#FF5733]" />}
    >
      {forgot ? (
        <div className="space-y-4 text-xs">
          <p className="text-muted-foreground leading-relaxed">
            Enter your registered mobile or email to dispatch an instant recovery code.
          </p>
          <Input placeholder="Mobile or email address" className="bg-secondary/50 border-border text-white" />
          <Button
            className="w-full bg-[#FF5733] hover:bg-[#FF784E] text-white shadow-elegant rounded-xl font-bold"
            onClick={() => {
              toast.success("Recovery token dispatched (demo mode: owner / owner123)");
              setForgot(false);
            }}
          >
            Dispatch Recovery Link
          </Button>
          <button onClick={() => setForgot(false)} className="text-[#FF784E] hover:underline font-semibold block text-center w-full">
            Return to Login
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4 text-xs">
          <div>
            <Label>Username / Registered Mobile</Label>
            <Input
              value={id}
              onChange={e => setId(e.target.value)}
              placeholder="owner"
              className="mt-1 bg-secondary/50 border-border text-white rounded-xl"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>Account Password</Label>
              <button
                type="button"
                onClick={() => setForgot(true)}
                className="text-[11px] text-[#FF784E] hover:underline font-medium"
              >
                Forgot password?
              </button>
            </div>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bg-secondary/50 border-border text-white rounded-xl"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FF5733] hover:bg-[#FF784E] text-white shadow-elegant rounded-xl font-bold h-10 mt-2"
          >
            {loading ? "Authenticating..." : "Sign In to Admin Console"}
          </Button>
        </form>
      )}

      <div className="mt-6 pt-4 border-t border-[#272B36] flex items-center justify-between text-[11px]">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-white transition-colors"
        >
          <ArrowLeft className="size-3" /> Back to Store
        </Link>
        <span className="text-muted-foreground">
          Demo: <span className="font-mono text-[#FF784E] font-bold">owner / owner123</span>
        </span>
      </div>
    </AuthShell>
  );
}
