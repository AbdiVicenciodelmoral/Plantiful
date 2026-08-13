import { useEffect, useState } from "react";

function Orders({ user, onNavigate, onRequireLogin }) {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("Loading order history...");

  useEffect(() => {
    async function loadOrders() {
      if (!user) {
        onRequireLogin("Please log in to view your order history.");
        return;
      }

      const response = await fetch("/api/checkout/orders", {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        setStatus(data.error || "Could not load order history.");
        return;
      }

      setOrders(data.orders || []);
      setStatus("");
    }

    loadOrders();
  }, [user, onRequireLogin]);

  if (status) {
    return (
      <main className="page-shell order-history-page">
        <p>{status}</p>
      </main>
    );
  }

  return (
    <main className="page-shell order-history-page">
      <section className="page-heading">
        <p className="section-eyebrow">My Account</p>
        <h1>Shopping History</h1>
        <p>Review previous Plantiful orders and open order details.</p>
      </section>

      {orders.length === 0 ? (
        <section className="checkout-panel">
          <p>No orders yet.</p>
          <button type="button" onClick={() => onNavigate("shop")}>
            Shop Plants
          </button>
        </section>
      ) : (
        <section className="order-history-list">
          {orders.map((order) => (
            <article className="order-history-row" key={order.id}>
              <div>
                <p className="section-eyebrow">Order #{order.id}</p>
                <h2>{order.status}</h2>
                <p>
                  Sent to {order.shipping_name} in {order.shipping_city}, {order.shipping_state}
                </p>
                <p>{order.items.length} cart item record(s)</p>
              </div>

              <div className="order-history-meta">
                <strong>${Number(order.total).toFixed(2)}</strong>
                <span>{order.created_at}</span>
                <button
                  type="button"
                  onClick={() =>
                    onNavigate("orderConfirmation", {
                      orderId: order.id,
                    })
                  }
                >
                  View details
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      <aside className="training-note">
        <strong>Training surface:</strong> order detail URLs can become an IDOR
        lab because users may try changing order IDs in the URL.
      </aside>
    </main>
  );
}

export default Orders;
