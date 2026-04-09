import { useGrid } from "@/contexts/GridContext";
import { Brain, Download, Loader2, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { toast } from "sonner";

export default function PredictionsPage() {
  const { predictions, runPrediction, isPredicting } = useGrid();

  const handleDownloadReport = () => {
    const report = predictions.map((p) =>
      `${p.nodeName}: ${(p.failureProbability * 100).toFixed(1)}% failure probability, ${p.timeToFailure}h to failure\nRecommendations: ${p.recommendations.join("; ")}`
    ).join("\n\n");
    const blob = new Blob([`POWER GRID FAILURE PREDICTION REPORT\n${"=".repeat(40)}\nGenerated: ${new Date().toISOString()}\n\n${report}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "prediction_report.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Report downloaded");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">ML Predictions</h1>
          <p className="text-sm text-muted-foreground">LSTM/Transformer-based failure prediction</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={runPrediction}
            disabled={isPredicting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isPredicting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
            {isPredicting ? "Running Pipeline..." : "Run Prediction"}
          </button>
          <button
            onClick={handleDownloadReport}
            disabled={predictions.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
          >
            <Download className="h-4 w-4" /> Download Report
          </button>
        </div>
      </div>

      {isPredicting && (
        <div className="grid-card-glow flex items-center gap-4 animate-pulse-glow">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <div>
            <p className="text-sm font-semibold">ML Pipeline Running</p>
            <p className="text-xs text-muted-foreground">Processing SCADA logs, weather data, and sensor feeds through LSTM model...</p>
          </div>
        </div>
      )}

      {predictions.length === 0 && !isPredicting ? (
        <div className="grid-card text-center py-12">
          <Brain className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No predictions yet. Click "Run Prediction" to start the ML pipeline.</p>
        </div>
      ) : (
        <>
          {/* Prediction Results */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {predictions.map((pred) => (
              <div key={pred.nodeId} className={`control-panel ${pred.failureProbability > 0.7 ? "border-destructive/30" : pred.failureProbability > 0.4 ? "border-warning/30" : ""}`}>
                <div className="control-panel-header">
                  <h3 className="text-sm font-semibold">{pred.nodeName}</h3>
                  {pred.failureProbability > 0.7 ? (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  )}
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase">Failure Probability</p>
                      <p className={`text-2xl font-mono font-bold ${pred.failureProbability > 0.7 ? "text-destructive" : pred.failureProbability > 0.4 ? "text-warning" : "text-success"}`}>
                        {(pred.failureProbability * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground uppercase">Time to Failure</p>
                      <p className="text-lg font-mono font-bold">{pred.timeToFailure}h</p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pred.failureProbability > 0.7 ? "bg-destructive" : pred.failureProbability > 0.4 ? "bg-warning" : "bg-success"}`}
                      style={{ width: `${pred.failureProbability * 100}%` }}
                    />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase mb-1">Confidence</p>
                    <p className="text-xs font-mono">{(pred.confidence * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase mb-1">Recommendations</p>
                    {pred.recommendations.map((r, i) => (
                      <p key={i} className="text-xs text-muted-foreground">• {r}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Feature Importance */}
          {predictions.length > 0 && (
            <div className="control-panel">
              <div className="control-panel-header">
                <h2 className="text-sm font-semibold">Model Insights — Feature Importance</h2>
              </div>
              <div className="p-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={predictions[0].topFeatures} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} domain={[0, 0.6]} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} width={130} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }} />
                    <Bar dataKey="importance" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
