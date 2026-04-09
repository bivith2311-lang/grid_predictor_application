import { useGrid } from "@/contexts/GridContext";
import { useState } from "react";
import { Zap, MapPin } from "lucide-react";

export default function GridMapPage() {
  const { nodes } = useGrid();
  const [selected, setSelected] = useState<string | null>(null);
  const selectedNode = nodes.find((n) => n.id === selected);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Grid Visualization</h1>
        <p className="text-sm text-muted-foreground">Interactive national grid map</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Map Area */}
        <div className="lg:col-span-2 control-panel">
          <div className="control-panel-header">
            <h2 className="text-sm font-semibold">National Grid Map</h2>
          </div>
          <div className="p-4 relative" style={{ minHeight: 400 }}>
            {/* Simplified SVG map representation */}
            <svg viewBox="0 0 800 500" className="w-full h-full">
              {/* US outline simplified */}
              <rect x="50" y="50" width="700" height="400" rx="20" fill="none" stroke="hsl(var(--border))" strokeWidth="1" />
              {/* Grid lines */}
              {[150, 250, 350, 450, 550, 650].map((x) => (
                <line key={`v${x}`} x1={x} y1="50" x2={x} y2="450" stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="4" />
              ))}
              {[150, 250, 350].map((y) => (
                <line key={`h${y}`} x1="50" y1={y} x2="750" y2={y} stroke="hsl(var(--border))" strokeWidth="0.5" strokeDasharray="4" />
              ))}
              {/* Nodes */}
              {nodes.map((node) => {
                const x = 80 + ((node.lng + 120) / 55) * 640;
                const y = 70 + ((49 - node.lat) / 24) * 360;
                const color = node.riskLevel > 70 ? "hsl(var(--destructive))" : node.riskLevel > 40 ? "hsl(var(--warning))" : "hsl(var(--success))";
                const isSelected = selected === node.id;
                return (
                  <g key={node.id} onClick={() => setSelected(node.id)} className="cursor-pointer">
                    {isSelected && <circle cx={x} cy={y} r="18" fill="none" stroke={color} strokeWidth="2" opacity="0.3" />}
                    <circle cx={x} cy={y} r={isSelected ? 10 : 7} fill={color} opacity={isSelected ? 1 : 0.8} />
                    <circle cx={x} cy={y} r="3" fill="hsl(var(--card))" />
                    {node.riskLevel > 70 && (
                      <circle cx={x} cy={y} r="12" fill="none" stroke={color} strokeWidth="1" opacity="0.5">
                        <animate attributeName="r" from="10" to="20" dur="2s" repeatCount="indefinite" />
                        <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
                      </circle>
                    )}
                  </g>
                );
              })}
            </svg>
            {/* Legend */}
            <div className="absolute bottom-4 left-4 flex items-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-success" /> Low Risk</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-warning" /> Medium</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-destructive" /> Critical</span>
            </div>
          </div>
        </div>

        {/* Node Detail */}
        <div className="control-panel">
          <div className="control-panel-header">
            <h2 className="text-sm font-semibold">Node Details</h2>
          </div>
          {selectedNode ? (
            <div className="p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Zap className={`h-5 w-5 ${selectedNode.riskLevel > 70 ? "text-destructive" : selectedNode.riskLevel > 40 ? "text-warning" : "text-success"}`} />
                <div>
                  <p className="text-sm font-semibold">{selectedNode.name}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{selectedNode.type.replace("_", " ")}</p>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                {([
                  ["Status", selectedNode.status],
                  ["Region", selectedNode.region],
                  ["Risk Level", `${selectedNode.riskLevel}%`],
                  ["Voltage", `${selectedNode.voltage.toFixed(1)} kV`],
                  ["Load", `${selectedNode.load.toFixed(1)}%`],
                  ["Temperature", `${selectedNode.temperature.toFixed(1)}°C`],
                  ["Last Maintenance", selectedNode.lastMaintenance],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-mono font-medium">{value}</span>
                  </div>
                ))}
              </div>
              {selectedNode.predictedFailure && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <p className="text-[10px] text-destructive font-bold uppercase">Predicted Failure</p>
                  <p className="text-xs font-mono mt-1">{new Date(selectedNode.predictedFailure).toLocaleString()}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center">
              <MapPin className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Click a node on the map to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
