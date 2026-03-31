import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, MessageSquare, Zap, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCTA = () => {
    if (user) {
      navigate('/chat');
    } else {
      navigate('/signup');
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 2rem', textAlign: 'center' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h1 style={{ fontSize: '4rem', fontWeight: 800, marginBottom: '1.5rem', lineHeight: 1.1 }}>
          Unlock the Power of <br />
          <span className="title-gradient">GenBot AI</span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 3rem auto', lineHeight: 1.6 }}>
          Experience the next generation of conversational AI. Fast, secure, and beautiful. Powered by Google Gemini.
        </p>

        <motion.button 
          onClick={handleCTA}
          className="btn-primary" 
          style={{ fontSize: '1.2rem', padding: '16px 40px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Sparkles /> {user ? 'Continue Chatting' : 'Start for Free'}
        </motion.button>
      </motion.div>

      <motion.div 
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem', width: '100%', maxWidth: '1000px', marginTop: '5rem' }}
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'rgba(99,102,241,0.2)', padding: '12px', borderRadius: '12px', width: 'fit-content', color: 'var(--primary-accent)' }}>
            <Zap size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem' }}>Lightning Fast</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Powered by Gemini 2.0 Flash for instant, high-quality responses.</p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'rgba(16,185,129,0.2)', padding: '12px', borderRadius: '12px', width: 'fit-content', color: 'var(--secondary-accent)' }}>
            <MessageSquare size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem' }}>Persistent History</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Access all your previous AI conversations easily from your dashboard.</p>
        </div>

        <div className="glass-panel" style={{ padding: '2rem', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'rgba(239,68,68,0.2)', padding: '12px', borderRadius: '12px', width: 'fit-content', color: 'var(--danger)' }}>
            <ShieldCheck size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem' }}>Secure & Private</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Your data is encrypted. Authenticated sessions keep your prompts safe.</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Home;
