import React, { useContext, useState } from 'react';
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
    name: user?.name || '',
    mobile: user?.mobile || '',
    age: user?.age || ''
  });

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

  const TabButton = ({ tab, icon: Icon, label, color = 'var(--text-muted)' }) => (
    <button 
      onClick={() => { setActiveTab(tab); setError(''); setSuccess(''); setEditing(false); }}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '16px 24px', 
        width: '100%', background: activeTab === tab ? 'rgba(255,255,255,0.05)' : 'transparent',
        borderLeft: activeTab === tab ? `3px solid ${color === 'var(--text-muted)' ? 'var(--primary-accent)' : color}` : '3px solid transparent',
        color: activeTab === tab ? 'white' : 'var(--text-muted)',
        textAlign: 'left', transition: 'all 0.2s', fontSize: '1.05rem', fontWeight: 500
      }}
    >
      <Icon size={20} color={activeTab === tab ? (color === 'var(--text-muted)' ? 'var(--primary-accent)' : color) : 'var(--text-muted)'} />
      {label}
    </button>
  );

  return (
    <div style={{ flex: 1, padding: '2rem', maxWidth: '1000px', width: '100%', margin: '0 auto', display: 'flex', gap: '2rem' }}>
      
      {/* Sidebar */}
      <div className="glass-panel" style={{ width: '280px', flexShrink: 0, padding: '2rem 0', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
        <div style={{ textAlign: 'center', padding: '0 2rem 2rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '1rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-accent), var(--secondary-accent))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', margin: '0 auto 1rem auto' }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>{user?.name}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>@{user?.userName}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <TabButton tab="details" icon={Settings} label="Profile Settings" />
          <TabButton tab="password" icon={Lock} label="Security" />
          <TabButton tab="danger" icon={Trash2} label="Danger Zone" color="var(--danger)" />
        </div>
      </div>

      {/* Main Content */}
      <div className="glass-panel" style={{ flex: 1, padding: '3rem', position: 'relative' }}>
        
        {error && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', padding: '12px 16px', borderRadius: '8px', marginBottom: '2rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>{error}</div>}
        {success && <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--secondary-accent)', padding: '12px 16px', borderRadius: '8px', marginBottom: '2rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>{success}</div>}

        {activeTab === 'details' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <User size={28} className="title-gradient" /> <span className="title-gradient">Personal Information</span>
                </h2>
                <p style={{ color: 'var(--text-muted)' }}>Update your profile details.</p>
              </div>
              {!editing && (
                <button className="btn-secondary" onClick={() => setEditing(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Edit3 size={16} /> Edit
                </button>
              )}
            </div>

            <form onSubmit={handleProfileUpdate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email (Read Only)</label>
                <input type="email" value={user?.email} disabled className="input-base" style={{ opacity: 0.5, cursor: 'not-allowed' }}/>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Full Name</label>
                <input type="text" value={editing ? profileData.name : user?.name} onChange={e => setProfileData({...profileData, name: e.target.value})} disabled={!editing} className="input-base" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Username</label>
                <input type="text" value={user?.userName} disabled className="input-base" style={{ opacity: 0.5, cursor: 'not-allowed' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Mobile</label>
                <input type="text" value={editing ? profileData.mobile : user?.mobile} onChange={e => setProfileData({...profileData, mobile: e.target.value})} disabled={!editing} className="input-base" />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Age</label>
                <input type="number" value={editing ? profileData.age : user?.age} onChange={e => setProfileData({...profileData, age: e.target.value})} disabled={!editing} className="input-base" />
              </div>
              
              {editing && (
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="button" className="btn-secondary" onClick={() => { setEditing(false); setProfileData({ name: user.name, mobile: user.mobile, age: user.age }) }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <X size={16} /> Cancel
                  </button>
                  <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Save size={16} /> Save Changes
                  </button>
                </div>
              )}
            </form>
          </motion.div>
        )}

        {activeTab === 'password' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
             <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={28} className="title-gradient" /> <span className="title-gradient">Change Password</span>
             </h2>
             <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Ensure your account is using a long, random password to stay secure.</p>
             
             <form onSubmit={handlePasswordReset} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '400px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Current Password</label>
                  <input type="password" required className="input-base" value={pwdData.currentPassword} onChange={e => setPwdData({...pwdData, currentPassword: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>New Password</label>
                  <input type="password" required className="input-base" value={pwdData.newPassword} onChange={e => setPwdData({...pwdData, newPassword: e.target.value})} />
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Minimum 8 characters, at least 1 uppercase letter, 1 number, and 1 special character.</p>
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '1rem', alignSelf: 'flex-start' }}>Update Password</button>
             </form>
          </motion.div>
        )}

        {activeTab === 'danger' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
             <h2 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trash2 size={28} /> Delete Account
             </h2>
             <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Once you delete your account, there is no going back. Please be certain.</p>
             
             <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '2rem', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Delete permanently</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>All of your personal data, chat history, and preferences will be permanently wiped from our secure servers.</p>
                <button onClick={handleDeleteAccount} className="btn-danger">Yes, delete my account</button>
             </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default Profile;
