// Production Launch v1.0.0 - Optimized AI Chatbot
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Check, X, AlertCircle } from 'lucide-react';
import api from '../api';

const Signup = () => {
  const [formData, setFormData] = useState({ 
    name: '', userName: '', email: '', mobile: '', password: '' 
  });
  const [countryCode, setCountryCode] = useState('+91');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Username validation states
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, message: '' });
  const usernameDebounceRef = useRef(null);

  // Password requirements check states
  const [passwordReqs, setPasswordReqs] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  // Debounced Username availability check
  useEffect(() => {
    if (usernameDebounceRef.current) {
      clearTimeout(usernameDebounceRef.current);
    }

    const cleanUsername = formData.userName.trim();
    if (!cleanUsername || cleanUsername.length < 3) {
      setUsernameStatus({ checking: false, available: null, message: '' });
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUsername)) {
      setUsernameStatus({ checking: false, available: false, message: 'Invalid format (3-20 chars, letters/nums/_ only)' });
      return;
    }

    setUsernameStatus({ checking: true, available: null, message: 'Checking availability...' });

    usernameDebounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get(`/user/check-username/${cleanUsername}`);
        if (data.success) {
          setUsernameStatus({
            checking: false,
            available: data.available,
            message: data.message
          });
        }
      } catch (err) {
        setUsernameStatus({ checking: false, available: null, message: '' });
      }
    }, 500);

    return () => clearTimeout(usernameDebounceRef.current);
  }, [formData.userName]);

  // Live password requirements validation
  useEffect(() => {
    const pwd = formData.password;
    setPasswordReqs({
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd)
    });
  }, [formData.password]);

  const handleMobileChange = (e) => {
    const val = e.target.value.replace(/\D/g, ''); // Enforce only digits
    if (val.length <= 10) {
      setFormData({ ...formData, mobile: val });
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Pre-submit validations
    if (formData.mobile.length !== 10) {
      setError('Mobile number must be exactly 10 digits.');
      return;
    }

    if (usernameStatus.available === false) {
      setError('Selected username is already taken.');
      return;
    }

    const allPasswordRequirementsMet = Object.values(passwordReqs).every(req => req);
    if (!allPasswordRequirementsMet) {
      setError('Password does not satisfy all specifications.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/user/signup', formData);
      if (data.success) {
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const countries = [
    { code: '+91', label: 'IN (+91)' },
    { code: '+1', label: 'US/CA (+1)' },
    { code: '+44', label: 'UK (+44)' },
    { code: '+81', label: 'JP (+81)' },
    { code: '+61', label: 'AU (+61)' }
  ];

  const ReqItem = ({ met, label }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: met ? 'var(--color-success)' : 'var(--color-mute)' }}>
      {met ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={3} style={{ color: 'var(--color-sale)' }} />}
      <span>{label}</span>
    </div>
  );

  return (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '2rem 1.5rem',
      backgroundColor: 'var(--color-canvas)',
      overflowY: 'auto'
    }}>
      <motion.div 
        style={{ 
          padding: '2rem 2.5rem', 
          width: '100%', 
          maxWidth: '680px',
          backgroundColor: 'var(--color-canvas)',
          border: '1px solid var(--color-hairline-soft)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
        }}
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{ 
            backgroundColor: 'var(--color-ink)', 
            color: 'var(--color-on-primary)', 
            padding: '12px', 
            borderRadius: 'var(--rounded-full)', 
            display: 'inline-flex', 
            marginBottom: '0.75rem' 
          }}>
            <UserPlus size={24} />
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-mute)', display: 'block' }}>
            REGISTRATION GATEWAY
          </span>
          <h2 className="heading-md" style={{ textTransform: 'uppercase', marginTop: '0.25rem', fontSize: '20px' }}>
            Create Account
          </h2>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ 
                backgroundColor: 'rgba(211,0,5,0.04)', 
                color: 'var(--color-sale)', 
                padding: '12px', 
                border: '1px solid rgba(211,0,5,0.15)',
                fontSize: '13px', 
                textAlign: 'center', 
                marginBottom: '1.25rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
            gap: '1.25rem' 
          }}>
            {/* Full Name */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '12px', fontWeight: 700, color: 'var(--color-mute)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
              <input 
                type="text" 
                className="input-base" 
                placeholder="John Doe" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                style={{ padding: '10px 16px', fontSize: '14px', height: '40px' }}
                required
              />
            </div>

            {/* Username */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '12px', fontWeight: 700, color: 'var(--color-mute)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Username</label>
              <input 
                type="text" 
                className="input-base" 
                placeholder="johndoe123" 
                value={formData.userName}
                onChange={(e) => setFormData({...formData, userName: e.target.value})}
                style={{ 
                  padding: '10px 16px', 
                  fontSize: '14px', 
                  height: '40px',
                  borderColor: usernameStatus.available === true ? 'var(--color-success)' : usernameStatus.available === false ? 'var(--color-sale)' : 'transparent'
                }}
                required
              />
              {usernameStatus.message && (
                <span style={{ 
                  fontSize: '11px', 
                  display: 'block', 
                  marginTop: '4px',
                  fontWeight: 500,
                  color: usernameStatus.available === true ? 'var(--color-success)' : usernameStatus.available === false ? 'var(--color-sale)' : 'var(--color-mute)'
                }}>
                  {usernameStatus.message}
                </span>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '12px', fontWeight: 700, color: 'var(--color-mute)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address</label>
              <input 
                type="email" 
                className="input-base" 
                placeholder="john@example.com" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={{ padding: '10px 16px', fontSize: '14px', height: '40px' }}
                required
              />
            </div>

            {/* Mobile Phone */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '12px', fontWeight: 700, color: 'var(--color-mute)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mobile Phone</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  style={{
                    width: '100px',
                    height: '40px',
                    backgroundColor: 'var(--color-soft-cloud)',
                    border: '1px solid transparent',
                    borderRadius: 'var(--rounded-md)',
                    color: 'var(--color-ink)',
                    fontSize: '13px',
                    fontWeight: 600,
                    padding: '0 8px',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {countries.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
                </select>
                <input 
                  type="text" 
                  className="input-base" 
                  placeholder="10-digit number" 
                  value={formData.mobile}
                  onChange={handleMobileChange}
                  style={{ padding: '10px 16px', fontSize: '14px', height: '40px', flex: 1 }}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '12px', fontWeight: 700, color: 'var(--color-mute)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              <input 
                type="password" 
                className="input-base" 
                placeholder="••••••••" 
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                style={{ padding: '10px 16px', fontSize: '14px', height: '40px' }}
                required
              />
            </div>

            {/* Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {formData.password.length > 0 ? (
                <div style={{ 
                  padding: '10px 14px', 
                  backgroundColor: 'var(--color-soft-cloud)', 
                  border: '1px solid var(--color-hairline-soft)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  borderRadius: 'var(--rounded-md)'
                }}>
                  <ReqItem met={passwordReqs.length} label="Min 8 characters" />
                  <ReqItem met={passwordReqs.uppercase} label="At least 1 uppercase letter" />
                  <ReqItem met={passwordReqs.lowercase} label="At least 1 lowercase letter" />
                  <ReqItem met={passwordReqs.number} label="At least 1 number" />
                  <ReqItem met={passwordReqs.special} label="At least 1 special character" />
                </div>
              ) : (
                <div style={{ 
                  fontSize: '12px', 
                  color: 'var(--color-mute)', 
                  fontStyle: 'italic', 
                  textAlign: 'center', 
                  padding: '12px', 
                  border: '1px dashed var(--color-hairline-soft)',
                  borderRadius: 'var(--rounded-md)'
                }}>
                  Enter password to check requirements
                </div>
              )}
            </div>
          </div>
          
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading} 
            style={{ 
              marginTop: '0.5rem', 
              width: '100%', 
              height: '42px',
              display: 'flex', 
              justifyContent: 'center',
              textTransform: 'uppercase',
              fontSize: '14px',
              fontWeight: 600,
              borderRadius: 'var(--rounded-md)'
            }}
          >
            {loading ? <span className="spinner" style={{ borderTopColor: '#fff', width: '16px', height: '16px' }}></span> : 'Register & Join'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '13px', color: 'var(--color-mute)' }}>
          Already registered? <Link to="/login" style={{ color: 'var(--color-ink)', fontWeight: 600 }}>Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
