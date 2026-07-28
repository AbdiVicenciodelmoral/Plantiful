import { useState } from "react";

function WorkshopPotting({ user, onNavigate }) {
  const [preferredName, setPreferredName] = useState(user?.username || "");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  if (!user) {
    return null;
  }

  function handleSubmit(event) {
    event.preventDefault();
    setMessage(
      `Seat request saved for ${preferredName || user.username}. Confirmation will be sent to ${email}.`
    );
  }

  return (
    <main className="page-shell">
      <button
        className="secondary-action"
        type="button"
        onClick={() => onNavigate("workshops")}
      >
        Back to workshops
      </button>

      <section className="workshop-detail">
        <div className="workshop-detail-copy">
          <p className="workshop-schedule">Every Friday</p>
          <h1>Potting Like a Master</h1>
          <p>
            Learn how to choose the right container, match plants with the best
            soil mix, loosen roots safely, and repot without stressing your
            plant. This class is built for new plant owners who want a hands-on
            routine they can repeat at home.
          </p>
          <p>
            We will cover drainage, root health, watering after repotting, and
            common mistakes that lead to yellowing leaves or soggy soil.
          </p>

          <dl className="workshop-facts">
            <div>
              <dt>Length</dt>
              <dd>90 minutes</dd>
            </div>
            <div>
              <dt>Skill level</dt>
              <dd>Beginner friendly</dd>
            </div>
            <div>
              <dt>Materials</dt>
              <dd>Soil, pots, and practice plants included</dd>
            </div>
          </dl>
        </div>

        <form className="workshop-form" onSubmit={handleSubmit}>
          <h2>Register for this class</h2>

          {message && <p className="success">{message}</p>}

          <label htmlFor="preferred-name">Name you want to be called</label>
          <input
            id="preferred-name"
            type="text"
            required
            value={preferredName}
            onChange={(event) => setPreferredName(event.target.value)}
          />

          <label htmlFor="workshop-email">Email</label>
          <input
            id="workshop-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <button type="submit">Request seat</button>
        </form>
      </section>
    </main>
  );
}

export default WorkshopPotting;
