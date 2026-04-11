import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, History as HistoryIcon, User, Bot, ChevronLeft, ChevronRight, Trash2, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../api';

// Markdown component styling
const markdownComponents = {
  // Simple styling to prevent errors with ReactMarkdown
};

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
          // Group by conversation
          const grouped = {};
          
          data.data.forEach(p => {
            const cid = p.conversationId || p._id;
            if (!grouped[cid]) {
              grouped[cid] = {
                id: cid,
                title: p.textPrompt, // First prompt asked
                messages: [],
                createdAt: p.createdAt,
                updatedAt: p.createdAt // Track latest message time
              };
            }
            // Append chronologically
            grouped[cid].messages.push({
              prompt: p.textPrompt,
              answer: p.textAnswer,
              id: p._id,
              createdAt: p.createdAt
            });
            // Update the conversation's updatedAt if this prompt is newer
            // (technically since we process chronologically, the last one processed is the newest)
            grouped[cid].updatedAt = p.createdAt;
          });

          // Sort conversations by most recently updated
          const sortedConvs = Object.values(grouped).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          setConversations(sortedConvs);
        } else {
          console.error("Malformed or failed history response", data);
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
    // Check if title or any message inside matches
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
    <div style={{ flex: 1, padding: '2rem', maxWidth: '1000px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <HistoryIcon className="title-gradient" size={40} />
            <span className="title-gradient">Conversation History</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Review all your past conversation sessions.</p>
        </div>

        <div style={{ position: 'relative', width: '100%', maxWidth: '450px', display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search conversations..." 
              className="input-base"
              style={{ paddingLeft: '48px', borderRadius: 'var(--border-radius-xl)' }}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          {conversations.length > 0 && (
            <button 
              onClick={handleClearHistory}
              className="btn-secondary"
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.5rem', 
                color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)',
                background: 'rgba(239, 68, 68, 0.05)'
              }}
              title="Clear all history"
            >
              <Trash2 size={18} /> <span className="hide-on-mobile">Clear All</span>
            </button>
          )}
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}><span className="spinner" style={{ width: '40px', height: '40px' }}></span></div>
        ) : currentItems.length === 0 ? (
          <div className="glass-panel" style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Bot size={64} style={{ opacity: 0.5, margin: '0 auto 1rem auto' }} />
            <h3>No conversations found</h3>
            <p>Try a different search term or start a new chat.</p>
          </div>
        ) : (
          groupOrder.map(label => {
            if (!groupedItems[label]) return null;
            return (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                   <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-accent)', textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</span>
                   <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(99,102,241,0.2), transparent)' }}></div>
                </div>
                <AnimatePresence initial={false}>
                  {groupedItems[label].map((conv, index) => {
                    const isExpanded = expandedConvs[conv.id];
                    return (
                      <motion.div 
                        key={conv.id}
                        className="glass-panel"
                        style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        {/* Conversation Header (Clickable) */}
                        <div 
                          onClick={() => toggleExpand(conv.id)}
                          style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer', background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent', transition: 'background 0.2s' }}
                          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                          onMouseOut={(e) => e.currentTarget.style.background = isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent'}
                        >
                          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(99,102,241,0.1)', color: 'var(--primary-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <MessageSquare size={20} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, margin: 0, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {conv.title}
                            </h3>
                            <p style={{ margin: '0.3rem 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                              {conv.messages.length} message{conv.messages.length !== 1 ? 's' : ''} • Last updated {new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                          <div style={{ color: 'var(--text-muted)' }}>
                            {isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
                          </div>
                        </div>

                        {/* Expanded Messages Area */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              style={{ overflow: 'hidden' }}
                            >
                              <div style={{ padding: '0 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 0 1rem 0' }} />
                                
                                {conv.messages.map((msg, msgIndex) => (
                                  <div key={msg.id || msgIndex} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: msgIndex !== conv.messages.length - 1 ? '1.5rem' : '0', borderBottom: msgIndex !== conv.messages.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                    
                                    {/* User Message */}
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                      <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(99,102,241,0.2)', color: 'var(--primary-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <User size={16} />
                                      </div>
                                      <div style={{ flex: 1 }}>
                                        <h4 style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem' }}>You</h4>
                                        <p style={{ fontSize: '1rem', margin: 0 }}>{msg.prompt}</p>
                                      </div>
                                    </div>

                                    {/* Bot Message */}
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                      <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(16,185,129,0.2)', color: 'var(--secondary-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Bot size={16} />
                                      </div>
                                      <div style={{ flex: 1 }}>
                                        <h4 style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.2rem' }}>GenBot</h4>
                                        <div style={{ color: 'var(--text-main)', opacity: 0.9, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                                          <div className="markdown-body">
                                            <ReactMarkdown components={markdownComponents}>
                                              {msg.answer || ""}
                                            </ReactMarkdown>
                                          </div>
                                        </div>
                                      </div>
                                    </div>

                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', marginTop: 'auto', paddingTop: '2rem' }}>
          <button className="btn-secondary" onClick={handlePrevPage} disabled={currentPage === 1} style={{ padding: '12px', borderRadius: '50%' }}>
            <ChevronLeft size={20} />
          </button>
          <span>Page <strong style={{ color: 'var(--primary-accent)' }}>{currentPage}</strong> of <strong>{totalPages}</strong></span>
          <button className="btn-secondary" onClick={handleNextPage} disabled={currentPage === totalPages} style={{ padding: '12px', borderRadius: '50%' }}>
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
};

export default History;
