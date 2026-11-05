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
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
      toast.success(`Welcome back, ${res.user.name}`);
      navigate("/app/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Invalid technician credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Technician Portal"
      subtitle="Access assigned repair queues and diagnostic terminals"
      icon={<Wrench className="size-5 text-[#FF784E]" />}
    >
      <form onSubmit={submit} className="space-y-4 text-xs">
        <div>
          <Label>Technician ID / Mobile / Email</Label>
          <Input
            value={id}
            onChange={e => setId(e.target.value)}
            className="mt-1 bg-secondary/50 border-border text-white rounded-xl"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <Label>Password</Label>
            <button
              type="button"
              onClick={() => toast.info("Contact the shop owner to reset your technician password.")}
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
          {loading ? "Authenticating..." : "Sign In to Technician Bench"}
        </Button>
      </form>

      <div className="mt-6 pt-4 border-t border-[#272B36] flex items-center justify-between text-[11px]">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-muted-foreground hover:text-white transition-colors"
        >
          <ArrowLeft className="size-3" /> Back to Store
        </Link>
        <span className="text-muted-foreground">
          Demo: <span className="font-mono text-[#FF784E] font-bold">EMP001 / emp123</span>
        </span>
      </div>
    </AuthShell>
  );
}
