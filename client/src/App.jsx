import { useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Account from "./pages/Account.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import CareGuides from "./pages/CareGuides.jsx";
import Contact from "./pages/Contact.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Home from "./pages/Home.jsx";
import LoginHelp from "./pages/LoginHelp.jsx";
import Login from "./pages/Login.jsx";
import PlaceholderPage from "./pages/PlaceholderPage.jsx";
import Register from "./pages/Register.jsx";
import Reviews from "./pages/Reviews.jsx";
import Shop from "./pages/Shop.jsx";
import WorkshopPotting from "./pages/WorkshopPotting.jsx";
import Workshops from "./pages/Workshops.jsx";

const pathToScreen = {
  "/": "home",
  "/account": "account",
  "/account/orders": "accountOrders",
  "/account/profile": "profile",
  "/account/workshops": "accountWorkshops",
  "/admin": "admin",
  "/admin/messages": "adminMessages",
  "/admin/orders": "adminOrders",
  "/admin/plants": "adminPlants",
  "/admin/users": "adminUsers",
  "/care-guides": "careGuides",
  "/cart": "cart",
  "/contact": "contact",
  "/dashboard": "dashboard",
  "/favorites": "favorites",
  "/login": "login",
  "/login-help": "loginHelp",
  "/orders": "orders",
  "/register": "register",
  "/reviews": "reviews",
  "/shop": "shop",
  "/workshops/potting-like-a-master": "workshopPotting",
  "/workshops": "workshops",
};

const screenToPath = Object.fromEntries(
  Object.entries(pathToScreen).map(([path, screen]) => [screen, path])
);

function App() {
  const [screen, setScreen] = useState(() => {
    return pathToScreen[window.location.pathname] || "home";
  });
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loginNotice, setLoginNotice] = useState("");

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
    const path = screenToPath[screen] || "/";
    window.history.replaceState(null, "", path);
  }, [screen]);

  const activeScreen = useMemo(() => {
    return screen;
  }, [screen, user]);

  useEffect(() => {
    if (!loadingUser && activeScreen === "workshopPotting" && !user) {
      requireLogin("Please log in or create an account before registering for a class.");
    }
  }, [activeScreen, loadingUser, user]);

  function navigate(nextScreen) {
    setScreen(nextScreen);
  }

  function showLogin() {
    setLoginNotice("");
    setScreen("login");
  }

  function showRegister() {
    setLoginNotice("");
    setScreen("register");
  }

  function showLoginHelp() {
    setLoginNotice("");
    setScreen("loginHelp");
  }

  function requireLogin(message) {
    setLoginNotice(message);
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
    setLoginNotice("");
    setScreen("dashboard");
  }

  function handleRegisterSuccess(message) {
    setLoginNotice(message);
    setScreen("login");
  }

  return (
    <>
      <Navbar
        user={user}
        onNavigate={navigate}
        onLogin={showLogin}
        onLogout={handleLogout}
      />

      {loadingUser ? (
        <main className="loading-view">Loading...</main>
      ) : (
        <>
          {activeScreen === "account" && <Account onNavigate={navigate} user={user} />}
          {activeScreen === "accountOrders" && (
            <PlaceholderPage
              title="Shopping History"
              description="Future order history, invoices, shipment status, and IDOR testing area."
              actions={["View order details", "Download invoice", "Report missing plant"]}
            />
          )}
          {activeScreen === "accountWorkshops" && (
            <PlaceholderPage
              title="My Workshops"
              description="Future class registrations, appointment changes, and workshop IDOR testing area."
              actions={["View signup", "Cancel appointment", "Change attendee"]}
            />
          )}
          {activeScreen === "admin" && <AdminDashboard onNavigate={navigate} />}
          {activeScreen === "adminMessages" && (
            <PlaceholderPage
              title="Support Messages"
              description="Future admin view for contact form submissions and stored support-message XSS tests."
              actions={["Open message", "Assign ticket", "Reply as support"]}
            />
          )}
          {activeScreen === "adminOrders" && (
            <PlaceholderPage
              title="Manage Orders"
              description="Future admin order management and broken access-control testing area."
              actions={["Edit order", "Refund order", "Change order owner"]}
            />
          )}
          {activeScreen === "adminPlants" && (
            <PlaceholderPage
              title="Manage Plants"
              description="Future admin plant catalog editor for price tampering, stored XSS, and upload lessons."
              actions={["Add plant", "Edit price", "Upload plant image"]}
            />
          )}
          {activeScreen === "adminUsers" && (
            <PlaceholderPage
              title="Manage Users"
              description="Future admin user controls for role tampering, user deletion, and IDOR practice."
              actions={["Edit user", "Delete user", "Change role"]}
            />
          )}
          {activeScreen === "careGuides" && <CareGuides />}
          {activeScreen === "cart" && (
            <PlaceholderPage
              title="Cart"
              description="Future cart page for quantity abuse, price tampering, and checkout workflow tests."
              actions={["Update quantity", "Apply coupon", "Checkout"]}
            />
          )}
          {activeScreen === "contact" && <Contact />}
          {activeScreen === "home" && <Home />}
          {activeScreen === "favorites" && (
            <PlaceholderPage
              title="Favorite Plants"
              description="Future saved plants page for IDOR testing around favorite IDs and user ownership."
              actions={["Remove favorite", "Move to cart", "Share list"]}
            />
          )}
          {activeScreen === "login" && (
            <Login
              notice={loginNotice}
              onCreateAccount={showRegister}
              onLoginHelp={showLoginHelp}
              onLogin={handleLogin}
            />
          )}
          {activeScreen === "loginHelp" && <LoginHelp onBackToLogin={showLogin} />}
          {activeScreen === "orders" && (
            <PlaceholderPage
              title="Orders"
              description="Future order list for shopping history, order details, and IDOR practice."
              actions={["View order", "Track shipment", "Request refund"]}
            />
          )}
          {activeScreen === "profile" && (
            <PlaceholderPage
              title="Edit Profile"
              description="Future profile editor for stored XSS, mass assignment, and role tampering lessons."
              actions={["Save profile", "Upload avatar", "Change email"]}
            />
          )}
          {activeScreen === "register" && (
            <Register
              onBackToLogin={showLogin}
              onRegisterSuccess={handleRegisterSuccess}
            />
          )}
          {activeScreen === "reviews" && (
            <Reviews
              user={user}
              onRequireLogin={() =>
                requireLogin("Please log in or create an account before writing a review.")
              }
            />
          )}
          {activeScreen === "shop" && <Shop />}
          {activeScreen === "workshopPotting" && (
            <WorkshopPotting user={user} onNavigate={navigate} />
          )}
          {activeScreen === "workshops" && (
            <Workshops
              user={user}
              onNavigate={navigate}
              onRequireLogin={requireLogin}
            />
          )}
          {activeScreen === "dashboard" && <Dashboard user={user} />}
        </>
      )}
    </>
  );
}

export default App;
