import toast from "react-hot-toast";

/**
 * Modern, interactive confirmation toast with Cancel and Confirm buttons.
 * Replaces window.confirm with a non-blocking, responsive UI dialog.
 */
export function confirmToast({
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Yes, Delete",
  cancelLabel = "Cancel",
  isDestructive = true,
  onConfirm,
}) {
  return toast(
    (t) => (
      <div className="flex flex-col gap-2 p-1 min-w-[280px] max-w-[360px]">
        <div className="flex items-start gap-2.5">
          <span className="text-2xl shrink-0 leading-none">
            {isDestructive ? "⚠️" : "ℹ️"}
          </span>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-wider">
              {title}
            </h4>
            <p className="text-xs text-gray-600 dark:text-zinc-300 mt-1 leading-relaxed break-words">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-3 pt-2.5 border-t border-gray-100 dark:border-white/10">
          <button
            type="button"
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 text-gray-700 dark:text-zinc-200 transition cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={async () => {
              toast.dismiss(t.id);
              if (typeof onConfirm === "function") {
                try {
                  await onConfirm();
                } catch (err) {
                  console.error("Confirmation action error:", err);
                }
              }
            }}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg text-white transition shadow-sm cursor-pointer ${
              isDestructive
                ? "bg-red-600 hover:bg-red-700 active:scale-95"
                : "bg-[#26382E] hover:bg-[#1a271f] active:scale-95"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    ),
    {
      duration: 10000,
      position: "top-center",
      style: {
        borderRadius: "14px",
        background: "#ffffff",
        color: "#17251C",
        border: isDestructive ? "2px solid #f43f5e" : "2px solid #8FAF9A",
        boxShadow: "0 20px 35px -5px rgba(0, 0, 0, 0.25)",
        maxWidth: "420px",
        padding: "14px 16px",
      },
    }
  );
}

export default confirmToast;
