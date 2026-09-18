import { useState } from "react";
import {
  X,
  TrendingUp,
  Truck,
  Package,
  AlertCircle,
  Plus,
  Edit2,
  Trash2,
  Receipt,
  CheckCircle2,
  HelpCircle,
  Clock,
  RotateCcw,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import confirmToast from "../../utils/confirmToast";
import {
  useGetOrderProfitBreakdownQuery,
  useRefundOrderMutation,
} from "../../redux/features/orderApi";
import {
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} from "../../redux/features/expenseApi";

export default function OrderAccountingDrawer({ order, onClose }) {
  const orderId = order?._id || order?.id;

  const {
    data: profitRes,
    isLoading: isLoadingProfit,
    isFetching: isFetchingProfit,
    refetch: refetchProfit,
  } = useGetOrderProfitBreakdownQuery(orderId, { skip: !orderId });

  const breakdown = profitRes?.data || profitRes || {};

  const [createExpense, { isLoading: isCreatingExpense }] = useCreateExpenseMutation();
  const [updateExpense, { isLoading: isUpdatingExpense }] = useUpdateExpenseMutation();
  const [deleteExpense, { isLoading: isDeletingExpense }] = useDeleteExpenseMutation();
  const [refundOrder, { isLoading: isRefunding }] = useRefundOrderMutation();

  // Courier Expense Form Modal inside Drawer
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [editingExpenseItem, setEditingExpenseItem] = useState(null);
  const [expenseForm, setExpenseForm] = useState({
    title: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    vendor: "Pathao",
    paymentMethod: "Cash",
    note: "",
  });

  // Refund Modal State
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState("Returned item");
  const [refundAmount, setRefundAmount] = useState("");

  const formatMoney = (amount) => {
    if (amount === null || amount === undefined || isNaN(Number(amount))) {
      return "Unavailable";
    }
    return `৳${Number(amount).toLocaleString("en-BD")}`;
  };

  // Open Expense Modal (Pre-filled for Domestic Courier)
  const handleOpenAddExpense = () => {
    setEditingExpenseItem(null);
    setExpenseForm({
      title: `${order?.courier || "Pathao"} delivery - ${order?.orderNumber || orderId?.slice(-6) || "ORD"}`,
      amount: "",
      date: new Date().toISOString().split("T")[0],
      vendor: order?.courier || "Pathao",
      paymentMethod: "Cash",
      note: `Actual courier delivery bill for Order #${order?.orderNumber || orderId?.slice(-6)}`,
    });
    setShowExpenseModal(true);
  };

  const handleOpenEditExpense = (exp) => {
    setEditingExpenseItem(exp);
    setExpenseForm({
      title: exp.title || "",
      amount: exp.amount || "",
      date: exp.date ? exp.date.split("T")[0] : new Date().toISOString().split("T")[0],
      vendor: exp.vendor || order?.courier || "Pathao",
      paymentMethod: exp.paymentMethod || "Cash",
      note: exp.note || "",
    });
    setShowExpenseModal(true);
  };

  const handleSaveExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.amount || Number(expenseForm.amount) <= 0) {
      toast.error("Please enter a valid courier bill amount");
      return;
    }

    try {
      if (editingExpenseItem) {
        const expId = editingExpenseItem._id || editingExpenseItem.id;
        await updateExpense({
          id: expId,
          amount: Number(expenseForm.amount),
          title: expenseForm.title.trim(),
          date: expenseForm.date,
          vendor: expenseForm.vendor.trim(),
          paymentMethod: expenseForm.paymentMethod.trim(),
          note: expenseForm.note.trim(),
          // Preserve orderId
          orderId,
        }).unwrap();
        toast.success("Courier expense updated successfully");
      } else {
        await createExpense({
          title: expenseForm.title.trim() || `Courier delivery - ${order?.orderNumber || ""}`,
          category: "Domestic Courier",
          treatment: "operating",
          amount: Number(expenseForm.amount),
          date: expenseForm.date,
          paymentMethod: expenseForm.paymentMethod.trim() || "Cash",
          vendor: expenseForm.vendor.trim() || order?.courier || "Pathao",
          note: expenseForm.note.trim() || "Actual delivery bill",
          orderId,
        }).unwrap();
        toast.success("Actual courier expense recorded and linked to order!");
      }
      setShowExpenseModal(false);
      refetchProfit();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to save courier expense");
    }
  };

  const handleDeleteExpense = (expId) => {
    confirmToast({
      title: "Delete Courier Expense?",
      message: "Are you sure you want to delete this courier cost record? This will remove the actual expense and update order contribution.",
      confirmLabel: "Yes, Delete",
      onConfirm: async () => {
        try {
          await deleteExpense(expId).unwrap();
          toast.success("Courier expense record deleted");
          refetchProfit();
        } catch (err) {
          toast.error(err?.data?.message || "Failed to delete expense");
        }
      },
    });
  };

  const handleProcessRefund = async (e) => {
    e.preventDefault();
    if (!refundAmount || Number(refundAmount) <= 0) {
      toast.error("Please enter a valid refund amount");
      return;
    }

    const toastId = toast.loading("Recording positive refund...");
    try {
      await refundOrder({
        id: orderId,
        reason: refundReason.trim() || "Customer return",
        amount: Number(refundAmount),
      }).unwrap();
      toast.success("Refund recorded. Order will be excluded from profit calculations.", { id: toastId });
      setShowRefundModal(false);
      refetchProfit();
    } catch (err) {
      toast.error(err?.data?.message || err?.message || "Failed to process refund", { id: toastId });
    }
  };

  // Profit Status Labels
  const calculationStatus = breakdown?.calculationStatus || (order?.status === "Delivered" ? "realized" : "projected");
  const isRealized = calculationStatus === "realized";
  const isExcluded = calculationStatus === "excluded" || (order?.refund !== undefined && order?.refund !== null && order.refund > 0);
  const contributionLabel = isRealized ? "Realized contribution" : "Projected contribution";

  const hasMissingCosts = Boolean(
    breakdown?.missingCostsCount && breakdown.missingCostsCount > 0
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-[#1A1D1B] text-[#17251C] dark:text-[#EFE8DE] shadow-2xl flex flex-col h-full overflow-hidden animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#DCD6CB] dark:border-white/10 flex items-center justify-between bg-[#F9F6EF] dark:bg-[#222620]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#EEF3EF] dark:bg-[#8FAF9A]/15 text-[#26382E] dark:text-[#8FAF9A] border border-[#8FAF9A]/30">
                {order?.orderNumber || orderId?.slice(-6) || "ORDER"}
              </span>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded ${
                isRealized
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : isExcluded
                  ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
              }`}>
                {isExcluded ? "Excluded from profit (Refunded)" : isRealized ? "Realized Delivered Sale" : "Projected Sale"}
              </span>
            </div>
            <h2 className="text-lg font-bold">Order Accounting & Contribution</h2>
            <p className="text-xs text-[#42584B] dark:text-[#8FAF9A] mt-0.5">
              Unit purchase costs, customer delivery balance, and actual courier charges.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 text-neutral-500 transition cursor-pointer"
            aria-label="Close drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drawer Body Scroll */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs">
          
          {isLoadingProfit ? (
            <div className="py-16 text-center text-[#42584B]">
              <Loader2 size={32} className="animate-spin mx-auto text-[#8FAF9A] mb-3" />
              <p className="font-semibold text-sm">Calculating order cost breakdown & courier allocations...</p>
            </div>
          ) : (
            <>
              {/* Status Banner */}
              {isExcluded && (
                <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-200 flex items-start gap-2.5">
                  <AlertCircle size={17} className="shrink-0 text-red-600 mt-0.5" />
                  <div>
                    <strong className="font-bold block text-sm">Order Excluded from Profit Calculations</strong>
                    <p className="text-xs mt-0.5 leading-relaxed">
                      This order has recorded positive refunds. In accordance with accounting policy, refunded orders are excluded from business net profit.
                    </p>
                  </div>
                </div>
              )}

              {hasMissingCosts && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                  <AlertCircle size={17} className="shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <strong className="font-bold block text-sm">Purchase cost missing</strong>
                    <p className="text-xs mt-0.5 leading-relaxed">
                      One or more products in this order lack a recorded purchase cost. Contribution after courier cannot be determined until all product costs are entered.
                    </p>
                  </div>
                </div>
              )}

              {/* 1. Contribution Card */}
              <div className="p-4 rounded-2xl bg-[#F9F6EF] dark:bg-[#222620] border border-[#DCD6CB] dark:border-white/10">
                <div className="flex items-center justify-between pb-2 border-b border-[#DCD6CB] dark:border-white/10 mb-3">
                  <div className="flex items-center gap-1.5 font-bold text-sm">
                    <TrendingUp size={16} className="text-[#8FAF9A]" />
                    <span>{contributionLabel}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#42584B] dark:text-[#8FAF9A] italic">
                    Excludes general business overheads
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#1A1D1B] border border-[#DCD6CB] dark:border-white/10">
                    <span className="text-[11px] text-[#42584B] dark:text-zinc-400 block">Product Sales</span>
                    <strong className="text-sm font-bold block mt-0.5">
                      {formatMoney(breakdown?.productSales ?? order?.totalAmount ?? order?.total)}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#1A1D1B] border border-[#DCD6CB] dark:border-white/10">
                    <span className="text-[11px] text-red-600 dark:text-red-400 block">Product Cost (COGS)</span>
                    <strong className="text-sm font-bold text-red-600 dark:text-red-400 block mt-0.5">
                      {hasMissingCosts || breakdown?.cogs === null || breakdown?.cogs === undefined
                        ? "Purchase cost missing"
                        : formatMoney(breakdown.cogs)}
                    </strong>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#1A1D1B] border border-[#DCD6CB] dark:border-white/10">
                    <span className="text-[11px] text-[#42584B] dark:text-zinc-400 block">Delivery Balance</span>
                    <strong className="text-sm font-bold block mt-0.5">
                      {breakdown?.deliveryBalance !== null && breakdown?.deliveryBalance !== undefined
                        ? formatMoney(breakdown.deliveryBalance)
                        : "Courier cost not recorded"}
                    </strong>
                  </div>

                  <div className={`p-2.5 rounded-xl border ${
                    isExcluded
                      ? "bg-neutral-100 text-neutral-500 border-neutral-300 dark:bg-zinc-800"
                      : "bg-[#26382E] text-white border-[#26382E] dark:bg-[#8FAF9A] dark:text-[#17251C]"
                  }`}>
                    <span className="text-[11px] font-bold opacity-80 block">Order Contribution</span>
                    <strong className="text-sm font-black block mt-0.5">
                      {isExcluded
                        ? "Excluded"
                        : hasMissingCosts || breakdown?.contributionAfterCourier === null || breakdown?.contributionAfterCourier === undefined
                        ? "Purchase cost missing"
                        : formatMoney(breakdown.contributionAfterCourier)}
                    </strong>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#DCD6CB]/60 dark:border-white/5 text-[11px] text-[#42584B] dark:text-zinc-400 flex items-center justify-between">
                  <span>
                    Calculation formula: Product Sales − COGS + Delivery Balance
                  </span>
                  <span className="font-semibold text-neutral-600 dark:text-zinc-300">
                    Not final business Net Profit
                  </span>
                </div>
              </div>

              {/* 2. Customer Delivery vs Actual Courier Accounting */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#222620] border border-[#DCD6CB] dark:border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-sm">
                    <Truck size={16} className="text-[#8FAF9A]" />
                    <span>Courier & Delivery Accounting</span>
                  </div>
                  <button
                    onClick={handleOpenAddExpense}
                    className="button text-xs py-1 px-2.5 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Record courier cost</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#1A1D1B] border border-[#DCD6CB] dark:border-white/10">
                    <span className="text-[11px] text-[#42584B] dark:text-zinc-400 block font-medium">Customer Charged</span>
                    <strong className="text-sm font-bold block mt-1">
                      {formatMoney(breakdown?.customerDeliveryCharge ?? order?.deliveryCharge ?? 0)}
                    </strong>
                    <span className="text-[10px] text-neutral-500 block mt-0.5">Charged on checkout</span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#1A1D1B] border border-[#DCD6CB] dark:border-white/10">
                    <span className="text-[11px] text-[#42584B] dark:text-zinc-400 block font-medium">Delivery Collected</span>
                    <strong className="text-sm font-bold block mt-1">
                      {order?.refund && order.refund > 0
                        ? "Unknown after refund"
                        : formatMoney(breakdown?.customerDeliveryCollected ?? (order?.paymentStatus === "Verified" ? (breakdown?.customerDeliveryCharge ?? order?.deliveryCharge ?? 0) : 0))}
                    </strong>
                    <span className="text-[10px] text-neutral-500 block mt-0.5">
                      {order?.paymentStatus === "Verified" ? "Verified in payment" : "Pending collection"}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-[#1A1D1B] border border-[#DCD6CB] dark:border-white/10">
                    <span className="text-[11px] text-red-600 dark:text-red-400 block font-medium">Actual Courier Cost</span>
                    <strong className="text-sm font-bold text-red-600 dark:text-red-400 block mt-1">
                      {breakdown?.actualCourierCost !== null && breakdown?.actualCourierCost !== undefined
                        ? formatMoney(breakdown.actualCourierCost)
                        : "Courier cost not recorded"}
                    </strong>
                    <span className="text-[10px] text-neutral-500 block mt-0.5">
                      Linked expense bill
                    </span>
                  </div>
                </div>

                {/* Linked Courier Expenses List */}
                <div className="pt-2">
                  <span className="font-bold text-xs block mb-2 text-[#17251C] dark:text-white">
                    Linked Courier Expense Records ({breakdown?.courierExpenses?.length || 0})
                  </span>
                  
                  {breakdown?.courierExpenses && breakdown.courierExpenses.length > 0 ? (
                    <div className="space-y-2">
                      {breakdown.courierExpenses.map((exp) => (
                        <div
                          key={exp._id || exp.id}
                          className="p-2.5 rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-[#FAF7F2] dark:bg-[#1A1D1B] flex items-center justify-between gap-3"
                        >
                          <div>
                            <div className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                              <span>{exp.title}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-zinc-700 text-neutral-700 dark:text-zinc-300">
                                {exp.vendor || "Courier"}
                              </span>
                            </div>
                            <div className="text-[11px] text-neutral-500 dark:text-zinc-400 mt-0.5">
                              {exp.date ? exp.date.split("T")[0] : ""} · {exp.paymentMethod || "Cash"}
                              {exp.note ? ` · ${exp.note}` : ""}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <strong className="text-sm font-bold text-red-600 dark:text-red-400">
                              ৳{Number(exp.amount || 0).toLocaleString("en-BD")}
                            </strong>
                            <button
                              onClick={() => handleOpenEditExpense(exp)}
                              className="p-1 rounded hover:bg-black/5 text-neutral-600 dark:text-zinc-400"
                              title="Edit Bill"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeleteExpense(exp._id || exp.id)}
                              className="p-1 rounded hover:bg-red-50 text-red-600"
                              title="Delete Bill"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl border border-dashed border-[#DCD6CB] dark:border-white/10 text-center text-neutral-500">
                      <span>No actual courier bill recorded for this order yet.</span>
                      <button
                        onClick={handleOpenAddExpense}
                        className="text-[#26382E] dark:text-[#8FAF9A] font-bold underline ml-1 cursor-pointer"
                      >
                        Record now
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Product Allocations Table */}
              <div className="border border-[#DCD6CB] dark:border-white/10 rounded-2xl overflow-hidden bg-white dark:bg-[#222620]">
                <div className="p-3.5 bg-[#FAF7F2] dark:bg-[#1A1D1B] border-b border-[#DCD6CB] dark:border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-neutral-900 dark:text-white">
                    <Package size={14} className="text-[#8FAF9A]" />
                    <span>Product Accounting Allocations</span>
                  </div>
                  <span className="text-[11px] text-[#42584B] dark:text-[#8FAF9A] italic">
                    Allocated estimate — by quantity
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#FAF7F2]/60 dark:bg-white/5 border-b border-[#DCD6CB] dark:border-white/10 text-[11px] font-bold uppercase text-[#42584B]">
                      <tr>
                        <th className="p-3">Product</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Net product revenue</th>
                        <th className="p-3 text-right">Product cost</th>
                        <th className="p-3 text-right">Allocated delivery income</th>
                        <th className="p-3 text-right">Allocated courier cost</th>
                        <th className="p-3 text-right">Contribution</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DCD6CB]/60 dark:divide-white/5">
                      {breakdown?.items && breakdown.items.length > 0 ? (
                        breakdown.items.map((it, idx) => {
                          const hasUnitCost = it.unitCostPrice !== null && it.unitCostPrice !== undefined;
                          return (
                            <tr key={it.itemId || it.productId || idx} className="hover:bg-[#F9F6EF]/50">
                              <td className="p-3 font-semibold text-neutral-900 dark:text-white">
                                {it.name || "Product"}
                              </td>
                              <td className="p-3 text-center font-bold">{it.quantity || 1}</td>
                              <td className="p-3 text-right font-semibold">
                                {formatMoney(it.productRevenue)}
                              </td>
                              <td className="p-3 text-right font-medium">
                                {hasUnitCost ? formatMoney(it.productCost) : (
                                  <span className="text-amber-600 font-semibold">Purchase cost missing</span>
                                )}
                              </td>
                              <td className="p-3 text-right text-neutral-600 dark:text-zinc-400">
                                {formatMoney(it.customerDeliveryShare)}
                              </td>
                              <td className="p-3 text-right text-red-600 dark:text-red-400">
                                {it.courierCostShare !== null && it.courierCostShare !== undefined
                                  ? formatMoney(it.courierCostShare)
                                  : "Courier cost not recorded"}
                              </td>
                              <td className="p-3 text-right font-bold">
                                {hasUnitCost && it.contributionAfterCourier !== null && it.contributionAfterCourier !== undefined
                                  ? formatMoney(it.contributionAfterCourier)
                                  : "Purchase cost missing"}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-4 text-center text-neutral-400">
                            No product allocations available.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. Action Row (Record Refund) */}
              <div className="pt-2 flex justify-between items-center text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setRefundAmount(order?.totalAmount || order?.total || "");
                    setShowRefundModal(true);
                  }}
                  className="button secondary text-red-600 hover:bg-red-50 text-xs py-1.5 px-3 cursor-pointer"
                >
                  <RotateCcw size={13} />
                  <span>Record positive refund</span>
                </button>

                <span className="text-neutral-400 text-[11px]">
                  Order #{order?.orderNumber || orderId?.slice(-6)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Expense Modal (Add / Edit Domestic Courier Bill) */}
        {showExpenseModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md bg-white dark:bg-[#222620] rounded-2xl p-5 shadow-2xl border border-[#DCD6CB] dark:border-white/10 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-[#DCD6CB] dark:border-white/10">
                <h3 className="font-bold text-sm">
                  {editingExpenseItem ? "Edit Courier Bill" : "Record Courier Expense"}
                </h3>
                <button
                  onClick={() => setShowExpenseModal(false)}
                  className="p-1 rounded text-neutral-400 hover:text-neutral-700"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveExpense} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">Expense Title *</label>
                  <input
                    type="text"
                    required
                    value={expenseForm.title}
                    onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                    className="w-full p-2 rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-transparent font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-bold block mb-1">Amount (BDT) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      step="any"
                      placeholder="e.g. 60"
                      value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      className="w-full p-2 rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-transparent font-bold text-red-600"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={expenseForm.date}
                      onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                      className="w-full p-2 rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="font-bold block mb-1">Courier Vendor</label>
                    <input
                      type="text"
                      value={expenseForm.vendor}
                      onChange={(e) => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                      placeholder="Pathao, Steadfast, etc."
                      className="w-full p-2 rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-transparent"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-1">Payment Method</label>
                    <select
                      value={expenseForm.paymentMethod}
                      onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value })}
                      className="w-full p-2 rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-transparent"
                    >
                      <option value="Cash">Cash</option>
                      <option value="bKash Merchant">bKash Merchant</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Credit Card">Credit Card</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold block mb-1">Notes / Consignment Ref</label>
                  <input
                    type="text"
                    value={expenseForm.note}
                    onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
                    placeholder="Optional consignment / invoice note"
                    className="w-full p-2 rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-transparent"
                  />
                </div>

                <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-zinc-800 text-[11px] text-neutral-500">
                  ℹ️ Linked to Order ID: <span className="font-mono font-bold text-neutral-800 dark:text-neutral-200">{orderId}</span> (Category: Domestic Courier, Treatment: Operating).
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#DCD6CB] dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowExpenseModal(false)}
                    className="button secondary text-xs py-1.5 px-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingExpense || isUpdatingExpense}
                    className="button text-xs py-1.5 px-4 disabled:opacity-50"
                  >
                    {isCreatingExpense || isUpdatingExpense ? "Saving..." : "Save Courier Expense"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Refund Modal */}
        {showRefundModal && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-md bg-white dark:bg-[#222620] rounded-2xl p-5 shadow-2xl border border-[#DCD6CB] dark:border-white/10 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-[#DCD6CB] dark:border-white/10">
                <h3 className="font-bold text-sm text-red-600">Record Positive Refund</h3>
                <button
                  onClick={() => setShowRefundModal(false)}
                  className="p-1 rounded text-neutral-400 hover:text-neutral-700"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleProcessRefund} className="space-y-3 text-xs">
                <p className="text-neutral-600 dark:text-zinc-400 leading-relaxed text-[11px]">
                  ⚠️ Recording a refund will permanently exclude this order from Net Profit accounting in accordance with the contract.
                </p>

                <div>
                  <label className="font-bold block mb-1">Refund Reason *</label>
                  <input
                    type="text"
                    required
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="e.g. Returned damaged item, Customer cancelled parcel"
                    className="w-full p-2 rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-transparent font-medium"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Refund Amount in BDT *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    className="w-full p-2 rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-transparent font-bold text-red-600"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[#DCD6CB] dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowRefundModal(false)}
                    className="button secondary text-xs py-1.5 px-3"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isRefunding}
                    className="button text-xs py-1.5 px-4 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                  >
                    {isRefunding ? "Processing..." : "Confirm Refund"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
