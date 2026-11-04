import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../contexts/auth";
import { apiRequest } from "../../api/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wrench, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { AuthShell } from "@/components/AuthShell";

export function EmployeeLogin() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [id, setId] = useState("EMP001");
  const [password, setPassword] = useState("emp123");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiRequest("/api/auth/login/", {
        method: "POST",
        body: JSON.stringify({
          role: "employee",
          username: id,
          password: password,
        }),
      });

      const sessionObj = {
        role: "employee" as const,
        userId: String(res.user.employee_profile?.employee_id || res.user.username),
        name: res.user.name,
      };

      await signIn(sessionObj, res.tokens.access, res.tokens.refresh);
      toast.success(`Welcome ${res.user.name}`);
      navigate("/app/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Invalid credentials");
    }
  };

  return (
    <AuthShell title="Employee Login" subtitle="Manage your assigned repairs" icon={<Wrench className="size-5" />}>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label>Employee ID / Mobile / Email</Label>
          <Input value={id} onChange={e => setId(e.target.value)} />
        </div>
        <div>
          <Label>Password</Label>
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button type="button" onClick={() => toast.info("Contact owner to reset password")} className="text-xs text-primary hover:underline">Forgot password?</button>
        <Button type="submit" className="w-full">Sign in</Button>
      </form>
      <div className="mt-6 flex justify-between text-xs">
        <Link to="/" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"><ArrowLeft className="size-3" /> All portals</Link>
        <span className="text-muted-foreground">Demo: <span className="font-mono">EMP001 / emp123</span></span>
      </div>
    </AuthShell>
  );
}
