import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Trash2, MessageSquare, ChevronDown, ChevronUp, Check, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
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
// Custom renderers for ReactMarkdown
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
// History Component
// ─────────────────────────────────────────────────────────────────────────────
const History = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedConvs, setExpandedConvs] = useState({});
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/prompt/history');
        if (data && data.success && Array.isArray(data.data)) {
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

          const sortedConvs = Object.values(grouped).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          setConversations(sortedConvs);
        } else {
          setConversations([]);
        }
      } catch (err) {
        console.error('Failed to fetch history', err);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear your entire chat history? This cannot be undone.")) return;
    
    try {
      const { data } = await api.delete('/prompt/clear');
      if (data.success) {
        setConversations([]);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Failed to clear history", err);
      alert("Error: Could not clear history.");
    }
  };

  const toggleExpand = (id) => {
    setExpandedConvs(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getGroupLabel = (dateStr) => {
    if (!dateStr) return "Earlier";
    const date = new Date(dateStr);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);
    const sevenDaysAgo = new Date(startOfToday);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    if (date >= startOfToday) return "Today";
    if (date >= startOfYesterday) return "Yesterday";
    if (date >= sevenDaysAgo) return "Last 7 Days";
    return "Earlier";
  };

  const filteredConvs = conversations.filter(conv => {
    const search = searchTerm.toLowerCase();
    if ((conv.title || "").toLowerCase().includes(search)) return true;
    for (let msg of conv.messages) {
      if ((msg.prompt || "").toLowerCase().includes(search) || (msg.answer || "").toLowerCase().includes(search)) {
        return true;
      }
    }
    return false;
  });

  const totalPages = Math.ceil(filteredConvs.length / itemsPerPage);
  const currentItems = filteredConvs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  const groupedItems = currentItems.reduce((acc, conv) => {
    const label = getGroupLabel(conv.updatedAt);
    if (!acc[label]) acc[label] = [];
    acc[label].push(conv);
    return acc;
  }, {});

  const groupOrder = ["Today", "Yesterday", "Last 7 Days", "Earlier"];

  return (
    <div style={{ 
      flex: 1, 
      padding: 'var(--space-section) 2rem', 
      maxWidth: '960px', 
      width: '100%', 
      margin: '0 auto', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '2.5rem',
      backgroundColor: 'var(--color-canvas)',
      overflowY: 'auto'
    }}>
      {/* Title Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--color-mute)' }}>
            ARCHIVE DATABASE
          </span>
          <h1 className="heading-xl" style={{ textTransform: 'uppercase', marginTop: '0.5rem' }}>
            CONVERSATION HISTORY
          </h1>
        </div>

        {/* Search and Action Row */}
        <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '480px', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-mute)' }} />
            <input 
              type="text" 
              placeholder="Search history..." 
              className="input-base"
              style={{ 
                paddingLeft: '48px', 
                borderRadius: 'var(--rounded-md)',
                height: '40px',
                fontSize: '14px'
              }}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          {conversations.length > 0 && (
            <button 
              onClick={handleClearHistory}
              className="btn-secondary"
              style={{ 
                height: '40px',
                padding: '0 16px',
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                color: 'var(--color-sale)', 
                backgroundColor: 'rgba(211,0,5,0.05)',
                border: 'none',
                borderRadius: 'var(--rounded-md)',
                fontSize: '13px',
                fontWeight: 600
              }}
              title="Clear all history"
            >
              <Trash2 size={15} /> <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Grouped Accordions Section */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <span className="spinner" style={{ width: '32px', height: '32px' }}></span>
          </div>
        ) : currentItems.length === 0 ? (
          <div style={{ 
            padding: '5rem 2rem', 
            textAlign: 'center', 
            backgroundColor: 'var(--color-soft-cloud)',
            border: '1px solid var(--color-hairline-soft)'
          }}>
            <MessageSquare size={36} strokeWidth={1.5} style={{ color: 'var(--color-mute)', margin: '0 auto 1rem auto' }} />
            <h3 className="heading-md" style={{ textTransform: 'uppercase', marginBottom: '0.5rem' }}>No conversations found</h3>
            <p className="caption-md">Your history database is currently empty.</p>
          </div>
        ) : (
          groupOrder.map(label => {
            if (!groupedItems[label]) return null;
            return (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Timeline Tag */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-ink)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                     {label}
                   </span>
                   <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-hairline-soft)' }}></div>
                </div>

                {/* List of Accordions */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {groupedItems[label].map((conv, index) => {
                    const isExpanded = expandedConvs[conv.id];
                    return (
                      <div 
                        key={conv.id}
                        style={{ 
                          borderBottom: '1px solid var(--color-hairline-soft)',
                          backgroundColor: 'var(--color-canvas)',
                          transition: 'background-color var(--transition-fast)'
                        }}
                      >
                        {/* PDP-style disclosure row click area */}
                        <div 
                          onClick={() => toggleExpand(conv.id)}
                          style={{ 
                            padding: '1.25rem 0', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'space-between',
                            cursor: 'pointer' 
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: 1 }}>
                            <MessageSquare size={16} style={{ color: 'var(--color-ink)', flexShrink: 0 }} />
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <h3 className="body-strong" style={{ 
                                margin: 0, 
                                color: 'var(--color-ink)', 
                                whiteSpace: 'nowrap', 
                                overflow: 'hidden', 
                                textOverflow: 'ellipsis',
                                fontSize: '15px'
                              }}>
                                {conv.title}
                              </h3>
                              <p className="caption-sm" style={{ margin: '2px 0 0', fontSize: '12px' }}>
                                {conv.messages.length} message{conv.messages.length !== 1 ? 's' : ''} • Last active {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <div style={{ color: 'var(--color-ink)', marginLeft: '1rem', display: 'flex', alignItems: 'center' }}>
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                          </div>
                        </div>

                        {/* Accordion Content */}
                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div style={{ 
                                padding: '0 0 1.5rem 0', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '1.5rem' 
                              }}>
                                {conv.messages.map((msg, msgIndex) => (
                                  <div 
                                    key={msg.id || msgIndex} 
                                    style={{ 
                                      display: 'flex', 
                                      flexDirection: 'column', 
                                      gap: '0.75rem', 
                                      padding: '1.25rem', 
                                      backgroundColor: 'var(--color-soft-cloud)',
                                      border: '1px solid var(--color-hairline-soft)'
                                    }}
                                  >
                                    {/* User Query Block */}
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                      <span className="caption-sm" style={{ fontWeight: 700, color: 'var(--color-ink)', width: '60px', flexShrink: 0 }}>YOU:</span>
                                      <p className="body-md" style={{ margin: 0, color: 'var(--color-charcoal)' }}>{msg.prompt}</p>
                                    </div>

                                    {/* Divider */}
                                    <div style={{ height: '1px', backgroundColor: 'var(--color-hairline-soft)' }} />

                                    {/* Bot Answer Block */}
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                      <span className="caption-sm" style={{ fontWeight: 700, color: 'var(--color-ink)', width: '60px', flexShrink: 0 }}>BOT:</span>
                                      <div style={{ flex: 1 }}>
                                        <div className="markdown-body">
                                          <ReactMarkdown components={markdownComponents}>
                                            {msg.answer || ""}
                                          </ReactMarkdown>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: '1rem', 
          marginTop: 'auto', 
          paddingTop: '2rem',
          borderTop: '1px solid var(--color-hairline-soft)'
        }}>
          <button 
            className="btn-secondary" 
            onClick={handlePrevPage} 
            disabled={currentPage === 1} 
            style={{ 
              width: '40px',
              height: '40px',
              padding: 0,
              borderRadius: 'var(--rounded-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ChevronLeft size={16} />
          </button>
          <span className="body-strong" style={{ fontSize: '14px' }}>
            PAGE <span style={{ color: 'var(--color-ink)' }}>{currentPage}</span> OF {totalPages}
          </span>
          <button 
            className="btn-secondary" 
            onClick={handleNextPage} 
            disabled={currentPage === totalPages} 
            style={{ 
              width: '40px',
              height: '40px',
              padding: 0,
              borderRadius: 'var(--rounded-full)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default History;
