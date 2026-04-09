import { useGrid } from "@/contexts/GridContext";
import {
  AlertTriangle, Activity, Zap, Clock, Radio, TrendingUp,
  ChevronRight, ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid,
} from "recharts";

function KpiCard({ label, value, icon: Icon, trend, color }: {
  label: string; value: string | number; icon: React.ElementType; trend?: number; color: string;
}) {
  return (
    <div className="grid-card animate-fade-in-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className={`kpi-value mt-1 text-${color}`}>{value}</p>
        </div>
        <div className={`p-2 rounded-lg bg-${color}/10`}>
          <Icon className={`h-5 w-5 text-${color}`} />
        </div>
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-2 text-xs">
          {trend >= 0 ? (
            <ArrowUpRight className="h-3 w-3 text-success" />
          ) : (
            <ArrowDownRight className="h-3 w-3 text-destructive" />
          )}
          <span className={trend >= 0 ? "text-success" : "text-destructive"}>
            {Math.abs(trend)}%
          </span>
          <span className="text-muted-foreground">vs last hour</span>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const {
    nodes, alerts, gridHealthScore, streamStatus, timeSeriesData,
    isStreaming, predictions,
  } = useGrid();

  const activeFaults = nodes.filter((n) => n.status === "critical").length;
  const avgRisk = Math.round(nodes.reduce((s, n) => s + n.riskLevel, 0) / nodes.length);
  const recentAlerts = alerts.slice(0, 5);
  const topRiskNodes = [...nodes].sort((a, b) => b.riskLevel - a.riskLevel).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">National Power Grid Monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`status-dot ${isStreaming ? "status-dot-ok" : "status-dot-warning"}`} />
          <span className="text-xs text-muted-foreground">{isStreaming ? "Live" : "Paused"}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Active Faults" value={activeFaults} icon={AlertTriangle} color="destructive" trend={-12} />
        <KpiCard label="Risk Level" value={`${avgRisk}%`} icon={Activity} color="warning" trend={5} />
        <KpiCard label="Ingestion Rate" value={`${streamStatus.ingestionRate}/s`} icon={Radio} color="primary" />
        <KpiCard label="System Uptime" value="99.7%" icon={Clock} color="success" trend={0.2} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Risk Timeline */}
        <div className="lg:col-span-2 control-panel">
          <div className="control-panel-header">
            <h2 className="text-sm font-semibold">Failure Prediction Timeline (72h)</h2>
            <span className="text-xs text-muted-foreground">Risk Score</span>
          </div>
          <div className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesData.slice(0, 72)}>
                <defs>
                  <linearGradient id="riskGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} interval={11} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="riskScore" stroke="hsl(var(--primary))" fill="url(#riskGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Alerts */}
        <div className="control-panel">
          <div className="control-panel-header">
            <h2 className="text-sm font-semibold">Live Alerts</h2>
            <span className="bg-destructive/10 text-destructive text-[10px] font-bold px-2 py-0.5 rounded-full">
              {alerts.filter((a) => !a.acknowledged).length} active
            </span>
          </div>
          <div className="divide-y divide-border max-h-64 overflow-y-auto scrollbar-thin">
            {recentAlerts.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">No alerts yet. Start streaming to generate data.</p>
            ) : (
              recentAlerts.map((alert) => (
                <div key={alert.id} className="px-4 py-3 flex items-start gap-3 animate-fade-in-up">
                  <span
                    className={`status-dot mt-1.5 ${
                      alert.severity === "critical" ? "status-dot-critical" : alert.severity === "medium" ? "status-dot-warning" : "status-dot-ok"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">{alert.message}</p>
                    <p className="text-[10px] text-muted-foreground">{alert.nodeName} · {alert.timestamp.toLocaleTimeString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top Risk Nodes */}
        <div className="control-panel">
          <div className="control-panel-header">
            <h2 className="text-sm font-semibold">Highest Risk Nodes</h2>
          </div>
          <div className="divide-y divide-border">
            {topRiskNodes.map((node) => (
              <div key={node.id} className="px-4 py-3 flex items-center gap-3">
                <Zap className={`h-4 w-4 ${node.riskLevel > 70 ? "text-destructive" : node.riskLevel > 40 ? "text-warning" : "text-success"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">{node.name}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{node.type.replace("_", " ")} · {node.region}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-mono font-bold ${node.riskLevel > 70 ? "text-destructive" : node.riskLevel > 40 ? "text-warning" : "text-success"}`}>
                    {node.riskLevel}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Load Distribution */}
        <div className="control-panel">
          <div className="control-panel-header">
            <h2 className="text-sm font-semibold">Load Distribution</h2>
          </div>
          <div className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topRiskNodes}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="load" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="temperature" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
