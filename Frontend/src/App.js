import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
import jsPDF from "jspdf";
import React, { useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import './App.css';
import AdminLogin from './AdminLogin';
import { PieChart, Pie, Cell, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";


// --- SVGs & Icons ---
const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
);
const MailIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
);
const GlobeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
);
const LockIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
);
const VirusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><path d="M12 2v3m0 14v3M2 12h3m14 0h3m-2.93-7.07l-2.12 2.12M7.05 16.95l-2.12 2.12m14.14 0l-2.12-2.12M7.05 7.05L4.93 4.93"></path></svg>
);
const AlertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
);


 

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const [history, setHistory] = useState([]);

  const [urlScanResult, setUrlScanResult] = useState(null);

  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState(null);

  const [tempName, setTempName] = useState('');

  
  // Auth Form State
  const [tempEmail, setTempEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Scanner State
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null); 
  const [emailText, setEmailText] = useState("");
  
  const [urlText, setUrlText] = useState("");
  const [urlScanning, setUrlScanning] = useState(false);
  const [urlResult, setUrlResult] = useState(null);
  const [urlConfidence, setUrlConfidence] = useState(null);

  const [stats, setStats] = useState({
  emails: 0,
  urls: 0
  });
  


  const location = useLocation();  
   useEffect(() => {

  if (location.pathname === "/profile") {
    loadHistory();
  }

  }, [location.pathname]);
 
  const isAdminPage = location.pathname === "/admin";



//Restore login on page load
useEffect(() => {

  const fetchStats = async () => {
    try {
      const res = await fetch("http://localhost:5000/stats");
      const data = await res.json();

      setStats({
        emails: data.emails,
        urls: data.urls
      });

    } catch (err) {
      console.error("Stats error:", err);
    }
  };

  fetchStats();

}, []);




 // function to load history GPT
const loadHistory = async () => {
  const userId = localStorage.getItem("user_id");
  if (!userId) return;
  try {

    const res = await fetch(`http://localhost:5000/history/${userId}`);
    const data = await res.json();
    setHistory(data);
  } catch (error) {
    console.error("History error:", error);
  }

};


const navigate = useNavigate();

const handleStartScan = (targetPage) => {
  if (isLoggedIn) {
    navigate(targetPage);   // "/check-email"
  } else {
    navigate('/login');
  }
}; 


  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);
    return password.length >= minLength && hasUpper && hasNumber && hasSpecial;
  };

  const handleLogin = async (e) => {
  e.preventDefault();

  // Check empty fields
  if (tempEmail.trim() === "" || tempPassword.trim() === "") {
    setAuthError("All fields are required.");
    return;
  }

  try {

    // =========================
    // SIGNUP API
    // =========================
    if (location.pathname === "/signup") {

      if (!validatePassword(tempPassword)) {
        setAuthError(
          "Password must be at least 8 characters long, include an uppercase letter, a number, and a special character."
        );
        return;
      }

      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
        name: tempName,
        email: tempEmail,
        password: tempPassword
      })
      });

      const data = await res.json();

      if (res.status === 200) {

  setAuthError("");
  setUserEmail(tempEmail);
  setIsLoggedIn(true);

  localStorage.setItem("user_id", data.user_id);
  localStorage.setItem("user_email", tempEmail);
  localStorage.setItem("user_name", tempName);
  localStorage.setItem("isLoggedIn", "true");

  navigate("/");
} else {
        setAuthError(data.message);
      }

      return;
    }

    // =========================
    // LOGIN API
    // =========================
    if (location.pathname === "/login") {

      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: tempEmail,
          password: tempPassword
        })
      });

      const data = await res.json();

      if (res.status === 200) {
        setAuthError("");
        setUserEmail(tempEmail);
        setIsLoggedIn(true);

        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("user_email", tempEmail);
        localStorage.setItem("user_name", data.name);
        localStorage.setItem("isLoggedIn", "true");

        navigate("/");
      } else {
        setAuthError(data.message);
      }

    }

  } catch (error) {
    console.error(error);
    setAuthError("Server error. Please try again.");
  }
};


// Logout fuunction
const handleLogout = () => {

  setIsLoggedIn(false);
  setUserEmail('');
  setTempEmail('');
  setTempPassword('');

  localStorage.removeItem("user_id");
  localStorage.removeItem("user_email");
  localStorage.removeItem("isLoggedIn");

  navigate('/');
};






  const simulateNetworkDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // --- DASHBOARD DATA GENERATOR ---

  // EMAIL
  const runSimulation = async () => {
  if (!emailText) return;

  setIsScanning(true);
  setScanResult(null);

  try {
    const res = await fetch("http://localhost:5000/analyze/email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email_text: emailText,
        user_id: localStorage.getItem("user_id")
      })
    });

    const data = await res.json();

    let status = "safe";

      if (data.result === "Fraud") status = "danger";
      else if (data.result === "Moderate") status = "warning";
      else status = "safe";

    setScanResult({
      input: emailText,
      status: status,
      title: data.result,
      message: "Analysis completed using ML model.",
      confidence: data.score,
      factors: data.factors,
      indicators: [
        {
          icon: "🧠",
          label: "Machine Learning Detection",
          desc: "Prediction generated using trained phishing detection model."
        }
      ]
    });

  } catch (err) {
    console.error(err);
    alert("Server error while analyzing email.");
  }

  setIsScanning(false);
};



