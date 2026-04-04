import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User as UserIcon, Mic, MicOff, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { AuthContext } from '../context/AuthContext';

// ─────────────────────────────────────────────────────────────────────────────
// CopyButton — shown inside every fenced code block
// ─────────────────────────────────────────────────────────────────────────────
function CopyButton({ code }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    // Try clipboard API first, then fallback
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
  // children is the React <code> element
  let codeChild = children;
  if (Array.isArray(children)) codeChild = children[0];

  const className = codeChild?.props?.className || '';
  const langMatch = /language-(\w+)/.exec(className);
  const language = langMatch ? langMatch[1] : '';

  // Pull all text content from the code element recursively
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
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');

  const messagesEndRef = useRef(null);
  const loadingRef = useRef(false);
  const recognitionRef = useRef(null);

  useEffect(() => { loadingRef.current = loading; }, [loading]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = async (text) => {
    const userMsg = (text || '').trim();
    if (!userMsg || loadingRef.current) return;

    const ts = Date.now();
    const userMsgId = ts;
    const botMsgId = ts + 1;

    setInput('');
    setVoiceTranscript('');
    setLoading(true);
    loadingRef.current = true;

    setMessages(prev => [
      ...prev,
      { id: userMsgId, text: userMsg, sender: 'user' },
      { id: botMsgId, text: '', sender: 'bot' },
    ]);

    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/prompt/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ prompt: userMsg }),
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  // ── Voice input ───────────────────────────────────────────────────────────
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert('Voice input is not supported in this browser.\nPlease use Google Chrome or Microsoft Edge.');
      return;
    }

    // If we already have a running recognition — stop it first
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch {}
      recognitionRef.current = null;
    }

    const recognition = new SR();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    // continuous:false — Chrome finalizes results before firing onend
    // continuous:true often ends before isFinal fires, giving empty transcript
    recognition.continuous = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    // Track BOTH final and interim separately
    // onend uses whichever is available (final preferred, interim as fallback)
    let finalTranscript = '';
    let interimTranscript = '';

    recognition.onstart = () => {
      console.log('[Voice] Started');
      setIsListening(true);
      setVoiceTranscript('');
      setInput('');
    };

    recognition.onresult = (event) => {
      let final = '';
      let interim = '';
      for (let i = 0; i < event.results.length; i++) {
        const r = event.results[i];
        if (r.isFinal) {
          final += r[0].transcript;
        } else {
          interim += r[0].transcript;
        }
      }
      // Store BOTH — we'll use finalTranscript in onend, with interimTranscript as backup
      finalTranscript = final;
      interimTranscript = interim;
      const display = (final + ' ' + interim).trim();
      console.log('[Voice] Transcript (final:', JSON.stringify(final), 'interim:', JSON.stringify(interim) + ')');
      setVoiceTranscript(display);
      setInput(display);
    };

    recognition.onerror = (event) => {
      console.error('[Voice] Error:', event.error);
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow microphone access in your browser settings and try again.');
      } else if (event.error === 'no-speech') {
        // User didn't speak — just stop quietly
      } else if (event.error === 'network') {
        alert('Voice recognition requires an internet connection.');
      }
      // Don't stop listening on transient errors like 'no-speech'
      if (event.error !== 'no-speech') {
        setIsListening(false);
        recognitionRef.current = null;
      }
    };

    recognition.onend = () => {
      // Use final transcript, fall back to interim if final is empty
      // (Chrome sometimes ends before issuing isFinal=true)
      const captured = (finalTranscript || interimTranscript).trim();
      console.log('[Voice] Ended. Final:', JSON.stringify(finalTranscript), '| Interim:', JSON.stringify(interimTranscript), '| Using:', JSON.stringify(captured));
      setIsListening(false);
      recognitionRef.current = null;

      if (captured) {
        setTimeout(() => {
          sendMessage(captured);
        }, 80);
      } else {
        // Nothing was captured — clear the transcript display
        setVoiceTranscript('');
      }
    };

    try {
      recognition.start();
    } catch (err) {
      console.error('[Voice] Failed to start:', err);
      setIsListening(false);
      recognitionRef.current = null;
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
      // onend will fire and handle submission
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
    };
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      height: '100%', maxWidth: '900px', width: '100%',
      margin: '0 auto', padding: '1rem',
    }}>

      {/* Messages Area */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '1rem',
        display: 'flex', flexDirection: 'column', gap: '1.5rem',
        backdropFilter: 'blur(8px)', background: 'rgba(15,23,42,0.2)',
        borderRadius: 'var(--border-radius-lg)',
        border: '1px solid var(--glass-border)',
        marginBottom: '1rem',
        boxShadow: 'var(--glass-shadow)',
        scrollbarWidth: 'thin',
        scrollbarColor: 'var(--bg-content-hover) transparent',
      }}>
        {messages.length === 0 ? (
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', opacity: 0.5,
          }}>
            <Bot size={64} style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 500 }}>
              Hello, {user?.name?.split(' ')[0] ?? 'there'}
            </h2>
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
                  display: 'flex', gap: '1rem',
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                }}
              >
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: msg.sender === 'user' ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)',
                  color: msg.sender === 'user' ? 'var(--primary-accent)' : 'var(--secondary-accent)',
                }}>
                  {msg.sender === 'user' ? <UserIcon size={20} /> : <Bot size={20} />}
                </div>
                <div style={{
                  background: msg.sender === 'user'
                    ? 'linear-gradient(135deg, var(--primary-accent), var(--primary-hover))'
                    : 'rgba(30,41,59,0.8)',
                  padding: '14px 18px', borderRadius: '16px',
                  borderTopRightRadius: msg.sender === 'user' ? '4px' : '16px',
                  borderTopLeftRadius: msg.sender === 'bot' ? '4px' : '16px',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.15)',
                  color: msg.error ? 'var(--danger)' : 'white',
                  lineHeight: 1.6, wordBreak: 'break-word',
                  minWidth: 0, maxWidth: '100%',
                }}>
                  {msg.sender === 'user' ? (
                    <span style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</span>
                  ) : (
                    <div className="markdown-body">
                      <ReactMarkdown components={markdownComponents}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', gap: '1rem', alignSelf: 'flex-start' }}
          >
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(16,185,129,0.2)', color: 'var(--secondary-accent)',
            }}><Bot size={20} /></div>
            <div style={{
              background: 'rgba(30,41,59,0.8)', padding: '16px',
              borderRadius: '16px', borderTopLeftRadius: '4px',
            }}>
              <span className="spinner" style={{ width: '16px', height: '16px', borderTopColor: 'var(--secondary-accent)' }} />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Voice transcript preview (shown above input while listening) */}
      {isListening && voiceTranscript && (
        <div style={{
          padding: '8px 16px', marginBottom: '6px',
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 'var(--border-radius-sm)',
          fontSize: '0.9rem', color: '#f87171',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: '#ef4444', display: 'inline-block',
            animation: 'pulse-danger 1.5s infinite',
          }} />
          <span style={{ fontStyle: 'italic' }}>"{voiceTranscript}"</span>
        </div>
      )}

      {/* Input area */}
      <form onSubmit={handleSubmit} style={{ position: 'relative' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? '🎤 Listening… speak now' : 'Message GenBot...'}
          className="input-base"
          style={{
            padding: '18px 24px', paddingRight: '116px',
            borderRadius: 'var(--border-radius-xl)',
            fontSize: '1.05rem',
            background: 'rgba(15,23,42,0.8)',
            borderColor: isListening ? 'rgba(239,68,68,0.7)' : undefined,
            boxShadow: isListening ? '0 0 0 3px rgba(239,68,68,0.18), 0 0 20px rgba(239,68,68,0.1)' : undefined,
            transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
          }}
          disabled={loading}
        />
        <div style={{
          position: 'absolute', right: '12px', top: '50%',
          transform: 'translateY(-50%)', display: 'flex', gap: '8px',
        }}>
          <button
            type="button"
            onClick={toggleListening}
            title={isListening ? 'Stop listening' : 'Speak your message'}
            style={{
              background: isListening ? 'var(--danger)' : 'rgba(255,255,255,0.1)',
              color: 'white', padding: '10px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
              boxShadow: isListening ? '0 0 18px rgba(239,68,68,0.55)' : 'none',
              animation: isListening ? 'pulse-danger 1.5s infinite' : 'none',
            }}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button
            type="submit"
            disabled={!input.trim() || loading}
            style={{
              background: input.trim() && !loading ? 'var(--primary-accent)' : 'rgba(255,255,255,0.1)',
              color: 'white', padding: '10px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            }}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
