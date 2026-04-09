import { useGrid } from "@/contexts/GridContext";
import { CloudLightning, Flame, WifiOff, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const EVENTS = [
  { id: "storm" as const, label: "Storm Surge", icon: CloudLightning, description: "Simulate severe weather impacting grid infrastructure", color: "primary" },
  { id: "overload" as const, label: "Grid Overload", icon: Flame, description: "Simulate excessive demand causing transformer stress", color: "warning" },
  { id: "sensor_malfunction" as const, label: "Sensor Malfunction", icon: WifiOff, description: "Simulate sensor failures causing data gaps", color: "destructive" },
];

export default function SimulationPanel() {
  const { triggerEvent } = useGrid();
  const [loading, setLoading] = useState<string | null>(null);

  const handleTrigger = async (event: "storm" | "overload" | "sensor_malfunction") => {
    setLoading(event);
    await new Promise((r) => setTimeout(r, 1500));
    triggerEvent(event);
    setLoading(null);
    toast.warning(`Simulation: ${event.replace("_", " ")} triggered`, { description: "Grid nodes affected. Check alerts for details." });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Simulation Control</h1>
        <p className="text-sm text-muted-foreground">Trigger events to test prediction and alert systems</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {EVENTS.map((event) => (
          <button
            key={event.id}
            onClick={() => handleTrigger(event.id)}
            disabled={loading !== null}
            className={`control-panel text-left transition-all hover:border-${event.color}/30 disabled:opacity-50`}
          >
            <div className="p-6 space-y-3">
              <div className={`w-12 h-12 rounded-xl bg-${event.color}/10 flex items-center justify-center`}>
                {loading === event.id ? (
                  <Loader2 className={`h-6 w-6 text-${event.color} animate-spin`} />
                ) : (
                  <event.icon className={`h-6 w-6 text-${event.color}`} />
                )}
              </div>
              <div>
                <p className="text-sm font-semibold">{event.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{event.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="control-panel">
        <div className="control-panel-header">
          <h2 className="text-sm font-semibold">How Simulation Works</h2>
        </div>
        <div className="p-4 text-xs text-muted-foreground space-y-2">
          <p>• <strong>Storm Surge:</strong> Affects ~40% of grid nodes, increases risk levels and generates critical alerts.</p>
          <p>• <strong>Grid Overload:</strong> Affects ~30% of nodes with temperature and load spikes.</p>
          <p>• <strong>Sensor Malfunction:</strong> Affects ~20% of nodes, simulating data quality issues.</p>
          <p>• After triggering, check the Dashboard for updated KPIs, Alerts page for new alerts, and Predictions page for revised forecasts.</p>
        </div>
      </div>
    </div>
  );
}
