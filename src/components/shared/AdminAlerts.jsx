import { AlertTriangle, CreditCard, PackageCheck } from "lucide-react";
import { useAdminUI } from "../../context/AdminUIContext";

export default function AdminAlerts() {
  const { storeSettings } = useAdminUI();

  return (
    <div className="alerts">
      <span>
        <CreditCard size={14} />
        <b>Active</b> bKash auto-verification ready
      </span>
      <span>
        <AlertTriangle size={14} />
        <b>Direct</b> German dm.de batch sync
      </span>
      <span>
        <PackageCheck size={14} />
        <b>Courier</b> Steadfast & Pathao integration
      </span>
    </div>
  );
}
