import { useState } from "react";
import { useGrid } from "@/contexts/GridContext";
import { Zap, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const { login } = useGrid();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("All fields required"); return; }
    setLoading(true);
    setError("");
    const ok = await login(email, password);
    setLoading(false);
    if (ok) navigate("/");
    else setError("Invalid credentials");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <Zap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">PowerGrid AI</span>
          </div>
          <p className="text-sm text-muted-foreground">National Power Grid Failure Prediction</p>
        </div>
        <form onSubmit={handleSubmit} className="control-panel">
          <div className="control-panel-header"><h2 className="text-sm font-semibold">Sign In</h2></div>
          <div className="p-4 space-y-4">
            {error && <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded">{error}</p>}
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="engineer@grid.gov" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Signing in..." : "Sign In"}
            </button>
            <div className="flex justify-between text-xs">
              <Link to="/signup" className="text-primary hover:underline">Create account</Link>
              <Link to="/forgot-password" className="text-muted-foreground hover:text-foreground">Forgot password?</Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
