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

export default Navbar;
