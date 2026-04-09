// Simulation engine for the Power Grid platform

export interface GridNode {
  id: string;
  name: string;
  type: "transformer" | "substation" | "transmission_line" | "generator";
  lat: number;
  lng: number;
  riskLevel: number; // 0-100
  status: "operational" | "warning" | "critical" | "offline";
  voltage: number;
  load: number;
  temperature: number;
  lastMaintenance: string;
  predictedFailure: string | null;
  region: string;
}

export interface Alert {
  id: string;
  timestamp: Date;
  severity: "low" | "medium" | "critical";
  message: string;
  nodeId: string;
  nodeName: string;
  acknowledged: boolean;
  escalated: boolean;
  assignedTo: string | null;
}

export interface PredictionResult {
  nodeId: string;
  nodeName: string;
  failureProbability: number;
  timeToFailure: number; // hours
  confidence: number;
  topFeatures: { name: string; importance: number }[];
  recommendations: string[];
}

export interface StreamStatus {
  scada: boolean;
  weather: boolean;
  satellite: boolean;
  acoustic: boolean;
  ingestionRate: number;
  totalRecords: number;
}

const REGIONS = ["Northeast", "Southeast", "Midwest", "Southwest", "Northwest", "Central"];
const NODE_NAMES = [
  "Alpha Station", "Beta Hub", "Gamma Relay", "Delta Junction", "Epsilon Grid",
  "Zeta Transformer", "Eta Substation", "Theta Line", "Iota Plant", "Kappa Node",
  "Lambda Switch", "Mu Relay", "Nu Station", "Xi Hub", "Omicron Grid",
  "Pi Junction", "Rho Transformer", "Sigma Line", "Tau Plant", "Upsilon Node",
];

export function generateGridNodes(count = 20): GridNode[] {
  return Array.from({ length: count }, (_, i) => {
    const risk = Math.random() * 100;
    return {
      id: `node-${i}`,
      name: NODE_NAMES[i % NODE_NAMES.length],
      type: (["transformer", "substation", "transmission_line", "generator"] as const)[i % 4],
      lat: 25 + Math.random() * 24,
      lng: -120 + Math.random() * 55,
      riskLevel: Math.round(risk),
      status: risk > 80 ? "critical" : risk > 50 ? "warning" : "operational",
      voltage: 110 + Math.random() * 390,
      load: 20 + Math.random() * 80,
      temperature: 30 + Math.random() * 60,
      lastMaintenance: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString().split("T")[0],
      predictedFailure: risk > 60 ? new Date(Date.now() + Math.random() * 72 * 3600000).toISOString() : null,
      region: REGIONS[i % REGIONS.length],
    };
  });
}

export function generateAlert(nodes: GridNode[]): Alert {
  const severities: Alert["severity"][] = ["low", "medium", "critical"];
  const sev = severities[Math.floor(Math.random() * 3)];
  const node = nodes[Math.floor(Math.random() * nodes.length)];
  const messages: Record<Alert["severity"], string[]> = {
    low: ["Minor voltage fluctuation detected", "Scheduled maintenance reminder", "Sensor calibration needed"],
    medium: ["Unusual load pattern detected", "Temperature exceeding threshold", "Partial sensor failure"],
    critical: ["Imminent transformer overload", "Transmission line fault detected", "Critical temperature exceeded"],
  };
  return {
    id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date(),
    severity: sev,
    message: messages[sev][Math.floor(Math.random() * 3)],
    nodeId: node.id,
    nodeName: node.name,
    acknowledged: false,
    escalated: false,
    assignedTo: null,
  };
}

export function generatePredictions(nodes: GridNode[]): PredictionResult[] {
  return nodes
    .filter((n) => n.riskLevel > 30)
    .slice(0, 8)
    .map((node) => ({
      nodeId: node.id,
      nodeName: node.name,
      failureProbability: Math.min(0.95, node.riskLevel / 100 + Math.random() * 0.1),
      timeToFailure: Math.round(12 + Math.random() * 108),
      confidence: 0.7 + Math.random() * 0.25,
      topFeatures: [
        { name: "Temperature Trend", importance: 0.3 + Math.random() * 0.2 },
        { name: "Load Variance", importance: 0.2 + Math.random() * 0.15 },
        { name: "Age Factor", importance: 0.1 + Math.random() * 0.15 },
        { name: "Weather Correlation", importance: 0.05 + Math.random() * 0.1 },
        { name: "Historical Failures", importance: 0.05 + Math.random() * 0.1 },
      ].sort((a, b) => b.importance - a.importance),
      recommendations: [
        "Schedule preventive maintenance within 48 hours",
        "Reduce load to 70% capacity",
        "Deploy mobile monitoring unit",
        "Update firmware on SCADA controllers",
      ].slice(0, 2 + Math.floor(Math.random() * 2)),
    }));
}

export function generateTimeSeriesData(hours = 72) {
  const data = [];
  const now = Date.now();
  for (let i = 0; i < hours; i++) {
    data.push({
      time: new Date(now + i * 3600000).toISOString(),
      hour: i,
      label: `+${i}h`,
      riskScore: Math.min(100, Math.max(0, 30 + Math.sin(i / 8) * 20 + Math.random() * 15 + (i > 48 ? 15 : 0))),
      temperature: 45 + Math.sin(i / 12) * 15 + Math.random() * 5,
      load: 50 + Math.cos(i / 6) * 20 + Math.random() * 10,
      voltage: 220 + Math.sin(i / 10) * 30 + Math.random() * 10,
    });
  }
  return data;
}

export function generateHistoricalData(days = 90) {
  const data = [];
  const now = Date.now();
  for (let i = days; i >= 0; i--) {
    data.push({
      date: new Date(now - i * 86400000).toISOString().split("T")[0],
      failures: Math.floor(Math.random() * 5),
      predictions: Math.floor(2 + Math.random() * 8),
      accuracy: 0.75 + Math.random() * 0.2,
      avgRisk: 30 + Math.random() * 40,
    });
  }
  return data;
}

export function applySimulationEvent(
  nodes: GridNode[],
  event: "storm" | "overload" | "sensor_malfunction"
): { nodes: GridNode[]; alerts: Alert[] } {
  const alerts: Alert[] = [];
  const affected = Math.floor(nodes.length * (event === "storm" ? 0.4 : event === "overload" ? 0.3 : 0.2));
  const indices = new Set<number>();
  while (indices.size < affected) indices.add(Math.floor(Math.random() * nodes.length));

  const updated = nodes.map((node, i) => {
    if (!indices.has(i)) return node;
    const newRisk = Math.min(100, node.riskLevel + 20 + Math.random() * 30);
    const newNode = {
      ...node,
      riskLevel: Math.round(newRisk),
      status: (newRisk > 80 ? "critical" : newRisk > 50 ? "warning" : "operational") as GridNode["status"],
      temperature: event === "overload" ? node.temperature + 20 : node.temperature,
      load: event === "overload" ? Math.min(100, node.load + 30) : node.load,
    };
    alerts.push({
      id: `alert-sim-${Date.now()}-${i}`,
      timestamp: new Date(),
      severity: newRisk > 80 ? "critical" : "medium",
      message:
        event === "storm"
          ? `Storm surge impact on ${node.name}`
          : event === "overload"
          ? `Overload condition at ${node.name}`
          : `Sensor malfunction at ${node.name}`,
      nodeId: node.id,
      nodeName: node.name,
      acknowledged: false,
      escalated: false,
      assignedTo: null,
    });
    return newNode;
  });
  return { nodes: updated, alerts };
}
