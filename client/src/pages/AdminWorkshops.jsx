import { useEffect, useState } from "react";

function AdminWorkshops({ onNavigate }) {
  const [registrations, setRegistrations] = useState([]);
  const [status, setStatus] = useState("Loading workshop registrations...");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadRegistrations();
  }, []);

  async function loadRegistrations() {
    const response = await fetch("/api/admin/workshop-registrations", {
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

  async function cancelRegistration(registrationId) {
    setMessage("");

    const response = await fetch(`/api/admin/workshop-registrations/${registrationId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await response.json();

    if (!response.ok) {
      setMessage(data.error || "Could not cancel registration.");
      return;
    }

    setMessage(data.message || "Workshop registration canceled.");
    setRegistrations((currentRegistrations) =>
      currentRegistrations.filter((registration) => registration.id !== registrationId)
    );
  }

  if (status) {
    return (
      <main className="page-shell admin-page">
        <button className="text-link-button" type="button" onClick={() => onNavigate("admin")}>
          Back to admin
        </button>
        <p>{status}</p>
      </main>
    );
  }

  return (
    <main className="page-shell admin-page">
      <button className="text-link-button" type="button" onClick={() => onNavigate("admin")}>
        Back to admin
      </button>

      <section className="page-heading">
        <p className="section-eyebrow">Admin</p>
        <h1>Manage Workshops</h1>
        <p>View class registrations and cancel seats for users.</p>
      </section>

      {message && <p className="success">{message}</p>}

      <section className="admin-table">
        <div className="admin-table-head admin-workshop-row">
          <span>ID</span>
          <span>User</span>
          <span>Workshop</span>
          <span>Attendee</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {registrations.map((registration) => (
          <article className="admin-workshop-row" key={registration.id}>
            <span>{registration.id}</span>
            <strong>{registration.username}</strong>
            <span>{registration.workshop_title}</span>
            <span>{registration.preferred_name}</span>
            <span>{registration.status}</span>
            <button type="button" onClick={() => cancelRegistration(registration.id)}>
              Cancel
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}

export default AdminWorkshops;
