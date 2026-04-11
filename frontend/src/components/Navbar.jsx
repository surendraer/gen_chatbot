import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Bot, LogIn, UserPlus, LogOut, MessageSquare, Clock, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0 2rem',
      height: '60px',
      flexShrink: 0,
      background: 'rgba(15, 23, 42, 0.4)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      position: 'relative',
      zIndex: 100
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: 'bold' }}>
        <Bot size={32} color="var(--primary-accent)" />
        <span className="title-gradient">GenBot</span>
      </Link>
      
      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {user ? (
          <>
            <Link to="/chat" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
              <MessageSquare size={18} /> Chat
            </Link>
            <Link to="/history" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
              <Clock size={18} /> History
            </Link>
            <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}>
              <User size={18} /> {user.userName}
            </Link>
            <button onClick={handleLogout} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '8px 16px' }}>
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '8px 16px' }}>
              <LogIn size={16} /> Login
            </Link>
            <Link to="/signup" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '8px 16px' }}>
              <UserPlus size={16} /> Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
