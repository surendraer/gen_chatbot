// Production Launch v1.0.0 - Optimized AI Chatbot
import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Check, AlertCircle } from 'lucide-react';
import api from '../api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const fromLogin = searchParams.get('fromLogin') === 'true';

  const [otp, setOtp] = useState('');
  const [cooldown, setCooldown] = useState(fromLogin ? 60 : 0); // start with 60s cooldown if redirected from login (since we auto-sent code)
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState(fromLogin ? 'We automatically sent a new verification code to your email.' : '');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError('Please enter a valid 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/user/verify-otp', { email, otp });
      if (data.success) {
        login(data.data.token, data.data.response);
        navigate('/chat');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect or expired verification code.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setError('');
    setInfoMessage('');
    try {
      const { data } = await api.post('/user/resend-otp', { email });
      if (data.success) {
        setCooldown(60); // 60s cooldown limit
        setInfoMessage('A fresh verification code has been sent to your email.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    }
  };

  return (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '2rem 1.5rem',
      backgroundColor: 'var(--color-canvas)'
    }}>
      <motion.div 
        style={{ 
          padding: '2.5rem 2rem', 
          width: '100%', 
          maxWidth: '420px', 
          backgroundColor: 'var(--color-canvas)',
          border: '1px solid var(--color-hairline-soft)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
        }}
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ 
            backgroundColor: 'var(--color-ink)', 
            color: 'var(--color-on-primary)', 
            padding: '12px', 
            borderRadius: 'var(--rounded-full)', 
            display: 'inline-flex', 
            marginBottom: '0.75rem' 
          }}>
            <Check size={24} />
          </div>
          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-mute)', display: 'block' }}>
            SECURITY GATEWAY
          </span>
          <h2 className="heading-md" style={{ textTransform: 'uppercase', marginTop: '0.25rem', fontSize: '20px' }}>
            Verify Your Email
          </h2>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--color-charcoal)', textAlign: 'center', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          We sent a 6-digit verification code to <br />
          <strong style={{ color: 'var(--color-ink)' }}>{email || 'your email'}</strong>.<br />
          It will expire in 10 minutes.
        </p>

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

          {infoMessage && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ 
                backgroundColor: 'rgba(46,125,50,0.04)', 
                color: 'var(--color-success)', 
                padding: '12px', 
                border: '1px solid rgba(46,125,50,0.15)',
                fontSize: '13px', 
                textAlign: 'center', 
                marginBottom: '1.25rem',
                fontWeight: 500
              }}>
                {infoMessage}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '12px', fontWeight: 700, color: 'var(--color-mute)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verification Code</label>
            <input 
              type="text" 
              maxLength={6}
              className="input-base" 
              placeholder="123456" 
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} // numeric only
              style={{ 
                padding: '10px 16px', 
                fontSize: '20px', 
                height: '46px', 
                textAlign: 'center', 
                letterSpacing: '0.35em', 
                fontWeight: 700,
                borderRadius: 'var(--rounded-md)'
              }}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading} 
            style={{ 
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
            {loading ? <span className="spinner" style={{ borderTopColor: '#fff', width: '16px', height: '16px' }}></span> : 'Verify & Continue'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            type="button"
            onClick={handleResendOtp}
            disabled={cooldown > 0}
            style={{
              background: 'transparent',
              border: 'none',
              color: cooldown > 0 ? 'var(--color-mute)' : 'var(--color-ink)',
              fontWeight: 600,
              fontSize: '13px',
              cursor: cooldown > 0 ? 'not-allowed' : 'pointer',
              textDecoration: 'underline'
            }}
          >
            {cooldown > 0 ? `Resend Code in ${cooldown}s` : 'Resend Verification Code'}
          </button>
          <Link
            to="/login"
            style={{
              color: 'var(--color-mute)',
              fontSize: '12px',
              textDecoration: 'none'
            }}
          >
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
