function Account({ onNavigate, user }) {
  return (
    <main className="page-shell">
      <section className="page-heading">
        <h1>My Account</h1>
        <p>
          Future account hub for profile edits, shopping history, class
          appointments, saved plants, and user-specific IDOR testing.
        </p>
      </section>

      <section className="account-summary">
        <p>
          <strong>Signed in as:</strong> {user?.username || "Guest"}
        </p>
        <p>
          <strong>Role:</strong> {user?.role || "none"}
        </p>
      </section>

      <section className="action-grid">
        <button className="action-tile" type="button" onClick={() => onNavigate("profile")}>
          Edit Profile
        </button>
        <button className="action-tile" type="button" onClick={() => onNavigate("orders")}>
          Shopping History
        </button>
        <button className="action-tile" type="button" onClick={() => onNavigate("favorites")}>
          Favorite Plants
        </button>
        <button className="action-tile" type="button" onClick={() => onNavigate("accountWorkshops")}>
          Workshop Appointments
        </button>
      </section>
    </main>
  );
}

export default Account;
