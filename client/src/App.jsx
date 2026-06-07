import { useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";

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

  function handleLogin(nextUser) {
    setUser(nextUser);
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
          {activeScreen === "home" && <Home />}
          {activeScreen === "login" && <Login onLogin={handleLogin} />}
          {activeScreen === "dashboard" && <Dashboard user={user} />}
        </>
      )}
    </>
  );
}

export default App;