// URL CHECK
  const runUrlCheck = async () => {

  if (!urlText) return;

  setUrlScanning(true);
  setUrlScanResult(null);

  try {

    const res = await fetch("http://localhost:5000/analyze/url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url_text: urlText,
        user_id: localStorage.getItem("user_id")
      })
    });

    const data = await res.json();

    let status = "safe";

        if (data.result === "Fraud") {
            status = "danger";
          } else if (data.result === "Moderate") {
            status = "warning";
          } else {
            status = "safe";
          }

    setUrlScanResult({
      input: urlText,
      status: status,
      title: data.result,
      message: "URL analyzed using ML detection model.",
      confidence: data.score,
      factors: data.factors,
      indicators: [
        {
          icon: "🌐",
          label: "URL Pattern Analysis",
          desc: "Machine learning model detected suspicious URL patterns."
        }
      ]
    });

  } catch (err) {
    console.error(err);
  }

  setUrlScanning(false);

};



  const getUsername = () => {

  const name = localStorage.getItem("user_name");

  if (name) return name;

  if (!userEmail) return "User";

  return userEmail.split("@")[0];
};

// ===== USER ANALYTICS =====

const totalScans = history.length;

const fraudCount = history.filter(h => h.Result === "Fraud").length;

const safeCount = history.filter(h => h.Result === "Safe").length;

const moderateCount = history.filter(h => h.Result === "Moderate").length;

const emailCount = history.filter(h => h.Type === "Email").length;

const urlCount = history.filter(h => h.Type === "URL").length;

const avgRisk =
totalScans === 0
? 0
: Math.round(
(
fraudCount * 90 +
moderateCount * 50 +
safeCount * 10
) / totalScans
);

// Pie Chart Data

const pieData = [
{ name: "Fraud", value: fraudCount },
{ name: "Safe", value: safeCount },
{ name: "Moderate", value: moderateCount }
];

// Bar Graph Data

const barData = [
{ name: "Email", scans: emailCount },
{ name: "URL", scans: urlCount }
];




//Download PDF Report Function

const downloadPDF = (data, type) => {

  const doc = new jsPDF();

  const name = localStorage.getItem("user_name") || "User";
  const date = new Date().toLocaleString();

  let y = 15;

  // ================= HEADER =================
  doc.setFillColor(40, 60, 120);
  doc.rect(0, 0, 210, 20, "F");

  doc.setTextColor(255,255,255);
  doc.setFontSize(14);
  doc.setFont("helvetica","bold");
  doc.text("FraudX - Fraud Detection Using ML", 10, 12);

  doc.setFontSize(10);
  doc.text("Security Analysis Report", 150, 12);

  doc.setTextColor(0,0,0);
  doc.setFont("helvetica","normal");

  y = 30;

  // ================= USER INFO =================
  doc.setFont("helvetica","bold");
  doc.text("User Information", 10, y);

  doc.setFont("helvetica","normal");
  y += 6;

  doc.rect(10, y, 190, 20);

  doc.text(`Name: ${name}`, 12, y + 6);
  doc.text(`Date: ${date}`, 12, y + 12);

  y += 30;

  // ================= INPUT =================
  doc.setFont("helvetica","bold");
  doc.text(`${type} Details`, 10, y);

  doc.setFont("helvetica","normal");
  y += 6;

  doc.rect(10, y, 190, 20);

  doc.setFont("helvetica","bold");
  doc.text(`Input ${type}:`, 12, y + 6);

  doc.setFont("helvetica","normal");
  doc.text(data.input || "N/A", 12, y + 12);

  y += 30;

  // ================= RESULT =================
  doc.setFont("helvetica","bold");
  doc.text("Analysis Result", 10, y);

  doc.setFont("helvetica","normal");
  y += 6;

  doc.rect(10, y, 190, 20);

  doc.text(`Prediction: ${data.title}`, 12, y + 6);
  doc.text(`Confidence Score: ${data.confidence}%`, 12, y + 12);

  y += 30;

  // ================= RISK =================
  doc.setFont("helvetica","bold");
  doc.text("Risk Factor Analysis", 10, y);

  doc.setFont("helvetica","normal");
  y += 6;

  doc.rect(10, y, 190, 30);

  doc.text(`• Suspicious Keywords: ${data.factors.keywords}%`, 12, y + 6);
  doc.text(`• Domain Reputation: ${data.factors.domain}%`, 12, y + 12);
  doc.text(`• Urgency / Redirection: ${data.factors.urgency}%`, 12, y + 18);
  doc.text(`• Suspicious Links: ${data.factors.links}%`, 12, y + 24);

  y += 40;

  // ================= INDICATORS =================
  doc.setFont("helvetica","bold");
  doc.text("Top Indicators Detected", 10, y);

  doc.setFont("helvetica","normal");
  y += 6;

  doc.rect(10, y, 190, 20);

  data.indicators.forEach((i, index) => {
    doc.text(`• ${i.label}`, 12, y + 6 + (index * 6));
  });

  y += 30;

  // ================= SUMMARY (UPGRADED) =================
  doc.setFont("helvetica","bold");
  doc.text("Detailed Summary & Recommendations", 10, y);

  doc.setFont("helvetica","normal");
  y += 6;

  doc.rect(10, y, 190, 50);

  let summary = "";

  if (data.title === "Fraud") {
    summary =
      "This analysis strongly indicates that the provided input is fraudulent. " +
      "Users are advised to avoid interacting with this content immediately. " +
      "Do not click on any links or share personal information. " +
      "If you have already interacted with it, change your passwords and contact your bank if necessary. " +
      "Always verify the authenticity of sources before trusting them.";
  }
  else if (data.title === "Moderate") {
    summary =
      "This input contains suspicious characteristics that may indicate potential fraud. " +
      "Exercise caution before interacting with it. Verify the sender or website independently. " +
      "Avoid sharing sensitive information such as passwords or OTPs. " +
      "Use additional verification methods to confirm authenticity.";
  }
  else {
    summary =
      "No major threats were detected in this analysis. However, users should always remain cautious. " +
      "Ensure the source is trusted before interacting. Avoid clicking unknown links and never share personal details unnecessarily. " +
      "Maintaining awareness is key to staying protected from evolving cyber threats.";
  }

  const splitSummary = doc.splitTextToSize(summary, 180);
  doc.text(splitSummary, 12, y + 8);

  y += 60;

  // ================= FOOTER (CENTERED) =================
  doc.setFontSize(9);
  doc.setTextColor(120);

  doc.text(
    "Generated by FraudX Security System",
    105,
    285,
    { align: "center" }
  );

  doc.save(`${type}_FraudX_Report.pdf`);
};

