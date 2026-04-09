import { useGrid } from "@/contexts/GridContext";
import { AlertTriangle, CheckCircle2, ArrowUp, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function AlertsPage() {
  const { alerts, acknowledgeAlert, escalateAlert, assignTechnician } = useGrid();
  const [filter, setFilter] = useState<"all" | "critical" | "medium" | "low">("all");

  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.severity === filter);

  const handleAssign = (id: string) => {
    const techs = ["John Smith", "Sarah Chen", "Mike Rivera", "Lisa Park"];
    const tech = techs[Math.floor(Math.random() * techs.length)];
    assignTechnician(id, tech);
    toast.success(`Assigned to ${tech}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Alert Center</h1>
          <p className="text-sm text-muted-foreground">{alerts.length} total alerts</p>
        </div>
        <div className="flex gap-1 bg-muted rounded-lg p-1">
          {(["all", "critical", "medium", "low"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize ${
                filter === f ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="grid-card text-center py-12">
          <CheckCircle2 className="h-12 w-12 text-success/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No alerts. Start streaming data to generate alerts.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((alert) => (
            <div
              key={alert.id}
              className={`control-panel animate-fade-in-up ${
                alert.severity === "critical" ? "border-destructive/30" : alert.severity === "medium" ? "border-warning/30" : ""
              }`}
            >
              <div className="px-4 py-3 flex items-start gap-3">
                <span
                  className={`mt-1 status-dot ${
                    alert.severity === "critical" ? "status-dot-critical" : alert.severity === "medium" ? "status-dot-warning" : "status-dot-ok"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                      alert.severity === "critical" ? "bg-destructive/10 text-destructive" :
                      alert.severity === "medium" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                    }`}>
                      {alert.severity}
                    </span>
                    {alert.acknowledged && <span className="text-[10px] bg-success/10 text-success px-1.5 py-0.5 rounded-full">Acknowledged</span>}
                    {alert.escalated && <span className="text-[10px] bg-warning/10 text-warning px-1.5 py-0.5 rounded-full">Escalated</span>}
                    {alert.assignedTo && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">→ {alert.assignedTo}</span>}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{alert.nodeName} · {alert.timestamp.toLocaleString()}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {!alert.acknowledged && (
                    <button
                      onClick={() => { acknowledgeAlert(alert.id); toast.success("Alert acknowledged"); }}
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-success transition-colors"
                      title="Acknowledge"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  )}
                  {!alert.escalated && (
                    <button
                      onClick={() => { escalateAlert(alert.id); toast.warning("Alert escalated"); }}
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-warning transition-colors"
                      title="Escalate"
                    >
                      <ArrowUp className="h-4 w-4" />
                    </button>
                  )}
                  {!alert.assignedTo && (
                    <button
                      onClick={() => handleAssign(alert.id)}
                      className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                      title="Assign Technician"
                    >
                      <UserPlus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
