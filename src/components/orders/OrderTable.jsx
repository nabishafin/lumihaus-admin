import { CheckCircle2, Eye, Printer, ShoppingBag } from "lucide-react";

export default function OrderTable({ orders = [], isLoading, onVerify, onSelect }) {
  if (isLoading) {
    return (
      <div className="py-16 text-center text-gray-500 dark:text-zinc-400">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#d96b86] border-r-transparent mb-3" />
        <p className="text-xs font-semibold">Loading orders from database...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl my-4">
        <ShoppingBag size={36} className="mx-auto text-gray-400 dark:text-zinc-500 mb-2 opacity-60" />
        <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-200">No orders found</h4>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
          When customers place orders from the store, they will appear here in real-time.
        </p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table className="orders-table">
        <thead>
          <tr>
            <th>Order & customer</th>
            <th>Delivery</th>
            <th>bKash sender</th>
            <th>Transaction ID</th>
            <th>Total</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id || order._id}>
              <td>
                <b>{order.id}</b>
                <div>{order.name}</div>
                <small>{order.phone}</small>
              </td>
              <td>
                <b>{order.area}</b>
                <small>{order.address}</small>
              </td>
              <td>
                <span className="sensitive-value">{order.sender}</span>
              </td>
              <td>
                <span className="trx-code">{order.trx}</span>
              </td>
              <td>
                <b>{order.total}</b>
              </td>
              <td>
                <span className={`badge status-${(order.status || "placed").toLowerCase().replace(/\s+/g, "-")}`}>
                  {order.status}
                </span>
                <small>{order.payment} payment</small>
              </td>
              <td>
                <div className="row-actions">
                  {order.payment === "Pending" ? (
                    <button
                      className="verify-button cursor-pointer"
                      onClick={() => onVerify(order.id)}
                    >
                      <CheckCircle2 size={14} />
                      Verify & confirm
                    </button>
                  ) : (
                    <button
                      className="icon-action cursor-pointer"
                      onClick={() => onSelect(order)}
                      title="Order details"
                    >
                      <Eye size={15} />
                    </button>
                  )}
                  <button
                    className="icon-action cursor-pointer"
                    onClick={() => window.print()}
                    title="Print invoice"
                  >
                    <Printer size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