// ---- Counter------------
const StatsSection = ({ stats }) => {

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.3
  });

  return (
    <section className="stats-section" ref={ref}>
      <div className="stats-container">

        {/* EMAIL */}
        <div className="stat-box">
          <h1>
            {inView && <CountUp end={stats.emails} duration={2} />}+
          </h1>
          <p>📧 Emails Detected</p>
        </div>

        {/* URL */}
        <div className="stat-box">
          <h1>
            {inView && <CountUp end={stats.urls} duration={2} />}+
          </h1>
          <p>🌐 URLs Detected</p>
        </div>

        {/* ACCURACY */}
        <div className="stat-box">
          <h1>
            {inView && <CountUp end={97} duration={2} />}%
          </h1>
          <p>🎯 Model Accuracy</p>
        </div>

      </div>
    </section>
  );
};








  // --- ADMIN OVERRIDE ---
<Route path="/admin" element={<AdminLogin />} />



  return (
    <div className="app-container">
      {/* --- Navigation Bar --- */}
      {!isAdminPage && (
      <nav className="navbar">
        <div className="logo" onClick={() => navigate('/')}>
          <div className="logo-icon"><ShieldIcon /></div>
          FraudX
        </div>
        
        <div className="nav-right">
          <button className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} onClick={() => navigate('/')}>Home</button>
          <button className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`} onClick={() => navigate('/about')}>About Us</button>
          <button className={`nav-link ${location.pathname === '/safety' ? 'active' : ''}`} onClick={() => navigate('/safety')}>Safety</button>
          <div className="nav-divider"></div>
          {isLoggedIn ? (
            <div className="user-badge" onClick={() => navigate('/profile')}>
              <span className="status-dot"></span>{getUsername()}
            </div>
          ) : (
            <>
              <button className="btn-small" onClick={() => navigate('/login')}>Login</button>
              <button className="btn-small-outline" onClick={() => navigate('/signup')}>Sign Up</button>
            </>
          )}
        </div>
      </nav>
    )}





<main className="content-wrapper">
 <Routes>

{/* 1. HOME PAGE */}
<Route path="/" element={

  <div className="page-home fade-in">

    {/* HERO */}
    <section className="hero-section">
      <div className="hero-content">
        
        <div className="system-badge">
          <span className="dot"></span> SYSTEM ACTIVE
        </div>

        <h1>
          Fraud Doesn’t Warn.<br />FraudX Does.
        </h1>

        <p className="hero-subtext">
          The most advanced platform to analyze suspicious digital behavior. 
          Check emails and URLs instantly with our military-grade scanning engine.
        </p>

        <button 
          className="btn-primary"
          onClick={() => navigate('/select')}
        >
          Start Fraud Check
        </button>

      </div>

      <div className="hero-visual">
        <div className="shield-container">
          <ShieldIcon />
          <div className="shield-forcefield"></div>
          <div className="virus v1"><VirusIcon /></div>
          <div className="virus v2"><VirusIcon /></div>
          <div className="virus v3"><VirusIcon /></div>
        </div>
      </div>
    </section>


    {/* ✅ STATS SECTION */}
    <StatsSection stats={stats} />


    {/* ANALYSIS SECTION */}
    <section className="analysis-banner-section">
      <div className="analysis-banner">
        <h2>Begin Secure Analysis</h2>
        <p>
          Select the category of suspicious activity you want to investigate 
          through FraudX's guided process.
        </p>

        <button 
          className="btn-glow-outline"
          onClick={() => navigate('/select')}
        >
          Select Fraud Type
        </button>
      </div>
    </section>


    {/* FEATURES */}
    <section className="features-grid" style={{ marginTop: '60px' }}>

      <div className="feature-card">
        <div className="icon-box"><ShieldIcon /></div>
        <h3>Real-Time Defense</h3>
        <p>
          We quickly scan inputs using machine learning techniques 
          to provide risk insights in seconds.
        </p>
      </div>

      <div className="feature-card">
        <div className="icon-box"><LockIcon /></div>
        <h3>Private & Secure</h3>
        <p>
          We focus on keeping your data safe and confidential 
          while performing security checks.
        </p>
      </div>

      <div className="feature-card">
        <div className="icon-box"><GlobeIcon /></div>
        <h3>Global Database</h3>
        <p>
          We use trained datasets to detect common fraud 
          and phishing behaviors.
        </p>
      </div>

    </section>

  </div>

} />








  {/* 2. SELECT FRAUD */}
       <Route path="/select" element={

  <div className="page-center fade-in">

    <h2>Select Fraud Check</h2>

    <p className="subtext" style={{ marginBottom: '50px' }}>
      Choose the category of threat you want to analyze.
    </p>

    <div className="selection-grid large-cards">

      <div 
        className="selection-card" 
        onClick={() => navigate('/check-email')}
      >
        <div className="card-icon"><MailIcon /></div>
        <h3>Email Analysis</h3>
        <p>
          Check sender reputation and scan text for known phishing patterns.
        </p>
      </div>

      <div 
        className="selection-card" 
        onClick={() => navigate('/check-url')}
      >
        <div className="card-icon"><GlobeIcon /></div>
        <h3>URL Scanner</h3>
        <p>
          Verify website authenticity and cross-reference against malware lists.
        </p>
      </div>

    </div>

    <button 
      className="btn-text"
      style={{ marginTop: '40px' }}
      onClick={() => navigate('/')}
    >
      ← Back to Home
    </button>

  </div>

} />






        {/* 3. ABOUT PAGE */}
        <Route path="/about" element={
          <div className="page-about fade-in">
            <div className="about-hero"><h1>What is FraudX?</h1><p>Your ultimate shield against digital deception.</p></div>
            <div className="about-content">
              <div className="glass-card full">
                <h3>Our Mission</h3>
                <p style={{color: 'var(--text-muted)', lineHeight: '1.8', marginBottom: '20px'}}>At FraudX, we believe that everyone deserves to navigate the digital world safely. Cyber threats are evolving faster than ever, and traditional warning signs are no longer enough to protect individuals and businesses. Our platform exists to level the playing field by putting advanced, enterprise-grade threat detection directly into your hands.</p>
                <h3 style={{marginTop: '40px'}}>How We Work</h3>
                <div className="info-grid">
                  <div className="info-item"><h4>1. Data Gathering</h4><p>FraudX aggregates data from global threat intelligence feeds, blacklisted domains, and recognized phishing templates to keep our knowledge base up to the minute.</p></div>
                  <div className="info-item"><h4>2. Machine Learning Analysis</h4><p>When you input an email or URL, our AI models analyze the structure, linguistics, and metadata. It looks for urgency markers, spoofed headers, and suspicious routing.</p></div>
                  <div className="info-item"><h4>3. Real-Time Verdict</h4><p>Within seconds, we return a clear verdict and a confidence score, empowering you to make safe decisions about links to click and emails to trust.</p></div>
                </div>
              </div>
            </div>
          </div>
      } />






        {/* 4. SAFETY PAGE */}
        <Route path="/safety" element={
          <div className="page-about fade-in">
            <div className="about-hero"><h1>Prevention & Recovery</h1><p>Knowledge is your first line of defense.</p></div>
            <div className="about-content">
              <div className="glass-card full">
                <h3><span className="teal-text">🛡</span> How to Avoid Fraud</h3>
                <div className="info-grid">
                  <div className="info-item"><h4>1. The "Pause" Rule</h4><p>Scammers create urgency (e.g., "Act Now!", "Account Suspended"). Always pause for 5 minutes before clicking anything.</p></div>
                  <div className="info-item"><h4>2. Verify the Source</h4><p>Check the email sender deeply. Does it say <code>@paypal-support.com</code> instead of <code>@paypal.com</code>?</p></div>
                  <div className="info-item"><h4>3. Use Tools, Not Gut Feeling</h4><p>Use FraudX to scan suspicious URLs or files. Enable 2-Factor Authentication (2FA) on all your banking accounts.</p></div>
                </div>
              </div>
              <div className="glass-card full danger-border">
                <h3><span className="amber-text">⚠</span> What to Do If Fraud Occurred</h3>
                <div className="step-list">
                  <div className="step"><div className="step-num">1</div><div className="step-text"><strong>Disconnect Immediately:</strong> Disconnect your device from the internet to stop malware spreading.</div></div>
                  <div className="step"><div className="step-num">2</div><div className="step-text"><strong>Contact Bank:</strong> Call your bank immediately. Ask them to freeze your cards.</div></div>
                  <div className="step"><div className="step-num">3</div><div className="step-text"><strong>Change Credentials:</strong> From a <em>different</em> device, change your passwords.</div></div>
                  <div className="step"><div className="step-num">4</div><div className="step-text"><strong>Report It:</strong> File a report with your local cybercrime unit.</div></div>
                </div>
              </div>
            </div>
          </div>
        } />





         <Route path="/admin" element={<AdminLogin />} />
        {/* 5. LOGIN PAGE */}
       <Route path="/login" element={
          <div className="page-auth fade-in">
            <div className="auth-card">
              <h2>Secure Login</h2>
              {authError && <div className="auth-error">{authError}</div>}
              <form onSubmit={handleLogin}>
                <div className="input-group">
                  <label>Email Address</label>
                  <input type="email" placeholder="user@fraudx.com" value={tempEmail} onChange={(e) => setTempEmail(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Password</label>
                  <input type="password" placeholder="••••••••" value={tempPassword} onChange={(e) => setTempPassword(e.target.value)} />
                </div>
                <button type="submit" className="btn-primary full-width">Authenticate</button>
              </form>
              <p className="auth-footer">
                Don't have an account? <span onClick={() => navigate('/signup')}>Sign Up</span>
                <span style={{ display: 'block', marginTop: '20px', color: '#475569', cursor: 'pointer', fontSize: '12px' }} onClick={() => navigate('/admin')}>🔒 Admin Portal</span>
              </p>
            </div>
          </div>
        } />








       {/* 6. SIGN UP PAGE */}
  <Route path="/signup" element={
  <div className="page-auth fade-in">
    <div className="auth-card">
      <h2>Create Account</h2>
      {authError && <div className="auth-error">{authError}</div>}

      <form onSubmit={handleLogin}>

        {/* NAME FIELD */}
        <div className="input-group">
          <label>Full Name</label>
          <input
            type="text"
            placeholder="Enter your full name"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
          />
        </div>

        {/* EMAIL */}
        <div className="input-group">
          <label>Email Address</label>
          <input
            type="email"
            placeholder="name@example.com"
            value={tempEmail}
            onChange={(e) => setTempEmail(e.target.value)}
          />
        </div>

        {/* PASSWORD */}
        <div className="input-group">
          <label>Create Password</label>
          <input
            type="password"
            placeholder="Must include upper, number & symbol"
            value={tempPassword}
            onChange={(e) => setTempPassword(e.target.value)}
          />

          <small className="password-hint">
            Min. 8 characters, 1 uppercase, 1 number, 1 special character.
          </small>
        </div>

        <button type="submit" className="btn-primary full-width">
          Register Securely
        </button>

      </form>

      <p className="auth-footer">
        Already a member? 
        <span onClick={() => navigate('/login')}> Login</span>
      </p>

    </div>
  </div>
} />








        {/* 7. CHECK EMAIL (ANALYTICAL DASHBOARD VIEW) */}
         <Route path="/check-email" element={
          <div className="page-center slide-up">
            
            {!scanResult && (
              <div className="input-panel" style={{maxWidth: '700px', width: '100%'}}>
                <div className="panel-header"><MailIcon /><h3>Email Scanner</h3></div>
                <p>Paste the full body of an email to check for known malicious patterns and phishing linguistics.</p>
                <div className="input-group-large">
                  <textarea 
                    placeholder="Paste the full email content here..." 
                    value={emailText} 
                    onChange={(e) => setEmailText(e.target.value)}
                    rows={8}
                  />
                </div>
                {!isScanning && (
                  <button className="btn-primary full-width" onClick={runSimulation}>Analyze Email</button>
                )}
                {isScanning && (
                  <div className="scanning-state">
                    <div className="spinner"></div><span>Running Deep Linguistic Analysis...</span>
                  </div>
                )}
              </div>
            )}

            {scanResult && !isScanning && (
              <div className="dashboard-report fade-in">
                
                <div className="dashboard-header">
                  <div className="dash-title"><MailIcon /> Analysis Report</div>
                  <button className="btn-small-outline" onClick={() => { setScanResult(null); setEmailText(""); }}>Close Analysis</button>
                </div>

                <div className={`dash-alert-banner ${scanResult.status}`}>
                  <div className="dash-alert-text">
                    <h3 style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                      {scanResult.status === 'danger' ? <AlertIcon /> : <ShieldIcon />} 
                      {scanResult.title}
                    </h3>
                    <p style={{marginTop: '5px'}}>{scanResult.message}</p>
                  </div>
                  <div className="dash-score-box">
                    <div className="score-num" style={{fontSize: '42px', fontWeight: 'bold'}}>
                      {scanResult.confidence}<span style={{fontSize: '24px'}}>%</span>
                    </div>
                    <div className="score-label" style={{color: '#94A3B8'}}>Confidence</div>
                  </div>
                </div>

                <div className="dash-grid">
                  <div className="dash-card">
                    <h4>Risk Factor Analysis</h4>
                    <div className="factor-list">
                      <div className="factor-row">
                        <div className="factor-labels"><span>Phishing Keywords</span> <span>{scanResult.factors.keywords}%</span></div>
                        <div className="factor-track"><div className={`factor-fill ${scanResult.factors.keywords > 70 ? 'danger' : scanResult.factors.keywords > 40 ? 'warning' : 'safe'}`} style={{width: `${scanResult.factors.keywords}%`}}></div></div>
                      </div>
                      <div className="factor-row">
                        <div className="factor-labels"><span>Spoofed Domain</span> <span>{scanResult.factors.domain}%</span></div>
                        <div className="factor-track"><div className={`factor-fill ${scanResult.factors.domain > 70 ? 'danger' : scanResult.factors.domain > 40 ? 'warning' : 'safe'}`} style={{width: `${scanResult.factors.domain}%`}}></div></div>
                      </div>
                      <div className="factor-row">
                        <div className="factor-labels"><span>Urgent Language</span> <span>{scanResult.factors.urgency}%</span></div>
                        <div className="factor-track"><div className={`factor-fill ${scanResult.factors.urgency > 70 ? 'danger' : scanResult.factors.urgency > 40 ? 'warning' : 'safe'}`} style={{width: `${scanResult.factors.urgency}%`}}></div></div>
                      </div>
                      <div className="factor-row">
                        <div className="factor-labels"><span>Suspicious Links</span> <span>{scanResult.factors.links}%</span></div>
                        <div className="factor-track"><div className={`factor-fill ${scanResult.factors.links > 70 ? 'danger' : scanResult.factors.links > 40 ? 'warning' : 'safe'}`} style={{width: `${scanResult.factors.links}%`}}></div></div>
                      </div>
                    </div>
                  </div>

                  <div className="dash-card">
                    <h4>Top Indicators Detected</h4>
                    <div className="indicator-list">
                      {scanResult.indicators.map((ind, idx) => (
                        <div className="indicator-item" key={idx}>
                          <span className="indicator-icon">{ind.icon}</span>
                          <div className="indicator-text">
                            <strong>{ind.label}: </strong> {ind.desc}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="dash-actions" style={{display:'flex',gap:'15px',justifyContent:'center',gap: '20px'}}>
                      <button className="btn-outline" onClick={()=>{ setReportData(scanResult); setShowReport(true);}}>View Full Report</button>
                      <button className="btn-primary" onClick={()=>downloadPDF(scanResult,"Email")}>Download Report</button>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {!scanResult && (
              <button className="btn-text" onClick={() => navigate('/select')} style={{marginTop: '30px'}}>← Back to Selection</button>
            )}
          </div>
        } />








 {/* 8. CHECK URL */}
 <Route path="/check-url" element={
  <div className="page-center slide-up">

    {/* INPUT PANEL */}
    {!urlScanResult && (
      <div className="input-panel" style={{maxWidth:'700px', width:'100%'}}>
        
        <div className="panel-header">
          <GlobeIcon />
          <h3>URL Scanner</h3>
        </div>

        <p>
          Paste a website URL to check it against our active lists for phishing,
          malware, or fraudulent behavior.
        </p>

        <div className="input-group-large">
          <input
            type="text"
            placeholder="https://secure-login-example.com"
            value={urlText}
            onChange={(e) => setUrlText(e.target.value)}
          />
        </div>

        {!urlScanning && (
          <button
            className="btn-primary full-width"
            onClick={runUrlCheck}
          >
            Analyze URL
          </button>
        )}

        {urlScanning && (
          <div className="scanning-state">
            <div className="spinner"></div>
            <span>Analyzing URL with ML models...</span>
          </div>
        )}

      </div>
    )}

    {/* DASHBOARD RESULT */}
    {urlScanResult && !urlScanning && (

      <div className="dashboard-report fade-in">

        <div className="dashboard-header">
          <div className="dash-title">
            <GlobeIcon /> URL Analysis Report
          </div>

          <button
            className="btn-small-outline"
            onClick={() => {
              setUrlScanResult(null);
              setUrlText("");
            }}
          >
            Close Analysis
          </button>
        </div>

        <div className={`dash-alert-banner ${urlScanResult.status}`}>

          <div className="dash-alert-text">

            <h3 style={{display:'flex',alignItems:'center',gap:'10px'}}>
              {urlScanResult.status === 'danger'
                ? <AlertIcon />
                : <ShieldIcon />
              }
              {urlScanResult.title}
            </h3>

            <p style={{marginTop:'5px'}}>
              {urlScanResult.message}
            </p>

          </div>

          <div className="dash-score-box">

            <div className="score-num" style={{fontSize:'42px',fontWeight:'bold'}}>
              {urlScanResult.confidence}
              <span style={{fontSize:'24px'}}>%</span>
            </div>

            <div className="score-label" style={{color:'#94A3B8'}}>
              Confidence
            </div>

          </div>

        </div>

        <div className="dash-grid">

          {/* RISK FACTORS */}
          <div className="dash-card">

            <h4>Risk Factor Analysis</h4>

            <div className="factor-list">

              <div className="factor-row">
                <div className="factor-labels">
                  <span>Suspicious Keywords</span>
                  <span>{urlScanResult.factors.keywords}%</span>
                </div>

                <div className="factor-track">
                  <div
                    className="factor-fill warning"
                    style={{width:`${urlScanResult.factors.keywords}%`}}
                  ></div>
                </div>
              </div>

              <div className="factor-row">
                <div className="factor-labels">
                  <span>Domain Reputation</span>
                  <span>{urlScanResult.factors.domain}%</span>
                </div>

                <div className="factor-track">
                  <div
                    className="factor-fill warning"
                    style={{width:`${urlScanResult.factors.domain}%`}}
                  ></div>
                </div>
              </div>

              <div className="factor-row">
                <div className="factor-labels">
                  <span>Redirection Risk</span>
                  <span>{urlScanResult.factors.urgency}%</span>
                </div>

                <div className="factor-track">
                  <div
                    className="factor-fill safe"
                    style={{width:`${urlScanResult.factors.urgency}%`}}
                  ></div>
                </div>
              </div>

              <div className="factor-row">
                <div className="factor-labels">
                  <span>Suspicious Links</span>
                  <span>{urlScanResult.factors.links}%</span>
                </div>

                <div className="factor-track">
                  <div
                    className="factor-fill safe"
                    style={{width:`${urlScanResult.factors.links}%`}}
                  ></div>
                </div>
              </div>

            </div>

          </div>

          {/* INDICATORS */}
<div className="dash-card">

<h4>Top Indicators Detected</h4>

<div className="indicator-list">

{urlScanResult.indicators.map((ind, idx) => (

<div className="indicator-item" key={idx}>

<span className="indicator-icon">{ind.icon}</span>

<div className="indicator-text">
<strong>{ind.label}: </strong> {ind.desc}
</div>

</div>

))}

</div>

<div className="dash-actions" style={{marginTop:'30px',display:'flex',justifyContent:'center',gap: '20px'}}>
 <button className="btn-outline" onClick={()=>{setReportData(urlScanResult); setShowReport(true);}}>View Full Report</button>
 <button className="btn-primary" onClick={()=>downloadPDF(urlScanResult,"URL")}>Download Report</button>
</div>

</div>

        </div>

      </div>

    )}

    {!urlScanResult && (
      <button
        className="btn-text"
        onClick={() => navigate('/select')}
        style={{marginTop:'30px'}}
      >
        ← Back to Selection
      </button>
    )}

  </div>
} />
  







{/* USER ANALYTICS DASHBOARD */}

<Route path="/analytics" element={

<div className="page-profile slide-up">

<div className="profile-dashboard">

<h2 style={{marginBottom:'25px'}}>User Analytics Dashboard</h2>

<div className="dash-grid">

<div className="dash-card">
<h3>Total Scans</h3>
<h1>{totalScans}</h1>
</div>

<div className="dash-card">
<h3>Fraud Detected</h3>
<h1 style={{color:'#ef4444'}}>{fraudCount}</h1>
</div>

<div className="dash-card">
<h3>Safe Results</h3>
<h1 style={{color:'#22c55e'}}>{safeCount}</h1>
</div>

<div className="dash-card">
<h3>Average Risk Score</h3>
<h1>{avgRisk}%</h1>
</div>

</div>

<div style={{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"30px",
marginTop:"30px"
}}>

<div className="glass-panel">

<h3>Fraud vs Safe</h3>

<ResponsiveContainer width="100%" height={320}>
<PieChart>

<Pie
data={pieData}
dataKey="value"
cx="50%"
cy="50%"
outerRadius={110}
label
>
<Cell fill="#ef4444" />   // Fraud - Red
<Cell fill="#22c55e" />   // Safe - Green
<Cell fill="#f59e0b" />   // Moderate - Orange
</Pie>

<Tooltip />
<Legend />

</PieChart>
</ResponsiveContainer>

</div>


<div className="glass-panel">

<h3>Email vs URL</h3>

<ResponsiveContainer width="100%" height={320}>
<BarChart data={barData}>
<CartesianGrid strokeDasharray="3 3" />
<XAxis dataKey="name" />
<YAxis />
<Tooltip />
<Bar dataKey="scans" fill="#38bdf8" />
</BarChart>
</ResponsiveContainer>

</div>

</div>

<button
className="btn-text"
style={{marginTop:'30px'}}
onClick={()=>navigate("/profile")}
>
← Back to Profile
</button>

</div>

</div>

} />





        {/* 9. PROFILE PAGE */}
          <Route path="/profile" element={
          <div className="page-profile slide-up">
            <aside className="profile-sidebar">
              <div className="id-card">
                <div className="avatar-frame"><span className="initials">{getUsername().charAt(0).toUpperCase()}</span></div>
                <h2 style={{textTransform: 'capitalize'}}>{getUsername()}</h2>
                <div className="user-meta">{userEmail}</div>
                <div className="security-level"><div className="level-bar"><div className="fill"></div></div><span>Tier 1 Security User</span></div>
                <button className="btn-outline danger-border full-width" style={{marginTop: '25px', color: 'var(--danger-red)'}} onClick={handleLogout}>Secure Logout</button>
                <button
className="btn-primary full-width"
style={{marginTop:'12px'}}
onClick={()=>navigate("/analytics")}
>
User Analytics Dashboard
</button>
              </div>
            </aside>
            <div className="profile-dashboard">
              <div className="glass-panel">
                <h3>Recent Analysis History</h3>
                <table className="data-table">
                  <thead><tr><th>Date</th><th>Type</th><th>Result</th><th>ID's</th></tr></thead>
                  <tbody>
                    {history.length === 0 ? (
                     <tr>
                      <td colSpan="4" style={{textAlign:'center', color:'#64748b'}}>
                        No recent activity found.
                    </td>
                    </tr>
                        ) : (
                           history.map((item, index) => (
                            <tr key={index}>
                              <td>{new Date(item.Time).toLocaleString()}</td>
                              <td>{item.Type}</td>
                              <td
                                style={{
                                    color:
                                    item.Result === "Safe"
                                      ? "#22c55e"
                                      : item.Result === "Moderate"
                                      ? "#f59e0b"
                                      : "#ef4444",
                                      fontWeight: "600"
                                   }}
                                   >
                                 <td>
  <span className={`result-badge ${item.Result.toLowerCase()}`}>
    <span className="result-dot"></span>
    {item.Result}
  </span>
</td>
                              </td>
                              <td>{item.Reference_Id}</td>
                           </tr>
                           ))
                         )}
                    </tbody>
                </table>
              </div>
            </div>
          </div>
        } />


          </Routes>
      </main>










      {/* --- GLOBAL FOOTER --- */}
     {/* FOOTER */}
{!isAdminPage && location.pathname !== "/profile" && (

  <footer className="footer-section">

    <div className="footer-content">

      {/* BRAND */}
      <div className="footer-brand">
        <div 
          className="logo" 
          style={{ marginBottom: '15px' }} 
          onClick={() => navigate('/')}
        >
          <div className="logo-icon"><ShieldIcon /></div>
          FraudX
        </div>

        <p>
          Your ultimate shield against digital deception. 
          We leverage advanced scanning techniques to keep your inbox and browsing safe.
        </p>
      </div>


      {/* LINKS */}
      <div className="footer-links">
        <h4>Quick Links</h4>

        <button className="footer-link" onClick={() => navigate('/')}>
          Home
        </button>

        <button className="footer-link" onClick={() => navigate('/about')}>
          About Us
        </button>

        <button className="footer-link" onClick={() => navigate('/safety')}>
          Safety Guide
        </button>

        <a href="mailto:contact@fraudx.com" className="footer-link">
          Contact Us
        </a>
      </div>


      {/* DEVELOPERS */}
      <div className="footer-developers">
        <h4>Developed By</h4>
        <ul>
          <li>Adesh Bordekar</li>
          <li>Adarsh Sonar</li>
          <li>Devendra Lohar</li>
          <li>Ganesh Chaudhary</li>
        </ul>
      </div>

    </div>


    {/* BOTTOM */}
    <div className="footer-bottom">
      <p>
        &copy; {new Date().getFullYear()} FraudX Security. 
        All rights reserved. | Privacy Policy | Terms of Service
      </p>
    </div>

  </footer>

)}








    {showReport && reportData && (

<div className="report-modal-overlay">

<div className="report-modal">

<h2>Detailed Security Report</h2>

<div className="report-section">
<b>Prediction:</b> {reportData.title}
</div>

<div className="report-section">
<b>Confidence Score:</b> {reportData.confidence}%
</div>

<div className="report-section">
<b>Risk Factors</b>

<ul>

<li>Suspicious Keywords: {reportData.factors.keywords}%</li>

<li>Domain Reputation: {reportData.factors.domain}%</li>

<li>Urgent Language / Redirection: {reportData.factors.urgency}%</li>

<li>Suspicious Links: {reportData.factors.links}%</li>

</ul>

</div>

<div className="report-section">

<b>Indicators</b>

{reportData.indicators.map((i,idx)=>(
<div key={idx}>{i.label}</div>
))}

</div>

<button
className="btn-primary"
onClick={()=>setShowReport(false)}
>
Close Report
</button>

</div>

</div>

)}



    </div>
  );
}

export default App;