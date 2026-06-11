function AdminDashboard({ onNavigate }) {
  return (
    <main className="page-shell">
      <section className="page-heading">
        <h1>Admin Dashboard</h1>
        <p>
          Future admin area for user management, plant catalog edits, order
          management, and support messages. This is a good place for broken
          access-control lessons.
        </p>
      </section>

      <section className="action-grid">
        <button className="action-tile" type="button" onClick={() => onNavigate("adminUsers")}>
          Manage Users
        </button>
        <button className="action-tile" type="button" onClick={() => onNavigate("adminPlants")}>
          Manage Plants
        </button>
        <button className="action-tile" type="button" onClick={() => onNavigate("adminOrders")}>
          Manage Orders
        </button>
        <button className="action-tile" type="button" onClick={() => onNavigate("adminMessages")}>
          Support Messages
        </button>
      </section>
    </main>
  );
}

export default AdminDashboard;
