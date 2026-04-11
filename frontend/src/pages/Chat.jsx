import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User as UserIcon, Mic, MicOff, Copy, Check, AlertCircle, Plus, MessageSquare, Menu, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

// ─────────────────────────────────────────────────────────────────────────────
// CopyButton — shown inside every fenced code block
// ─────────────────────────────────────────────────────────────────────────────
function CopyButton({ code }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      }).catch(() => {
        fallbackCopy(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2200);
      });
    } else {
      fallbackCopy(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  return (
    <button
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy code'}
      style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        background: copied ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.07)',
        border: copied ? '1px solid rgba(16,185,129,0.5)' : '1px solid rgba(255,255,255,0.12)',
        color: copied ? '#10b981' : '#94a3b8',
        borderRadius: '6px',
        padding: '5px 12px',
        fontSize: '0.74rem',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        transition: 'all 0.25s ease',
        zIndex: 2,
        letterSpacing: '0.03em',
        lineHeight: 1,
      }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try { document.execCommand('copy'); } catch (_) { /* ignore */ }
  document.body.removeChild(ta);
}

// ─────────────────────────────────────────────────────────────────────────────
// extractText — recursively pull text from React children
// ─────────────────────────────────────────────────────────────────────────────
function extractText(node) {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (!node) return '';
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node.props && node.props.children) return extractText(node.props.children);
  return '';
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom renderers for react-markdown v10
// ─────────────────────────────────────────────────────────────────────────────

// <pre> wraps block code — we intercept here for copy button + language badge
function PreBlock({ children, ...rest }) {
  let codeChild = children;
  if (Array.isArray(children)) codeChild = children[0];

  const className = codeChild?.props?.className || '';
  const langMatch = /language-(\w+)/.exec(className);
  const language = langMatch ? langMatch[1] : '';

  const rawCode = extractText(codeChild?.props?.children).replace(/\n$/, '');

  return (
    <div style={{ position: 'relative', margin: '14px 0' }}>
      {language && (
        <span style={{
          position: 'absolute', top: 0, left: 0, zIndex: 1,
          background: 'rgba(99,102,241,0.25)', color: '#a5b4fc',
          fontSize: '0.68rem', fontWeight: 700, padding: '3px 10px',
          borderRadius: '8px 0 8px 0', textTransform: 'uppercase',
          letterSpacing: '0.06em', userSelect: 'none',
        }}>
          {language}
        </span>
      )}
      <CopyButton code={rawCode} />
      <pre
        {...rest}
        style={{
          background: 'rgba(10,15,32,0.92)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px',
          padding: '38px 16px 16px',
          overflowX: 'auto',
          fontSize: '0.875rem',
          lineHeight: 1.65,
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(255,255,255,0.12) transparent',
          margin: 0,
          whiteSpace: 'pre',
          wordWrap: 'normal',
        }}
      >
        {children}
      </pre>
    </div>
  );
}

// Inline <code> — styled differently, no copy button
function InlineCode({ children, className, ...rest }) {
  return (
    <code
      className={className}
      style={{
        background: 'rgba(99,102,241,0.15)',
        border: '1px solid rgba(99,102,241,0.2)',
        borderRadius: '4px',
        padding: '1px 6px',
        fontSize: '0.875em',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        color: '#a5b4fc',
        whiteSpace: 'break-spaces',
      }}
      {...rest}
    >
      {children}
    </code>
  );
}

const markdownComponents = {
  pre: PreBlock,
  code: InlineCode,
};

