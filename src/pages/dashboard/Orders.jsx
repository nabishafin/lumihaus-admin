import { useMemo, useState } from "react";
import { Download, Search, RefreshCw, ShoppingBag } from "lucide-react";
import toast from "react-hot-toast";
import OrderTable from "../../components/orders/OrderTable";
import OrderStatusModal from "../../components/orders/OrderStatusModal";
import { useAdminUI } from "../../context/AdminUIContext";
import {
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  useVerifyBkashPaymentMutation,
} from "../../redux/features/orderApi";

export default function Orders() {
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const { notify } = useAdminUI();

  // RTK Query hooks
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetOrdersQuery({
    status: filter === "All" ? undefined : filter,
    searchTerm: query.trim() || undefined,
  });

  const [updateStatusApi] = useUpdateOrderStatusMutation();
  const [verifyPaymentApi] = useVerifyBkashPaymentMutation();

  // Real API Orders
  const orders = useMemo(() => {
    if (!apiResponse) return [];

    const rawList =
      apiResponse?.data?.orders ||
      (Array.isArray(apiResponse?.data) ? apiResponse?.data : null) ||
      apiResponse?.orders ||
      [];

    return rawList.map((o) => ({
      id: o.orderNumber || o.id || o._id,
      _id: o._id || o.id,
      name: o.customer?.name || o.name || "Customer",
      phone: o.customer?.phone || o.phone || "N/A",
      area: o.shippingAddress?.city === "Dhaka" ? "Inside Dhaka" : o.area || "Outside Dhaka",
      address: o.shippingAddress?.street || o.shippingAddress?.address || o.address || "Delivery Address",
      sender: o.paymentDetails?.senderNumber || o.senderNumber || o.sender || "—",
      trx: o.paymentDetails?.transactionId || o.trxId || o.trx || "—",
      total: `৳${(o.totalAmount || o.total || 0).toLocaleString()}`,
      payment: o.paymentStatus || o.payment || "Pending",
      status: o.status || "Placed",
    }));
  }, [apiResponse]);

  // Filter and search
  const visible = useMemo(() => {
    return orders.filter((o) => {
      const matchFilter =
        filter === "All"
          ? true
          : filter === "bKash pending"
          ? o.payment === "Pending" || o.status === "bKash pending" || o.paymentStatus === "Pending"
          : o.status?.toLowerCase() === filter.toLowerCase();

      const q = query.toLowerCase();
      const matchQuery =
        !q ||
        `${o.id} ${o.name} ${o.phone} ${o.trx} ${o.sender}`
          .toLowerCase()
          .includes(q);

      return matchFilter && matchQuery;
    });
  }, [orders, query, filter]);

  // Pending count from backend statusCounts or parsed list
  const pendingCount =
    apiResponse?.statusCounts?.bkashPending ??
    apiResponse?.data?.statusCounts?.bkashPending ??
    orders.filter((o) => o.payment === "Pending" || o.status === "bKash pending").length;

  // Verify bKash Payment
  async function verify(id) {
    const orderObj = orders.find((o) => o.id === id);
    const targetId = orderObj?._id || id;
    const toastId = toast.loading(`Verifying bKash payment for ${id}...`);

    try {
      await verifyPaymentApi({ id: targetId, paymentStatus: "Verified" }).unwrap();
      toast.success(`${id} TrxID verified — order confirmed!`, { id: toastId });
    } catch (err) {
      toast.error(err?.data?.message || `Failed to verify payment for ${id}`, { id: toastId });
    }
    notify(`${id} TrxID verified — order confirmed`);
  }

  // Save Order Status / Courier / Note
  async function save(formData) {
    if (!selected) return;
    const status = formData.get("status");
    const courier = formData.get("courier");
    const tracking = formData.get("tracking");
    const note = formData.get("note") || `Status changed to ${status}`;

    const targetId = selected._id || selected.id;
    const toastId = toast.loading(`Updating ${selected.id} to ${status}...`);

    try {
      await updateStatusApi({
        id: targetId,
        status,
        courier,
        trackingNumber: tracking,
        note,
      }).unwrap();
      toast.success(`Order ${selected.id} updated to ${status}!`, { id: toastId });
    } catch (err) {
      toast.error(err?.data?.message || `Failed to update ${selected.id}`, { id: toastId });
    }

    setSelected(null);
    notify("Order pipeline updated successfully");
  }

  return (
    <>
      <title>LumiHaus Admin · Orders & bKash</title>
      <div className="page-heading">
        <div>
          <span className="page-kicker">CORE OPERATIONS</span>
          <h2>Orders & bKash verification</h2>
          <p>Verify customer payments and move orders through fulfillment.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="button secondary flex items-center gap-1.5"
            title="Refresh Orders"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
            <span>{isFetching ? "Syncing..." : "Sync Orders"}</span>
          </button>
          <button
            onClick={() => toast.success("Exporting orders to Excel (.xlsx)...")}
            className="button secondary"
          >
            <Download size={15} /> Export orders
          </button>
        </div>
      </div>

      <div className="status-tabs premium-tabs">
        {[
          "All",
          "bKash pending",
          "Placed",
          "Confirmed",
          "Processing",
          "Shipped",
          "Delivered",
          "Cancelled",
        ].map((x) => (
          <button
            onClick={() => setFilter(x)}
            className={filter === x ? "active" : ""}
            key={x}
          >
            {x}
            {x === "bKash pending" && pendingCount > 0 && (
              <b>{pendingCount}</b>
            )}
          </button>
        ))}
      </div>

      <section className="card">
        <div className="toolbar">
          <label className="table-search">
            <Search size={15} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search order #, customer, phone, or TrxID..."
            />
          </label>
          <span className="result-count">
            {isLoading || isFetching ? "Loading..." : `${visible.length} orders found`}
          </span>
        </div>

        <OrderTable
          orders={visible}
          isLoading={isLoading}
          onVerify={verify}
          onSelect={setSelected}
        />
      </section>

      <OrderStatusModal
        order={selected}
        onClose={() => setSelected(null)}
        onSave={save}
      />
    </>
  );
}
