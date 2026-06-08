function Dashboard({ user }) {
  const welcomeMessage = `Welcome, ${user.username}`;

  return (
    <main className="dashboard">
      <section>
        {/* Intentionally vulnerable for the training playground:
            dangerouslySetInnerHTML tells React to render this string as HTML
            instead of encoded text. That means stored username characters like
            <, >, ', and " can affect the page if the browser treats them as
            markup.

            Remediation point:
            Replace this with normal React output:
            <h1>Welcome, {user.username}</h1>
            Normal React output encodes the username by default. */}
        <h1 dangerouslySetInnerHTML={{ __html: welcomeMessage }} />
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
