import { useState, useEffect, useMemo } from "react";
import { Download, Search, RefreshCw, AlertTriangle, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import OrderTable from "../../components/orders/OrderTable";
import OrderStatusModal from "../../components/orders/OrderStatusModal";
import ManualBkashVerifyModal from "../../components/orders/ManualBkashVerifyModal";
import { useAdminUI } from "../../context/AdminUIContext";
import {
  useGetOrdersQuery,
  useUpdateOrderStatusMutation,
  useVerifyBkashPaymentMutation,
} from "../../redux/features/orderApi";

const TABS = [
  { label: "All", value: "All" },
  { label: "Placed", value: "Placed", countKey: "Placed" },
  { label: "bKash pending", value: "bKash pending", countKey: "bkashPending" },
  { label: "Confirmed", value: "Confirmed", countKey: "Confirmed" },
  {
    label: "In Delivery",
    value: "In Delivery",
    countKey: "In Delivery",
  },
  { label: "Delivered", value: "Delivered", countKey: "Delivered" },
  { label: "Cancelled", value: "Cancelled", countKey: "Cancelled" },
];

export default function Orders() {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { notify } = useAdminUI();

  // Debounce search input by 350 ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // RTK Query: fetch paginated, filtered orders from backend
  const {
    data: apiResponse,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetOrdersQuery({
    status: filter === "All" ? undefined : filter,
    searchTerm: debouncedSearch || undefined,
    page,
    limit,
  });

  const [updateStatusApi, { isLoading: isSavingStatus }] = useUpdateOrderStatusMutation();
  const [verifyPaymentApi, { isLoading: isSavingPayment }] = useVerifyBkashPaymentMutation();

  // Extract orders list directly from response.data ARRAY per contract
  const rawOrders = useMemo(() => {
    if (!apiResponse) return [];
    if (Array.isArray(apiResponse?.data)) return apiResponse.data;
    if (Array.isArray(apiResponse?.data?.orders)) return apiResponse.data.orders;
    if (Array.isArray(apiResponse?.orders)) return apiResponse.orders;
    if (Array.isArray(apiResponse)) return apiResponse;
    return [];
  }, [apiResponse]);

  const statusCounts = apiResponse?.statusCounts || {};

  const pagination = apiResponse?.pagination || {
    page: 1,
    limit: 20,
    total: rawOrders.length,
    pages: 1,
  };

  // Map raw orders to table format — do NOT apply client-side filtering (backend handles it)
  const orders = useMemo(() => {
    return rawOrders.map((o) => ({
      id: o.orderNumber || o.id || o._id,
      _id: o._id || o.id,
      createdAt: o.createdAt,
      name: o.customer?.name || o.name || "Customer",
      phone: o.customer?.phone || o.phone || "N/A",
      email: o.customer?.email || o.email || "",
      area:
        o.shippingAddress?.city === "Dhaka" || o.customer?.district === "Dhaka"
          ? "Inside Dhaka"
          : o.area || "Outside Dhaka",
      address:
        o.customer?.deliveryAddress ||
        o.shippingAddress?.street ||
        o.shippingAddress?.address ||
        o.address ||
        "Delivery Address",
      sender:
        o.paymentDetails?.senderNumber ||
        o.bkashSenderNumber ||
        o.senderNumber ||
        o.sender ||
        "—",
      trx:
        o.paymentDetails?.transactionId ||
        o.bkashTrxId ||
        o.trxId ||
        o.trx ||
        "—",
      total: `৳${(o.total || o.totalAmount || 0).toLocaleString()}`,
      totalNumber: o.total || o.totalAmount || 0,
      payment: o.paymentStatus || o.payment || "Pending",
      paymentMethod:
        o.paymentDetails?.method ||
        o.paymentMethod ||
        (o.bkashTrxId ? "bKash (Manual)" : "Cash on Delivery"),
      status: o.status || "Placed",
      courier: o.deliveryPartner?.provider || o.courier || "",
      trackingNumber:
        o.deliveryPartner?.trackingNumber || o.trackingNumber || "",
      note: o.note || "",
      items: o.items || [],
      statusHistory: o.statusHistory || [],
      raw: o,
    }));
  }, [rawOrders]);

  const handleTabChange = (newTab) => {
    setFilter(newTab);
    setPage(1);
  };

  // Manual bKash Payment Verification
  const handleVerifyPayment = async (orderId, paymentStatus) => {
    const toastId = toast.loading(`Updating payment to ${paymentStatus}...`);
    try {
      const res = await verifyPaymentApi({
        id: orderId,
        paymentStatus,
      }).unwrap();

      const updated = res?.data || res;
      toast.success(
        paymentStatus === "Verified"
          ? `Payment verified! Order is now confirmed.`
          : `Payment status set to ${paymentStatus}.`,
        { id: toastId }
      );

      if (selectedOrder && (selectedOrder._id === orderId || selectedOrder.id === orderId)) {
        setSelectedOrder((prev) => ({ ...prev, ...updated }));
      }
      setReviewOrder(null);
    } catch (err) {
      const msg = err?.data?.message || err?.message || "Failed to verify payment";
      toast.error(msg, { id: toastId });
    }
  };

  // Save Order Status / Courier / Tracking
  const handleSaveStatus = async (payload) => {
    const toastId = toast.loading(`Updating order fulfillment status...`);
    try {
      const res = await updateStatusApi(payload).unwrap();
      const updated = res?.data || res;
      toast.success(`Fulfillment pipeline updated successfully!`, { id: toastId });

      if (selectedOrder) {
        setSelectedOrder((prev) => ({ ...prev, ...updated }));
      }
    } catch (err) {
      let msg = err?.data?.message || "Failed to update order status";
      if (Array.isArray(err?.data?.error) && err.data.error.length > 0) {
        msg = `${msg}: ${err.data.error.map((e) => `${e.field}: ${e.message}`).join(", ")}`;
      }
      toast.error(msg, { id: toastId });
    }
  };

  return (
    <>
      <title>LumiHaus Admin · Order Fulfillment & bKash</title>
      <div className="page-heading">
        <div>
          <span className="page-kicker">CORE OPERATIONS</span>
          <h2>Orders & bKash verification</h2>
          <p>Review customer payments and manage fulfillment through the 6-stage pipeline.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="button secondary flex items-center gap-1.5 cursor-pointer"
            title="Refresh Orders"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
            <span>{isFetching ? "Syncing..." : "Sync Orders"}</span>
          </button>
          <button
            onClick={() => toast.success("Exporting orders to Excel (.xlsx)...")}
            className="button secondary cursor-pointer"
          >
            <Download size={15} /> Export orders
          </button>
        </div>
      </div>

      {/* Global Status Tabs with Response Root Badges */}
      <div className="status-tabs premium-tabs">
        {TABS.map((tab) => {
          let count = 0;
          if (tab.value === "All") {
            // "All" count: sum of distinct order statuses (In Delivery, Confirmed, Delivered, Placed, Cancelled)
            count =
              (statusCounts["In Delivery"] ?? statusCounts.Shipped ?? 0) +
              (statusCounts.Confirmed ?? 0) +
              (statusCounts.Delivered ?? 0) +
              (statusCounts.Placed ?? 0) +
              (statusCounts.Cancelled ?? 0);
          } else if (tab.countKey === "In Delivery") {
            // Take exact count from In Delivery (or Shipped if legacy alias), never sum both!
            count = statusCounts["In Delivery"] ?? statusCounts.Shipped ?? 0;
          } else if (tab.countKey) {
            count = statusCounts[tab.countKey] ?? 0;
          }

          return (
            <button
              onClick={() => handleTabChange(tab.value)}
              className={filter === tab.value ? "active cursor-pointer" : "cursor-pointer"}
              key={tab.value}
            >
              {tab.label}
              <b>{count}</b>
            </button>
          );
        })}
      </div>

      <section className="card">
        {/* Search & Toolbar */}
        <div className="toolbar flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <label className="table-search w-full sm:w-80">
            <Search size={15} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search order #, customer, phone, or TrxID..."
            />
          </label>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="result-count text-xs text-gray-500 dark:text-zinc-400">
              {isLoading || isFetching
                ? "Loading orders..."
                : `${pagination.total} orders found`}
            </span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="text-xs bg-transparent border border-neutral-200 dark:border-white/10 rounded px-2 py-1"
              title="Page size"
            >
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
            </select>
          </div>
        </div>

        {/* Error Notice */}
        {isError && (
          <div className="p-4 mx-4 my-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-red-800 dark:text-red-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              {error?.status === 403 ? <ShieldAlert size={16} /> : <AlertTriangle size={16} />}
              <span>
                {error?.status === 403
                  ? "Access denied. Only admin or super_admin users may access order management."
                  : error?.data?.message || "Failed to load orders from backend."}
              </span>
            </div>
            <button
              onClick={() => refetch()}
              className="button secondary text-xs py-1 px-2.5 cursor-pointer"
            >
              Retry
            </button>
          </div>
        )}

        {/* Orders Table */}
        <OrderTable
          orders={orders}
          isLoading={isLoading}
          onOpenReview={(order) => setReviewOrder(order)}
          onSelect={(order) => setSelectedOrder(order)}
        />

        {/* Pagination Controls */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100 dark:border-white/5">
            <span className="text-xs text-neutral-500 dark:text-zinc-400">
              Showing {(page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, pagination.total)} of {pagination.total} orders
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isFetching}
                className="button secondary text-xs py-1 px-3 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs font-semibold text-neutral-700 dark:text-zinc-300">
                Page {page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page >= pagination.pages || isFetching}
                className="button secondary text-xs py-1 px-3 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Manual bKash Review Modal */}
      {reviewOrder && (
        <ManualBkashVerifyModal
          order={reviewOrder}
          onClose={() => setReviewOrder(null)}
          onVerify={handleVerifyPayment}
          isSaving={isSavingPayment}
        />
      )}

      {/* Full Order Fulfillment Details Modal */}
      {selectedOrder && (
        <OrderStatusModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onSave={handleSaveStatus}
          onVerifyPayment={handleVerifyPayment}
          isSavingStatus={isSavingStatus}
          isSavingPayment={isSavingPayment}
        />
      )}
    </>
  );
}
