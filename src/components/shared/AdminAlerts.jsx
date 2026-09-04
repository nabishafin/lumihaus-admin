import { AlertTriangle, CreditCard, PackageCheck } from "lucide-react";
export default function AdminAlerts() { return <div className="alerts"><span><CreditCard size={14}/><b>8</b> bKash verifications waiting</span><span><AlertTriangle size={14}/><b>14</b> low-stock German SKUs</span><span><PackageCheck size={14}/><b>12</b> orders ready to ship</span></div>; }
