import { useEffect, useMemo, useState } from "react";

function readCart() {
  try {
    return JSON.parse(localStorage.getItem("plantifulCart")) || [];
  } catch {
    return [];
  }
}

function notifyCartChange() {
  window.dispatchEvent(new Event("plantiful-cart-change"));
}

function saveCart(cartItems) {
  localStorage.setItem("plantifulCart", JSON.stringify(cartItems));
  notifyCartChange();
}

function Cart({ user, onNavigate, onRequireLogin }) {
  const [cartItems, setCartItems] = useState(readCart);
  const [plants, setPlants] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    async function loadCartPlants() {
      setStatus("");

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

  function updateQuantity(plantId, nextQuantity) {
    const quantity = Math.max(1, Number(nextQuantity) || 1);
    const updatedCart = cartItems.map((item) => {
      if (item.plantId === plantId) {
        return {
          ...item,
          quantity,
        };
      }

      return item;
    });

    setCartItems(updatedCart);
    saveCart(updatedCart);
  }

  function removeItem(plantId) {
    const updatedCart = cartItems.filter((item) => item.plantId !== plantId);
    setCartItems(updatedCart);
    saveCart(updatedCart);
  }

  function handleCheckout() {
    if (!user) {
      onRequireLogin("Please log in or create an account before checking out.");
      return;
    }

    if (cartItems.length === 0) {
      setStatus("Your cart is empty.");
      return;
    }

    onNavigate("checkoutShipping");
  }

  const subtotal = useMemo(() => {
    return plants.reduce((total, plant) => {
      return total + Number(plant.price) * Number(plant.quantity);
    }, 0);
  }, [plants]);

  return (
    <main className="page-shell checkout-page">
      <section className="page-heading">
        <p className="section-eyebrow">Order process</p>
        <h1>Your Cart</h1>
        <p>Review plant quantities before moving into shipping and payment.</p>
      </section>

      {status && <p className="error">{status}</p>}

      {plants.length === 0 ? (
        <section className="checkout-panel">
          <p>Your cart is empty.</p>
          <button type="button" onClick={() => onNavigate("shop")}>
            Shop Plants
          </button>
        </section>
      ) : (
        <section className="checkout-grid">
          <div className="checkout-panel">
            {plants.map((plant) => (
              <article className="cart-row" key={plant.id}>
                <img src={plant.image_url} alt={plant.name} />
                <div>
                  <h2>{plant.name}</h2>
                  <p>${Number(plant.price).toFixed(2)} each</p>
                  <label>
                    Quantity
                    <input
                      type="number"
                      min="1"
                      value={plant.quantity}
                      onChange={(event) => updateQuantity(plant.id, event.target.value)}
                    />
                  </label>
                </div>
                <div className="cart-row-actions">
                  <strong>${(Number(plant.price) * Number(plant.quantity)).toFixed(2)}</strong>
                  <button type="button" onClick={() => removeItem(plant.id)}>
                    Remove
                  </button>
                </div>
              </article>
            ))}
          </div>

          <aside className="checkout-summary">
            <h2>Order Summary</h2>
            <p>
              <span>Subtotal</span>
              <strong>${subtotal.toFixed(2)}</strong>
            </p>
            <p>
              <span>Shipping</span>
              <strong>$7.99</strong>
            </p>
            <p className="checkout-total">
              <span>Total</span>
              <strong>${(subtotal + 7.99).toFixed(2)}</strong>
            </p>
            <button type="button" onClick={handleCheckout}>
              Continue to shipping
            </button>
          </aside>
        </section>
      )}
    </main>
  );
}

export default Cart;

