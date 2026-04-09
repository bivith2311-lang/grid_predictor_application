import { useGrid } from "@/contexts/GridContext";
import { useState } from "react";
import { User, Save } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, updateProfile, activityLog } = useGrid();
  const [form, setForm] = useState({
    name: user?.name || "",
    organization: user?.organization || "",
    role: user?.role || "engineer",
  });

  const handleSave = () => {
    updateProfile(form as any);
    toast.success("Profile updated");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-sm text-muted-foreground">{user?.email}</p>
      </div>

      <div className="control-panel">
        <div className="control-panel-header"><h2 className="text-sm font-semibold">Personal Information</h2></div>
        <div className="p-4 space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Name</label>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Organization</label>
            <input value={form.organization} onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Role</label>
            <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as "admin" | "engineer" | "analyst" }))}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
              <option value="admin">Admin</option>
              <option value="engineer">Engineer</option>
              <option value="analyst">Analyst</option>
            </select>
          </div>
          <button onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
            <Save className="h-4 w-4" /> Save Changes
          </button>
        </div>
      </div>

      {/* Activity Log */}
      <div className="control-panel">
        <div className="control-panel-header"><h2 className="text-sm font-semibold">Activity Log</h2></div>
        <div className="divide-y divide-border max-h-64 overflow-y-auto scrollbar-thin">
          {activityLog.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground text-center">No activity yet.</p>
          ) : (
            activityLog.map((log, i) => (
              <div key={i} className="px-4 py-2 flex items-center gap-3">
                <span className="text-[10px] text-muted-foreground font-mono w-20 shrink-0">{log.timestamp.toLocaleTimeString()}</span>
                <span className="text-xs">{log.action}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
