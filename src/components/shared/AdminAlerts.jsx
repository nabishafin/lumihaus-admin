import { CreditCard, PackageCheck, ShieldCheck } from "lucide-react";

// These are plain descriptions of how the store operates. Do not restore the
// previous "auto-verification ready" / "courier integration" wording: bKash
// payments are verified by hand and no courier API is connected.
export default function AdminAlerts() {
  return (
    <div className="alerts">
      <span>
        <CreditCard size={14} />
        <b>Manual</b> bKash TrxID verification
      </span>
      <span>
        <ShieldCheck size={14} />
        <b>Sourced</b> German dm.de &amp; Rossmann imports
      </span>
      <span>
        <PackageCheck size={14} />
        <b>Courier</b> handover tracked manually
      </span>
    </div>
  );
}
