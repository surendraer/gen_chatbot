import React, { useState, useRef, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User as UserIcon, Mic, MicOff } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

const Chat = () => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  // Refs to track voice transcript across async events
  const finalTranscriptRef = useRef('');
  const interimTranscriptRef = useRef('');

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = false;      // simpler: fires one result then stops
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = 0; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      finalTranscriptRef.current = final;
      interimTranscriptRef.current = interim;
      // Show live text in input immediately
      setInput((final + ' ' + interim).trim());
    };

    recognition.onerror = (event) => {
      console.error('Speech error:', event.error);
      if (event.error === 'not-allowed') {
        alert('Microphone access denied. Please allow it in your browser settings.');
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      // Auto-submit if we captured something
      const captured = (finalTranscriptRef.current + ' ' + interimTranscriptRef.current).trim();
      if (captured) {
        // Trigger form submit via a custom event
        document.getElementById('chat-submit-btn')?.click();
      }
      finalTranscriptRef.current = '';
      interimTranscriptRef.current = '';
    };
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      finalTranscriptRef.current = '';
      interimTranscriptRef.current = '';
      setInput('');
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Could not start recognition:', err);
        setIsListening(false);
      }
    }
  };

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
    const userMsgId = Date.now();
    const botMsgId = userMsgId + 1;

    console.log("Submitting prompt:", userMsg);
    setInput('');
    setLoading(true);

    // Combine updates to avoid race conditions/batching issues
    setMessages(prev => [
      ...prev, 
      { id: userMsgId, text: userMsg, sender: 'user' },
      { id: botMsgId, text: "", sender: 'bot' }
    ]);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/prompt/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ prompt: userMsg })
      });

      if (!response.ok) throw new Error("Failed to connect to AI");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let streamFinished = false;

      while (!streamFinished) {
        const { value, done } = await reader.read();
        if (done) {
          streamFinished = true;
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();

            if (data === "[DONE]") {
              streamFinished = true;
            } else {
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  // Robust update: Find the message by ID
                  setMessages(prev => prev.map(msg => 
                    msg.id === botMsgId 
                      ? { ...msg, text: msg.text + parsed.text } 
                      : msg
                  ));
                }
              } catch (e) {
                // Partial JSON
              }
            }
          }
        }
      }
      console.log("Stream finished successfully");
    } catch (err) {
      console.error("Chat submission error:", err);
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId 
          ? { ...msg, text: "Error: Could not get a response. Please try again.", error: true } 
          : msg
      ));
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
                  {msg.sender === 'user' ? msg.text : <div className="markdown-body"><ReactMarkdown>{msg.text}</ReactMarkdown></div>}
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
          style={{ padding: '18px 24px', paddingRight: '110px', borderRadius: 'var(--border-radius-xl)', fontSize: '1.05rem', background: 'rgba(15, 23, 42, 0.8)' }}
          disabled={loading}
        />
        <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={toggleListening}
            style={{
              background: isListening ? 'var(--danger)' : 'rgba(255,255,255,0.1)',
              color: 'white', padding: '10px', borderRadius: '50%', display: 'flex',
              cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isListening ? '0 0 15px rgba(239, 68, 68, 0.5)' : 'none',
              animation: isListening ? 'pulse-danger 1.5s infinite' : 'none'
            }}
            title={isListening ? "Stop listening" : "Speak your message"}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button
            id="chat-submit-btn"
            type="submit"
            disabled={!input.trim() || loading}
            style={{
              background: input.trim() && !loading ? 'var(--primary-accent)' : 'rgba(255,255,255,0.1)',
              color: 'white', padding: '10px', borderRadius: '50%', display: 'flex',
              transition: 'all 0.2s', cursor: input.trim() && !loading ? 'pointer' : 'not-allowed'
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
