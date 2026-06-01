import { useEffect, useMemo, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";
import "./App.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const professions = {
  tech: ["python", "react", "javascript", "html", "css", "github", "cybersecurity", "authentication", "software", "developer", "programming"],
  doctor: ["doctor", "medical", "patient", "hospital", "clinical", "healthcare", "diagnosis", "treatment"],
  nurse: ["nurse", "nursing", "patient care", "hospital", "clinical"],
  pharmacist: ["pharmacist", "pharmacy", "medication", "prescription", "drug"],
  lawyer: ["lawyer", "legal", "law", "case", "court", "contract"],
  teacher: ["teacher", "teaching", "education", "classroom", "student"],
  accountant: ["accountant", "accounting", "finance", "audit", "tax", "budget"],
  engineer: ["engineer", "engineering", "civil", "mechanical", "electrical"],
  designer: ["designer", "design", "figma", "photoshop", "canva", "ui", "ux"],
  marketing: ["marketing", "campaign", "seo", "branding", "social media"],
};

function detectProfession(text) {
  const lower = text.toLowerCase();

  for (const [profession, keywords] of Object.entries(professions)) {
    if (keywords.some((word) => lower.includes(word))) return profession;
  }

  return "general";
}

function generateQuestions(role, mode, cvName) {
  const cvText = localStorage.getItem("cv_text") || "";
  const combined = `${role} ${cvName} ${cvText}`.toLowerCase();
  const profession = detectProfession(combined);

  const banks = {
    tech: [
      "Tell me about a technical project from your CV and the problem it solved.",
      "Your CV mentions technical skills. Explain one project where you used them.",
      "How would you improve the security, performance, or scalability of one of your projects?",
      "Explain a technical challenge you faced and how you solved it.",
      "What tools or technologies from your CV are you most confident using?",
    ],
    doctor: [
      "Tell me about a challenging patient case or medical situation you handled.",
      "How do you communicate complex medical information to patients?",
      "How do you manage pressure in a clinical environment?",
      "How do you ensure patient safety and accurate documentation?",
      "What healthcare experience from your CV are you most proud of?",
    ],
    nurse: [
      "Describe a difficult patient care situation and how you handled it.",
      "How do you prioritize patients during a busy shift?",
      "Tell me about a time you worked with a healthcare team.",
      "How do you communicate with patients and families professionally?",
      "How do you stay calm under pressure in nursing?",
    ],
    pharmacist: [
      "How do you ensure medication safety and accuracy?",
      "Describe how you would handle a prescription error.",
      "How do you explain medication instructions clearly to patients?",
      "Tell me about your experience with pharmacy systems or patient care.",
      "How would you handle a possible drug interaction concern?",
    ],
    lawyer: [
      "Describe a legal case or matter that challenged your analytical skills.",
      "How do you prepare for a legal argument or client matter?",
      "Tell me about a time you explained complex legal information clearly.",
      "How do you manage deadlines and legal documentation?",
      "How do you handle client confidentiality?",
    ],
    teacher: [
      "How do you keep students engaged during lessons?",
      "Describe a time you helped a student understand a difficult concept.",
      "How do you adapt your teaching style for different learners?",
      "How do you manage classroom challenges?",
      "What teaching experience from your CV are you most proud of?",
    ],
    accountant: [
      "Tell me about your experience handling financial records or reports.",
      "How do you ensure accuracy when working with financial data?",
      "Describe a time you found or prevented an error in financial work.",
      "How do you manage deadlines during reporting or audit periods?",
      "What accounting or finance skill from your CV is your strongest?",
    ],
    engineer: [
      "Tell me about an engineering project you worked on.",
      "Describe a technical problem you solved and how you approached it.",
      "How do you balance safety, cost, and performance in engineering decisions?",
      "What engineering tool or method from your CV are you most confident using?",
      "How do you test and validate your engineering work?",
    ],
    designer: [
      "Walk me through your design process from concept to completion.",
      "How do you balance creativity with user needs?",
      "Tell me about a design project you are proud of.",
      "How do you use feedback to improve a design?",
      "What design tools from your CV do you use most effectively?",
    ],
    marketing: [
      "Describe a marketing campaign you worked on and its results.",
      "How do you measure whether a campaign is successful?",
      "Tell me about a time you improved engagement, reach, or conversions.",
      "How do you understand a target audience?",
      "What marketing or branding experience from your CV are you most proud of?",
    ],
    general: [
      "Tell me about yourself and your background.",
      `Why are you interested in ${role || "this role"}?`,
      cvName ? `Your uploaded resume is ${cvName}. Tell me about one experience from it.` : "Tell me about a project or achievement you are proud of.",
      "Describe a time you solved a difficult problem.",
      "Why should we choose you for this opportunity?",
    ],
  };

  if (mode === "system") {
    return [
      `How would you design a complete platform for ${role || "interview preparation"}?`,
      "What database tables would you create and why?",
      "How would you make the platform scalable for thousands of users?",
      "How would you protect user CVs and interview data?",
      "How would you track user progress and generate analytics?",
    ];
  }

  return banks[profession] || banks.general;
}

