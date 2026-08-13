function AdminDashboard({ onNavigate }) {
  return (
    <main className="page-shell admin-page">
      <section className="page-heading">
        <p className="section-eyebrow">Admin</p>
        <h1>Admin Dashboard</h1>
        <p>
          Manage users, orders, workshop registrations, plant inventory, and
          support messages. This area is intentionally useful for broken
          access-control and privilege-escalation lessons.
        </p>
      </section>

      <section className="action-grid">
        <button className="action-tile" type="button" onClick={() => onNavigate("adminUsers")}>
          Manage Users
        </button>
        <button className="action-tile" type="button" onClick={() => onNavigate("adminWorkshops")}>
          Manage Workshops
        </button>
        <button className="action-tile" type="button" onClick={() => onNavigate("adminOrders")}>
          Manage Orders
        </button>
        <button className="action-tile" type="button" onClick={() => onNavigate("adminPlants")}>
          Manage Plants
        </button>
        <button className="action-tile" type="button" onClick={() => onNavigate("adminMessages")}>
          Support Messages
        </button>
      </section>
    </main>
  );
}

export default AdminDashboard;
