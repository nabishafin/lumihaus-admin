import { useState, useEffect, useMemo } from "react";
import { Calculator, Send, MessageSquare, Check, X, Copy } from "lucide-react";
import { useAdminUI } from "../../context/AdminUIContext";
import { useUpdatePreOrderStatusMutation } from "../../redux/features/preOrderApi";
import toast from "react-hot-toast";

export default function FreightCalculator({ selectedRequest, onClearSelected }) {
  const [weight, setWeight] = useState(500);
  const [euro, setEuro] = useState(12.95);
  const [rate, setRate] = useState(132);
  const [cargo, setCargo] = useState(1.35);
  const [margin, setMargin] = useState(25);
  const [copied, setCopied] = useState(false);

  const { notify } = useAdminUI();
  const [updateStatusApi, { isLoading: isUpdating }] = useUpdatePreOrderStatusMutation();

  // Auto-populate inputs when admin selects a customer request from the table
  useEffect(() => {
    if (selectedRequest) {
      if (Number(selectedRequest.itemPriceEur) > 0) {
        setEuro(Number(selectedRequest.itemPriceEur));
      }
      if (Number(selectedRequest.estimatedWeightKg) > 0) {
        setWeight(Math.round(Number(selectedRequest.estimatedWeightKg) * 1000));
      } else if (Number(selectedRequest.weightGrams) > 0) {
        setWeight(Number(selectedRequest.weightGrams));
      }
      if (Number(selectedRequest.euroRate) > 0) {
        setRate(Number(selectedRequest.euroRate));
      }
    }
  }, [selectedRequest]);

  const quote = useMemo(
    () => Math.ceil(((euro * rate) + (weight * cargo)) * (1 + margin / 100) / 10) * 10,
    [weight, euro, rate, cargo, margin]
  );

  const formatCustomerPhone = (phone) => {
    if (!phone) return "";
    let clean = phone.replace(/[^0-9]/g, "");
    if (clean.startsWith("0")) clean = "88" + clean;
    if (!clean.startsWith("88") && clean.length === 10) clean = "880" + clean;
    return clean;
  };

  const generateQuoteMessage = () => {
    const custName = selectedRequest?.customer?.name || "Valued Client";
    const prodName = selectedRequest?.productName || "German Import Item";
    const reqNum = selectedRequest?.requestNumber || "";

    return `*🇩🇪 LUMIHAUS · GERMAN SOURCING QUOTATION*

Hello ${custName}! 👋

Thank you for your German import request. Here is your official doorstep landed price quote:

📦 *Product:* ${prodName} ${reqNum ? `(${reqNum})` : ""}
💶 *Source Price:* €${euro}
⚖️ *Est. Weight:* ${weight}g
🇧🇩 *Total Landed Price:* *৳${quote.toLocaleString()}*

*(Includes direct procurement in Germany, air cargo freight, customs clearance & insured doorstep delivery across Bangladesh)*

Please reply to this message if you would like to proceed with your pre-order so our Frankfurt team can secure your item.

Warm regards,
*LumiHaus Bangladesh*`;
  };

  const handleSendQuote = async () => {
    const msg = generateQuoteMessage();
    const phone = selectedRequest?.customer?.phone;
    const cleanPhone = formatCustomerPhone(phone);

    // 1. Copy to clipboard for easy pasting anywhere
    try {
      await navigator.clipboard.writeText(msg);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // ignore clipboard error
    }

    // 2. Open WhatsApp if phone is available
    if (cleanPhone) {
      const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
      window.open(waUrl, "_blank");
    }

    // 3. Update Pre-Order status in backend
    if (selectedRequest?._id && !selectedRequest._id.startsWith("pr-")) {
      try {
        await updateStatusApi({
          id: selectedRequest._id,
          status: "Quoted",
          quotedPriceBdt: quote,
          quotedWeightGrams: weight,
          itemPriceEur: euro,
        }).unwrap();
        toast.success(`Quote of ৳${quote.toLocaleString()} saved & WhatsApp opened!`);
      } catch {
        toast.success(`Quote text prepared! (Local demo)`);
      }
    } else {
      notify(`৳${quote.toLocaleString()} quote prepared for ${selectedRequest?.customer?.name || "customer"}`);
      toast.success(
        cleanPhone
          ? `Quote opened in WhatsApp for ${selectedRequest?.customer?.name || cleanPhone}!`
          : `Quote of ৳${quote.toLocaleString()} copied to clipboard!`
      );
    }
  };

  return (
    <section className="card calculator-card">
      <div className="section-head">
        <div>
          <span className="section-icon">
            <Calculator size={18} />
          </span>
          <h2>Air freight quote</h2>
          <p>Germany → Bangladesh landed price</p>
        </div>
      </div>

      {/* When a request from the table is selected */}
      {selectedRequest ? (
        <div className="quote-selected-badge">
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-gray-500 block">Quoting Request</span>
            <b>{selectedRequest.customer?.name || "Customer"}</b>
            <span className="text-gray-500 truncate block text-[11px]">
              {selectedRequest.productName || "German Item"} · {selectedRequest.customer?.phone || "No phone"}
            </span>
          </div>
          <button
            type="button"
            onClick={onClearSelected}
            title="Clear selection"
            className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <p className="text-xs text-gray-500 mb-3 bg-gray-50 dark:bg-zinc-800/50 p-2.5 rounded-lg border border-dashed border-gray-200 dark:border-zinc-700">
          💡 Click <b>"Quote"</b> on any request row in the table to auto-fill details, or calculate manually below.
        </p>
      )}

      <div className="calculator-grid">
        <label>
          Product weight (g)
          <input
            type="number"
            min="0"
            step="10"
            value={weight}
            onChange={(e) => setWeight(+e.target.value)}
          />
        </label>
        <label>
          Source price (€)
          <input
            type="number"
            min="0"
            step=".01"
            value={euro}
            onChange={(e) => setEuro(+e.target.value)}
          />
        </label>
        <label>
          EUR exchange rate
          <input
            type="number"
            min="0"
            value={rate}
            onChange={(e) => setRate(+e.target.value)}
          />
        </label>
        <label>
          Air cargo / gram
          <input
            type="number"
            step=".05"
            value={cargo}
            onChange={(e) => setCargo(+e.target.value)}
          />
        </label>
        <label style={{ gridColumn: "span 2" }}>
          Margin (%)
          <input
            type="number"
            min="0"
            value={margin}
            onChange={(e) => setMargin(+e.target.value)}
          />
        </label>
      </div>

      <div className="quote-result">
        <span>Suggested client quote</span>
        <strong>৳{quote.toLocaleString()}</strong>
        <small>Includes product (€{euro}), freight & {margin}% margin</small>
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="button"
          className="button full-button"
          onClick={handleSendQuote}
          disabled={isUpdating}
          style={{ background: "#25D366", borderColor: "#25D366", color: "#fff" }}
        >
          <MessageSquare size={15} />
          {selectedRequest?.customer?.phone ? "Send via WhatsApp & Save" : "Copy Quote Message"}
        </button>

        {selectedRequest && (
          <button
            type="button"
            className="button secondary full-button"
            onClick={async () => {
              const msg = generateQuoteMessage();
              await navigator.clipboard.writeText(msg);
              setCopied(true);
              toast.success("Quote text copied to clipboard!");
              setTimeout(() => setCopied(false), 2500);
            }}
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Copied!" : "Copy Quote Text"}
          </button>
        )}
      </div>
    </section>
  );
}
