import { Ban, CircleCheck, ShieldCheck, Trash2, UserCog, Users2 } from "lucide-react";
import { formatBdt } from "../../utils/format";
import { isSameUser } from "../../utils/currentAdmin";

const ROLE_STYLES = {
  super_admin: "bg-[#26382E] text-white border-[#26382E]",
  admin: "bg-[#EEF3EF] text-[#26382E] border-[#8FAF9A]/50",
  customer: "bg-neutral-100 dark:bg-white/5 text-neutral-600 dark:text-zinc-300 border-neutral-200 dark:border-white/10",
};

const ROLE_LABELS = {
  super_admin: "Super Admin",
  admin: "Admin",
  customer: "Customer",
};

function initialsOf(name = "", email = "") {
  const source = (name || email || "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

function formatJoined(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function UserTable({
  users = [],
  isLoading,
  currentAdmin,
  canManageRoles,
  onChangeRole,
  onToggleBlock,
  onDelete,
  busyId,
}) {
  if (isLoading) {
    return (
      <div className="py-16 text-center text-gray-500 dark:text-zinc-400">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#8FAF9A] border-r-transparent mb-3" />
        <p className="text-xs font-semibold">Loading users from database...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="py-16 text-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-xl my-4">
        <Users2 size={36} className="mx-auto text-gray-400 dark:text-zinc-500 mb-2 opacity-60" />
        <h4 className="text-sm font-bold text-gray-800 dark:text-zinc-200">No users found</h4>
        <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
          Customers appear here as soon as they register on the storefront.
        </p>
      </div>
    );
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Mobile</th>
            <th>Role</th>
            <th>Orders</th>
            <th>Total spent</th>
            <th>Joined</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const id = user._id || user.id;
            const role = user.role || "customer";
            const isSelf = isSameUser(user, currentAdmin);
            const isBusy = busyId === id;
            // A super_admin cannot be demoted or removed from here — that has to
            // go through another super_admin on purpose, and the server refuses
            // to remove the last one regardless.
            const isStaff = role === "admin" || role === "super_admin";

            return (
              <tr key={id} className={user.isBlocked ? "opacity-60" : undefined}>
                <td>
                  <div className="customer-cell">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name || user.email}
                        className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#dfe3dc] dark:border-white/10"
                      />
                    ) : (
                      <span className="avatar">{initialsOf(user.name, user.email)}</span>
                    )}
                    <div className="min-w-0">
                      <strong className="block truncate max-w-[210px]">
                        {user.name || "Unnamed user"}
                        {isSelf && (
                          <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider text-[#8FAF9A]">
                            You
                          </span>
                        )}
                      </strong>
                      <small className="truncate max-w-[210px]">{user.email || "—"}</small>
                    </div>
                  </div>
                </td>

                <td className="text-xs font-medium text-neutral-700 dark:text-zinc-300">
                  {user.phone || "—"}
                </td>

                <td>
                  <span
                    className={`inline-flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      ROLE_STYLES[role] || ROLE_STYLES.customer
                    }`}
                  >
                    {isStaff && <ShieldCheck size={11} />}
                    {ROLE_LABELS[role] || role}
                  </span>
                </td>

                <td className="text-xs font-semibold text-neutral-800 dark:text-zinc-200">
                  {isStaff ? "—" : (user.ordersCount ?? 0)}
                </td>

                <td className="text-xs font-semibold text-neutral-900 dark:text-white">
                  {isStaff ? "—" : formatBdt(user.totalSpent ?? 0)}
                </td>

                <td className="text-xs text-neutral-500 dark:text-zinc-400">
                  {formatJoined(user.createdAt)}
                </td>

                <td>
                  {user.isBlocked ? (
                    <span className="badge out-of-stock">Blocked</span>
                  ) : (
                    <span className="badge active">Active</span>
                  )}
                </td>

                <td>
                  <div className="row-actions">
                    {canManageRoles && !isSelf && (
                      <button
                        type="button"
                        className="icon-action cursor-pointer hover:text-[#26382E] hover:border-[#8FAF9A] disabled:opacity-40 disabled:cursor-not-allowed"
                        onClick={() => onChangeRole?.(user)}
                        disabled={isBusy}
                        title="Change role"
                      >
                        <UserCog size={15} />
                      </button>
                    )}

                    {!isSelf && (
                      <button
                        type="button"
                        className="icon-action cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        onClick={() => onToggleBlock?.(user)}
                        disabled={isBusy}
                        title={user.isBlocked ? "Unblock user" : "Block user"}
                      >
                        {user.isBlocked ? <CircleCheck size={15} /> : <Ban size={15} />}
                      </button>
                    )}

                    {canManageRoles && !isSelf && (
                      <button
                        type="button"
                        className="icon-action cursor-pointer hover:text-red-600 hover:border-red-300 disabled:opacity-40 disabled:cursor-not-allowed"
                        onClick={() => onDelete?.(user)}
                        disabled={isBusy}
                        title="Delete user"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}

                    {isSelf && (
                      <span className="text-[11px] text-neutral-400 dark:text-zinc-500">
                        Your account
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
