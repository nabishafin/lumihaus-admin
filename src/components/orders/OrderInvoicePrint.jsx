// Renders one order as a printable invoice. Hidden on screen; only shown
// inside @media print (see .invoice-print-sheet in styles.css), which also
// hides everything else so only this order's invoice ends up on paper.
export default function OrderInvoicePrint({ order }) {
  if (!order) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleString("en-GB", {
        timeZone: "Asia/Dhaka",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const orderNumber = order.orderNumber || order.id || order._id || "—";
  const customerName = order.customer?.name || order.name || "Customer";
  const customerPhone = order.customer?.phone || order.phone || "—";
  const customerEmail = order.customer?.email || order.email || "";
  const deliveryAddress =
    order.customer?.deliveryAddress ||
    order.shippingAddress?.street ||
    order.address ||
    "—";
  const zone =
    [order.customer?.zone, order.customer?.district, order.customer?.postalCode]
      .filter(Boolean)
      .join(", ") || order.area || "";

  const paymentMethod =
    order.paymentMethod || (order.bkashTrxId ? "bKash (Manual)" : "Cash on Delivery");
  const senderNumber =
    order.sender && order.sender !== "—"
      ? order.sender
      : order.paymentDetails?.senderNumber || order.bkashSenderNumber || order.senderNumber || "";
  const trxId =
    order.trx && order.trx !== "—"
      ? order.trx
      : order.paymentDetails?.transactionId || order.bkashTrxId || order.trxId || "";

  const items = Array.isArray(order.items) ? order.items : [];
  const deliveryFee = order.deliveryCharge ?? order.raw?.deliveryCharge ?? 0;
  const totalAmount =
    typeof order.totalNumber === "number"
      ? order.totalNumber
      : typeof order.total === "number"
      ? order.total
      : order.totalAmount || 0;

  return (
    <div className="invoice-print-sheet">
      <div className="invoice-print-header">
        <h1>LumiHaus</h1>
        <div className="invoice-print-meta">
          <div>
            <strong>Invoice / Order #{orderNumber}</strong>
            <div>Placed on {formatDate(order.createdAt)} (BST)</div>
          </div>
          <div>
            <div>Status: {order.status || "Placed"}</div>
            {(order.deliveryPartner?.provider || order.courier) && (
              <div>
                Courier: {order.deliveryPartner?.provider || order.courier}
                {(order.deliveryPartner?.trackingNumber || order.trackingNumber) &&
                  ` (${order.deliveryPartner?.trackingNumber || order.trackingNumber})`}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="invoice-print-parties">
        <div>
          <h3>Customer</h3>
          <div>{customerName}</div>
          <div>{customerPhone}</div>
          {customerEmail && <div>{customerEmail}</div>}
        </div>
        <div>
          <h3>Delivery Address</h3>
          <div>{deliveryAddress}</div>
          {zone && <div>{zone}</div>}
        </div>
        <div>
          <h3>Payment</h3>
          <div>{paymentMethod}</div>
          <div>Status: {order.paymentStatus || order.payment || "Pending"}</div>
          {senderNumber && <div>Sender: {senderNumber}</div>}
          {trxId && <div>TrxID: {trxId}</div>}
        </div>
      </div>

      {items.length > 0 && (
        <table className="invoice-print-items">
          <thead>
            <tr>
              <th>Item</th>
              <th>Variant</th>
              <th>Qty</th>
              <th>Unit Price</th>
              <th>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => {
              const itemName = item.name || item.product?.name || "Purchased Product";
              const itemPrice = item.price ?? 0;
              const itemQty = item.quantity || 1;
              const variant = [item.selectedSize, item.selectedShade].filter(Boolean).join(" / ");
              return (
                <tr key={item._id || idx}>
                  <td>{itemName}</td>
                  <td>{variant || "—"}</td>
                  <td>{itemQty}</td>
                  <td>৳{itemPrice.toLocaleString()}</td>
                  <td>৳{(itemPrice * itemQty).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      <div className="invoice-print-totals">
        <div>
          <span>Delivery Fee</span>
          <span>৳{Number(deliveryFee).toLocaleString()}</span>
        </div>
        <div className="invoice-print-grand-total">
          <span>Total</span>
          <span>৳{Number(totalAmount).toLocaleString()}</span>
        </div>
      </div>

      <div className="invoice-print-footer">
        Thank you for shopping with LumiHaus — 100% authentic German imports.
      </div>
    </div>
  );
}
