import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';
import api from '../api';

const Signup = () => {
  const [formData, setFormData] = useState({ 
    name: '', userName: '', email: '', mobile: '', password: '', age: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/user/signup', {
        ...formData,
        age: Number(formData.age)
      });
      if (data.success) {
        login(data.data.token, data.data.response);
        navigate('/chat');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const formFields = [
    { name: 'name', type: 'text', placeholder: 'John Doe', label: 'Full Name' },
    { name: 'userName', type: 'text', placeholder: 'johndoe123', label: 'Username' },
    { name: 'email', type: 'email', placeholder: 'john@example.com', label: 'Email Address' },
    { name: 'mobile', type: 'text', placeholder: '10 digit number', label: 'Mobile Number' },
    { name: 'password', type: 'password', placeholder: 'Min 8 chars, 1 uppercase, 1 special', label: 'Secure Password' },
    { name: 'age', type: 'number', placeholder: 'Over 13', label: 'Age' }
  ];

  return (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '2.5rem 2rem',
      backgroundColor: 'var(--color-canvas)',
      overflowY: 'auto'
    }}>
      <motion.div 
        style={{ 
          padding: '3rem 2.5rem', 
          width: '100%', 
          maxWidth: '560px',
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
            <UserPlus size={24} />
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-mute)', display: 'block' }}>
            REGISTRATION GATEWAY
          </span>
          <h2 className="heading-lg" style={{ textTransform: 'uppercase', marginTop: '0.25rem' }}>
            Create Account
          </h2>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
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
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          {formFields.map((field) => (
            <div key={field.name} style={{ gridColumn: field.name === 'password' || field.name === 'email' ? '1 / -1' : 'span 1' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '11px', fontWeight: 700, color: 'var(--color-mute)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{field.label}</label>
              <input 
                type={field.type} 
                className="input-base" 
                placeholder={field.placeholder} 
                value={formData[field.name]}
                onChange={(e) => setFormData({...formData, [field.name]: e.target.value})}
                required
              />
            </div>
          ))}
          
          <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading} 
              style={{ 
                width: '100%', 
                display: 'flex', 
                justifyContent: 'center',
                textTransform: 'uppercase',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              {loading ? <span className="spinner" style={{ borderTopColor: '#fff', width: '16px', height: '16px' }}></span> : 'Register & Join'}
            </button>
          </div>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2.5rem', fontSize: '13px', color: 'var(--color-mute)' }}>
          Already registered? <Link to="/login" style={{ color: 'var(--color-ink)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
