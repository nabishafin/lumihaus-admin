import { Outlet } from "react-router";
import Sidebar from "../components/shared/Sidebar";
import Header from "../components/shared/Header";
import AdminAlerts from "../components/shared/AdminAlerts";
import { AdminUIProvider, useAdminUI } from "../context/AdminUIContext";

export default function DashboardLayout() {
  return <AdminUIProvider><DashboardShell/></AdminUIProvider>;
}

function DashboardShell() {
  const { collapsed } = useAdminUI();
  return <div className={`app-shell ${collapsed ? "sidebar-collapsed" : ""}`}><Sidebar/><div className="app-main"><Header/><AdminAlerts/><main className="page"><Outlet/></main></div></div>;
}
