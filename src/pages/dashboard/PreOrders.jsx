import { useState, useCallback } from "react";
import { Download, Plus } from "lucide-react";
import FreightCalculator from "../../components/preorders/FreightCalculator";
import ImportRequestTable from "../../components/preorders/ImportRequestTable";
import { CARD } from "../../components/preorders/ui";

const PIPELINE_TABS = [
  { id: "All", label: "All" },
  { id: "Requested", label: "Needs quote" },
  { id: "Quoted", label: "Quoted" },
  { id: "Sourced in Germany", label: "Purchased" },
  { id: "Air Freight to BD", label: "Air-shipped" },
  { id: "Ready for Delivery", label: "Ready in BD" },
];

export default function PreOrders() {
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");
  const [counts, setCounts] = useState({
    All: 0,
    Requested: 0,
    Quoted: 0,
    "Sourced in Germany": 0,
    "Air Freight to BD": 0,
    "Ready for Delivery": 0,
  });

  const handleCountsCalculated = useCallback((newCounts) => {
    setCounts(newCounts);
  }, []);

  return (
    <>
      <title>LumiHaus Admin · Import Requests</title>
      <div className="page-heading">
        <div>
          <h2>Import requests</h2>
          <p>Quote landed prices for German pre-orders and send them on WhatsApp.</p>
        </div>
      </div>

      <div className="preorder-layout">
        <section className={`${CARD} min-w-0`}>
          <div className="section-head">
            <div>
              <h2>Requests</h2>
              <p>
                {counts["All"] || 0} total · {counts["Requested"] || 0} need a quote
              </p>
            </div>
          </div>

          {/* Pipeline stage filter (segmented, live counts) */}
          <div
            role="tablist"
            aria-label="Filter by stage"
            className="mb-4 flex gap-1 overflow-x-auto rounded-lg border border-[#DCD6CB] dark:border-white/10 bg-[#FAF8F4] dark:bg-white/[0.03] p-1"
          >
            {PIPELINE_TABS.map((tab) => {
              const count = counts[tab.id] ?? 0;
              const isActive = activeFilter === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-[13px] transition cursor-pointer ${
                    isActive
                      ? "bg-white dark:bg-[#2F342E] text-[#141f17] dark:text-white font-medium shadow-[0_1px_2px_rgba(20,31,23,0.08)] ring-1 ring-[#DCD6CB] dark:ring-white/10"
                      : "text-[#2E4235]/70 dark:text-[#D2DDD6]/70 hover:text-[#141f17] dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`min-w-5 rounded-full px-1.5 text-center text-[11.5px] tabular-nums ${
                      isActive
                        ? "bg-[#26382E] text-white dark:bg-[#8FAF9A] dark:text-[#17251C]"
                        : "bg-[#2E4235]/[0.07] dark:bg-white/10"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Requests Table */}
          <ImportRequestTable
            selectedRequest={selectedRequest}
            onSelectRequest={setSelectedRequest}
            activeFilter={activeFilter}
            onCountsCalculated={handleCountsCalculated}
          />
        </section>

        {/* Live Freight & Landed Price Calculator */}
        <FreightCalculator
          selectedRequest={selectedRequest}
          onClearSelected={() => setSelectedRequest(null)}
        />
      </div>
    </>
  );
}
