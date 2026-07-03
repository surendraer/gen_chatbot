import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import heroBg from '../assets/tech_hero_bg.png';
import { Sparkles, Zap, Shield, Mic } from 'lucide-react';

const Home = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleCTA = () => {
    if (user) navigate('/chat');
    else navigate('/signup');
  };

  return (
    <div style={{ 
      backgroundColor: 'var(--color-canvas)', 
      color: 'var(--color-ink)',
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      transition: 'background-color var(--transition-medium), color var(--transition-medium)'
    }}>
      {/* 1. Campaign Hero Section */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '75vh',
        minHeight: '480px',
        backgroundImage: `url(${heroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'flex-end',
        padding: '3rem 2rem var(--space-section) 2rem',
      }}>
        {/* Dark overlay for text readability */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(to top, rgba(17,17,17,0.9) 0%, rgba(17,17,17,0.3) 60%, rgba(17,17,17,0.5) 100%)',
          zIndex: 1
        }} />

        {/* Content Box */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1200px',
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start'
        }}>
          <span style={{ 
            color: 'var(--color-on-primary)', 
            fontSize: '14px', 
            fontWeight: 700, 
            letterSpacing: '0.2em', 
            textTransform: 'uppercase',
            marginBottom: '1rem',
            opacity: 0.9
          }}>
            Powered by Llama 3.3 70B & Groq
          </span>
          <h1 className="display-campaign" style={{ 
            color: 'var(--color-on-primary)',
            maxWidth: '900px',
            marginBottom: '2rem'
          }}>
            UNLOCK SPEED.<br />UNLEASH INTELLIGENCE.
          </h1>
          <button 
            onClick={handleCTA}
            className="btn-outline-on-image"
            style={{ 
              fontSize: '16px', 
              padding: '14px 36px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Sparkles size={16} />
            {user ? 'CONTINUE CHATTING' : 'START CHATTING NOW'}
          </button>
        </div>
      </div>

      {/* 2. Feature Cards Section (Stacked below Hero, with Spacing Section) */}
      <div style={{
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: 'var(--space-section) 2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem'
      }}>
        {/* Section Title */}
        <div>
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-mute)' }}>
            CORE CAPABILITIES
          </span>
          <h2 className="heading-xl" style={{ textTransform: 'uppercase', marginTop: '0.5rem' }}>
            THE ENGINE BEHIND GENBOT
          </h2>
        </div>

        {/* 3-Up Grid of Flat Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          width: '100%'
        }}>
          {/* Card 1: Speed */}
          <div className="flat-card" style={{ 
            backgroundColor: 'var(--color-soft-cloud)', 
            padding: '2.5rem',
            transition: 'background-color var(--transition-medium), color var(--transition-medium)'
          }}>
            <div style={{ color: 'var(--color-ink)', marginBottom: '1.5rem', transition: 'color var(--transition-medium)' }}>
              <Zap size={32} strokeWidth={1.5} />
            </div>
            <h3 className="heading-md" style={{ textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Lightning Streaming
            </h3>
            <p className="caption-md" style={{ color: 'var(--color-charcoal)', lineHeight: 1.6, transition: 'color var(--transition-medium)' }}>
              Experience instant response times powered by Groq's high-speed inference engine. Token-by-token streaming delivers answers with zero buffering lag.
            </p>
          </div>

          {/* Card 2: Secure History */}
          <div className="flat-card" style={{ 
            backgroundColor: 'var(--color-soft-cloud)', 
            padding: '2.5rem',
            transition: 'background-color var(--transition-medium), color var(--transition-medium)'
          }}>
            <div style={{ color: 'var(--color-ink)', marginBottom: '1.5rem', transition: 'color var(--transition-medium)' }}>
              <Shield size={32} strokeWidth={1.5} />
            </div>
            <h3 className="heading-md" style={{ textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Secure Persistence
            </h3>
            <p className="caption-md" style={{ color: 'var(--color-charcoal)', lineHeight: 1.6, transition: 'color var(--transition-medium)' }}>
              All chats are securely stored and tied to your private account. Access comprehensive multi-turn dialogue histories across all device sessions.
            </p>
          </div>

          {/* Card 3: Voice input */}
          <div className="flat-card" style={{ 
            backgroundColor: 'var(--color-soft-cloud)', 
            padding: '2.5rem',
            transition: 'background-color var(--transition-medium), color var(--transition-medium)'
          }}>
            <div style={{ color: 'var(--color-ink)', marginBottom: '1.5rem', transition: 'color var(--transition-medium)' }}>
              <Mic size={32} strokeWidth={1.5} />
            </div>
            <h3 className="heading-md" style={{ textTransform: 'uppercase', marginBottom: '0.75rem' }}>
              Interactive Voice
            </h3>
            <p className="caption-md" style={{ color: 'var(--color-charcoal)', lineHeight: 1.6, transition: 'color var(--transition-medium)' }}>
              Engage hands-free. Native speech recognition turns voice input into text instantly. Visual indicators provide real-time audio loop feedback.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Secondary Campaign CTA Block (Stacked at Spacing Section) */}
      <div style={{
        backgroundColor: 'var(--color-ink)',
        color: 'var(--color-on-primary)',
        textAlign: 'center',
        padding: '5rem 2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2rem',
        transition: 'background-color var(--transition-medium), color var(--transition-medium)'
      }}>
        <h2 className="display-campaign" style={{ 
          color: 'var(--color-on-primary)', 
          fontSize: '48px',
          maxWidth: '800px',
          margin: 0
        }}>
          TALK TO THE FUTURE.<br />IT RESPONDS IN REAL-TIME.
        </h2>
        <button 
          onClick={handleCTA} 
          className="btn-secondary"
          style={{ 
            backgroundColor: 'var(--color-canvas)', 
            color: 'var(--color-ink)',
            fontWeight: 600,
            padding: '16px 40px',
            fontSize: '15px',
            transition: 'background-color var(--transition-medium), color var(--transition-medium)'
          }}
        >
          EXPERIENCE GENBOT
        </button>
      </div>

      {/* 5. Minimal Footer */}
      <footer style={{
        borderTop: '1px solid var(--color-hairline-soft)',
        padding: '2rem',
        textAlign: 'center',
        backgroundColor: 'var(--color-canvas)',
        marginTop: 'auto',
        transition: 'background-color var(--transition-medium), border-color var(--transition-medium)'
      }}>
        <p className="caption-sm" style={{ color: 'var(--color-mute)', transition: 'color var(--transition-medium)' }}>
          © {new Date().getFullYear()} GENBOT. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
};

export default Home;
