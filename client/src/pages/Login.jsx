import { useState } from "react";

function Login({ notice, onCreateAccount, onLogin, onLoginHelp }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const response = await fetch("/api/login", {
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
      setError(data.error || "Login failed.");
      return;
    }

    onLogin(data.user);
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <h1>Login</h1>

        {notice && <p className="success">{notice}</p>}
        {error && <p className="error">{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            autoComplete="username"
            onChange={(event) => setUsername(event.target.value)}
          />

          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            autoComplete="current-password"
            onChange={(event) => setPassword(event.target.value)}
          />

          <button type="submit">Log in</button>
        </form>

        <button className="secondary-action" type="button" onClick={onCreateAccount}>
          Create account
        </button>

        <button className="secondary-action" type="button" onClick={onLoginHelp}>
          Forgot username or password?
        </button>

        
      </section>
    </main>
  );
}

export default Login;
