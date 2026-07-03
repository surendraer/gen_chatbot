// Production Launch v1.0.0 - Optimized AI Chatbot
import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogIn } from 'lucide-react';
import api from '../api';

const Login = () => {
  const [formData, setFormData] = useState({ userName: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/user/login', formData);
      if (data.success) {
        login(data.data.token, data.data.response);
        navigate('/chat');
      }
    } catch (err) {
      if (err.response?.status === 403) {
        const email = err.response.data.email;
        try {
          await api.post('/user/resend-otp', { email });
        } catch (resendErr) {
          console.error("Auto-resend OTP failed:", resendErr);
        }
        navigate(`/verify-email?email=${encodeURIComponent(email)}&fromLogin=true`);
        return;
      }
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '2rem',
      backgroundColor: 'var(--color-canvas)' 
    }}>
      <motion.div 
        style={{ 
          padding: '3rem 2.5rem', 
          width: '100%', 
          maxWidth: '440px',
          backgroundColor: 'var(--color-canvas)',
          border: '1px solid var(--color-hairline-soft)'
        }}
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            backgroundColor: 'var(--color-ink)', 
            color: 'var(--color-on-primary)', 
            padding: '14px', 
            borderRadius: 'var(--rounded-full)', 
            display: 'inline-flex', 
            marginBottom: '1rem' 
          }}>
            <LogIn size={24} />
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-mute)', display: 'block' }}>
            PORTAL ACCESS
          </span>
          <h2 className="heading-lg" style={{ textTransform: 'uppercase', marginTop: '0.25rem' }}>
            Welcome Back
          </h2>
        </div>

        {error && (
          <div style={{ 
            backgroundColor: 'rgba(211,0,5,0.05)', 
            color: 'var(--color-sale)', 
            padding: '12px', 
            border: '1px solid rgba(211,0,5,0.2)',
            fontSize: '13px', 
            textAlign: 'center', 
            marginBottom: '1.5rem',
            fontWeight: 500
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '11px', fontWeight: 700, color: 'var(--color-mute)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Username</label>
            <input 
              type="text" 
              className="input-base" 
              placeholder="Enter username" 
              value={formData.userName}
              onChange={(e) => setFormData({...formData, userName: e.target.value})}
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '11px', fontWeight: 700, color: 'var(--color-mute)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
            <input 
              type="password" 
              className="input-base" 
              placeholder="••••••••" 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading} 
            style={{ 
              marginTop: '0.5rem', 
              width: '100%', 
              display: 'flex', 
              justifyContent: 'center',
              textTransform: 'uppercase',
              fontSize: '14px',
              fontWeight: 600
            }}
          >
            {loading ? <span className="spinner" style={{ borderTopColor: '#fff', width: '16px', height: '16px' }}></span> : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '13px', color: 'var(--color-mute)' }}>
          New to GenBot? <Link to="/signup" style={{ color: 'var(--color-ink)', fontWeight: 600 }}>Create Account</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
