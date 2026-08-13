import { useState } from "react";

function CheckoutPayment({ checkoutData, onCheckoutDataChange, onNavigate }) {
  const [payment, setPayment] = useState(checkoutData.payment);

  function updateField(field, value) {
    setPayment({
      ...payment,
      [field]: value,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    onCheckoutDataChange({
      payment,
    });
    onNavigate("checkoutReview");
  }

  return (
    <main className="page-shell checkout-page">
      <section className="page-heading">
        <p className="section-eyebrow">Step 2 of 3</p>
        <h1>Payment Method</h1>
        <p>Use fake test information only. This playground never needs real card data.</p>
      </section>

      <form className="checkout-panel checkout-form" onSubmit={handleSubmit}>
        <label>
          Cardholder name
          <input value={payment.cardholderName} onChange={(event) => updateField("cardholderName", event.target.value)} required />
        </label>
        <label>
          Test card number
          <input
            value={payment.cardNumber}
            onChange={(event) => updateField("cardNumber", event.target.value)}
            placeholder="4111 1111 1111 1111"
            required
          />
        </label>
        <div className="form-grid">
          <label>
            Expiration
            <input value={payment.expiration} onChange={(event) => updateField("expiration", event.target.value)} placeholder="12/30" required />
          </label>
          <label>
            CVV
            <input value={payment.cvv} onChange={(event) => updateField("cvv", event.target.value)} placeholder="123" required />
          </label>
          <label>
            Billing ZIP
            <input value={payment.billingZip} onChange={(event) => updateField("billingZip", event.target.value)} required />
          </label>
        </div>

        <div className="checkout-actions">
          <button type="button" onClick={() => onNavigate("checkoutShipping")}>
            Back to shipping
          </button>
          <button type="submit">
            Review order
          </button>
        </div>

        <aside className="training-note">
          <strong>Training surface:</strong> this intentionally stores fake
          payment fields so learners can discuss plaintext sensitive-data risks.
          Never enter real payment data here.
        </aside>
      </form>
    </main>
  );
}

export default CheckoutPayment;
