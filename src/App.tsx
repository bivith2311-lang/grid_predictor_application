import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GridProvider, useGrid } from "@/contexts/GridContext";
import AppLayout from "@/components/AppLayout";
import DashboardPage from "@/pages/DashboardPage";
import DataStreamsPage from "@/pages/DataStreamsPage";
import PredictionsPage from "@/pages/PredictionsPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import AlertsPage from "@/pages/AlertsPage";
import SettingsPage from "@/pages/SettingsPage";
import ProfilePage from "@/pages/ProfilePage";
import GridMapPage from "@/pages/GridMapPage";
import SimulationPage from "@/pages/SimulationPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useGrid();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route element={<AuthGuard><AppLayout /></AuthGuard>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/data-streams" element={<DataStreamsPage />} />
        <Route path="/predictions" element={<PredictionsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/grid-map" element={<GridMapPage />} />
        <Route path="/simulation" element={<SimulationPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <GridProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </GridProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