function analyzeAnswer(answer) {
  const words = answer.trim().split(/\s+/).filter(Boolean).length;
  const hasProject = /project|built|created|developed|implemented|designed|experience/i.test(answer);
  const hasTech = /react|python|api|database|security|patient|legal|finance|marketing|teaching|design|engineering/i.test(answer);
  const hasImpact = /improved|increased|reduced|result|impact|users|accuracy|performance|successful/i.test(answer);
  const hasStructure = /first|then|finally|because|therefore|result|challenge|solution/i.test(answer);

  const communication = Math.min(95, 35 + Math.min(words, 100) * 0.45);
  const technical = Math.min(95, 45 + (hasTech ? 30 : 0) + (hasProject ? 10 : 0));
  const structure = Math.min(95, 45 + (hasStructure ? 30 : 0) + (words > 50 ? 10 : 0));
  const impact = Math.min(95, 40 + (hasImpact ? 35 : 0) + (hasProject ? 10 : 0));
  const confidence = Math.min(95, 45 + (words > 40 ? 20 : 0) + (words > 80 ? 15 : 0));

  const overall = Math.round(
    communication * 0.25 +
      technical * 0.25 +
      structure * 0.2 +
      impact * 0.15 +
      confidence * 0.15
  );

  return {
    overall,
    communication: Math.round(communication),
    technical: Math.round(technical),
    structure: Math.round(structure),
    impact: Math.round(impact),
    confidence: Math.round(confidence),
    strengths: [
      hasProject ? "Good use of experience-based examples." : "You attempted to answer the question clearly.",
      hasTech ? "Relevant field-specific knowledge was included." : "The answer can be improved with more specific terminology.",
    ],
    weaknesses: [
      hasStructure ? "Structure is clear." : "Use STAR: Situation, Task, Action, Result.",
      hasImpact ? "Impact was explained." : "Add measurable results or outcomes.",
      words < 40 ? "Answer is short. Add more detail." : "Good answer length.",
    ],
  };
}

function getAccounts() {
  return JSON.parse(localStorage.getItem("aic_accounts") || "{}");
}

