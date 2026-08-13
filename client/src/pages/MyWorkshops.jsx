import { useEffect, useState } from "react";

function MyWorkshops({ user, onNavigate, onRequireLogin }) {
  const [registrations, setRegistrations] = useState([]);
  const [status, setStatus] = useState("Loading workshop registrations...");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadRegistrations() {
      if (!user) {
        onRequireLogin("Please log in to view your workshop registrations.");
        return;
      }

      const response = await fetch("/api/workshop-registrations", {
        credentials: "include",
      });
      const data = await response.json();

      if (!response.ok) {
        setStatus(data.error || "Could not load workshop registrations.");
        return;
      }

      setRegistrations(data.registrations || []);
      setStatus("");
    }

    loadRegistrations();
  }, [user, onRequireLogin]);

  async function handleCancel(registrationId) {
    setMessage("");

    const response = await fetch(`/api/workshop-registrations/${registrationId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Could not cancel registration.");
      return;
    }

    setRegistrations((currentRegistrations) => {
      return currentRegistrations.filter((registration) => {
        return registration.id !== registrationId;
      });
    });
    setMessage(data.message || "Workshop registration canceled.");
  }

  if (status) {
    return (
      <main className="page-shell my-workshops-page">
        <p>{status}</p>
      </main>
    );
  }

  return (
    <main className="page-shell my-workshops-page">
      <section className="page-heading">
        <p className="section-eyebrow">My Account</p>
        <h1>My Workshops</h1>
        <p>View classes you signed up for and manage upcoming workshop seats.</p>
      </section>

      {message && <p className="success">{message}</p>}

      {registrations.length === 0 ? (
        <section className="checkout-panel">
          <p>You have not signed up for any workshops yet.</p>
          <button type="button" onClick={() => onNavigate("workshops")}>
            Browse Workshops
          </button>
        </section>
      ) : (
        <section className="my-workshops-list">
          {registrations.map((registration) => (
            <article className="my-workshop-row" key={registration.id}>
              <div>
                <p className="section-eyebrow">Registration #{registration.id}</p>
                <h2>{registration.workshop_title}</h2>
                <p>{registration.workshop_schedule}</p>
                <p>
                  Reserved for <strong>{registration.preferred_name}</strong> at{" "}
                  <strong>{registration.email}</strong>
                </p>
              </div>

              <div className="my-workshop-actions">
                <span>{registration.status}</span>
                <button
                  type="button"
                  onClick={() => handleCancel(registration.id)}
                >
                  Cancel seat
                </button>
              </div>
            </article>
          ))}
        </section>
      )}

      <aside className="training-note">
        <strong>Training surface:</strong> workshop registration IDs are exposed
        in cancellation requests. The delete endpoint intentionally does not
        check registration ownership, making this another IDOR practice area.
      </aside>
    </main>
  );
}

export default MyWorkshops;
