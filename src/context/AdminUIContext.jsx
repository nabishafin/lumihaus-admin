import { createContext, useContext, useEffect, useState } from "react";

const AdminUIContext = createContext(null);

export function AdminUIProvider({ children }) {
  const [dark, setDark] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("lumihaus-theme");
    const enabled = saved ? saved === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(enabled);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("lumihaus-theme", dark ? "dark" : "light");
  }, [dark]);

  function notify(message, tone = "success") {
    setToast({ message, tone });
    window.setTimeout(() => setToast(null), 2800);
  }

  return <AdminUIContext.Provider value={{ dark, setDark, collapsed, setCollapsed, notify }}>
    {children}
    {toast && <div className={`toast ${toast.tone}`}>{toast.message}</div>}
  </AdminUIContext.Provider>;
}

export function useAdminUI() {
  const value = useContext(AdminUIContext);
  if (!value) throw new Error("useAdminUI must be used inside AdminUIProvider");
  return value;
}
