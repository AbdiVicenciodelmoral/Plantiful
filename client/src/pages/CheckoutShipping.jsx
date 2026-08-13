import { useState } from "react";

function CheckoutShipping({ checkoutData, onCheckoutDataChange, onNavigate }) {
  const [shipping, setShipping] = useState(checkoutData.shipping);

  function updateField(field, value) {
    setShipping({
      ...shipping,
      [field]: value,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    onCheckoutDataChange({
      shipping,
    });
    onNavigate("checkoutPayment");
  }

  return (
    <main className="page-shell checkout-page">
      <section className="page-heading">
        <p className="section-eyebrow">Step 1 of 3</p>
        <h1>Shipping Information</h1>
        <p>Tell Plantiful where this order should be sent.</p>
      </section>

      <form className="checkout-panel checkout-form" onSubmit={handleSubmit}>
        <label>
          Full name
          <input value={shipping.fullName} onChange={(event) => updateField("fullName", event.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={shipping.email} onChange={(event) => updateField("email", event.target.value)} required />
        </label>
        <label>
          Street address
          <input value={shipping.address} onChange={(event) => updateField("address", event.target.value)} required />
        </label>
        <div className="form-grid">
          <label>
            City
            <input value={shipping.city} onChange={(event) => updateField("city", event.target.value)} required />
          </label>
          <label>
            State
            <input value={shipping.state} onChange={(event) => updateField("state", event.target.value)} required />
          </label>
          <label>
            ZIP code
            <input value={shipping.zip} onChange={(event) => updateField("zip", event.target.value)} required />
          </label>
        </div>
        <label>
          Delivery notes
          <textarea
            value={shipping.notes}
            onChange={(event) => updateField("notes", event.target.value)}
            placeholder="Gate code, preferred dropoff spot, plant care note..."
          />
        </label>

        <div className="checkout-actions">
          <button type="button" onClick={() => onNavigate("cart")}>
            Back to cart
          </button>
          <button type="submit">
            Continue to payment
          </button>
        </div>

        <aside className="training-note">
          <strong>Training surface:</strong> delivery notes can later become a
          stored XSS lesson if they are rendered as raw HTML on order pages.
        </aside>
      </form>
    </main>
  );
}

export default CheckoutShipping;
