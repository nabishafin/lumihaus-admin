import { useState, useCallback } from "react";
import { Download, Plus } from "lucide-react";
import FreightCalculator from "../../components/preorders/FreightCalculator";
import ImportRequestTable from "../../components/preorders/ImportRequestTable";

const PIPELINE_TABS = [
  { id: "All", label: "All Requests" },
  { id: "Requested", label: "Needs Quote" },
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
          <span className="page-kicker">GERMANY SOURCING</span>
          <h2>Pre-orders & import requests</h2>
          <p>Calculate air freight landed quotes and message customers directly via WhatsApp.</p>
        </div>
      </div>

      <div className="preorder-layout">
        <section className="card">
          <div className="section-head">
            <div>
              <h2>Import request pipeline</h2>
              <p>
                {counts["All"] || 0} total requests · {counts["Requested"] || 0} awaiting price quote
              </p>
            </div>
          </div>

          {/* Interactive Pipeline Filters (Clickable & Live Counts) */}
          <div className="pipeline-summary">
            {PIPELINE_TABS.map((tab) => {
              const count = counts[tab.id] ?? 0;
              const isActive = activeFilter === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFilter(tab.id)}
                  className={isActive ? "active" : ""}
                >
                  <b>{count}</b>
                  <span>{tab.label}</span>
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
