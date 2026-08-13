import { useEffect, useState } from "react";

const statuses = ["created", "processing", "shipped", "canceled", "refunded"];

function AdminOrders({ onNavigate }) {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("Loading orders...");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    const response = await fetch("/api/admin/orders", {
      credentials: "include",
    });
    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error || "Could not load orders.");
      return;
    }

    setOrders(data.orders || []);
    setStatus("");
  }

  async function updateOrderStatus(orderId, nextStatus) {
    setMessage("");

    const response = await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        status: nextStatus,
      }),
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Could not update order.");
      return;
    }

    setMessage(data.message || "Order updated.");
    await loadOrders();
  }

  if (status) {
    return (
      <main className="page-shell admin-page">
        <button className="text-link-button" type="button" onClick={() => onNavigate("admin")}>
          Back to admin
        </button>
        <p>{status}</p>
      </main>
    );
  }

  return (
    <main className="page-shell admin-page">
      <button className="text-link-button" type="button" onClick={() => onNavigate("admin")}>
        Back to admin
      </button>

      <section className="page-heading">
        <p className="section-eyebrow">Admin</p>
        <h1>Manage Orders</h1>
        <p>Review customer orders and update fulfillment status.</p>
      </section>

      {message && <p className="success">{message}</p>}

      <section className="admin-table">
        <div className="admin-table-head admin-order-row">
          <span>ID</span>
          <span>User</span>
          <span>Ship To</span>
          <span>Total</span>
          <span>Status</span>
        </div>

        {orders.map((order) => (
          <article className="admin-order-row" key={order.id}>
            <span>{order.id}</span>
            <strong>{order.username}</strong>
            <span>{order.shipping_name} - {order.shipping_city}, {order.shipping_state}</span>
            <strong>${Number(order.total).toFixed(2)}</strong>
            <select value={order.status} onChange={(event) => updateOrderStatus(order.id, event.target.value)}>
              {statuses.map((orderStatus) => (
                <option value={orderStatus} key={orderStatus}>
                  {orderStatus}
                </option>
              ))}
            </select>
          </article>
        ))}
      </section>
    </main>
  );
}

export default AdminOrders;
