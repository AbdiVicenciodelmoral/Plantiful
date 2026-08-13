import { useEffect, useState } from "react";

function addPlantToCart(plantId) {
  let cartItems = [];

  try {
    cartItems = JSON.parse(localStorage.getItem("plantifulCart")) || [];
  } catch {
    cartItems = [];
  }

  const existingItem = cartItems.find((item) => item.plantId === plantId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cartItems.push({
      plantId,
      quantity: 1,
    });
  }

  localStorage.setItem("plantifulCart", JSON.stringify(cartItems));
  window.dispatchEvent(new Event("plantiful-cart-change"));
}

function Wishlist({ user, onNavigate, onRequireLogin }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("Loading wishlist...");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadWishlist() {
      if (!user) {
        onRequireLogin("Please log in to view your wishlist.");
        return;
      }

      const response = await fetch("/api/wishlist", {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        setStatus(data.error || "Could not load wishlist.");
        return;
      }

      setItems(data.items || []);
      setStatus("");
    }

    loadWishlist();
  }, [user, onRequireLogin]);

  async function handleRemove(wishlistId) {
    setMessage("");

    const response = await fetch(`/api/wishlist/${wishlistId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Could not remove wishlist item.");
      return;
    }

    setItems((currentItems) => {
      return currentItems.filter((item) => item.wishlist_id !== wishlistId);
    });
    setMessage(data.message || "Wishlist item removed.");
  }

  function handleMoveToCart(item) {
    addPlantToCart(item.plant_id);
    setMessage(`${item.name} added to your cart.`);
  }

  if (status) {
    return (
      <main className="page-shell wishlist-page">
        <p>{status}</p>
      </main>
    );
  }

  return (
    <main className="page-shell wishlist-page">
      <section className="page-heading">
        <p className="section-eyebrow">My Account</p>
        <h1>Favorite Plants</h1>
        <p>Saved plants for later shopping, care planning, and wishlist IDOR practice.</p>
      </section>

      {message && <p className="success">{message}</p>}

      {items.length === 0 ? (
        <section className="checkout-panel">
          <p>Your wishlist is empty.</p>
          <button type="button" onClick={() => onNavigate("shop")}>
            Shop Plants
          </button>
        </section>
      ) : (
        <section className="wishlist-grid">
          {items.map((item) => (
            <article className="wishlist-card" key={item.wishlist_id}>
              <img src={item.image_url} alt={item.name} />

              <div>
                <p className="section-eyebrow">Wishlist #{item.wishlist_id}</p>
                <h2>{item.name}</h2>
                <p>{item.description}</p>

                <dl className="plant-meta">
                  <div>
                    <dt>Care</dt>
                    <dd>{item.care_level}</dd>
                  </div>
                  <div>
                    <dt>Light</dt>
                    <dd>{item.light}</dd>
                  </div>
                  <div>
                    <dt>Water</dt>
                    <dd>{item.water}</dd>
                  </div>
                </dl>

                <strong>${Number(item.price).toFixed(2)}</strong>
              </div>

              <div className="wishlist-actions">
                <button
                  type="button"
                  onClick={() =>
                    onNavigate("plantDetail", {
                      plantId: item.plant_id,
                    })
                  }
                >
                  View details
                </button>
                <button type="button" onClick={() => handleMoveToCart(item)}>
                  Add to cart
                </button>
                <button className="secondary-action" type="button" onClick={() => handleRemove(item.wishlist_id)}>
                  Remove
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      <aside className="training-note">
        <strong>Training surface:</strong> wishlist records have their own IDs.
        The remove route currently trusts the wishlist ID from the URL, which
        makes this a clean IDOR area for learners to test.
      </aside>
    </main>
  );
}

export default Wishlist;
