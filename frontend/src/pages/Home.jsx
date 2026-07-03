import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
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
      {/* 1. Typographic Hero Section */}
      <div style={{
        padding: '5rem 2rem 4rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: '1px solid var(--color-hairline-soft)',
        backgroundColor: 'var(--color-canvas)',
        transition: 'background-color var(--transition-medium), border-color var(--transition-medium)'
      }}>
        <span style={{ 
          fontSize: '13px', 
          fontWeight: 700, 
          letterSpacing: '0.25em', 
          textTransform: 'uppercase',
          color: 'var(--color-mute)',
          marginBottom: '1rem',
          transition: 'color var(--transition-medium)'
        }}>
          POWERED BY LLAMA 3.3 70B & GROQ
        </span>
        <h1 className="display-campaign" style={{ 
          color: 'var(--color-ink)',
          maxWidth: '800px',
          marginBottom: '2rem',
          transition: 'color var(--transition-medium)',
          fontSize: '72px'
        }}>
          UNLOCK SPEED.<br />UNLEASH INTELLIGENCE.
        </h1>
        <button 
          onClick={handleCTA}
          className="btn-primary"
          style={{ 
            fontSize: '15px', 
            padding: '14px 36px',
            height: '48px',
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Sparkles size={16} />
          {user ? 'CONTINUE CHATTING' : 'START CHATTING NOW'}
        </button>
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
      <div 
        className="campaign-promo-banner"
        style={{
          textAlign: 'center',
          padding: '5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem'
        }}
      >
        <h2 className="display-campaign" style={{ 
          color: 'inherit', 
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
