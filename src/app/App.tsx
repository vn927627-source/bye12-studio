import { useState } from "react";
import { StoreProvider } from "../lib/store";
import { Sidebar } from "../components/Sidebar";
import { Dashboard } from "../pages/Dashboard";
import { Customers } from "../pages/Customers";
import { Orders } from "../pages/Orders";
import { Warehouse } from "../pages/Warehouse";
import { Revenue } from "../pages/Revenue";
import { Schedule } from "../pages/Schedule";
import { NotesPage } from "../pages/Notes";
import { SettingsPage } from "../pages/Settings";
import { Check } from "../pages/check";

export type Screen =
  | "dashboard"
  | "customers"
  | "orders"
  | "warehouse"
  | "revenue"
  | "calendar"
  | "notes"
  | "settings"
  | "check";

function Shell() {
  const [screen, setScreen] = useState<Screen>("dashboard");

  const screenComponents: Record<Screen, React.ReactNode> = {
    dashboard: <Dashboard onNav={setScreen} />,
    customers: <Customers />,
    orders: <Orders />,
    warehouse: <Warehouse />,
    revenue: <Revenue />,
    calendar: <Schedule />,
    notes: <NotesPage />,
    settings: <SettingsPage />,
    check: <Check />,
  };

  return (
    <div
      className="flex h-screen w-screen overflow-hidden bg-background text-foreground"
      style={{ fontFamily: "Inter, system-ui, sans-serif" }}
    >
      <Sidebar screen={screen} onNav={setScreen} />
      <main className="flex-1 overflow-hidden">{screenComponents[screen]}</main>
      {/* 🦆 Linh vật vịt */}
      <div
        className="fixed bottom-4 left-4 text-5xl select-none animate-bounce-slow opacity-80 hover:opacity-100 transition-opacity z-50"
        style={{ filter: "drop-shadow(0 4px 8px rgba(217,70,168,0.3))" }}
      >
        🦆
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
