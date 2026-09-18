import { useState } from "react";
import { useAdminUI } from "../../context/AdminUIContext";
import confirmToast from "../../utils/confirmToast";

export default function CustomerAction({ customer }) {
  const [blocked, setBlocked] = useState(false);
  const { notify } = useAdminUI();
  const c = customer || {
    initials: "NJ",
    name: "Nusrat Jahan",
    email: "nusrat@email.com",
    orders: 18,
    spent: "৳42,800",
    phone: "01712 884 921",
    address: "Dhanmondi, Dhaka",
  };

  const handleToggleBlock = () => {
    if (!blocked) {
      confirmToast({
        title: "Block Customer Account?",
        message: `Are you sure you want to block ${c.name}? They will not be able to place new orders.`,
        confirmLabel: "Yes, Block Customer",
        isDestructive: true,
        onConfirm: () => {
          setBlocked(true);
          notify(`${c.name} has been blocked`, "warning");
        },
      });
    } else {
      setBlocked(false);
      notify(`${c.name} unblocked successfully`, "success");
    }
  };

  return (
    <aside className="card profile-card">
      <span className="avatar large">{c.initials}</span>
      <h2>{c.name}</h2>
      <p>
        {c.email}
        <br />
        {c.phone}
      </p>
      <div className="profile-stats">
        <div>
          <b>{c.orders}</b>
          <small>Orders</small>
        </div>
        <div>
          <b>{c.spent}</b>
          <small>Total spent</small>
        </div>
      </div>
      <div className="profile-address">
        <small>Default delivery address</small>
        <b>{c.address}</b>
      </div>
      <button type="button" className="button secondary full-button">
        View order history
      </button>
      <button type="button" className="danger-button" onClick={handleToggleBlock}>
        {blocked ? "Unblock customer" : "Block customer"}
      </button>
    </aside>
  );
}
