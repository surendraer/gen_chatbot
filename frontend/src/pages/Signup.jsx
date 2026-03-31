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
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <motion.div 
        className="glass-panel"
        style={{ padding: '3rem', width: '100%', maxWidth: '500px' }}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ background: 'rgba(99,102,241,0.2)', padding: '16px', borderRadius: '50%', display: 'inline-flex', color: 'var(--primary-accent)', marginBottom: '1rem' }}>
            <UserPlus size={32} />
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700 }}>Join GenBot</h2>
          <p style={{ color: 'var(--text-muted)' }}>Experience AI conversations</p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                {error}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {formFields.map((field) => (
            <div key={field.name} style={{ gridColumn: field.name === 'password' || field.name === 'email' ? '1 / -1' : 'span 1' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{field.label}</label>
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
            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              {loading ? <span className="spinner"></span> : 'Create Account'}
            </button>
          </div>
        </form>

        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary-accent)' }}>Login</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
