import { useState } from "react";
import { Mail, Search, Trash2, RefreshCw, Users, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import confirmToast from "../../utils/confirmToast";
import { useGetSubscribersQuery, useUnsubscribeMutation } from "../../redux/features/subscriberApi";

export default function Subscribers() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const LIMIT = 20;

  const { data, isLoading, isFetching, refetch } = useGetSubscribersQuery(
    { page, limit: LIMIT, search },
    { refetchOnMountOrArgChange: true }
  );

  const [unsubscribe, { isLoading: isRemoving }] = useUnsubscribeMutation();

  const subscribers = data?.data?.subscribers || [];
  const pagination = data?.data?.pagination || {};
  const total = pagination.total || 0;
  const totalPages = pagination.pages || 1;

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleUnsubscribe = (id, email) => {
    confirmToast({
      title: "Unsubscribe Customer?",
      message: `Are you sure you want to unsubscribe ${email}? They can re-subscribe anytime.`,
      confirmLabel: "Yes, Unsubscribe",
      onConfirm: async () => {
        const toastId = toast.loading(`Unsubscribing ${email}...`);
        try {
          await unsubscribe(id).unwrap();
          toast.success(`${email} has been unsubscribed successfully!`, { id: toastId });
        } catch (err) {
          toast.error(err?.data?.message || "Failed to unsubscribe.", { id: toastId });
        }
      },
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#26382E] flex items-center gap-2">
            <Mail size={20} className="text-[#8FAF9A]" />
            Newsletter Subscribers
          </h1>
          <p className="text-sm text-[#26382E]/60 mt-0.5">
            Manage email subscribers for Lumihaus newsletters
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#26382E]/5 border border-[#26382E]/10 rounded-xl px-4 py-2.5">
          <Users size={16} className="text-[#8FAF9A]" />
          <span className="text-sm font-semibold text-[#26382E]">
            {total.toLocaleString()} Subscribers
          </span>
        </div>
      </div>

      {/* Search + Refresh Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#26382E]/40"
            />
            <input
              type="email"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by email address..."
              className="w-full pl-9 pr-4 py-2.5 text-sm border border-[#E8CFC8] rounded-xl bg-white text-[#26382E] placeholder:text-[#26382E]/40 outline-none focus:border-[#8FAF9A] transition"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#26382E] text-white text-sm font-semibold rounded-xl hover:bg-[#8FAF9A] hover:text-[#26382E] transition cursor-pointer"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(""); setSearchInput(""); setPage(1); }}
              className="px-4 py-2.5 border border-[#E8CFC8] text-sm text-[#26382E]/70 rounded-xl hover:bg-[#F9F6EF] transition cursor-pointer"
            >
              Clear
            </button>
          )}
        </form>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="flex items-center gap-2 px-4 py-2.5 border border-[#E8CFC8] text-sm text-[#26382E]/70 rounded-xl hover:bg-[#F9F6EF] transition cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E8CFC8] rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-[#26382E]/50">
            <RefreshCw size={18} className="animate-spin mr-2" />
            Loading subscribers...
          </div>
        ) : subscribers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#26382E]/40">
            <Mail size={32} className="opacity-30" />
            <p className="text-sm font-medium">
              {search ? `No subscribers found for "${search}"` : "No subscribers yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F9F6EF] border-b border-[#E8CFC8]">
                  <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-[#26382E]/60">#</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-[#26382E]/60">Email Address</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-[#26382E]/60">
                    <span className="flex items-center gap-1.5"><Calendar size={12} />Subscribed On</span>
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-[#26382E]/60">Status</th>
                  <th className="text-right px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-[#26382E]/60">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F9F6EF]">
                {subscribers.map((sub, idx) => (
                  <tr key={sub._id} className="hover:bg-[#F9F6EF]/60 transition group">
                    <td className="px-5 py-3.5 text-[#26382E]/40 font-mono text-xs">
                      {(page - 1) * LIMIT + idx + 1}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#8FAF9A]/20 flex items-center justify-center shrink-0">
                          <Mail size={12} className="text-[#8FAF9A]" />
                        </div>
                        <span className="font-medium text-[#26382E]">{sub.email}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[#26382E]/60">{formatDate(sub.subscribedAt)}</td>
                    <td className="px-5 py-3.5">
                      {sub.isActive !== false ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#8FAF9A]/15 text-[#26382E] text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#8FAF9A] inline-block" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E8CFC8]/40 text-[#26382E]/50 text-xs font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#26382E]/30 inline-block" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleUnsubscribe(sub._id, sub.email)}
                        disabled={isRemoving || sub.isActive === false}
                        title={sub.isActive === false ? "Already unsubscribed" : "Unsubscribe"}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition opacity-0 group-hover:opacity-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <Trash2 size={12} />
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-[#26382E]/50">
            Showing {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} of {total}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-[#E8CFC8] rounded-xl text-[#26382E]/70 hover:bg-[#F9F6EF] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Previous
            </button>
            <span className="px-4 py-2 bg-[#26382E] text-white rounded-xl font-semibold">{page}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-[#E8CFC8] rounded-xl text-[#26382E]/70 hover:bg-[#F9F6EF] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
