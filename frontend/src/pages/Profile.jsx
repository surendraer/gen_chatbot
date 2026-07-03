// Production Launch v1.0.0 - Optimized AI Chatbot
import React, { useContext, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import { User, Settings, Lock, Trash2, Edit3, Save, X } from 'lucide-react';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user, setUser, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('details'); // details, password, danger
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Profile Edit
  const [profileData, setProfileData] = useState({
    name: '',
    mobile: ''
  });

  // Sync profileData when context user loads/updates
  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        mobile: user.mobile || ''
      });
    }
  }, [user]);

  const handleMobileChange = (e) => {
    const val = e.target.value.replace(/\D/g, ''); // Enforce only digits
    if (val.length <= 10) {
      setProfileData({ ...profileData, mobile: val });
    }
  };

  // Password Reset
  const [pwdData, setPwdData] = useState({ currentPassword: '', newPassword: '' });

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const { data } = await api.put('/user/profile/update', profileData);
      if (data.success) {
        setUser({ ...user, ...data.data }); // update context
        setSuccess('Profile updated successfully!');
        setEditing(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    try {
      const { data } = await api.post('/user/password/reset', pwdData);
      if (data.success) {
        setSuccess('Password updated successfully!');
        setPwdData({ currentPassword: '', newPassword: '' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    }
  };

  const handleDeleteAccount = async () => {
    const confirm = window.confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.");
    if (!confirm) return;

    try {
      const { data } = await api.delete('/user/profile/delete');
      if (data.success) {
        logout();
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account.');
    }
  };

  const TabButton = ({ tab, icon: Icon, label, color = 'var(--color-ink)' }) => {
    const isActive = activeTab === tab;
    return (
      <button 
        onClick={() => { setActiveTab(tab); setError(''); setSuccess(''); setEditing(false); }}
        style={{
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          padding: '16px 24px', 
          width: '100%', 
          background: isActive ? 'var(--color-canvas)' : 'transparent',
          borderLeft: isActive ? `3px solid ${color}` : '3px solid transparent',
          color: isActive ? 'var(--color-ink)' : 'var(--color-mute)',
          textAlign: 'left', 
          transition: 'all var(--transition-fast)', 
          fontSize: '15px', 
          fontWeight: isActive ? 600 : 500,
          borderTop: 'none',
          borderRight: 'none',
          borderBottom: 'none',
          cursor: 'pointer'
        }}
      >
        <Icon size={18} style={{ color: isActive ? color : 'var(--color-mute)', flexShrink: 0 }} />
        {label}
      </button>
    );
  };

  return (
    <div style={{ 
      flex: 1, 
      padding: 'var(--space-section) 2rem', 
      maxWidth: '960px', 
      width: '100%', 
      margin: '0 auto', 
      display: 'flex', 
      gap: '2rem',
      backgroundColor: 'var(--color-canvas)',
      overflowY: 'auto',
      flexDirection: window.innerWidth <= 768 ? 'column' : 'row'
    }}>
      
      {/* Sidebar Navigation */}
      <div style={{ 
        width: window.innerWidth <= 768 ? '100%' : '240px', 
        flexShrink: 0, 
        padding: '1.5rem 0', 
        display: 'flex', 
        flexDirection: 'column', 
        height: 'fit-content',
        backgroundColor: 'var(--color-soft-cloud)',
        border: '1px solid var(--color-hairline-soft)'
      }}>
        {/* User Card */}
        <div style={{ textAlign: 'center', padding: '0 1.5rem 1.5rem 1.5rem', borderBottom: '1px solid var(--color-hairline-soft)', marginBottom: '1rem' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: 'var(--rounded-full)', 
            backgroundColor: 'var(--color-ink)', 
            color: 'var(--color-on-primary)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '24px', 
            fontWeight: 700, 
            margin: '0 auto 1rem auto' 
          }}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <h3 className="body-strong" style={{ margin: 0 }}>{user?.name}</h3>
          <p className="caption-sm" style={{ margin: '2px 0 0' }}>@{user?.userName}</p>
        </div>

        {/* Tab Links */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <TabButton tab="details" icon={Settings} label="Account Details" />
          <TabButton tab="password" icon={Lock} label="Password Security" />
          <TabButton tab="danger" icon={Trash2} label="Danger Zone" color="var(--color-sale)" />
        </div>
      </div>

      {/* Main Settings Panel */}
      <div style={{ 
        flex: 1, 
        padding: window.innerWidth <= 768 ? '1.5rem' : '2.5rem', 
        border: '1px solid var(--color-hairline-soft)',
        backgroundColor: 'var(--color-canvas)' 
      }}>
        
        {error && (
          <div style={{ 
            backgroundColor: 'rgba(211,0,5,0.05)', 
            color: 'var(--color-sale)', 
            padding: '12px 16px', 
            border: '1px solid rgba(211,0,5,0.2)',
            fontSize: '14px',
            fontWeight: 500,
            marginBottom: '2rem' 
          }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ 
            backgroundColor: 'rgba(0,125,72,0.05)', 
            color: 'var(--color-success)', 
            padding: '12px 16px', 
            border: '1px solid rgba(0,125,72,0.2)',
            fontSize: '14px',
            fontWeight: 500,
            marginBottom: '2rem' 
          }}>
            {success}
          </div>
        )}

        {/* DETAILS TAB */}
        {activeTab === 'details' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--color-hairline-soft)', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-mute)' }}>
                  USER INFORMATION
                </span>
                <h2 className="heading-lg" style={{ textTransform: 'uppercase', marginTop: '0.2rem' }}>
                  Account Details
                </h2>
              </div>
              {!editing && (
                <button 
                  className="btn-secondary" 
                  onClick={() => setEditing(true)} 
                  style={{ 
                    height: '36px',
                    padding: '0 16px',
                    fontSize: '13px',
                    borderRadius: 'var(--rounded-lg)',
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px' 
                  }}
                >
                  <Edit3 size={14} /> EDIT
                </button>
              )}
            </div>

            <form onSubmit={handleProfileUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '12px', fontWeight: 700, color: 'var(--color-mute)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                  <input 
                    type="text" 
                    value={editing ? profileData.name : user?.name || ''} 
                    onChange={e => setProfileData({...profileData, name: e.target.value})} 
                    disabled={!editing} 
                    className="input-base" 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '12px', fontWeight: 700, color: 'var(--color-mute)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Username</label>
                  <input type="text" value={user?.userName || ''} disabled className="input-base" style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '12px', fontWeight: 700, color: 'var(--color-mute)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mobile Number</label>
                <input 
                  type="text" 
                  value={editing ? profileData.mobile : user?.mobile || ''} 
                  onChange={handleMobileChange} 
                  disabled={!editing} 
                  className="input-base" 
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '12px', fontWeight: 700, color: 'var(--color-mute)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email Address (Read Only)</label>
                <input type="email" value={user?.email || ''} disabled className="input-base" style={{ opacity: 0.6, cursor: 'not-allowed' }}/>
              </div>
              
              {editing && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--color-hairline-soft)', paddingTop: '1.5rem' }}>
                  <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => { setEditing(false); setProfileData({ name: user.name, mobile: user.mobile }) }} 
                    style={{ height: '40px', borderRadius: 'var(--rounded-lg)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <X size={15} /> CANCEL
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    style={{ height: '40px', borderRadius: 'var(--rounded-lg)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Save size={15} /> SAVE CHANGES
                  </button>
                </div>
              )}
            </form>
          </motion.div>
        )}

        {/* SECURITY TAB */}
        {activeTab === 'password' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
             <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--color-hairline-soft)', paddingBottom: '1rem' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-mute)' }}>
                  AUTHENTICATION CONTROLS
                </span>
                <h2 className="heading-lg" style={{ textTransform: 'uppercase', marginTop: '0.2rem' }}>
                  Password Security
                </h2>
             </div>
             
             <form onSubmit={handlePasswordReset} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '480px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '12px', fontWeight: 700, color: 'var(--color-mute)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Password</label>
                  <input type="password" required className="input-base" value={pwdData.currentPassword} onChange={e => setPwdData({...pwdData, currentPassword: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '12px', fontWeight: 700, color: 'var(--color-mute)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Password</label>
                  <input type="password" required className="input-base" value={pwdData.newPassword} onChange={e => setPwdData({...pwdData, newPassword: e.target.value})} />
                  <p className="caption-sm" style={{ marginTop: '0.5rem', lineHeight: 1.4 }}>
                    Requirements: Minimum 8 characters, at least 1 uppercase letter, 1 number, and 1 special character.
                  </p>
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '1rem', alignSelf: 'flex-start', height: '40px', borderRadius: 'var(--rounded-lg)', fontSize: '14px' }}>
                  UPDATE PASSWORD
                </button>
             </form>
          </motion.div>
        )}

        {/* DANGER ZONE */}
        {activeTab === 'danger' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
             <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--color-hairline-soft)', paddingBottom: '1rem' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-sale)' }}>
                  DESTRUCTIVE ACTIONS
                </span>
                <h2 className="heading-lg" style={{ color: 'var(--color-sale)', textTransform: 'uppercase', marginTop: '0.2rem' }}>
                  Danger Zone
                </h2>
             </div>
             
             <div style={{ 
               backgroundColor: 'rgba(211,0,5,0.02)', 
               padding: '2rem', 
               border: '1px solid rgba(211,0,5,0.15)'
             }}>
                <h3 className="heading-md" style={{ textTransform: 'uppercase', color: 'var(--color-sale)', marginBottom: '0.5rem' }}>
                  Delete account permanently
                </h3>
                <p className="caption-md" style={{ color: 'var(--color-charcoal)', marginBottom: '2rem', lineHeight: 1.6 }}>
                  Once deleted, all your active chat histories, profile preferences, and private account credentials will be immediately and irreversibly purged from our database records.
                </p>
                <button onClick={handleDeleteAccount} className="btn-danger" style={{ height: '40px', fontSize: '14px', borderRadius: 'var(--rounded-lg)' }}>
                  DELETE MY ACCOUNT
                </button>
             </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default Profile;
