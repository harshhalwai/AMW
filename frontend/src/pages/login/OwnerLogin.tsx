import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../contexts/auth";
import { apiRequest } from "../../api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/AuthShell";

export function OwnerLogin() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [id, setId] = useState("owner");
  const [password, setPassword] = useState("owner123");
  const [forgot, setForgot] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      toast.success("Welcome back, Owner");
      navigate("/app/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    }
  };

  return (
    <AuthShell title="Owner Login" subtitle="Full access to AMW Repair OS" icon={<ShieldCheck className="size-5" />}>
      {forgot ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Enter your registered mobile or email — we'll send a recovery link (demo only).</p>
          <Input placeholder="Mobile or email" />
          <Button className="w-full" onClick={() => { toast.success("Recovery link sent (demo)"); setForgot(false); }}>Send Link</Button>
          <button onClick={() => setForgot(false)} className="text-sm text-primary hover:underline">Back to login</button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label>Mobile / Email / Username</Label>
            <Input value={id} onChange={e => setId(e.target.value)} placeholder="owner" />
          </div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button type="button" onClick={() => setForgot(true)} className="text-xs text-primary hover:underline">Forgot password?</button>
          <Button type="submit" className="w-full">Sign in</Button>
        </form>
      )}
      <div className="mt-6 flex justify-between text-xs">
        <Link to="/" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3" /> All portals</Link>
        <span className="text-muted-foreground">Demo: <span className="font-mono">owner / owner123</span></span>
      </div>
    </AuthShell>
  );
}
