import React, { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User as UserIcon, Mic, MicOff, Copy, Check, AlertCircle, Plus, MessageSquare, Menu, X, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

// ─────────────────────────────────────────────────────────────────────────────
// CopyButton — shown inside every fenced code block
// ─────────────────────────────────────────────────────────────────────────────
function CopyButton({ code }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => {
        fallbackCopy(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    } else {
      fallbackCopy(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy code'}
      className="btn-secondary"
      style={{
        position: 'absolute',
        top: '8px',
        right: '8px',
        height: '28px',
        padding: '0 10px',
        fontSize: '11px',
        fontWeight: 600,
        borderRadius: 'var(--rounded-sm)',
        backgroundColor: copied ? 'var(--color-success)' : 'var(--color-canvas)',
        color: copied ? 'var(--color-on-primary)' : 'var(--color-ink)',
        zIndex: 2,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        border: '1px solid var(--color-hairline)',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}
    >
      {copied ? <Check size={11} /> : <Copy size={11} />}
      {copied ? 'Copied' : 'Copy'}
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
// Custom renderers for react-markdown
// ─────────────────────────────────────────────────────────────────────────────
function PreBlock({ children, ...rest }) {
  let codeChild = children;
  if (Array.isArray(children)) codeChild = children[0];

  const className = codeChild?.props?.className || '';
  const langMatch = /language-(\w+)/.exec(className);
  const language = langMatch ? langMatch[1] : '';

  const rawCode = extractText(codeChild?.props?.children).replace(/\n$/, '');

  return (
    <div style={{ position: 'relative', margin: '18px 0' }}>
      {language && (
        <span style={{
          position: 'absolute', top: 0, left: 0, zIndex: 1,
          background: 'var(--color-ink)', color: 'var(--color-on-primary)',
          fontSize: '10px', fontWeight: 700, padding: '3px 10px',
          textTransform: 'uppercase',
          letterSpacing: '0.08em', userSelect: 'none',
          borderBottomRightRadius: 'var(--rounded-sm)',
          borderRight: '1px solid var(--color-hairline-soft)',
          borderBottom: '1px solid var(--color-hairline-soft)',
        }}>
          {language}
        </span>
      )}
      <CopyButton code={rawCode} />
      <pre
        {...rest}
        style={{
          background: '#0a0a0a',
          border: '1px solid var(--color-hairline)',
          borderRadius: 'var(--rounded-none)',
          padding: '40px 16px 16px',
          overflowX: 'auto',
          fontSize: '13px',
          lineHeight: 1.6,
          color: '#f5f5f5',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          margin: 0,
          whiteSpace: 'pre',
        }}
      >
        {children}
      </pre>
    </div>
  );
}

function InlineCode({ children, className, ...rest }) {
  return (
    <code
      className={className}
      style={{
        background: 'var(--color-soft-cloud)',
        border: '1px solid var(--color-hairline-soft)',
        borderRadius: '4px',
        padding: '2px 6px',
        fontSize: '14px',
        fontWeight: 600,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        color: 'var(--color-ink)',
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
        // Group by conversationId
        const grouped = {};
        
        data.data.forEach(p => {
          const cid = p.conversationId || p._id;
          if (!grouped[cid]) {
            grouped[cid] = {
              id: cid,
              title: p.textPrompt,
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
      const newMessages = [];
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
      let buffer = '';
      let finished = false;

      while (!finished) {
        const { value, done: streamDone } = await reader.read();
        if (streamDone) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // Save the last line if it is incomplete
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          if (!trimmed.startsWith('data: ')) continue;
          
          const payload = trimmed.slice(6).trim();
          if (payload === '[DONE]') {
            finished = true;
            break;
          } else {
            try {
              const parsed = JSON.parse(payload);
              if (parsed.text) {
                setMessages(prev => prev.map(m =>
                  m.id === botMsgId ? { ...m, text: m.text + parsed.text } : m
                ));
              }
            } catch (e) {
              console.warn("Parse error for partial line:", trimmed, e);
            }
          }
        }
      }
      
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

  // ── Robust continuous voice recognition loop ──────────────────────────────────
  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
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
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = navigator.language || 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    finalTranscriptRef.current = '';
    interimTranscriptRef.current = '';
    setVoiceTranscript('');
    setVoiceError('');
    setIsListening(true);
    isListeningRef.current = true;

    recognition.onstart = () => {
      setInput('');
    };

    recognition.onresult = (event) => {
      let final = '';
      let interim = '';
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
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        setVoiceError('Microphone access denied.');
      } else if (event.error === 'network') {
        setVoiceError('Speech recognition requires an internet connection.');
      } else {
        setVoiceError(`Voice error: ${event.error}`);
      }
      setIsListening(false);
      isListeningRef.current = false;
    };

    recognition.onend = () => {
      if (isListeningRef.current) {
        try {
          recognition.start(); // Auto-restart to enable continuous input
        } catch {
          setIsListening(false);
          isListeningRef.current = false;
        }
      } else {
        const captured = (finalTranscriptRef.current + ' ' + interimTranscriptRef.current).trim();
        setIsListening(false);
        if (captured) {
          setTimeout(() => sendMessage(captured), 80);
        } else {
          setVoiceTranscript('');
        }
      }
    };

    try {
      recognition.start();
    } catch (err) {
      setIsListening(false);
      isListeningRef.current = false;
      setVoiceError('Could not start the microphone. Please try again.');
    }
  }, [voiceSupported, sendMessage]);

  const toggleListening = () => {
    if (isListening) stopListening();
    else startListening();
  };

  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, []);

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', position: 'relative', backgroundColor: 'var(--color-canvas)' }}>
      
      {/* Sidebar Toggle Button for Mobile */}
      {!isSidebarOpen && (
        <button 
          onClick={() => setIsSidebarOpen(true)}
          style={{ 
            position: 'absolute', 
            top: '15px', 
            left: '15px', 
            zIndex: 10, 
            background: 'var(--color-ink)', 
            color: 'var(--color-on-primary)', 
            padding: '8px', 
            borderRadius: 'var(--rounded-full)', 
            border: 'none', 
            cursor: 'pointer', 
            display: window.innerWidth > 768 ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Menu size={18} />
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
              minWidth: '280px',
              height: '100%',
              backgroundColor: 'var(--color-soft-cloud)',
              borderRight: '1px solid var(--color-hairline-soft)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              position: window.innerWidth <= 768 ? 'absolute' : 'relative',
              zIndex: 20,
              boxShadow: window.innerWidth <= 768 ? '4px 0 20px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            {/* Sidebar Header */}
            <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-hairline-soft)' }}>
              <button 
                onClick={startNewChat}
                className="btn-primary"
                style={{ flex: 1, height: '40px', fontSize: '14px', borderRadius: 'var(--rounded-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
              >
                <Plus size={16} /> NEW CHAT
              </button>
              {window.innerWidth <= 768 && (
                <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'none', color: 'var(--color-ink)', border: 'none', marginLeft: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  <ArrowLeft size={20} />
                </button>
              )}
            </div>

            {/* Sidebar Title */}
            <div style={{ padding: '1.25rem 1.25rem 0.5rem' }}>
               <h3 className="caption-sm" style={{ fontWeight: 700, color: 'var(--color-ink)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Recent Chats</h3>
            </div>

            {/* Sidebar Chat List */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 0.75rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {conversationsList.length === 0 ? (
                <div className="caption-md" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                  No history yet. Start a conversation!
                </div>
              ) : (
                conversationsList.map(conv => {
                  const isActive = activeConversationId === conv.id;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => loadConversation(conv.id)}
                      style={{
                        background: isActive ? 'var(--color-canvas)' : 'transparent',
                        color: 'var(--color-ink)',
                        border: 'none',
                        borderLeft: isActive ? '3px solid var(--color-ink)' : '3px solid transparent',
                        padding: '10px 12px',
                        borderRadius: '0px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all var(--transition-fast)',
                      }}
                      onMouseOver={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'var(--color-translucent-hover)';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = 'transparent';
                        }
                      }}
                    >
                      <MessageSquare size={14} style={{ flexShrink: 0, opacity: isActive ? 1 : 0.6 }} />
                      <span className="body-strong" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: '13px', flex: 1, fontWeight: isActive ? 600 : 400 }}>
                        {conv.title || 'New Conversation'}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0, overflow: 'hidden', backgroundColor: 'var(--color-canvas)' }}>
        
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          height: '100%', width: '100%',
          padding: '1.5rem 2rem', paddingTop: window.innerWidth <= 768 && !isSidebarOpen ? '60px' : '1.5rem',
          overflow: 'hidden',
          maxWidth: '960px',
          margin: '0 auto'
        }}>
          {/* Messages Area */}
          <div style={{
            flex: 1, overflowY: 'auto', paddingRight: '6px',
            display: 'flex', flexDirection: 'column', gap: '1.5rem',
            background: 'transparent',
            marginBottom: '1rem',
          }}>
            {messages.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Bot size={48} strokeWidth={1.5} style={{ marginBottom: '1.5rem', color: 'var(--color-ink)' }} />
                <h1 className="heading-xl" style={{ textTransform: 'uppercase', marginBottom: '0.5rem', textAlign: 'center' }}>
                  Hello, {user?.name?.split(' ')[0] ?? 'there'}
                </h1>
                <p className="caption-md" style={{ textAlign: 'center' }}>How can I assist you with your project today?</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                      style={{ 
                        display: 'flex', 
                        gap: '0.75rem', 
                        alignSelf: isUser ? 'flex-end' : 'flex-start', 
                        maxWidth: '85%', 
                        flexDirection: isUser ? 'row-reverse' : 'row',
                        alignItems: 'flex-start'
                      }}
                    >
                      {/* Avatar */}
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        borderRadius: 'var(--rounded-full)', 
                        flexShrink: 0, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        background: isUser ? 'var(--color-ink)' : 'var(--color-soft-cloud)', 
                        color: isUser ? 'var(--color-on-primary)' : 'var(--color-ink)',
                        border: isUser ? 'none' : '1px solid var(--color-hairline-soft)'
                      }}>
                        {isUser ? <UserIcon size={16} /> : <Bot size={16} />}
                      </div>

                      {/* Bubble content */}
                      <div style={{ 
                        backgroundColor: isUser ? 'var(--color-ink)' : 'var(--color-soft-cloud)', 
                        padding: '16px 20px', 
                        borderRadius: isUser ? '20px' : '0px', // Flat 0 border radius for bot card
                        borderTopRightRadius: isUser ? '4px' : '0px',
                        borderTopLeftRadius: isUser ? '20px' : '0px',
                        color: isUser ? 'var(--color-on-primary)' : 'var(--color-ink)', 
                        lineHeight: 1.6, 
                        wordBreak: 'break-word', 
                        minWidth: 0, 
                        maxWidth: '100%',
                        border: isUser ? 'none' : '1px solid var(--color-hairline-soft)'
                      }}>
                        {isUser ? (
                          <span style={{ whiteSpace: 'pre-wrap', fontSize: '15px' }}>{msg.text}</span>
                        ) : (
                          <div className="markdown-body">
                            <ReactMarkdown components={markdownComponents}>{msg.text}</ReactMarkdown>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}

            {loading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: '0.75rem', alignSelf: 'flex-start' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: 'var(--rounded-full)', 
                  flexShrink: 0, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  background: 'var(--color-soft-cloud)', 
                  color: 'var(--color-ink)',
                  border: '1px solid var(--color-hairline-soft)'
                }}>
                  <Bot size={16} />
                </div>
                <div style={{ backgroundColor: 'var(--color-soft-cloud)', padding: '16px 24px', borderRadius: '0px', border: '1px solid var(--color-hairline-soft)' }}>
                  <span className="spinner" style={{ width: '16px', height: '16px' }} />
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div style={{ position: 'relative', flexShrink: 0, paddingTop: '10px', borderTop: '1px solid var(--color-hairline-soft)' }}>
            
            {/* Visual sound wave recording feedback */}
            {isListening && (
              <div style={{ 
                padding: '10px 16px', 
                marginBottom: '10px', 
                backgroundColor: 'rgba(211,0,5,0.04)', 
                border: '1px solid rgba(211,0,5,0.15)', 
                borderRadius: 'var(--rounded-md)', 
                fontSize: '13px', 
                color: 'var(--color-sale)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                gap: '12px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-sale)', display: 'inline-block' }} />
                  {voiceTranscript ? (
                    <span style={{ fontStyle: 'italic', color: 'var(--color-ink)' }}>"{voiceTranscript}"</span>
                  ) : (
                    <span style={{ fontWeight: 500 }}>LISTENING... START SPEAKING.</span>
                  )}
                </div>
                <div className="voice-wave">
                  <div className="voice-wave-bar" />
                  <div className="voice-wave-bar" />
                  <div className="voice-wave-bar" />
                  <div className="voice-wave-bar" />
                  <div className="voice-wave-bar" />
                </div>
              </div>
            )}

            {voiceError && !isListening && (
              <div style={{ 
                padding: '10px 16px', 
                marginBottom: '10px', 
                backgroundColor: 'rgba(211,0,5,0.05)', 
                border: '1px solid rgba(211,0,5,0.2)', 
                borderRadius: 'var(--rounded-md)', 
                fontSize: '13px', 
                color: 'var(--color-sale)', 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '8px' 
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
                <span style={{ flex: 1 }}>{voiceError}</span>
                <button onClick={() => setVoiceError('')} style={{ background: 'none', border: 'none', color: 'var(--color-sale)', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>✕</button>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? 'Listening… speak now' : 'Message GenBot...'}
                className="input-base"
                style={{ 
                  padding: '16px 20px', 
                  paddingRight: voiceSupported ? '110px' : '65px', 
                  borderRadius: 'var(--rounded-lg)', 
                  fontSize: '15px', 
                  backgroundColor: 'var(--color-soft-cloud)', 
                  borderColor: isListening ? 'var(--color-sale)' : 'transparent',
                  boxShadow: isListening ? '0 0 0 3px rgba(211,0,5,0.08)' : undefined, 
                  transition: 'all var(--transition-fast) ease', 
                  width: '100%' 
                }}
              />
              <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                {voiceSupported && (
                  <button 
                    type="button" 
                    onClick={toggleListening} 
                    disabled={loading}
                    title={isListening ? 'Stop & send' : 'Speak message'} 
                    style={{ 
                      backgroundColor: isListening ? 'var(--color-sale)' : 'var(--color-translucent-ink)', 
                      color: isListening ? 'var(--color-on-primary)' : 'var(--color-ink)', 
                      width: '36px',
                      height: '36px', 
                      borderRadius: 'var(--rounded-full)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      cursor: loading ? 'not-allowed' : 'pointer', 
                      transition: 'all var(--transition-fast)',
                      border: 'none',
                      opacity: loading ? 0.4 : 1
                    }}
                  >
                    {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                )}
                <button 
                  type="submit" 
                  disabled={!input.trim() || loading} 
                  style={{ 
                    backgroundColor: input.trim() && !loading ? 'var(--color-ink)' : 'var(--color-translucent-ink)', 
                    color: input.trim() && !loading ? 'var(--color-on-primary)' : 'var(--color-stone)', 
                    width: '36px',
                    height: '36px', 
                    borderRadius: 'var(--rounded-full)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    transition: 'all var(--transition-fast)', 
                    cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                    border: 'none',
                    opacity: loading ? 0.4 : 1
                  }}
                >
                  <Send size={16} />
                </button>
              </div>
            </form>
            <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '11px', color: 'var(--color-mute)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              GenBot can make mistakes. Please check important specifications.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
