import { Outlet } from "react-router";
import Sidebar from "../components/shared/Sidebar";
import Header from "../components/shared/Header";
import AdminAlerts from "../components/shared/AdminAlerts";

export default function DashboardLayout() {
  return <div className="app-shell"><Sidebar/><div className="app-main"><Header/><AdminAlerts/><main className="page"><Outlet/></main></div></div>;
}
