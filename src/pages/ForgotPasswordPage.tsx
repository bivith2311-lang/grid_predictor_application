import { useState } from "react";
import { Zap, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSent(true);
    toast.success("Password reset email sent");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Zap className="h-8 w-8 text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Reset your password</p>
        </div>
        <div className="control-panel">
          <div className="control-panel-header"><h2 className="text-sm font-semibold">Forgot Password</h2></div>
          <div className="p-4 space-y-4">
            {sent ? (
              <div className="text-center py-4">
                <p className="text-sm text-success mb-2">Reset link sent!</p>
                <p className="text-xs text-muted-foreground">Check your email for instructions.</p>
                <Link to="/login" className="text-xs text-primary hover:underline mt-4 inline-block">Back to login</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="engineer@grid.gov" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
                <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground block text-center">Back to login</Link>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
