import React, { useContext } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Bot, LogOut, UserPlus, Sun, Moon } from 'lucide-react';

const Navbar = ({ theme, toggleTheme }) => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinkStyle = ({ isActive }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: isActive ? 'var(--color-ink)' : 'var(--color-mute)',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: isActive ? 600 : 500,
    height: '100%',
    padding: '0 8px',
    position: 'relative',
    transition: 'color var(--transition-fast)',
  });

  const activeIndicator = ({ isActive }) => 
    isActive ? (
      <span style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '2px',
        backgroundColor: 'var(--color-ink)'
      }} />
    ) : null;

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 2rem',
      height: '56px',
      flexShrink: 0,
      backgroundColor: 'var(--color-canvas)',
      borderBottom: '1px solid var(--color-hairline-soft)',
      position: 'relative',
      zIndex: 100,
      transition: 'background-color var(--transition-medium), border-color var(--transition-medium)'
    }}>
      {/* Left: Brand Logo & Title */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--color-ink)' }}>
        <Bot size={28} strokeWidth={2.5} />
        <span style={{ 
          fontFamily: 'Bebas Neue, sans-serif', 
          fontSize: '24px', 
          letterSpacing: '0.05em', 
          fontWeight: 500 
        }}>
          GENBOT
        </span>
      </Link>

      {/* Center: Navigation Links */}
      <div style={{ display: 'flex', gap: '1.5rem', height: '100%', alignItems: 'center' }}>
        {user && (
          <>
            <NavLink to="/chat" style={navLinkStyle}>
              {({ isActive }) => (
                <>
                  Chat
                  {activeIndicator({ isActive })}
                </>
              )}
            </NavLink>
            <NavLink to="/history" style={navLinkStyle}>
              {({ isActive }) => (
                <>
                  History
                  {activeIndicator({ isActive })}
                </>
              )}
            </NavLink>
            <NavLink to="/profile" style={navLinkStyle}>
              {({ isActive }) => (
                <>
                  Settings
                  {activeIndicator({ isActive })}
                </>
              )}
            </NavLink>
          </>
        )}
      </div>

      {/* Right: Theme Toggle & Authentication Actions */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            background: 'transparent',
            color: 'var(--color-ink)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: 'var(--rounded-full)',
            transition: 'background-color var(--transition-fast)'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-soft-cloud)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {user ? (
          <>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-charcoal)' }} className="hide-on-mobile">
              @{user.userName}
            </span>
            <button 
              onClick={handleLogout} 
              className="btn-secondary" 
              style={{ 
                height: '36px', 
                padding: '0 16px', 
                fontSize: '14px',
                borderRadius: 'var(--rounded-lg)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <LogOut size={14} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link 
              to="/login" 
              style={{ 
                color: 'var(--color-ink)', 
                textDecoration: 'none', 
                fontSize: '14px', 
                fontWeight: 600,
                padding: '8px 16px'
              }}
            >
              Login
            </Link>
            <Link 
              to="/signup" 
              className="btn-primary" 
              style={{ 
                height: '36px', 
                padding: '0 18px', 
                fontSize: '14px',
                borderRadius: 'var(--rounded-lg)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none'
              }}
            >
              <UserPlus size={14} /> Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
