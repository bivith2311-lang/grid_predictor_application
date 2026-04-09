import { useGrid } from "@/contexts/GridContext";
import { useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, ZAxis,
} from "recharts";

export default function AnalyticsPage() {
  const { historicalData, nodes } = useGrid();
  const [regionFilter, setRegionFilter] = useState("All");
  const regions = ["All", ...new Set(nodes.map((n) => n.region))];

  const filteredNodes = regionFilter === "All" ? nodes : nodes.filter((n) => n.region === regionFilter);

  const heatmapData = filteredNodes.map((n) => ({
    name: n.name,
    risk: n.riskLevel,
    load: Math.round(n.load),
    temp: Math.round(n.temperature),
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">Historical trends and failure analysis</p>
        </div>
        <select
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-card text-sm"
        >
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Failures Over Time */}
        <div className="control-panel">
          <div className="control-panel-header">
            <h2 className="text-sm font-semibold">Failures & Predictions (90 days)</h2>
          </div>
          <div className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historicalData.slice(-30)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Area type="monotone" dataKey="failures" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive) / 0.1)" strokeWidth={2} />
                <Area type="monotone" dataKey="predictions" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Accuracy */}
        <div className="control-panel">
          <div className="control-panel-header">
            <h2 className="text-sm font-semibold">Model Accuracy Trend</h2>
          </div>
          <div className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData.slice(-30)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} domain={[0.5, 1]} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Line type="monotone" dataKey="accuracy" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Heatmap (as scatter) */}
        <div className="control-panel">
          <div className="control-panel-header">
            <h2 className="text-sm font-semibold">Risk vs Load Scatter</h2>
          </div>
          <div className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="load" name="Load %" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis dataKey="risk" name="Risk %" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <ZAxis dataKey="temp" range={[50, 400]} name="Temperature" />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Scatter data={heatmapData} fill="hsl(var(--primary))" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Average Risk by Day */}
        <div className="control-panel">
          <div className="control-panel-header">
            <h2 className="text-sm font-semibold">Average Risk Score (30 days)</h2>
          </div>
          <div className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historicalData.slice(-30)}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                <Bar dataKey="avgRisk" fill="hsl(var(--warning))" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
