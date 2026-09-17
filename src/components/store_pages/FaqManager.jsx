import { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Search,
  PenLine,
  Trash2,
  Check,
  X,
  RotateCcw,
  HelpCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  useGetFaqsQuery,
  useCreateFaqMutation,
  useUpdateFaqMutation,
  useDeleteFaqMutation,
} from "../../redux/features/cmsApi";

export const DEFAULT_FAQS = [
  {
    _id: "faq-1",
    question: "Are all products 100% authentic and sourced from Germany?",
    answer:
      "Yes, every product is procured directly from official retailers in Germany like dm-drogerie markt and Rossmann with genuine batch codes.",
  },
  {
    _id: "faq-2",
    question: "What payment methods do you accept?",
    answer:
      "We accept manual bKash Send Money and Cash on Delivery (COD).",
  },
  {
    _id: "faq-3",
    question: "How long does delivery take inside and outside Dhaka?",
    answer:
      "Delivery takes 24–48 hours inside Dhaka and 2–3 days outside Dhaka.",
  },
  {
    _id: "faq-4",
    question: "What is your return policy?",
    answer:
      "Damaged or incorrect products can be reported within 48 hours of delivery for a replacement or refund.",
  },
];

export default function FaqManager() {
  const { data: faqsRes, refetch } = useGetFaqsQuery();
  const [createFaq, { isLoading: isCreating }] = useCreateFaqMutation();
  const [updateFaq, { isLoading: isUpdating }] = useUpdateFaqMutation();
  const [deleteFaq, { isLoading: isDeleting }] = useDeleteFaqMutation();

  // Local storage backup & live sync
  const [localFaqs, setLocalFaqs] = useState(() => {
    try {
      const saved = localStorage.getItem("lumihaus_faqs");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // If stored FAQs contain the old 8 bloated questions, default to simple ones
          if (parsed.length > 5 || parsed[0]?.answer?.includes("official German dm-drogerie markt")) {
            return DEFAULT_FAQS;
          }
          return parsed;
        }
      }
      return DEFAULT_FAQS;
    } catch {
      return DEFAULT_FAQS;
    }
  });

  // Sync with API when available
  useEffect(() => {
    const apiList = faqsRes?.data || (Array.isArray(faqsRes) ? faqsRes : null);
    if (Array.isArray(apiList) && apiList.length > 0) {
      setLocalFaqs(apiList);
      try {
        localStorage.setItem("lumihaus_faqs", JSON.stringify(apiList));
      } catch {}
    }
  }, [faqsRes]);

  const persistFaqs = (updated) => {
    setLocalFaqs(updated);
    try {
      localStorage.setItem("lumihaus_faqs", JSON.stringify(updated));
    } catch {}
  };

  // Search
  const [search, setSearch] = useState("");

  const filteredFaqs = useMemo(() => {
    if (!search.trim()) return localFaqs;
    const s = search.toLowerCase().trim();
    return localFaqs.filter((item) => {
      const q = (item.question || item.q || "").toLowerCase();
      const a = (item.answer || item.a || "").toLowerCase();
      return q.includes(s) || a.includes(s);
    });
  }, [localFaqs, search]);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const openAddModal = () => {
    setEditingFaq(null);
    setQuestion("");
    setAnswer("");
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingFaq(item);
    setQuestion(item.question || item.q || "");
    setAnswer(item.answer || item.a || "");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingFaq(null);
    setQuestion("");
    setAnswer("");
  };

  // Save (Create or Update)
  const handleSave = async (e) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) {
      toast.error("Please enter both question and answer.");
      return;
    }

    if (editingFaq) {
      const id = editingFaq._id || editingFaq.id;
      const payload = {
        question: question.trim(),
        answer: answer.trim(),
      };

      const updated = localFaqs.map((f) =>
        (f._id === id || f.id === id) ? { ...f, ...payload } : f
      );
      persistFaqs(updated);
      toast.success("FAQ updated successfully!");
      closeModal();

      try {
        await updateFaq({ id, ...payload }).unwrap();
        refetch();
      } catch {}
    } else {
      const newFaq = {
        _id: `faq-${Date.now()}`,
        question: question.trim(),
        answer: answer.trim(),
      };
      const updated = [...localFaqs, newFaq];
      persistFaqs(updated);
      toast.success("New FAQ added!");
      closeModal();

      try {
        await createFaq(newFaq).unwrap();
        refetch();
      } catch {}
    }
  };

  // Delete
  const handleDelete = async (item) => {
    const id = item._id || item.id;
    const qText = item.question || item.q || "this question";
    if (!window.confirm(`Delete question: "${qText}"?`)) return;

    const updated = localFaqs.filter((f) => f._id !== id && f.id !== id);
    persistFaqs(updated);
    toast.success("FAQ deleted.");

    try {
      await deleteFaq(id).unwrap();
      refetch();
    } catch {}
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    if (window.confirm("Reset FAQs to default questions?")) {
      persistFaqs(DEFAULT_FAQS);
      toast.success("Reset to default FAQs.");
    }
  };

  return (
    <div className="space-y-5 max-w-5xl">
      {/* Top Header Card */}
      <div className="rounded-2xl border-2 border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#EEF3EF] dark:bg-[#8FAF9A]/15 border border-[#8FAF9A]/30 text-[#26382E] dark:text-[#8FAF9A] flex items-center justify-center shrink-0">
              <HelpCircle size={20} />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#141f17] dark:text-white">
                Frequently Asked Questions ({localFaqs.length})
              </h3>
              <p className="text-xs text-neutral-500">
                Manage questions and answers displayed live on the storefront.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition cursor-pointer"
              title="Reset to default questions"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#26382E] hover:bg-[#8FAF9A] hover:text-[#26382E] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <Plus size={15} />
              <span>Add FAQ</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-4 pt-3 border-t border-[#DCD6CB]/60 dark:border-white/10">
          <div className="relative w-full">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions or answers..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] text-xs text-[#141f17] dark:text-white outline-none focus:border-[#8FAF9A]"
            />
          </div>
        </div>
      </div>

      {/* FAQ Items List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-[#DCD6CB] dark:border-white/10 p-10 text-center bg-white dark:bg-[#222620]">
            <HelpCircle size={30} className="mx-auto text-neutral-400 mb-2 opacity-60" />
            <p className="font-serif text-base font-bold text-neutral-700 dark:text-neutral-300">
              No questions found
            </p>
          </div>
        ) : (
          filteredFaqs.map((faq, index) => {
            const id = faq._id || faq.id;
            const q = faq.question || faq.q || "";
            const a = faq.answer || faq.a || "";

            return (
              <div
                key={id || index}
                className="group rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] p-4 sm:p-5 shadow-xs transition-all hover:border-[#8FAF9A]"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Number & Text */}
                  <div className="flex items-start gap-3 flex-1">
                    <span className="font-mono text-xs font-bold text-neutral-400 dark:text-neutral-500 bg-[#F9F6EF] dark:bg-[#1A1D1B] px-2 py-1 rounded border border-[#DCD6CB]/60 shrink-0">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <div className="space-y-1.5 flex-1">
                      <h4 className="font-sans text-sm sm:text-base font-bold text-[#141f17] dark:text-white">
                        {q}
                      </h4>
                      <p className="font-sans text-xs sm:text-[13px] text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                        {a}
                      </p>
                    </div>
                  </div>

                  {/* Right Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      type="button"
                      onClick={() => openEditModal(faq)}
                      className="p-2 rounded-lg border border-transparent hover:border-[#DCD6CB] hover:bg-[#F9F6EF] dark:hover:bg-[#1A1D1B] text-neutral-600 dark:text-neutral-300 transition cursor-pointer"
                      title="Edit"
                    >
                      <PenLine size={15} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(faq)}
                      className="p-2 rounded-lg border border-transparent hover:border-red-200 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Clean Simple Modal for Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border-2 border-[#DCD6CB] dark:border-white/10 bg-white dark:bg-[#222620] p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#DCD6CB]/60 dark:border-white/10">
              <h3 className="font-serif text-lg font-bold text-[#141f17] dark:text-white">
                {editingFaq ? "Edit Question & Answer" : "Add New Question"}
              </h3>
              <button
                onClick={closeModal}
                className="text-neutral-400 hover:text-neutral-600 transition p-1 cursor-pointer rounded-full"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#141f17] dark:text-white uppercase tracking-wider mb-1.5">
                  Question *
                </label>
                <input
                  type="text"
                  required
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Enter the question here..."
                  className="w-full rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] px-3.5 py-2.5 text-sm font-semibold text-[#141f17] dark:text-white outline-none focus:border-[#8FAF9A]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#141f17] dark:text-white uppercase tracking-wider mb-1.5">
                  Answer *
                </label>
                <textarea
                  rows={5}
                  required
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter the answer here..."
                  className="w-full rounded-xl border border-[#DCD6CB] dark:border-white/10 bg-[#F9F6EF] dark:bg-[#1A1D1B] px-3.5 py-2.5 text-xs sm:text-sm text-[#141f17] dark:text-white outline-none focus:border-[#8FAF9A] resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-[#DCD6CB]/60 dark:border-white/10">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#26382E] hover:bg-[#8FAF9A] hover:text-[#26382E] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Check size={14} />
                  <span>{editingFaq ? "Save Changes" : "Add FAQ"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
