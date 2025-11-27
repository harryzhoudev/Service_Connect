import { NavLink } from "react-router-dom";
import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../pages/navbar.css";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <nav className="sc-navbar">
      <div className="nav-left">
        <img
          src="/serviceConnectLogo.png"
          alt="ServiceConnect Logo"
          className="nav-logo"
        />
        <span className="nav-title">SERVICECONNECT</span>
      </div>

      <button
        className="hamburger"
        aria-label="Toggle navigation"
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
      >
        <span className="hamburger-bar" />
        <span className="hamburger-bar" />
        <span className="hamburger-bar" />
      </button>

      <div className={`nav-links ${open ? "open" : ""}`}>
        <NavLink to="/" end onClick={() => setOpen(false)}>
          Home
        </NavLink>
        <NavLink to="/services" onClick={() => setOpen(false)}>
          Services
        </NavLink>

        {!user && (
          <>
            <NavLink to="/login" onClick={() => setOpen(false)}>
              Login
            </NavLink>
            <NavLink to="/register" onClick={() => setOpen(false)}>
              Register
            </NavLink>
          </>
        )}

        {user && (
          <>
            <NavLink to="/profile" onClick={() => setOpen(false)}>
              My Profile
            </NavLink>
            {user?.role === 'provider' && (
              <NavLink to="/dashboard" onClick={() => setOpen(false)}>
                My Services
              </NavLink>
            )}
            <span className="user-badge">{user?.name || user?.username}</span>
            <button type="button" className="logout-link" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
