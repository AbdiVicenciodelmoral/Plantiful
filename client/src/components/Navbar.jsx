function Navbar({ user, onLogin, onLogout, onNavigate }) {
  return (
    <nav className="navbar">
      <button className="logo" type="button" onClick={() => onNavigate("home")}>
          <img src="../../assets/wolfsbane2.png" alt="Plantiful logo" width="22" height="22" />
          Plantiful
      </button>

      <div className="nav-links">
        <button type="button" onClick={() => onNavigate("home")}>
          Home
        </button>
        <button type="button" onClick={() => onNavigate("shop")}>
          Shop
        </button>
        <button type="button" onClick={() => onNavigate("careGuides")}>
          Care Guides
        </button>
        <button type="button" onClick={() => onNavigate("workshops")}>
          Workshops
        </button>
        <button type="button" onClick={() => onNavigate("reviews")}>
          Reviews
        </button>
        <button type="button" onClick={() => onNavigate("contact")}>
          Contact
        </button>

        {user ? (
          <>
            <button type="button" onClick={() => onNavigate("account")}>
              My Account
            </button>
            {user.role === "admin" && (
              <button type="button" onClick={() => onNavigate("admin")}>
                Admin
              </button>
            )}
            <button className="login-btn" type="button" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <button className="login-btn" type="button" onClick={onLogin}>
            Login
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
