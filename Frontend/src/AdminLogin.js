import React, { useState } from 'react';
import { useEffect } from "react";
import './AdminLogin.css';

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
);
const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
);
const SystemIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
);
const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
);
const ActivityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
);

const AdminLogin = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [activeTab, setActiveTab] = useState('status');

  const [users, setUsers] = useState([]);

  const [stats, setStats] = useState({
            emails_scanned: 0,
             urls_scanned: 0
               });


  useEffect(() => {

  const adminSession = localStorage.getItem("admin_logged_in");

  if (adminSession === "true") {
    setIsAdminLoggedIn(true);

    // ✅ Auto load stats after login restore
    loadStats();

    // ✅ Optional: preload users
    loadUsers();
  }

 }, []);



  const handleAdminLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch("http://localhost:5000/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: email,
        password: adminPassword
      })
    });

    const data = await res.json();

    if (res.status === 200) {
      setIsAdminLoggedIn(true);
      localStorage.setItem("admin_logged_in", "true");
      localStorage.setItem("admin_email", data.email);

      setLoginError("");
    } else {
      setLoginError(data.message);
    }

  } catch (err) {
    console.error(err);
    setLoginError("Server error");
  }
};

  const handleLogout = () => {
  setIsAdminLoggedIn(false);
  setEmail('');
  setAdminPassword('');

  localStorage.removeItem("admin_logged_in");
  localStorage.removeItem("admin_email");
};


  // function to load Status
const loadStats = async () => {
  try {

    const res = await fetch("http://localhost:5000/admin/stats");
    const data = await res.json();

    setStats(data);

  } catch (err) {
    console.error("Stats error:", err);
  }
};



  //function to load users
  const loadUsers = async () => {
  try {

    const res = await fetch("http://localhost:5000/admin/users");

    const data = await res.json();

    setUsers(data);

  } catch (err) {
    console.error("User load error:", err);
  }
};


  if (!isAdminLoggedIn) {
    return (
      <div className="admin-wrapper fade-in">
        <div className="admin-auth-card">
          {/* INLINE STYLES FORCED HERE TO FIX RED ICON */}
          <div className="admin-header-icon" style={{ color: '#22D3EE', transform: 'scale(1.5)', marginBottom: '25px' }}>
            <ShieldIcon />
          </div>
          <h2>Admin Portal</h2>
          <p>Authorized personnel only.</p>
          
          {loginError && <div className="admin-error">{loginError}</div>}

          <form onSubmit={handleAdminLogin}>
            <div className="admin-input-group">
              <label>Email Address</label>
              <input type="text" placeholder="admin@fraudx.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="admin-input-group">
              <label>Passcode</label>
              <input type="password" placeholder="••••••••" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} required />
            </div>
            <button type="submit" className="admin-btn-primary full-width">Access System</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard fade-in">
      <aside className="admin-sidebar">
        
        {/* INLINE STYLES FORCED HERE TO FIX RED TEXT */}
        <div className="admin-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '22px', fontWeight: '800', padding: '0 30px 40px', color: '#22D3EE', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '20px' }}>
          <div className="logo-icon" style={{ color: '#22D3EE' }}><ShieldIcon /></div>
          FraudX Admin
        </div>
        
        <nav className="admin-nav">
          <button className={`admin-nav-item ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>
            <UploadIcon /> Upload Data
          </button>
          <button className={`admin-nav-item ${activeTab === 'system' ? 'active' : ''}`} onClick={() => setActiveTab('system')}>
            <SystemIcon /> View System
          </button>
          <button className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => {
                                                                                                          setActiveTab('users');
                                                                                                             loadUsers();
                                                                                                        }}>
            <UserIcon /> Manage Users
          </button>
          <button className={`admin-nav-item ${activeTab === 'status' ? 'active' : ''}`} onClick={() => {
                                                                                                          setActiveTab('status');
                                                                                                          loadStats();
                                                                                                        }}>
            <ActivityIcon /> Fraud Status
          </button>
        </nav>

        <button className="admin-logout-btn" style={{ borderColor: '#22D3EE', color: '#22D3EE' }} onClick={handleLogout}>Secure Logout</button>
      </aside>

      <main className="admin-content">
        <header className="admin-content-header">
          <h2>
            {activeTab === 'upload' && 'Upload Datasets'}                  
            {activeTab === 'system' && 'System Health Overview'}
            {activeTab === 'users' && 'User Management'}
            {activeTab === 'status' && 'Global Fraud Activity'}
          </h2>
        </header>

        <div className="admin-panel-body slide-up">
          {activeTab === 'upload' && (
            <div className="admin-card text-center">
              <UploadIcon />
              <h3>Upload Threat Intelligence</h3>
              <p>Upload new global blacklists, malicious URL datasets, or updated phishing models.</p>
              <input type="file" className="admin-file-input" />
              <button className="admin-btn-primary" style={{marginTop: '20px'}}>Deploy to System</button>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="admin-grid">
              <div className="admin-card">
                <h3>Email Detection Model</h3>
                <h2 style={{color: '#22D3EE'}}><h3>Accuracy:</h3>90%</h2>
                <p>Naive Bayes</p>
              </div>
              <div className="admin-card">
                <h3>URL Detection Model</h3>
                <h2 style={{color: '#22D3EE'}}><h3>Accuracy:</h3>95%</h2>
                <p>Logistic Regression</p>
              </div>
              <div className="admin-card">
                <h3>Text Vectorizer</h3>
                <h2 style={{color: '#22D3EE'}}><h3>Features:</h3>5000</h2>
                <p>TF-IDF</p>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="admin-card full-width">
              <h3>Active Users</h3>
              <table className="admin-table">
                <thead>
                  <tr><th>User Email</th><th>Status</th><th>Last Login</th><th>User ID</th></tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                   <tr key={index}>
                     <td>{user.Email}</td>

                    <td>
                      <span className={`badge ${user.Status === "Active" ? "safe" : "danger"}`}>
                       {user.Status}
                      </span>
                   </td>

                    <td>
                       {user.Last_Login
                        ? new Date(user.Last_Login).toLocaleString()
                          : "Never"}
                    </td>

                    <td>{user.User_Id}</td>
                    </tr>
                     ))}
               </tbody>
              </table>
            </div>
          )}

          {activeTab === 'status' && (
            <div className="admin-card full-width">
              <h3>Threats Neutralized Today</h3>
              <div className="admin-stats-row">
                <div className="stat-box">
                  <span className="stat-number" style={{color: '#EF4444'}}>
                    {stats.emails_scanned}
                  </span>
                  <span className="stat-label">Phishing Emails Detected</span>
                </div>
                <div className="stat-box">
                  <span className="stat-number" style={{color: '#EF4444'}}>
                    {stats.urls_scanned}
                 </span>
                  <span className="stat-label">Malicious URLs Detected</span>
                </div>
                <div className="stat-box">
                  <span className="stat-number" style={{color: '#22D3EE'}}>92.2%</span>
                  <span className="stat-label">Detection Accuracy</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminLogin;