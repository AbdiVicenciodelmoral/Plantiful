import { useState } from "react";

function Register({ onBackToLogin, onRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const response = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || "Account creation failed.");
      return;
    }

    onRegister(data.user);
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <h1>Create Account</h1>

        {error && <p className="error">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="new-username">Username</label>

          {/* Training note:
              This input currently allows broad username characters.
              Vulnerability introduction point: if stored usernames are later
              rendered as raw HTML, special characters can become part of a
              stored XSS lesson.
              Remediation point: validate input and keep output encoded. */}
          <input
            id="new-username"
            type="text"
            value={username}
            autoComplete="username"
            onChange={(event) => setUsername(event.target.value)}
          />

          <label htmlFor="new-password">Password</label>

          {/* Training note:
              The backend currently stores passwords in plain text.
              Remediation point: hash passwords before storage in a real app. */}
          <input
            id="new-password"
            type="password"
            value={password}
            autoComplete="new-password"
            onChange={(event) => setPassword(event.target.value)}
          />

          <button type="submit">Create account</button>
        </form>

        <button className="secondary-action" type="button" onClick={onBackToLogin}>
          Back to login
        </button>

        <p className="hint">
          This training form is intentionally permissive so account creation can
          become a future vulnerability lesson.
        </p>
      </section>
    </main>
  );
}

export default Register;
