import { useState, useRef } from "react";
import { useGrid } from "@/contexts/GridContext";
import { Radio, Upload, Cloud, Satellite, Play, Square, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

function StreamButton({ label, icon: Icon, active, onToggle }: {
  label: string; icon: React.ElementType; active: boolean; onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border transition-all w-full text-left ${
        active
          ? "border-primary/50 bg-primary/10 animate-pulse-glow"
          : "border-border bg-card hover:border-primary/30"
      }`}
    >
      <Icon className={`h-5 w-5 ${active ? "text-primary" : "text-muted-foreground"}`} />
      <div className="flex-1">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-[10px] text-muted-foreground">{active ? "Connected · Streaming" : "Disconnected"}</p>
      </div>
      <span className={`status-dot ${active ? "status-dot-ok" : "bg-muted-foreground/30"}`} />
    </button>
  );
}

export default function DataStreamsPage() {
  const { streamStatus, toggleStream, startAllStreams, stopAllStreams, isStreaming } = useGrid();
  const [uploading, setUploading] = useState(false);
  const [fetchingWeather, setFetchingWeather] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async () => {
    setUploading(true);
    await new Promise((r) => setTimeout(r, 2000));
    setUploading(false);
    toast.success("Historical data uploaded successfully", { description: "2,847 records ingested from CSV" });
  };

  const handleFetchWeather = async () => {
    setFetchingWeather(true);
    await new Promise((r) => setTimeout(r, 1500));
    setFetchingWeather(false);
    toast.success("Weather data fetched", { description: "NOAA API: 156 data points for 48 regions" });
  };

  const handleSimulateSatellite = () => {
    toggleStream("satellite");
    toast.info("Satellite feed simulation " + (streamStatus.satellite ? "stopped" : "started"));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Data Streams</h1>
        <p className="text-sm text-muted-foreground">Manage data ingestion pipelines</p>
      </div>

      {/* Stream Controls */}
      <div className="grid sm:grid-cols-2 gap-3">
        <StreamButton label="SCADA Stream" icon={Radio} active={streamStatus.scada} onToggle={() => toggleStream("scada")} />
        <StreamButton label="Weather API" icon={Cloud} active={streamStatus.weather} onToggle={() => toggleStream("weather")} />
        <StreamButton label="Satellite Feed" icon={Satellite} active={streamStatus.satellite} onToggle={handleSimulateSatellite} />
        <StreamButton label="Acoustic Sensors" icon={Radio} active={streamStatus.acoustic} onToggle={() => toggleStream("acoustic")} />
      </div>

      {/* Master Controls */}
      <div className="flex gap-3">
        <button
          onClick={startAllStreams}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Play className="h-4 w-4" /> Start Streaming
        </button>
        <button
          onClick={stopAllStreams}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors"
        >
          <Square className="h-4 w-4" /> Stop Streaming
        </button>
      </div>

      {/* Data Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="control-panel">
          <div className="control-panel-header">
            <h3 className="text-sm font-semibold">Upload Historical Data</h3>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-xs text-muted-foreground">Upload CSV or JSON files with historical failure records.</p>
            <input type="file" ref={fileRef} accept=".csv,.json" className="hidden" onChange={handleUpload} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted text-sm w-full justify-center transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? "Uploading..." : "Upload CSV/JSON"}
            </button>
          </div>
        </div>

        <div className="control-panel">
          <div className="control-panel-header">
            <h3 className="text-sm font-semibold">Weather Data</h3>
          </div>
          <div className="p-4 space-y-3">
            <p className="text-xs text-muted-foreground">Fetch latest weather data from NOAA API.</p>
            <button
              onClick={handleFetchWeather}
              disabled={fetchingWeather}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted text-sm w-full justify-center transition-colors disabled:opacity-50"
            >
              {fetchingWeather ? <Loader2 className="h-4 w-4 animate-spin" /> : <Cloud className="h-4 w-4" />}
              {fetchingWeather ? "Fetching..." : "Fetch Weather Data"}
            </button>
          </div>
        </div>

        <div className="control-panel">
          <div className="control-panel-header">
            <h3 className="text-sm font-semibold">Ingestion Stats</h3>
          </div>
          <div className="p-4 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Ingestion Rate</span>
              <span className="font-mono font-bold text-primary">{streamStatus.ingestionRate}/s</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Total Records</span>
              <span className="font-mono font-bold">{streamStatus.totalRecords.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Active Streams</span>
              <span className="font-mono font-bold">
                {[streamStatus.scada, streamStatus.weather, streamStatus.satellite, streamStatus.acoustic].filter(Boolean).length}/4
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
