function Dashboard({ user }) {
  return (
    <main className="dashboard">
      <section>
        <h1>Welcome, {user.username}</h1>
        <p>You reached this page because the server found a session cookie.</p>
      </section>

      <section className="secret-box">
        <h2>Account Details</h2>
        <p>
          <strong>User ID:</strong> {user.id}
        </p>
        <p>
          <strong>Role:</strong> {user.role}
        </p>

        {user.role === "admin" ? (
          <p className="admin-note">Admin-only inventory controls unlocked.</p>
        ) : (
          <p>Regular user access only.</p>
        )}
      </section>
    </main>
  );
}

export default Dashboard;
