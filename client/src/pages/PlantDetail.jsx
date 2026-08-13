import { useEffect, useState } from "react";

function readCart() {
  try {
    return JSON.parse(localStorage.getItem("plantifulCart")) || [];
  } catch {
    return [];
  }
}

function saveCart(cartItems) {
  localStorage.setItem("plantifulCart", JSON.stringify(cartItems));
  window.dispatchEvent(new Event("plantiful-cart-change"));
}

function addPlantToCart(plant) {
  const cartItems = readCart();
  const existingItem = cartItems.find((item) => item.plantId === plant.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartItems.push({
      plantId: plant.id,
      quantity: 1,
    });
  }

  saveCart(cartItems);
}

function PlantDetail({ plantId, user, onNavigate, onRequireLogin }) {
  const [plant, setPlant] = useState(null);
  const [status, setStatus] = useState("Loading plant...");
  const [wishlistMessage, setWishlistMessage] = useState("");
  const [cartMessage, setCartMessage] = useState("");

  useEffect(() => {
    async function loadPlant() {
      setStatus("Loading plant...");
      setWishlistMessage("");
      setCartMessage("");

      const response = await fetch(`/api/plants/${plantId}`);
      const data = await response.json();

      if (!response.ok) {
        setPlant(null);
        setStatus(data.error || "Plant not found.");
        return;
      }

      setPlant(data.plant);
      setStatus("");
    }

    loadPlant();
  }, [plantId]);

  function handleAddToCart() {
    addPlantToCart(plant);
    setCartMessage(`${plant.name} added to your cart.`);
  }

  async function handleWishlist() {
    setWishlistMessage("");

    if (!user) {
      onRequireLogin("Please log in or create an account before saving plants to your wishlist.");
      return;
    }

    const response = await fetch("/api/wishlist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        plantId: plant.id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setWishlistMessage(data.error || "Plant could not be added to wishlist.");
      return;
    }

    setWishlistMessage(data.message || `${plant.name} added to your wishlist.`);
  }

  if (status) {
    return (
      <main className="page-shell">
        <button className="text-link-button" type="button" onClick={() => onNavigate("shop")}>
          Back to shop
        </button>
        <p>{status}</p>
      </main>
    );
  }

  if (!plant) {
    return null;
  }

  return (
    <main className="page-shell product-detail-page">
      <button className="text-link-button" type="button" onClick={() => onNavigate("shop")}>
        Back to shop
      </button>

      <section className="product-detail">
        <div className="product-image-panel">
          <img src={plant.image_url} alt={plant.name} />
        </div>

        <div className="product-info-panel">
          <p className="section-eyebrow">Plantiful Shop</p>
          <h1>{plant.name}</h1>
          <p>{plant.description}</p>

          <p className="product-price">${Number(plant.price).toFixed(2)}</p>

          <dl className="product-detail-list">
            <div>
              <dt>Care Level</dt>
              <dd>{plant.care_level}</dd>
            </div>
            <div>
              <dt>Light</dt>
              <dd>{plant.light}</dd>
            </div>
            <div>
              <dt>Water</dt>
              <dd>{plant.water}</dd>
            </div>
            <div>
              <dt>Stock</dt>
              <dd>{plant.stock} available</dd>
            </div>
          </dl>

          <div className="product-actions">
            <button type="button" onClick={handleAddToCart}>
              Add to cart
            </button>
            <button className="secondary-action" type="button" onClick={() => onNavigate("cart")}>
              View cart
            </button>
            <button className="secondary-action" type="button" onClick={handleWishlist}>
              Add to wishlist
            </button>
          </div>

          {cartMessage && (
            <div className="cart-feedback">
              <p className="success">{cartMessage}</p>
              <div>
                <button type="button" onClick={() => onNavigate("cart")}>
                  View cart
                </button>
                <button type="button" onClick={() => onNavigate("shop")}>
                  Continue shopping
                </button>
              </div>
            </div>
          )}
          {wishlistMessage && <p className="success">{wishlistMessage}</p>}

          <aside className="training-note">
            <strong>Training surface:</strong> this product flow is a future home
            for product IDOR, cart tampering, quantity abuse, price manipulation,
            wishlist ownership bugs, and checkout authorization lessons.
          </aside>
        </div>
      </section>
    </main>
  );
}

export default PlantDetail;
