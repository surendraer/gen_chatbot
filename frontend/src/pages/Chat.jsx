import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User as UserIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const Chat = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), text: userMsg, sender: 'user' }]);
    setLoading(true);

    try {
      const { data } = await api.post('/prompt/', { prompt: userMsg });
      if (data.success) {
        setMessages(prev => [...prev, { id: Date.now()+1, text: data.data.answer, sender: 'bot' }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: Date.now()+2, text: "Sorry, I encountered an error answering that query.", sender: 'bot', error: true }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '900px', width: '100%', margin: '0 auto', padding: '1rem' }}>
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        backdropFilter: 'blur(8px)',
        background: 'rgba(15,23,42,0.2)',
        borderRadius: 'var(--border-radius-lg)',
        border: '1px solid var(--glass-border)',
        marginBottom: '1rem',
        boxShadow: 'var(--glass-shadow)',
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--bg-content-hover) transparent'
      }}>
        {messages.length === 0 ? (
           <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
              <Bot size={64} style={{ marginBottom: '1rem' }} />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 500 }}>Hello, {user?.name.split(' ')[0]}</h2>
              <p>How can I help you today?</p>
           </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ 
                  display: 'flex', 
                  gap: '1rem',
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row'
                }}
              >
                <div style={{ 
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: msg.sender === 'user' ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)',
                  color: msg.sender === 'user' ? 'var(--primary-accent)' : 'var(--secondary-accent)'
                }}>
                  {msg.sender === 'user' ? <UserIcon size={20} /> : <Bot size={20} />}
                </div>
                <div style={{ 
                  background: msg.sender === 'user' ? 'linear-gradient(135deg, var(--primary-accent), var(--primary-hover))' : 'rgba(30,41,59,0.8)',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  borderTopRightRadius: msg.sender === 'user' ? '4px' : '16px',
                  borderTopLeftRadius: msg.sender === 'bot' ? '4px' : '16px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  color: msg.error ? 'var(--danger)' : 'white',
                  lineHeight: 1.6,
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.sender === 'user' ? msg.text : <ReactMarkdown className="markdown-body">{msg.text}</ReactMarkdown>}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        
        {loading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', gap: '1rem', alignSelf: 'flex-start', maxWidth: '85%' }}
          >
            <div style={{ 
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(16,185,129,0.2)', color: 'var(--secondary-accent)'
            }}><Bot size={20} /></div>
            <div style={{ background: 'rgba(30,41,59,0.8)', padding: '16px', borderRadius: '16px', borderTopLeftRadius: '4px' }}>
              <span className="spinner" style={{ width: '16px', height: '16px', borderTopColor: 'var(--secondary-accent)' }}></span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message GenBot..." 
          className="input-base"
          style={{ padding: '18px 24px', paddingRight: '60px', borderRadius: 'var(--border-radius-xl)', fontSize: '1.05rem', background: 'rgba(15, 23, 42, 0.8)' }}
          disabled={loading}
        />
        <button 
          type="submit" 
          disabled={!input.trim() || loading}
          style={{ 
            position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
            background: input.trim() && !loading ? 'var(--primary-accent)' : 'rgba(255,255,255,0.1)',
            color: 'white', padding: '10px', borderRadius: '50%', display: 'flex',
            transition: 'all 0.2s', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed'
          }}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default Chat;
