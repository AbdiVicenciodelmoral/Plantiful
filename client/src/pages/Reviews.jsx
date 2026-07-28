import { useEffect, useState } from "react";

const emptyForm = {
  id: "",
  plantName: "Monstera Deliciosa",
  displayName: "",
  title: "",
  body: "",
  rating: "5",
};

function Reviews({ user, onRequireLogin }) {
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
    const response = await fetch("/api/reviews");
    const data = await response.json();
    setReviews(data.reviews || []);
  }

  const averageRating = reviews.length
    ? (
        reviews.reduce((total, review) => total + Number(review.rating), 0) /
        reviews.length
      ).toFixed(1)
    : "0.0";

  function updateForm(field, value) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function startReview() {
    if (!user) {
      onRequireLogin();
      return;
    }

    setError("");
    setMessage("");
    setShowForm(true);
    setForm({
      ...emptyForm,
      displayName: user.username,
    });
  }

  function startEdit(review) {
    if (!user) {
      onRequireLogin();
      return;
    }

    // Intentionally vulnerable training note:
    // The UI allows any logged-in user to load any review into the edit form.
    // The backend repeats the same mistake by updating only by review id.
    setShowForm(true);
    setForm({
      id: String(review.id),
      plantName: review.plant_name,
      displayName: review.display_name,
      title: review.title,
      body: review.body,
      rating: String(review.rating),
    });
    setError("");
    setMessage(`Editing review #${review.id}`);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!user) {
      onRequireLogin();
      return;
    }

    setError("");
    setMessage("");

    const isEditing = Boolean(form.id);
    const response = await fetch(
      isEditing ? `/api/reviews/${form.id}` : "/api/reviews",
      {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(form),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Review could not be saved.");
      return;
    }

    setMessage(data.message);
    setShowForm(false);
    setForm({
      ...emptyForm,
      displayName: user.username,
    });
    await loadReviews();
  }

  function renderRawHtml(value) {
    return {
      __html: value,
    };
  }

  return (
    <main className="page-shell">
      <section className="page-heading">
        <h1>Plant Reviews</h1>
        <p>
          Customer plant reviews with intentional stored XSS and edit IDOR
          training points.
        </p>
      </section>

      <section className="review-page">
        <div className="review-summary-panel">
          <div>
            <p className="review-summary-label">Customer reviews</p>
            <h2>{averageRating} out of 5</h2>
            <p>{reviews.length} total reviews</p>
          </div>

          <div className="review-actions">
            <button type="button" onClick={startReview}>
              Write a review
            </button>
            {!user && <p className="hint">Log in to write or edit a review.</p>}
          </div>
        </div>

        {showForm && user && (
          <form className="review-editor-panel" onSubmit={handleSubmit}>
            <div className="review-editor-heading">
              <h2>{form.id ? `Edit review #${form.id}` : "Write a review"}</h2>
              <button
                className="review-cancel"
                type="button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>

            {message && <p className="success">{message}</p>}
            {error && <p className="error">{error}</p>}

            <label htmlFor="review-id">Review ID</label>
            <input
              id="review-id"
              type="number"
              value={form.id}
              placeholder="Blank creates a new review"
              onChange={(event) => updateForm("id", event.target.value)}
            />
            <p className="hint">
              Training note: changing this ID before saving can target another
              user's review because the backend does not verify ownership.
            </p>

            <label htmlFor="plant-name">Plant</label>
            <select
              id="plant-name"
              value={form.plantName}
              onChange={(event) => updateForm("plantName", event.target.value)}
            >
              <option>Monstera Deliciosa</option>
              <option>Snake Plant</option>
              <option>Pothos</option>
              <option>Calathea Orbifolia</option>
              <option>ZZ Plant</option>
              <option>Fiddle Leaf Fig</option>
            </select>

            <label htmlFor="display-name">Display name</label>
            <input
              id="display-name"
              type="text"
              value={form.displayName}
              onChange={(event) => updateForm("displayName", event.target.value)}
            />

            <label htmlFor="review-title">Title</label>
            <input
              id="review-title"
              type="text"
              value={form.title}
              onChange={(event) => updateForm("title", event.target.value)}
            />

            <label htmlFor="review-body">Review</label>
            <textarea
              id="review-body"
              value={form.body}
              onChange={(event) => updateForm("body", event.target.value)}
            />

            <label htmlFor="review-rating">Rating</label>
            <select
              id="review-rating"
              value={form.rating}
              onChange={(event) => updateForm("rating", event.target.value)}
            >
              <option value="5">5 stars</option>
              <option value="4">4 stars</option>
              <option value="3">3 stars</option>
              <option value="2">2 stars</option>
              <option value="1">1 star</option>
            </select>

            <button type="submit">{form.id ? "Save edit" : "Post review"}</button>
          </form>
        )}

        <section className="review-feed" aria-label="Customer reviews">
          <div className="review-feed-heading">
            <h2>Reviews</h2>
            <span>{reviews.length} results</span>
          </div>

          {reviews.map((review) => (
            <article className="review-row" key={review.id}>
              <div className="review-row-meta">
                <span>{review.rating} stars</span>
                <span>Review #{review.id}</span>
              </div>
              <p className="review-plant">{review.plant_name}</p>

              {/* Intentionally vulnerable for the training playground:
                  dangerouslySetInnerHTML renders stored review fields as HTML.
                  Payloads such as <img src=x onerror=alert(1)> can execute
                  when the review list renders.

                  Remediation point:
                  Replace these with normal React output:
                  <h3>{review.title}</h3>
                  <p>{review.body}</p>
                  <p>{review.display_name}</p>
              */}
              <h3 dangerouslySetInnerHTML={renderRawHtml(review.title)} />
              <p dangerouslySetInnerHTML={renderRawHtml(review.body)} />
              <p>
                By{" "}
                <strong
                  dangerouslySetInnerHTML={renderRawHtml(review.display_name)}
                />
              </p>

              <button type="button" onClick={() => startEdit(review)}>
                Edit review
              </button>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}

export default Reviews;
