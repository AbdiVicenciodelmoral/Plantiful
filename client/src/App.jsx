import { useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";

function App() {
  const [screen, setScreen] = useState(() => {
    if (window.location.pathname === "/login") {
      return "login";
    }

    if (window.location.pathname === "/register") {
      return "register";
    }

    return "home";
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
    const paths = {
      home: "/",
      login: "/login",
      register: "/register",
    };
    const path = paths[screen] || "/";
    window.history.replaceState(null, "", path);
  }, [screen]);

  const activeScreen = useMemo(() => {
    if (screen === "login") {
      return "login";
    }

    if (screen === "register") {
      return "register";
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

  function showRegister() {
    setScreen("register");
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
          {activeScreen === "login" && (
            <Login onCreateAccount={showRegister} onLogin={handleLogin} />
          )}
          {activeScreen === "register" && (
            <Register onBackToLogin={showLogin} onRegister={handleLogin} />
          )}
          {activeScreen === "dashboard" && <Dashboard user={user} />}
        </>
      )}
    </>
  );
}

export default App;
