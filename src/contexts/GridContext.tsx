import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import {
  GridNode, Alert, PredictionResult, StreamStatus,
  generateGridNodes, generateAlert, generatePredictions,
  generateTimeSeriesData, generateHistoricalData, applySimulationEvent,
} from "@/lib/simulation";

interface AuthUser {
  email: string;
  name: string;
  role: "admin" | "engineer" | "analyst";
  organization: string;
}

interface GridContextType {
  // Auth
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<AuthUser>) => void;
  // Grid data
  nodes: GridNode[];
  alerts: Alert[];
  predictions: PredictionResult[];
  timeSeriesData: ReturnType<typeof generateTimeSeriesData>;
  historicalData: ReturnType<typeof generateHistoricalData>;
  streamStatus: StreamStatus;
  // Actions
  runPrediction: () => Promise<void>;
  acknowledgeAlert: (id: string) => void;
  escalateAlert: (id: string) => void;
  assignTechnician: (id: string, tech: string) => void;
  toggleStream: (type: keyof Omit<StreamStatus, "ingestionRate" | "totalRecords">) => void;
  startAllStreams: () => void;
  stopAllStreams: () => void;
  triggerEvent: (event: "storm" | "overload" | "sensor_malfunction") => void;
  isStreaming: boolean;
  isPredicting: boolean;
  gridHealthScore: number;
  darkMode: boolean;
  toggleDarkMode: () => void;
  activityLog: { timestamp: Date; action: string }[];
}

const GridContext = createContext<GridContextType | null>(null);

export function useGrid() {
  const ctx = useContext(GridContext);
  if (!ctx) throw new Error("useGrid must be inside GridProvider");
  return ctx;
}

export function GridProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem("grid_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [nodes, setNodes] = useState<GridNode[]>(() => generateGridNodes());
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [timeSeriesData] = useState(() => generateTimeSeriesData());
  const [historicalData] = useState(() => generateHistoricalData());
  const [streamStatus, setStreamStatus] = useState<StreamStatus>({
    scada: false, weather: false, satellite: false, acoustic: false,
    ingestionRate: 0, totalRecords: 0,
  });
  const [isPredicting, setIsPredicting] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [activityLog, setActivityLog] = useState<{ timestamp: Date; action: string }[]>([]);
  const intervalRef = useRef<number | null>(null);

  const logAction = useCallback((action: string) => {
    setActivityLog((prev) => [{ timestamp: new Date(), action }, ...prev].slice(0, 50));
  }, []);

  const isStreaming = streamStatus.scada || streamStatus.weather || streamStatus.satellite || streamStatus.acoustic;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Simulate streaming
  useEffect(() => {
    if (isStreaming) {
      intervalRef.current = window.setInterval(() => {
        // Update some node values
        setNodes((prev) =>
          prev.map((n) => ({
            ...n,
            voltage: n.voltage + (Math.random() - 0.5) * 5,
            load: Math.max(0, Math.min(100, n.load + (Math.random() - 0.5) * 3)),
            temperature: n.temperature + (Math.random() - 0.5) * 2,
            riskLevel: Math.max(0, Math.min(100, n.riskLevel + (Math.random() - 0.5) * 2)),
          }))
        );
        setStreamStatus((prev) => ({
          ...prev,
          ingestionRate: 1200 + Math.floor(Math.random() * 800),
          totalRecords: prev.totalRecords + Math.floor(Math.random() * 500),
        }));
        // Random alerts
        if (Math.random() > 0.7) {
          setNodes((prev) => {
            const alert = generateAlert(prev);
            setAlerts((a) => [alert, ...a].slice(0, 100));
            return prev;
          });
        }
      }, 2000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setStreamStatus((prev) => ({ ...prev, ingestionRate: 0 }));
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isStreaming]);

  const gridHealthScore = Math.round(
    100 - nodes.reduce((sum, n) => sum + n.riskLevel, 0) / nodes.length
  );

  const login = useCallback(async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 800));
    const u: AuthUser = { email, name: email.split("@")[0], role: "engineer", organization: "National Grid Corp" };
    setUser(u);
    localStorage.setItem("grid_user", JSON.stringify(u));
    logAction("User logged in");
    return true;
  }, [logAction]);

  const signup = useCallback(async (email: string, _password: string, name: string) => {
    await new Promise((r) => setTimeout(r, 800));
    const u: AuthUser = { email, name, role: "analyst", organization: "" };
    setUser(u);
    localStorage.setItem("grid_user", JSON.stringify(u));
    logAction("User signed up");
    return true;
  }, [logAction]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem("grid_user");
    logAction("User logged out");
  }, [logAction]);

  const updateProfile = useCallback((updates: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      localStorage.setItem("grid_user", JSON.stringify(updated));
      return updated;
    });
    logAction("Profile updated");
  }, [logAction]);

  const runPrediction = useCallback(async () => {
    setIsPredicting(true);
    logAction("ML prediction pipeline started");
    await new Promise((r) => setTimeout(r, 2500));
    setPredictions(generatePredictions(nodes));
    setIsPredicting(false);
    logAction("ML prediction pipeline completed");
  }, [nodes, logAction]);

  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
    logAction(`Alert ${id.slice(0, 10)} acknowledged`);
  }, [logAction]);

  const escalateAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, escalated: true } : a)));
    logAction(`Alert ${id.slice(0, 10)} escalated`);
  }, [logAction]);

  const assignTechnician = useCallback((id: string, tech: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, assignedTo: tech } : a)));
    logAction(`Technician ${tech} assigned to alert`);
  }, [logAction]);

  const toggleStream = useCallback((type: keyof Omit<StreamStatus, "ingestionRate" | "totalRecords">) => {
    setStreamStatus((prev) => ({ ...prev, [type]: !prev[type] }));
    logAction(`${type} stream toggled`);
  }, [logAction]);

  const startAllStreams = useCallback(() => {
    setStreamStatus((prev) => ({ ...prev, scada: true, weather: true, satellite: true, acoustic: true }));
    logAction("All streams started");
  }, [logAction]);

  const stopAllStreams = useCallback(() => {
    setStreamStatus((prev) => ({ ...prev, scada: false, weather: false, satellite: false, acoustic: false }));
    logAction("All streams stopped");
  }, [logAction]);

  const triggerEvent = useCallback((event: "storm" | "overload" | "sensor_malfunction") => {
    const result = applySimulationEvent(nodes, event);
    setNodes(result.nodes);
    setAlerts((prev) => [...result.alerts, ...prev].slice(0, 100));
    logAction(`Simulation event triggered: ${event}`);
  }, [nodes, logAction]);

  return (
    <GridContext.Provider
      value={{
        user, login, signup, logout, updateProfile,
        nodes, alerts, predictions, timeSeriesData, historicalData, streamStatus,
        runPrediction, acknowledgeAlert, escalateAlert, assignTechnician,
        toggleStream, startAllStreams, stopAllStreams, triggerEvent,
        isStreaming, isPredicting, gridHealthScore, darkMode,
        toggleDarkMode: () => setDarkMode((d) => !d),
        activityLog,
      }}
    >
      {children}
    </GridContext.Provider>
  );
}
