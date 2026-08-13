import { useEffect, useState } from "react";

function OrderConfirmation({ orderId, onNavigate }) {
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("Loading order...");

  useEffect(() => {
    async function loadOrder() {
      const response = await fetch(`/api/checkout/orders/${orderId}`, {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        setStatus(data.error || "Order not found.");
        return;
      }

      setOrder(data.order);
      setStatus("");
    }

    loadOrder();
  }, [orderId]);

  if (status) {
    return (
      <main className="page-shell">
        <p>{status}</p>
      </main>
    );
  }

  return (
    <main className="page-shell checkout-page">
      <section className="confirmation-panel">
        <p className="section-eyebrow">Order confirmed</p>
        <h1>Thanks for your order.</h1>
        <p>Order #{order.id} has been created for {order.shipping_name}.</p>
        <p>
          Estimated delivery: <strong>3-5 business days</strong>
        </p>
        <p>
          Total: <strong>${Number(order.total).toFixed(2)}</strong>
        </p>

        <div className="checkout-actions">
          <button type="button" onClick={() => onNavigate("shop")}>
            Continue shopping
          </button>
          <button type="button" onClick={() => onNavigate("orders")}>
            View orders
          </button>
        </div>

        <aside className="training-note">
          <strong>Training surface:</strong> direct order URLs like /orders/{order.id}
          are ideal for future IDOR lessons if ownership checks are missing.
        </aside>
      </section>
    </main>
  );
}

export default OrderConfirmation;
