import { useState, useEffect, useMemo } from "react";
import {
  AlertTriangle,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import toast from "react-hot-toast";
import confirmToast from "../../utils/confirmToast";
import UserTable from "../../components/users/UserTable";
import AddAdminModal from "../../components/users/AddAdminModal";
import ChangeRoleModal from "../../components/users/ChangeRoleModal";
import { getCurrentAdmin, isSuperAdmin } from "../../utils/currentAdmin";
import {
  useGetUsersQuery,
  useCreateAdminMutation,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
} from "../../redux/features/userApi";

const TABS = [
  { label: "All", value: "All", countKey: "total" },
  { label: "Customers", value: "customer", countKey: "customer" },
  { label: "Admins", value: "admin", countKey: "admin" },
  { label: "Super Admins", value: "super_admin", countKey: "super_admin" },
];

export default function Users() {
  const currentAdmin = useMemo(() => getCurrentAdmin(), []);
  const canManageRoles = isSuperAdmin(currentAdmin);

  const [role, setRole] = useState("All");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [roleTarget, setRoleTarget] = useState(null);
  const [busyId, setBusyId] = useState(null);

  // Debounce the search box so we do not hit the API on every keystroke.
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Any filter change invalidates the current page number.
  useEffect(() => {
    setPage(1);
  }, [search, role, limit]);

  const { data, isLoading, isFetching, isError, error, refetch } = useGetUsersQuery({
    page,
    limit,
    search: search || undefined,
    role,
  });

  const [createAdmin, { isLoading: isCreating }] = useCreateAdminMutation();
  const [updateUserRole, { isLoading: isSavingRole }] = useUpdateUserRoleMutation();
  const [updateUserStatus] = useUpdateUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();

  // Tolerate both envelope shapes the backend uses elsewhere.
  const users = useMemo(() => {
    if (Array.isArray(data?.data?.users)) return data.data.users;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.users)) return data.users;
    return [];
  }, [data]);

  const pagination = data?.data?.pagination ||
    data?.pagination || { page: 1, limit, total: users.length, pages: 1 };

  const roleCounts = data?.data?.roleCounts || data?.roleCounts || {};
  const totalCount =
    roleCounts.total ??
    (roleCounts.customer ?? 0) + (roleCounts.admin ?? 0) + (roleCounts.super_admin ?? 0);

  const handleCreateAdmin = async (payload) => {
    const toastId = toast.loading(`Creating ${payload.email}...`);
    try {
      await createAdmin(payload).unwrap();
      toast.success(`${payload.name} can now sign in to the console.`, { id: toastId });
      setShowAddAdmin(false);
    } catch (err) {
      toast.error(errorMessage(err, "Failed to create the admin account."), { id: toastId });
    }
  };

  const handleSaveRole = async (user, nextRole) => {
    const id = user._id || user.id;
    const toastId = toast.loading("Updating role...");
    setBusyId(id);
    try {
      await updateUserRole({ id, role: nextRole }).unwrap();
      toast.success(`${user.name || user.email} is now a ${labelFor(nextRole)}.`, { id: toastId });
      setRoleTarget(null);
    } catch (err) {
      toast.error(errorMessage(err, "Failed to update the role."), { id: toastId });
    } finally {
      setBusyId(null);
    }
  };

  const handleToggleBlock = (user) => {
    const id = user._id || user.id;
    const blocking = !user.isBlocked;
    const name = user.name || user.email;

    confirmToast({
      title: blocking ? "Block this user?" : "Unblock this user?",
      message: blocking
        ? `${name} will not be able to sign in or place new orders. Their order history is kept.`
        : `${name} will be able to sign in and order again.`,
      confirmLabel: blocking ? "Yes, block" : "Yes, unblock",
      isDestructive: blocking,
      onConfirm: async () => {
        const toastId = toast.loading(blocking ? `Blocking ${name}...` : `Unblocking ${name}...`);
        setBusyId(id);
        try {
          await updateUserStatus({ id, isBlocked: blocking }).unwrap();
          toast.success(blocking ? `${name} is blocked.` : `${name} is active again.`, {
            id: toastId,
          });
        } catch (err) {
          toast.error(errorMessage(err, "Failed to update the user."), { id: toastId });
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  const handleDelete = (user) => {
    const id = user._id || user.id;
    const name = user.name || user.email;
    const isStaff = user.role === "admin" || user.role === "super_admin";

    confirmToast({
      title: isStaff ? "Delete this admin?" : "Delete this user?",
      message: isStaff
        ? `${name} loses console access permanently. This cannot be undone — block them instead if you only want to suspend access.`
        : `${name} will be removed permanently. Their past orders stay in the system but are no longer linked to an account.`,
      confirmLabel: "Yes, delete",
      onConfirm: async () => {
        const toastId = toast.loading(`Deleting ${name}...`);
        setBusyId(id);
        try {
          await deleteUser(id).unwrap();
          toast.success(`${name} has been deleted.`, { id: toastId });
        } catch (err) {
          toast.error(errorMessage(err, "Failed to delete the user."), { id: toastId });
        } finally {
          setBusyId(null);
        }
      },
    });
  };

  return (
    <>
      <title>LumiHaus Admin · Users & Admins</title>

      <div className="page-heading">
        <div>
          <span className="page-kicker">ACCOUNTS & ACCESS</span>
          <h2>Users & Admins</h2>
          <p>Everyone registered on the storefront, plus who can reach this console.</p>
        </div>

        <div className="heading-actions">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="button secondary flex items-center gap-1.5 cursor-pointer"
            title="Refresh users"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
            <span>{isFetching ? "Syncing..." : "Sync"}</span>
          </button>

          {canManageRoles && (
            <button className="button cursor-pointer" onClick={() => setShowAddAdmin(true)}>
              <UserPlus size={15} /> Add admin
            </button>
          )}
        </div>
      </div>

      {/* A plain admin can see the directory but not change who has access. */}
      {!canManageRoles && (
        <div className="p-3.5 mb-4 bg-[#EEF3EF] border border-[#8FAF9A]/40 rounded-xl text-xs text-[#26382E] flex items-start gap-2.5">
          <ShieldCheck size={15} className="mt-0.5 shrink-0 text-[#8FAF9A]" />
          <p className="leading-relaxed">
            You are signed in as an <strong>Admin</strong>. Creating admins, changing
            roles and deleting accounts is restricted to <strong>Super Admins</strong>.
          </p>
        </div>
      )}

      <div className="status-tabs premium-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setRole(tab.value)}
            className={role === tab.value ? "active cursor-pointer" : "cursor-pointer"}
          >
            {tab.label}
            <b>{tab.countKey === "total" ? totalCount : roleCounts[tab.countKey] ?? 0}</b>
          </button>
        ))}
      </div>

      <section className="card">
        <div className="toolbar flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <label className="table-search w-full sm:w-80">
            <Search size={15} />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search name, email or mobile number..."
            />
          </label>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="result-count text-xs">
              {isLoading || isFetching
                ? "Loading users..."
                : `${pagination.total ?? users.length} users found`}
            </span>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="text-xs bg-transparent border border-neutral-200 dark:border-white/10 rounded px-2 py-1"
              title="Page size"
            >
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
            </select>
          </div>
        </div>

        {isError && (
          <div className="p-4 mx-4 my-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl text-red-800 dark:text-red-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {error?.status === 403 ? <ShieldAlert size={16} /> : <AlertTriangle size={16} />}
              <span>
                {error?.status === 403
                  ? "Access denied. Only admin or super_admin users may view the account directory."
                  : error?.data?.message || "Failed to load users from backend."}
              </span>
            </div>
            <button
              onClick={() => refetch()}
              className="button secondary text-xs py-1 px-2.5 cursor-pointer shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        <UserTable
          users={users}
          isLoading={isLoading}
          currentAdmin={currentAdmin}
          canManageRoles={canManageRoles}
          onChangeRole={setRoleTarget}
          onToggleBlock={handleToggleBlock}
          onDelete={handleDelete}
          busyId={busyId}
        />

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-100 dark:border-white/5">
            <span className="text-xs text-neutral-500 dark:text-zinc-400">
              Showing {(page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, pagination.total)} of {pagination.total} users
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

      {showAddAdmin && (
        <AddAdminModal
          onClose={() => setShowAddAdmin(false)}
          onCreate={handleCreateAdmin}
          isSaving={isCreating}
        />
      )}

      {roleTarget && (
        <ChangeRoleModal
          user={roleTarget}
          onClose={() => setRoleTarget(null)}
          onSave={handleSaveRole}
          isSaving={isSavingRole}
        />
      )}
    </>
  );
}

function labelFor(role) {
  if (role === "super_admin") return "Super Admin";
  if (role === "admin") return "Admin";
  return "Customer";
}

function errorMessage(err, fallback) {
  const status = err?.status ?? err?.originalStatus;
  if (status === 401) return "Your admin session has expired. Please sign in again.";
  if (status === 403) {
    return err?.data?.message || "Access denied. This action requires a Super Admin.";
  }
  return err?.data?.message || err?.error || fallback;
}
