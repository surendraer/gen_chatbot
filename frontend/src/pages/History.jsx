import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, History as HistoryIcon, User, Bot, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import api from '../api';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get('/prompt/history');
        if (data && data.success && Array.isArray(data.data)) {
          setHistory([...data.data].reverse());
        } else {
          console.error("Malformed or failed history response", data);
          setHistory([]);
        }
      } catch (err) {
        console.error('Failed to fetch history', err);
        setHistory([]);
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
        setHistory([]);
        setCurrentPage(1);
      }
    } catch (err) {
      console.error("Failed to clear history", err);
      alert("Error: Could not clear history.");
    }
  };

  const getGroupLabel = (dateStr) => {
    if (!dateStr) return "Earlier Messages";
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

  const filteredHistory = history.filter(item => {
    const prompt = (item.textPrompt || "").toLowerCase();
    const answer = (item.textAnswer || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    return prompt.includes(search) || answer.includes(search);
  });

  const totalPages = Math.ceil(filteredHistory.length / itemsPerPage);
  const currentItems = filteredHistory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleNextPage = () => { if (currentPage < totalPages) setCurrentPage(currentPage + 1); };
  const handlePrevPage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };

  const groupedItems = currentItems.reduce((acc, item) => {
    const label = getGroupLabel(item.createdAt);
    if (!acc[label]) acc[label] = [];
    acc[label].push(item);
    return acc;
  }, {});

  const groupOrder = ["Today", "Yesterday", "Last 7 Days", "Earlier", "Earlier Messages"];

  return (
    <div style={{ flex: 1, padding: '2rem', maxWidth: '1000px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <HistoryIcon className="title-gradient" size={40} />
            <span className="title-gradient">Conversation History</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Review and filter your past AI interactions.</p>
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
          {history.length > 0 && (
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
              <Trash2 size={18} /> <span className="hide-on-mobile">Clear</span>
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
                  {groupedItems[label].map((item, index) => (
                    <motion.div 
                      key={item._id?.toString() || index}
                      className="glass-panel"
                      style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(99,102,241,0.2)', color: 'var(--primary-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <User size={20} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                             <h4 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>You Asked</h4>
                             {item.createdAt && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                          </div>
                          <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{item.textPrompt || "No prompt text found"}</p>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(16,185,129,0.2)', color: 'var(--secondary-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <Bot size={20} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.3rem' }}>GenBot Responded</h4>
                          <div style={{ color: 'var(--text-main)', opacity: 0.9, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                            <div className="markdown-body">
                              <ReactMarkdown>
                                {(item.textAnswer || "").toString()}
                              </ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
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
