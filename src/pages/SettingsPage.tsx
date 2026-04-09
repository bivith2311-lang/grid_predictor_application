import { useState } from "react";
import { toast } from "sonner";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    retrainSchedule: "weekly",
    riskThreshold: 70,
    alertThreshold: 50,
    notifyEmail: true,
    notifySms: false,
    notifySlack: true,
    apiEndpoint: "https://api.powergrid.gov/v2",
    modelVersion: "LSTM-v3.2.1",
  });

  const handleSave = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Platform configuration and preferences</p>
      </div>

      {/* API Configuration */}
      <div className="control-panel">
        <div className="control-panel-header"><h2 className="text-sm font-semibold">API Configuration</h2></div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">API Endpoint</label>
            <input
              value={settings.apiEndpoint}
              onChange={(e) => setSettings((s) => ({ ...s, apiEndpoint: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Model Version</label>
            <input
              value={settings.modelVersion}
              onChange={(e) => setSettings((s) => ({ ...s, modelVersion: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono"
            />
          </div>
        </div>
      </div>

      {/* Model Retraining */}
      <div className="control-panel">
        <div className="control-panel-header"><h2 className="text-sm font-semibold">Model Retraining</h2></div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Retrain Schedule</label>
            <select
              value={settings.retrainSchedule}
              onChange={(e) => setSettings((s) => ({ ...s, retrainSchedule: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Threshold Tuning */}
      <div className="control-panel">
        <div className="control-panel-header"><h2 className="text-sm font-semibold">Threshold Tuning</h2></div>
        <div className="p-4 space-y-4">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Risk Alert Threshold: {settings.riskThreshold}%</label>
            <input
              type="range"
              min={0}
              max={100}
              value={settings.riskThreshold}
              onChange={(e) => setSettings((s) => ({ ...s, riskThreshold: Number(e.target.value) }))}
              className="w-full accent-primary"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Alert Trigger Threshold: {settings.alertThreshold}%</label>
            <input
              type="range"
              min={0}
              max={100}
              value={settings.alertThreshold}
              onChange={(e) => setSettings((s) => ({ ...s, alertThreshold: Number(e.target.value) }))}
              className="w-full accent-primary"
            />
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="control-panel">
        <div className="control-panel-header"><h2 className="text-sm font-semibold">Notifications</h2></div>
        <div className="p-4 space-y-3">
          {(["notifyEmail", "notifySms", "notifySlack"] as const).map((key) => (
            <label key={key} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings[key]}
                onChange={(e) => setSettings((s) => ({ ...s, [key]: e.target.checked }))}
                className="w-4 h-4 rounded border-border accent-primary"
              />
              <span className="text-sm capitalize">{key.replace("notify", "")} Notifications</span>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Save Settings
      </button>
    </div>
  );
}
