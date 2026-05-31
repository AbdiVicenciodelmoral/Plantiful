import { useEffect, useMemo, useState } from "react";

const plants = [
  {
    name: "Monstera Deliciosa",
    description: "Bold tropical leaves for bright indoor spaces.",
    price: "$24.99",
  },
  {
    name: "Snake Plant",
    description: "Low-maintenance and perfect for beginners.",
    price: "$18.99",
  },
  {
    name: "Pothos",
    description: "A fast-growing trailing plant for shelves and desks.",
    price: "$14.99",
  },
];

function App() {
  const [screen, setScreen] = useState(() => {
    return window.location.pathname === "/login" ? "login" : "home";
  });
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    fetch("/api/me", {
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        setUser(data.user);
      })
      .finally(() => {
        setLoadingUser(false);
      });
  }, []);

  useEffect(() => {
    const path = screen === "login" ? "/login" : "/";
    window.history.replaceState(null, "", path);
  }, [screen]);

  const activeScreen = useMemo(() => {
    if (screen === "login") {
      return "login";
    }

    if (user) {
      return "dashboard";
    }

    return "home";
  }, [screen, user]);

  function showHome() {
    setScreen("home");
  }

  function showLogin() {
    setScreen("login");
  }

  async function handleLogout() {
    await fetch("/api/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    setScreen("home");
  }

  return (
    <>
      <Navbar
        user={user}
        onHome={showHome}
        onLogin={showLogin}
        onLogout={handleLogout}
      />

      {loadingUser ? (
        <main className="loading-view">Loading...</main>
      ) : (
        <>
          {activeScreen === "home" && <Home onLogin={showLogin} />}
          {activeScreen === "login" && (
            <Login
              onLogin={(nextUser) => {
                setUser(nextUser);
                setScreen("home");
              }}
            />
          )}
          {activeScreen === "dashboard" && <Dashboard user={user} />}
        </>
      )}
    </>
  );
}

function Navbar({ user, onHome, onLogin, onLogout }) {
  return (
    <nav className="navbar">
      <button className="logo" type="button" onClick={onHome}>
        Plantiful
      </button>

      <div className="nav-links">
        <button type="button" onClick={onHome}>
          Home
        </button>
        <button type="button">Plants</button>
        <button type="button">Care Guides</button>

        {user ? (
          <button className="login-btn" type="button" onClick={onLogout}>
            Logout
          </button>
        ) : (
          <button className="login-btn" type="button" onClick={onLogin}>
            Login
          </button>
        )}
      </div>
    </nav>
  );
}

function Home() {
  return (
    <>
      <section className="hero">
        <div>
          <h1>Bring Your Space to Life</h1>
          <p>Shop beautiful indoor plants, care tools, and beginner-friendly greenery.</p>

          <form className="search-box">
            <input type="text" name="q" placeholder="Search for plants..." />
            <button type="submit">Search</button>
          </form>
        </div>
      </section>

      <section className="featured">
        <h2>Featured Plants</h2>

        <div className="cards">
          {plants.map((plant) => (
            <article className="card" key={plant.name}>
              <h3>{plant.name}</h3>
              <p>{plant.description}</p>
              <span>{plant.price}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="about">
        <h2>Why Plantiful?</h2>
        <p>
          Plantiful helps new and experienced plant lovers find the right plants,
          learn care basics, and create healthier indoor spaces.
        </p>
      </section>
    </>
  );
}

function Login({ onLogin }) {
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

        <p className="hint">Training account: student / learn123</p>
      </section>
    </main>
  );
}

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

export default App;
