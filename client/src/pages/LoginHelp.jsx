import { useState } from "react";

function LoginHelp({ onBackToLogin }) {
  const [identifier, setIdentifier] = useState("");
  const [accounts, setAccounts] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setAccounts([]);

    const response = await fetch("/api/login-help", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        identifier,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "No account recovery details found.");
      return;
    }

    setMessage(data.message);
    setAccounts(data.accounts || []);
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <h1>Login Help</h1>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="identifier">Username or email</label>

          {/* Intentionally vulnerable training flow:
              The backend uses this value in a string-built SQL query.
              That makes this page useful for practicing SQL injection and
              account enumeration.

              Remediation point:
              Use parameterized SQL and return a generic recovery message. */}
          <input
            id="identifier"
            type="text"
            value={identifier}
            autoComplete="username"
            onChange={(event) => setIdentifier(event.target.value)}
          />

          <button type="submit">Recover account</button>
        </form>

        {accounts.length > 0 && (
          <div className="recovery-results">
            {accounts.map((account) => (
              <article className="recovery-card" key={account.id}>
                <h2>{account.username}</h2>
                <p>
                  <strong>Email:</strong> {account.email || "No email on file"}
                </p>
                <p>
                  <strong>Password:</strong> {account.password}
                </p>
                <p>
                  <strong>Role:</strong> {account.role}
                </p>
              </article>
            ))}
          </div>
        )}

        <button className="secondary-action" type="button" onClick={onBackToLogin}>
          Back to login
        </button>

        <p className="hint">
          This page intentionally leaks account details for security training.
        </p>
      </section>
    </main>
  );
}

export default LoginHelp;