function saveAccounts(accounts) {
  localStorage.setItem("aic_accounts", JSON.stringify(accounts));
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [role, setRole] = useState("");
  const [cv, setCv] = useState("");
  const [mode, setMode] = useState("behavioral");
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("signin");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") !== "false");
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("aic_current_user") || "null"));
  const [verificationCode, setVerificationCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");

  useEffect(() => {
    document.body.classList.toggle("light", !darkMode);
    localStorage.setItem("darkMode", String(darkMode));
  }, [darkMode]);

  const historyKey = user ? `aic_history_${user.email}` : "aic_history_guest";
  const history = useMemo(() => JSON.parse(localStorage.getItem(historyKey) || "[]"), [historyKey, screen]);

  const average = useMemo(() => {
    if (!results.length) return 0;
    return Math.round(results.reduce((sum, r) => sum + r.analysis.overall, 0) / results.length);
  }, [results]);

  const stats = useMemo(() => {
    const total = history.length;
    const best = total ? Math.max(...history.map((h) => h.score)) : 0;
    const avg = total ? Math.round(history.reduce((s, h) => s + h.score, 0) / total) : 0;
    return { total, best, avg };
  }, [history]);

  async function handleCvUpload(file) {
    if (!file) return;
    setCv(file.name);

    try {
      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let text = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item) => item.str).join(" ") + " ";
        }

        localStorage.setItem("cv_text", text);
      }
    } catch {
      localStorage.setItem("cv_text", file.name);
    }
  }

  function startInterview() {
    setQuestions(generateQuestions(role, mode, cv));
    setCurrent(0);
    setAnswers({});
    setResults([]);
    setScreen("practice");
  }

  function submitAnswer() {
    const answer = answers[current] || "";
    const updated = [...results, { question: questions[current], answer, analysis: analyzeAnswer(answer) }];
    setResults(updated);

    if (current < questions.length - 1) {
      setCurrent(current + 1);
      return;
    }

    const finalScore = Math.round(updated.reduce((sum, r) => sum + r.analysis.overall, 0) / updated.length);
    const session = {
      id: Date.now(),
      role: role || "General Interview",
      mode,
      score: finalScore,
      date: new Date().toLocaleString(),
      results: updated,
    };

    localStorage.setItem(historyKey, JSON.stringify([session, ...history]));
    setScreen("results");
  }

  function startVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      setAnswers({ ...answers, [current]: event.results[0][0].transcript });
    };
    recognition.start();
  }

  function createAccount() {
    const name = document.getElementById("signup-name")?.value || "";
    const email = document.getElementById("signup-email")?.value || "";
    const password = document.getElementById("signup-password")?.value || "";
    const confirm = document.getElementById("signup-confirm")?.value || "";

    if (!name || !email || !password) return alert("Please fill all fields.");
    if (password.length < 6) return alert("Password must be at least 6 characters.");
    if (password !== confirm) return alert("Passwords do not match.");

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);
    alert(`Demo verification code: ${code}`);
    setAuthMode("verify");

    const accounts = getAccounts();
    accounts[email] = { name, email, password, verified: false };
    saveAccounts(accounts);
  }

  function verifyEmail() {
    const email = document.getElementById("verify-email")?.value || "";

    if (enteredCode !== verificationCode) return alert("Incorrect verification code.");

    const accounts = getAccounts();
    if (!accounts[email]) return alert("Account not found.");

    accounts[email].verified = true;
    saveAccounts(accounts);

    localStorage.setItem("aic_current_user", JSON.stringify(accounts[email]));
    setUser(accounts[email]);
    setShowAuth(false);
    alert("Email verified. Account created successfully.");
  }

  function signIn() {
    const email = document.getElementById("auth-email")?.value || "";
    const password = document.getElementById("auth-password")?.value || "";
    const accounts = getAccounts();
    const account = accounts[email];

    if (!account) return alert("No account found.");
    if (account.password !== password) return alert("Incorrect password.");
    if (!account.verified) return alert("Please verify your email first.");

    localStorage.setItem("aic_current_user", JSON.stringify(account));
    setUser(account);
    setShowAuth(false);
  }

  function signOut() {
    localStorage.removeItem("aic_current_user");
    setUser(null);
    setScreen("home");
  }

  function resetPractice() {
    setScreen("home");
    setQuestions([]);
    setResults([]);
    setAnswers({});
    setCurrent(0);
  }

  return (
    <div className="page">
      <nav className="navbar load-in">
        <div className="brand">
          <img src="/logo.png" alt="AI Interview Coach logo" className="logo" />
          <div>
            <h1>AI Interview Coach</h1>
            <p>Practice smarter. Interview with confidence.</p>
          </div>
        </div>

        <div className="nav-actions">
          <button className="nav-btn" onClick={() => setScreen("home")}>Home</button>
          <button className="nav-btn" onClick={() => setScreen("dashboard")}>Dashboard</button>
          <button className="nav-btn" onClick={() => setScreen("admin")}>Admin</button>
          <button className="nav-btn" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "Light" : "Dark"}
          </button>
          {user ? (
            <button className="main-btn small glow-btn" onClick={signOut}>{user.name}</button>
          ) : (
            <button className="main-btn small glow-btn" onClick={() => setShowAuth(true)}>Sign In</button>
          )}
        </div>
      </nav>

      {showAuth && (
        <div className="modal-backdrop">
          <div className="modal pop-modal">
            {authMode === "signin" && (
              <>
                <p className="tag">Sign In</p>
                <h2>Welcome back</h2>
                <input id="auth-email" type="email" placeholder="Email Address" />
                <input id="auth-password" type="password" placeholder="Password" />
                <div className="actions">
                  <button className="secondary" onClick={() => setShowAuth(false)}>Cancel</button>
                  <button className="main-btn glow-btn" onClick={signIn}>Sign In</button>
                </div>
                <p className="auth-switch">
                  Don’t have an account?{" "}
                  <button onClick={() => setAuthMode("signup")}>Create an account</button>
                </p>
              </>
            )}

            {authMode === "signup" && (
              <>
                <p className="tag">Create Account</p>
                <h2>Join AI Interview Coach</h2>
                <input id="signup-name" placeholder="Full Name" />
                <input id="signup-email" type="email" placeholder="Email Address" />
                <input id="signup-password" type="password" placeholder="Password" />
                <input id="signup-confirm" type="password" placeholder="Confirm Password" />
                <div className="actions">
                  <button className="secondary" onClick={() => setShowAuth(false)}>Cancel</button>
                  <button className="main-btn glow-btn" onClick={createAccount}>Create Account</button>
                </div>
                <p className="auth-switch">
                  Already have an account?{" "}
                  <button onClick={() => setAuthMode("signin")}>Sign in</button>
                </p>
              </>
            )}

            {authMode === "verify" && (
              <>
                <p className="tag">Email Verification</p>
                <h2>Verify your email</h2>
                <p className="muted">Enter the demo verification code shown in the alert.</p>
                <input id="verify-email" type="email" placeholder="Email Address" />
                <input value={enteredCode} onChange={(e) => setEnteredCode(e.target.value)} placeholder="Verification Code" />
                <button className="main-btn glow-btn" onClick={verifyEmail}>Verify Email</button>
              </>
            )}
          </div>
        </div>
      )}

      {screen === "home" && (
        <main className="hero">
          <section className="panel hero-panel reveal">
            <p className="tag">AI-style mock interview platform</p>
            <h2>Practice interviews with scoring, reports, and progress tracking.</h2>
            <p className="subtitle">
              Upload your CV, generate profession-specific questions, practice interviews, and receive detailed performance feedback.
            </p>

            <div className="grid-form">
              <label>
                Target Role
                <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Example: Cybersecurity Intern, Doctor, Teacher..." />
              </label>

              <label>
                Interview Mode
                <select value={mode} onChange={(e) => setMode(e.target.value)}>
                  <option value="behavioral">Behavioral</option>
                  <option value="technical">Technical</option>
                  <option value="system">System Design</option>
                </select>
              </label>

              <label className="wide">
                Upload CV / Resume
                <div className="upload-box">
                  <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => handleCvUpload(e.target.files[0])} />
                  <div>
                    <strong>{cv || "Click to upload your CV / Resume"}</strong>
                    <p>Accepted formats: PDF, DOC, DOCX</p>
                  </div>
                </div>
              </label>
            </div>

            <button className="main-btn glow-btn" onClick={startInterview}>Start Interview</button>
          </section>

          <section className="side">
            <div className="card preview-card reveal delay-1">
              <p className="mini">Live Report Preview</p>
              <h3><CountUp target={87} />/100</h3>
              <Progress label="Communication" value={88} />
              <Progress label="Technical Depth" value={82} />
              <Progress label="Structure" value={91} />
            </div>
            <div className="card reveal delay-2"><span>01</span><h3>Previous Scores</h3><p>Track your interview history per account.</p></div>
            <div className="card reveal delay-3"><span>02</span><h3>PDF Reports</h3><p>Download or print your interview report instantly.</p></div>
          </section>
        </main>
      )}

      {screen === "practice" && (
        <main className="panel practice reveal">
          <p className="tag">Question {current + 1} of {questions.length}</p>
          <h2>{questions[current]}</h2>
          <textarea className="answer" value={answers[current] || ""} onChange={(e) => setAnswers({ ...answers, [current]: e.target.value })} placeholder="Type your answer here..." />
          <div className="actions">
            <button className="secondary" onClick={startVoice}>Use Voice</button>
            <button className="secondary" onClick={resetPractice}>Restart</button>
            <button className="main-btn glow-btn" onClick={submitAnswer}>
              {current === questions.length - 1 ? "Finish Interview" : "Submit Answer"}
            </button>
          </div>
        </main>
      )}

      {screen === "results" && (
        <main className="results">
          <section className="panel center reveal">
            <p className="tag">Professional AI Report</p>
            <h2>Your Interview Score</h2>
            <div className="score"><CountUp target={average} />/100</div>
            <button className="main-btn glow-btn" onClick={() => window.print()}>Download / Print PDF Report</button>
          </section>

          <section className="report-layout">
            <div className="panel">
              <h3>Score Breakdown</h3>
              <Progress label="Communication" value={avgMetric(results, "communication")} />
              <Progress label="Technical Depth" value={avgMetric(results, "technical")} />
              <Progress label="Structure" value={avgMetric(results, "structure")} />
              <Progress label="Impact" value={avgMetric(results, "impact")} />
              <Progress label="Confidence" value={avgMetric(results, "confidence")} />
            </div>

            <div className="panel">
              <h3>Recommended Next Steps</h3>
              <ul>
                <li>Use STAR structure.</li>
                <li>Add measurable impact.</li>
                <li>Mention tools, methods, and results.</li>
                <li>Practice weak areas from your score breakdown.</li>
              </ul>
            </div>
          </section>

          <section className="result-grid">
            {results.map((r, i) => (
              <div className="panel result-card" key={i}>
                <div className="result-top"><span>Question {i + 1}</span><strong>{r.analysis.overall}/100</strong></div>
                <h3>{r.question}</h3>
                <p><b>Strengths:</b></p>
                <ul>{r.analysis.strengths.map((s, idx) => <li key={idx}>{s}</li>)}</ul>
                <p><b>Improvements:</b></p>
                <ul>{r.analysis.weaknesses.map((w, idx) => <li key={idx}>{w}</li>)}</ul>
              </div>
            ))}
          </section>
        </main>
      )}

      {screen === "dashboard" && (
        <main className="dashboard-wrap">
          <section className="stat-grid">
            <Stat title="Total Interviews" value={stats.total} />
            <Stat title="Average Score" value={`${stats.avg}/100`} />
            <Stat title="Best Score" value={`${stats.best}/100`} />
          </section>

          <section className="panel reveal">
            <p className="tag">Previous Scores</p>
            <h2>Your Interview History</h2>
            {history.length === 0 ? (
              <div className="empty"><h3>No sessions yet</h3><p>Start your first interview to track your progress.</p></div>
            ) : (
              history.map((h) => (
                <div className="history-row" key={h.id}>
                  <strong>{h.role}</strong>
                  <span>{h.mode}</span>
                  <span>{h.score}/100</span>
                  <small>{h.date}</small>
                </div>
              ))
            )}
          </section>
        </main>
      )}

      {screen === "admin" && (
        <main className="dashboard-wrap">
          <section className="panel reveal">
            <p className="tag">Admin Dashboard</p>
            <h2>Platform Overview</h2>
            <div className="stat-grid">
              <Stat title="Accounts" value={Object.keys(getAccounts()).length} />
              <Stat title="Current User" value={user ? user.name : "Guest"} />
              <Stat title="Theme" value={darkMode ? "Dark" : "Light"} />
            </div>
            <p className="muted">Demo admin dashboard using local browser data.</p>
          </section>
        </main>
      )}
    </div>
  );
}

function CountUp({ target }) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const timer = setInterval(() => {
      start += Math.max(1, Math.ceil(target / 40));
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(start);
      }
    }, 20);
    return () => clearInterval(timer);
  }, [target]);

  return <>{value}</>;
}

function Progress({ label, value }) {
  return (
    <div className="progress-item">
      <div className="progress-label"><span>{label}</span><strong>{value}/100</strong></div>
      <div className="progress-track"><div className="progress-fill" style={{ "--target-width": `${value}%` }}></div></div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="panel stat-card">
      <p>{title}</p>
      <h3>{value}</h3>
    </div>
  );
}

function avgMetric(results, key) {
  if (!results.length) return 0;
  return Math.round(results.reduce((sum, item) => sum + item.analysis[key], 0) / results.length);
}