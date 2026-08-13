import { useEffect, useMemo, useState } from "react";

function readCart() {
  try {
    return JSON.parse(localStorage.getItem("plantifulCart")) || [];
  } catch {
    return [];
  }
}

function CheckoutReview({ checkoutData, onNavigate, onOrderPlaced }) {
  const [cartItems] = useState(readCart);
  const [plants, setPlants] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function loadCartPlants() {
      const loadedPlants = [];

      for (const item of cartItems) {
        const response = await fetch(`/api/plants/${item.plantId}`);
        const data = await response.json();

        if (response.ok) {
          loadedPlants.push({
            ...data.plant,
            quantity: item.quantity,
          });
        }
      }

      setPlants(loadedPlants);
    }

    loadCartPlants();
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return plants.reduce((total, plant) => {
      return total + Number(plant.price) * Number(plant.quantity);
    }, 0);
  }, [plants]);

  const shippingCost = plants.length > 0 ? 7.99 : 0;
  const total = subtotal + shippingCost;

  async function handlePlaceOrder() {
    setStatus("");

    const response = await fetch("/api/checkout/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        items: cartItems,
        shipping: checkoutData.shipping,
        payment: checkoutData.payment,
        subtotal,
        shippingCost,
        total,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setStatus(data.error || "Order could not be placed.");
      return;
    }

    localStorage.removeItem("plantifulCart");
    window.dispatchEvent(new Event("plantiful-cart-change"));
    onOrderPlaced(data.order.id);
  }

  return (
    <main className="page-shell checkout-page">
      <section className="page-heading">
        <p className="section-eyebrow">Step 3 of 3</p>
        <h1>Review Your Order</h1>
        <p>Confirm the plant, shipping, and fake payment details before placing the order.</p>
      </section>

      {status && <p className="error">{status}</p>}

      <section className="checkout-grid">
        <div className="checkout-panel">
          <h2>Items</h2>
          {plants.map((plant) => (
            <article className="review-order-row" key={plant.id}>
              <span>{plant.name}</span>
              <span>Qty {plant.quantity}</span>
              <strong>${(Number(plant.price) * Number(plant.quantity)).toFixed(2)}</strong>
            </article>
          ))}

          <h2>Shipping</h2>
          <p>{checkoutData.shipping.fullName}</p>
          <p>{checkoutData.shipping.address}</p>
          <p>
            {checkoutData.shipping.city}, {checkoutData.shipping.state} {checkoutData.shipping.zip}
          </p>
          <p>{checkoutData.shipping.email}</p>

          <h2>Payment</h2>
          <p>{checkoutData.payment.cardholderName}</p>
          <p>Test card ending in {checkoutData.payment.cardNumber.slice(-4)}</p>
        </div>

        <aside className="checkout-summary">
          <h2>Total</h2>
          <p>
            <span>Subtotal</span>
            <strong>${subtotal.toFixed(2)}</strong>
          </p>
          <p>
            <span>Shipping</span>
            <strong>${shippingCost.toFixed(2)}</strong>
          </p>
          <p className="checkout-total">
            <span>Total</span>
            <strong>${total.toFixed(2)}</strong>
          </p>
          <button type="button" onClick={handlePlaceOrder}>
            Place order
          </button>
          <button className="secondary-action" type="button" onClick={() => onNavigate("checkoutPayment")}>
            Back to payment
          </button>
        </aside>
      </section>
    </main>
  );
}

export default CheckoutReview;