// ─────────────────────────────────────────────────────────────────────────────
// Chat component
// ─────────────────────────────────────────────────────────────────────────────
const Chat = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Conversation states
  const [conversationsList, setConversationsList] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);

  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const [voiceSupported] = useState(
    () => !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  );

  const messagesEndRef = useRef(null);
  const loadingRef = useRef(false);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const interimTranscriptRef = useRef('');
  const isListeningRef = useRef(false);

  useEffect(() => { loadingRef.current = loading; }, [loading]);
  useEffect(() => { isListeningRef.current = isListening; }, [isListening]);

  // Handle window resize for sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    try {
      const { data } = await api.get('/prompt/history');
      if (data && data.success && Array.isArray(data.data)) {
        // Group by conversationId (processing chronologically)
        const grouped = {};
        
        data.data.forEach(p => {
          const cid = p.conversationId || p._id; // Fallback to prompt id if no conv ID
          if (!grouped[cid]) {
            grouped[cid] = {
              id: cid,
              title: p.textPrompt, // Set to FIRST prompt chronologically
              messages: [],
              createdAt: p.createdAt,
              updatedAt: p.createdAt
            };
          }
          grouped[cid].messages.push({
            prompt: p.textPrompt,
            answer: p.textAnswer,
            id: p._id,
            createdAt: p.createdAt
          });
          grouped[cid].updatedAt = p.createdAt;
        });

        // Convert to array and sort by latest activity
        const sortedList = Object.values(grouped).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setConversationsList(sortedList);
        return grouped;
      }
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load a specific conversation into view
  const loadConversation = (convId) => {
    const conv = conversationsList.find(c => c.id === convId);
    if (conv) {
      // Reconstruct messages array from the conversation's grouped messages
      const newMessages = [];
      // They are already in chronological order
      conv.messages.forEach(msg => {
        newMessages.push({ id: `user-${msg.id}`, text: msg.prompt, sender: 'user' });
        newMessages.push({ id: `bot-${msg.id}`, text: msg.answer, sender: 'bot' });
      });
      setMessages(newMessages);
      setActiveConversationId(convId);
      if (window.innerWidth <= 768) setIsSidebarOpen(false);
    }
  };

  const startNewChat = () => {
    setMessages([]);
    setActiveConversationId(null);
    setInput('');
    if (window.innerWidth <= 768) setIsSidebarOpen(false);
  };

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    const userMsg = (text || '').trim();
    if (!userMsg || loadingRef.current) return;

    let currentConvId = activeConversationId;
    if (!currentConvId) {
      currentConvId = crypto.randomUUID();
      setActiveConversationId(currentConvId);
    }

    const ts = Date.now();
    const userMsgId = ts;
    const botMsgId = ts + 1;

    // Convert current messages to history format for backend context
    const historyPayload = [];
    messages.forEach(m => {
       historyPayload.push({
           role: m.sender === 'user' ? 'user' : 'assistant',
           content: m.text
       });
    });

    setInput('');
    setVoiceTranscript('');
    setVoiceError('');
    setLoading(true);
    loadingRef.current = true;

    setMessages(prev => [
      ...prev,
      { id: userMsgId, text: userMsg, sender: 'user' },
      { id: botMsgId, text: '', sender: 'bot' },
    ]);

    try {
      const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const cleanApiUrl = rawApiUrl.replace(/\/$/, '');
      const resp = await fetch(`${cleanApiUrl}/prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ 
          prompt: userMsg, 
          conversationId: currentConvId,
          history: historyPayload 
        }),
      });

      if (!resp.ok) throw new Error('Failed to connect to AI');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let finished = false;

      while (!finished) {
        const { value, done: streamDone } = await reader.read();
        if (streamDone) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split('\n')) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') {
            finished = true;
          } else {
            try {
              const parsed = JSON.parse(payload);
              if (parsed.text) {
                setMessages(prev => prev.map(m =>
                  m.id === botMsgId ? { ...m, text: m.text + parsed.text } : m
                ));
              }
            } catch { /* partial chunk */ }
          }
        }
      }
      
      // Refresh sidebar list to show new message/conversation
      await fetchConversations();
      
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => prev.map(m =>
        m.id === botMsgId
          ? { ...m, text: 'Error: Could not get a response. Please try again.', error: true }
          : m
      ));
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [activeConversationId, messages, fetchConversations]);

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  // ── Voice input (robust Web Speech API) ──────────────────────────────────
  const createRecognition = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return null;

    const recognition = new SR();
    recognition.lang = navigator.language || 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;       
    recognition.maxAlternatives = 1;
    return recognition;
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
  }, []);

  const startListening = useCallback(() => {
    if (!voiceSupported) {
      setVoiceError('Voice input is not supported in your browser. Try Chrome or Edge.');
      return;
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }
    finalTranscriptRef.current = '';
    interimTranscriptRef.current = '';
    setVoiceTranscript('');
    setVoiceError('');

    const recognition = createRecognition();
    if (!recognition) return;
    recognitionRef.current = recognition;

    recognition.onstart = () => { setIsListening(true); setInput(''); };
    recognition.onresult = (event) => {
      let final = ''; let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) final += r[0].transcript;
        else interim += r[0].transcript;
      }
      finalTranscriptRef.current += final;
      interimTranscriptRef.current = interim;
      const display = (finalTranscriptRef.current + ' ' + interim).trim();
      setVoiceTranscript(display);
      setInput(display);
    };
    recognition.onerror = (event) => {
      if (event.error === 'no-speech') return;
      if (event.error === 'not-allowed' || event.error === 'permission-denied') setVoiceError('Microphone access denied.');
      else if (event.error === 'network') setVoiceError('Speech recognition requires an internet connection.');
      else if (event.error !== 'aborted') setVoiceError(`Voice error: ${event.error}`);
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onend = () => {
      if (isListeningRef.current) {
        try {
          recognitionRef.current = createRecognition();
          if (!recognitionRef.current) return;
          recognition.onend = null; 
          startListeningSession(recognitionRef.current);
        } catch { setIsListening(false); }
        return;
      }
      const captured = (finalTranscriptRef.current + ' ' + interimTranscriptRef.current).trim();
      setIsListening(false);
      recognitionRef.current = null;
      if (captured) setTimeout(() => sendMessage(captured), 80);
      else setVoiceTranscript('');
    };
    try { recognition.start(); } catch (err) {
      setIsListening(false); recognitionRef.current = null;
      setVoiceError('Could not start the microphone. Please try again.');
    }
  }, [voiceSupported, createRecognition, sendMessage]);

  const startListeningSession = useCallback((recognition) => {
    recognition.lang = navigator.language || 'en-US';
    recognition.interimResults = true; recognition.continuous = true; recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      let final = ''; let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }
      finalTranscriptRef.current += final; interimTranscriptRef.current = interim;
      const display = (finalTranscriptRef.current + ' ' + interim).trim();
      setVoiceTranscript(display); setInput(display);
    };
    recognition.onerror = (event) => { if (event.error !== 'no-speech' && event.error !== 'aborted') { setVoiceError(`Voice error: ${event.error}`); setIsListening(false); } };
    recognition.onend = () => {
      if (!isListeningRef.current) {
        const captured = (finalTranscriptRef.current + ' ' + interimTranscriptRef.current).trim();
        setIsListening(false); recognitionRef.current = null;
        if (captured) setTimeout(() => sendMessage(captured), 80); else setVoiceTranscript('');
      }
    };
    try { recognition.start(); } catch {}
  }, [sendMessage]);

  const toggleListening = () => {
    if (isListening) { isListeningRef.current = false; stopListening(); } 
    else { startListening(); }
  };

  useEffect(() => {
    return () => { isListeningRef.current = false; if (recognitionRef.current) { try { recognitionRef.current.abort(); } catch {} } };
  }, []);

  return (
    <div style={{ flex: 1, display: 'flex', height: '100%', overflow: 'hidden', position: 'relative', margin: 0, padding: 0 }}>
      
      {/* Sidebar Toggle Button for Mobile */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          style={{ position: 'absolute', top: '15px', left: '15px', zIndex: 10, background: 'rgba(15,23,42,0.8)', color: 'white', padding: '8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', display: window.innerWidth > 768 ? 'none' : 'block' }}
        >
          <Menu size={20} />
        </button>
      )}

      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              width: '280px',
              height: '100%',
              background: 'rgba(9, 9, 11, 0.95)',
              borderRight: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              flexDirection: 'column',
              position: window.innerWidth <= 768 ? 'absolute' : 'relative',
              zIndex: 20,
              boxShadow: window.innerWidth <= 768 ? '5px 0 15px rgba(0,0,0,0.5)' : 'none'
            }}
          >
            <div style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button 
                onClick={startNewChat}
                className="btn-primary"
                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '12px', borderRadius: '8px' }}
              >
                <Plus size={18} /> New Chat
              </button>
              {window.innerWidth <= 768 && (
                <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', color: 'var(--text-muted)', border: 'none', marginLeft: '10px', cursor: 'pointer' }}>
                  <X size={24} />
                </button>
              )}
            </div>

            <div style={{ padding: '0.5rem 1rem 0.2rem' }}>
               <h3 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Recent Chats</h3>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0 0.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {conversationsList.length === 0 ? (
                <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  No history yet. Start a new conversation!
                </div>
              ) : (
                conversationsList.map(conv => (
                  <button
                    key={conv.id}
                    onClick={() => loadConversation(conv.id)}
                    style={{
                      background: activeConversationId === conv.id ? 'rgba(99,102,241,0.15)' : 'transparent',
                      color: activeConversationId === conv.id ? 'white' : 'var(--text-muted)',
                      border: 'none',
                      padding: '12px',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={(e) => {
                      if (activeConversationId !== conv.id) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        e.currentTarget.style.color = 'white';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (activeConversationId !== conv.id) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-muted)';
                      }
                    }}
                  >
                    <MessageSquare size={16} style={{ flexShrink: 0 }} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '0.9rem', flex: 1 }}>
                      {conv.title || 'New Conversation'}
                    </span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0, position: 'relative' }}>
        
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          height: '100%', maxWidth: '900px', width: '100%',
          margin: '0 auto', padding: '1rem', paddingTop: window.innerWidth <= 768 && !isSidebarOpen ? '60px' : '1rem'
        }}>
          {/* Messages Area */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '1rem',
            display: 'flex', flexDirection: 'column', gap: '1.5rem',
            background: 'transparent',
            marginBottom: '1rem',
            scrollbarWidth: 'thin',
            scrollbarColor: 'var(--bg-content-hover) transparent',
          }}>
            {messages.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.8 }}>
                <Bot size={64} style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                <h2 style={{ fontSize: '1.8rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Hello, {user?.name?.split(' ')[0] ?? 'there'}
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>How can I help you today?</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', gap: '1rem', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row' }}
                  >
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: msg.sender === 'user' ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)', color: msg.sender === 'user' ? 'var(--primary-accent)' : 'var(--secondary-accent)' }}>
                      {msg.sender === 'user' ? <UserIcon size={20} /> : <Bot size={20} />}
                    </div>
                    <div style={{ background: msg.sender === 'user' ? 'linear-gradient(135deg, var(--primary-accent), var(--primary-hover))' : 'rgba(30,41,59,0.8)', padding: '14px 18px', borderRadius: '16px', borderTopRightRadius: msg.sender === 'user' ? '4px' : '16px', borderTopLeftRadius: msg.sender === 'bot' ? '4px' : '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.15)', color: msg.error ? 'var(--danger)' : 'white', lineHeight: 1.6, wordBreak: 'break-word', minWidth: 0, maxWidth: '100%', border: msg.sender === 'bot' ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                      {msg.sender === 'user' ? (
                        <span style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</span>
                      ) : (
                        <div className="markdown-body">
                          <ReactMarkdown components={markdownComponents}>{msg.text}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {loading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: '1rem', alignSelf: 'flex-start' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(16,185,129,0.2)', color: 'var(--secondary-accent)' }}><Bot size={20} /></div>
                <div style={{ background: 'rgba(30,41,59,0.8)', padding: '16px', borderRadius: '16px', borderTopLeftRadius: '4px' }}>
                  <span className="spinner" style={{ width: '16px', height: '16px', borderTopColor: 'var(--secondary-accent)' }} />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div style={{ position: 'relative' }}>
            {isListening && (
              <div style={{ padding: '8px 16px', marginBottom: '6px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--border-radius-sm)', fontSize: '0.9rem', color: '#f87171', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', animation: 'pulse-danger 1.5s infinite', flexShrink: 0 }} />
                {voiceTranscript ? <span style={{ fontStyle: 'italic', flex: 1 }}>"{voiceTranscript}"</span> : <span style={{ opacity: 0.8 }}>Listening… start speaking. Click mic to stop & send.</span>}
              </div>
            )}
            {voiceError && !isListening && (
              <div style={{ padding: '8px 16px', marginBottom: '6px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--border-radius-sm)', fontSize: '0.85rem', color: '#fca5a5', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <AlertCircle size={15} style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{voiceError}</span>
                <button onClick={() => setVoiceError('')} style={{ marginLeft: 'auto', background: 'none', color: '#fca5a5', fontSize: '1rem', cursor: 'pointer', flexShrink: 0 }}>✕</button>
              </div>
            )}
            <form onSubmit={handleSubmit} style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? '🎤 Listening… speak now' : 'Message GenBot...'}
                className="input-base"
                style={{ padding: '18px 24px', paddingRight: voiceSupported ? '116px' : '72px', borderRadius: 'var(--border-radius-xl)', fontSize: '1.05rem', background: 'rgba(15,23,42,0.8)', borderColor: isListening ? 'rgba(239,68,68,0.7)' : undefined, boxShadow: isListening ? '0 0 0 3px rgba(239,68,68,0.18), 0 0 20px rgba(239,68,68,0.1)' : undefined, transition: 'all 0.3s ease', width: '100%' }}
                disabled={loading}
              />
              <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                {voiceSupported && (
                  <button type="button" onClick={toggleListening} title={isListening ? 'Stop & send' : 'Speak message'} style={{ background: isListening ? 'var(--danger)' : 'rgba(255,255,255,0.05)', color: isListening ? 'white' : 'var(--text-muted)', padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s', boxShadow: isListening ? '0 0 18px rgba(239,68,68,0.55)' : 'none', animation: isListening ? 'pulse-danger 1.5s infinite' : 'none' }}>
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                )}
                <button type="submit" disabled={!input.trim() || loading} style={{ background: input.trim() && !loading ? 'var(--primary-accent)' : 'rgba(255,255,255,0.05)', color: input.trim() && !loading ? 'white' : 'var(--text-muted)', padding: '10px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed' }}>
                  <Send size={20} />
                </button>
              </div>
            </form>
            <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              GenBot can make mistakes. Consider checking important information.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
