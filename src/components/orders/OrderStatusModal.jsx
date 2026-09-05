import { X, Truck, FileText, CheckCircle2 } from "lucide-react";

export default function OrderStatusModal({ order, onClose, onSave }) {
  if (!order) return null;

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <form
        className="modal order-modal"
        onSubmit={(e) => {
          e.preventDefault();
          onSave?.(new FormData(e.currentTarget));
        }}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="section-head">
          <div>
            <span className="page-kicker">ORDER FULFILLMENT & PIPELINE</span>
            <h2>{order.id} · {order.name}</h2>
          </div>
          <button type="button" className="icon-action cursor-pointer" onClick={onClose}>
            <X size={17} />
          </button>
        </div>

        {/* Status Pipeline Tracker */}
        <div className="pipeline">
          {["Placed", "Confirmed", "Processing", "Shipped", "Delivered"].map((x, i) => (
            <div className={x === order.status ? "current" : ""} key={x}>
              <i>{i + 1}</i>
              <span>{x}</span>
            </div>
          ))}
        </div>

        <div className="form-grid">
          <label>
            Status
            <select name="status" defaultValue={order.status}>
              <option value="Placed">Placed</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </label>

          <label>
            Courier Partner
            <select name="courier" defaultValue={order.courier || "Steadfast"}>
              <option value="Steadfast">Steadfast Courier</option>
              <option value="Pathao">Pathao Courier</option>
              <option value="RedX">RedX Delivery</option>
              <option value="Paperfly">Paperfly</option>
              <option value="Self Pickup">Self Pickup / Office</option>
            </select>
          </label>

          <label className="full">
            Consignment / Tracking Number
            <input
              name="tracking"
              defaultValue={order.trackingNumber || ""}
              placeholder="e.g. STF-8291046 or PTH-92841"
            />
          </label>

          <label className="full">
            Admin Note / Status Remark
            <input
              name="note"
              defaultValue={order.note || ""}
              placeholder="e.g. Handed over to Steadfast courier / Parcel packed"
            />
          </label>
        </div>

        <div className="modal-actions">
          <button type="button" className="button secondary cursor-pointer" onClick={() => window.print()}>
            Print packing slip
          </button>
          <button type="submit" className="button cursor-pointer">
            Update order pipeline
          </button>
        </div>
      </form>
    </div>
  );
}
