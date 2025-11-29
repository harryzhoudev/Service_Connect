import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../pages/navbar.css';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <nav className='sc-navbar'>
      {/* Left logo + title */}
      <div className='nav-left'>
        <img
          src='/serviceConnectLogo.png'
          alt='ServiceConnect Logo'
          className='nav-logo'
        />
        <span className='nav-title'>SERVICECONNECT</span>
      </div>

      {/* Hamburger for mobile */}
      <button
        className='hamburger'
        aria-label='Toggle navigation'
        aria-expanded={open}
        onClick={() => setOpen((s) => !s)}
      >
        <span className='hamburger-bar' />
        <span className='hamburger-bar' />
        <span className='hamburger-bar' />
      </button>

      {/* Nav links */}
      <div className={`nav-links ${open ? 'open' : ''}`}>
        <NavLink to='/' end onClick={() => setOpen(false)}>
          Home
        </NavLink>

        <NavLink to='/services' onClick={() => setOpen(false)}>
          Services
        </NavLink>

        {/* Not logged in */}
        {!user && (
          <>
            <NavLink to='/login' onClick={() => setOpen(false)}>
              Login
            </NavLink>
            <NavLink to='/register' onClick={() => setOpen(false)}>
              Register
            </NavLink>
          </>
        )}

        {/* Logged in */}
        {user && (
          <>
            <NavLink to='/profile' onClick={() => setOpen(false)}>
              My Profile
            </NavLink>

            {user?.role === 'provider' && (
              <NavLink to='/dashboard' onClick={() => setOpen(false)}>
                My Services
              </NavLink>
            )}

            {/* User name styled exactly like other NavLinks */}
            <NavLink to='/dashboard' onClick={() => setOpen(false)}>
              {user?.name || user?.username}
            </NavLink>

            <button
              type='button'
              className='logout-link'
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
