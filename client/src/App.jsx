import { useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Account from "./pages/Account.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import AdminOrders from "./pages/AdminOrders.jsx";
import AdminUsers from "./pages/AdminUsers.jsx";
import AdminWorkshops from "./pages/AdminWorkshops.jsx";
import CareGuides from "./pages/CareGuides.jsx";
import Cart from "./pages/Cart.jsx";
import CheckoutPayment from "./pages/CheckoutPayment.jsx";
import CheckoutReview from "./pages/CheckoutReview.jsx";
import CheckoutShipping from "./pages/CheckoutShipping.jsx";
import Contact from "./pages/Contact.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Home from "./pages/Home.jsx";
import LoginHelp from "./pages/LoginHelp.jsx";
import Login from "./pages/Login.jsx";
import MyWorkshops from "./pages/MyWorkshops.jsx";
import OrderConfirmation from "./pages/OrderConfirmation.jsx";
import Orders from "./pages/Orders.jsx";
import PlaceholderPage from "./pages/PlaceholderPage.jsx";
import PlantDetail from "./pages/PlantDetail.jsx";
import Register from "./pages/Register.jsx";
import Reviews from "./pages/Reviews.jsx";
import Shop from "./pages/Shop.jsx";
import Wishlist from "./pages/Wishlist.jsx";
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
  "/admin/workshops": "adminWorkshops",
  "/care-guides": "careGuides",
  "/cart": "cart",
  "/checkout/shipping": "checkoutShipping",
  "/checkout/payment": "checkoutPayment",
  "/checkout/review": "checkoutReview",
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

const emptyCheckoutData = {
  shipping: {
    fullName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    notes: "",
  },
  payment: {
    cardholderName: "",
    cardNumber: "",
    expiration: "",
    cvv: "",
    billingZip: "",
  },
};

function getCartCount() {
  try {
    const cartItems = JSON.parse(localStorage.getItem("plantifulCart")) || [];

    return cartItems.reduce((total, item) => {
      return total + Number(item.quantity || 0);
    }, 0);
  } catch {
    return 0;
  }
}

function getInitialRoute() {
  const plantDetailMatch = window.location.pathname.match(/^\/shop\/(\d+)$/);
  const orderMatch = window.location.pathname.match(/^\/orders\/(\d+)$/);

  if (plantDetailMatch) {
    return {
      screen: "plantDetail",
      plantId: plantDetailMatch[1],
      orderId: null,
    };
  }

  if (orderMatch) {
    return {
      screen: "orderConfirmation",
      plantId: null,
      orderId: orderMatch[1],
    };
  }

  return {
    screen: pathToScreen[window.location.pathname] || "home",
    plantId: null,
    orderId: null,
  };
}

function App() {
  const initialRoute = getInitialRoute();
  const [screen, setScreen] = useState(initialRoute.screen);
  const [selectedPlantId, setSelectedPlantId] = useState(initialRoute.plantId);
  const [selectedOrderId, setSelectedOrderId] = useState(initialRoute.orderId);
  const [checkoutData, setCheckoutData] = useState(emptyCheckoutData);
  const [cartCount, setCartCount] = useState(getCartCount);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loginNotice, setLoginNotice] = useState("");

  useEffect(() => {
    function refreshCartCount() {
      setCartCount(getCartCount());
    }

    window.addEventListener("storage", refreshCartCount);
    window.addEventListener("plantiful-cart-change", refreshCartCount);

    return () => {
      window.removeEventListener("storage", refreshCartCount);
      window.removeEventListener("plantiful-cart-change", refreshCartCount);
    };
  }, []);

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
    if (screen === "plantDetail" && selectedPlantId) {
      window.history.replaceState(null, "", `/shop/${selectedPlantId}`);
      return;
    }

    if (screen === "orderConfirmation" && selectedOrderId) {
      window.history.replaceState(null, "", `/orders/${selectedOrderId}`);
      return;
    }

    const path = screenToPath[screen] || "/";
    window.history.replaceState(null, "", path);
  }, [screen, selectedPlantId, selectedOrderId]);

  const activeScreen = useMemo(() => {
    return screen;
  }, [screen, user]);

  useEffect(() => {
    if (!loadingUser && activeScreen === "workshopPotting" && !user) {
      requireLogin("Please log in or create an account before registering for a class.");
    }
  }, [activeScreen, loadingUser, user]);

  function navigate(nextScreen, options = {}) {
    if (nextScreen === "plantDetail") {
      setSelectedPlantId(options.plantId);
    } else {
      setSelectedPlantId(null);
    }

    if (nextScreen === "orderConfirmation") {
      setSelectedOrderId(options.orderId);
    } else if (nextScreen !== "orderConfirmation") {
      setSelectedOrderId(null);
    }

    setScreen(nextScreen);
  }

  function updateCheckoutData(nextData) {
    setCheckoutData((currentData) => {
      return {
        ...currentData,
        ...nextData,
      };
    });
  }

  function handleOrderPlaced(orderId) {
    setCheckoutData(emptyCheckoutData);
    navigate("orderConfirmation", {
      orderId,
    });
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
        cartCount={cartCount}
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
            <Orders user={user} onNavigate={navigate} onRequireLogin={requireLogin} />
          )}
          {activeScreen === "accountWorkshops" && (
            <MyWorkshops user={user} onNavigate={navigate} onRequireLogin={requireLogin} />
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
            <AdminOrders onNavigate={navigate} />
          )}
          {activeScreen === "adminPlants" && (
            <PlaceholderPage
              title="Manage Plants"
              description="Future admin plant catalog editor for price tampering, stored XSS, and upload lessons."
              actions={["Add plant", "Edit price", "Upload plant image"]}
            />
          )}
          {activeScreen === "adminUsers" && (
            <AdminUsers onNavigate={navigate} />
          )}
          {activeScreen === "adminWorkshops" && (
            <AdminWorkshops onNavigate={navigate} />
          )}
          {activeScreen === "careGuides" && <CareGuides />}
          {activeScreen === "cart" && (
            <Cart user={user} onNavigate={navigate} onRequireLogin={requireLogin} />
          )}
          {activeScreen === "checkoutShipping" && (
            <CheckoutShipping
              checkoutData={checkoutData}
              onCheckoutDataChange={updateCheckoutData}
              onNavigate={navigate}
            />
          )}
          {activeScreen === "checkoutPayment" && (
            <CheckoutPayment
              checkoutData={checkoutData}
              onCheckoutDataChange={updateCheckoutData}
              onNavigate={navigate}
            />
          )}
          {activeScreen === "checkoutReview" && (
            <CheckoutReview
              checkoutData={checkoutData}
              onNavigate={navigate}
              onOrderPlaced={handleOrderPlaced}
            />
          )}
          {activeScreen === "contact" && <Contact />}
          {activeScreen === "home" && <Home />}
          {activeScreen === "favorites" && (
            <Wishlist user={user} onNavigate={navigate} onRequireLogin={requireLogin} />
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
          {activeScreen === "orderConfirmation" && (
            <OrderConfirmation orderId={selectedOrderId} onNavigate={navigate} />
          )}
          {activeScreen === "orders" && (
            <Orders user={user} onNavigate={navigate} onRequireLogin={requireLogin} />
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
          {activeScreen === "plantDetail" && (
            <PlantDetail
              plantId={selectedPlantId}
              user={user}
              onNavigate={navigate}
              onRequireLogin={requireLogin}
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





