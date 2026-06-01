import { useEffect, useMemo, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";
import "./App.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const professionKeywords = {
  software: ["software", "developer", "programming", "react", "javascript", "python", "api", "frontend", "backend", "github", "cybersecurity"],
  doctor: ["doctor", "medical", "patient", "clinical", "hospital", "diagnosis", "treatment", "healthcare"],
  nurse: ["nurse", "nursing", "patient care", "ward", "clinical", "healthcare"],
  pharmacist: ["pharmacist", "pharmacy", "medication", "prescription", "drug"],
  lawyer: ["lawyer", "legal", "law", "court", "case", "contract", "client"],
  teacher: ["teacher", "teaching", "education", "classroom", "student", "lesson"],
  accountant: ["accountant", "accounting", "audit", "tax", "finance", "budget", "invoice"],
  engineer: ["engineer", "engineering", "mechanical", "civil", "electrical", "system"],
  designer: ["designer", "design", "figma", "ui", "ux", "branding", "photoshop"],
  marketing: ["marketing", "campaign", "seo", "brand", "social media", "analytics"],
};

const questionBanks = {
  software: [
    "Tell me about a technical project from your CV and the problem it solved.",
    "Explain a technical challenge you faced and how you solved it.",
    "How would you improve the performance, security, or scalability of one of your projects?",
    "What tools or technologies from your CV are you most confident using?",
    "Describe a time you debugged or fixed a difficult issue.",
  ],
  doctor: [
    "Tell me about a challenging patient or clinical situation you handled.",
    "How do you communicate complex medical information clearly?",
    "How do you manage pressure in a healthcare environment?",
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
    "Why are you interested in this role?",
    "Tell me about a project or experience you are proud of.",
    "Describe a time you solved a difficult problem independently.",
    "Why should we choose you for this opportunity?",
  ],
};

function detectProfession(text) {
  const lower = text.toLowerCase();
  for (const [profession, words] of Object.entries(professionKeywords)) {
    if (words.some((word) => lower.includes(word))) return profession;
  }
  return "general";
}

function generateQuestions(role, mode, cvName) {
  const cvText = localStorage.getItem("cv_text") || "";
  const combined = `${role} ${cvName} ${cvText}`;
  const profession = detectProfession(combined);

  if (mode === "system") {
    return [
      `How would you design a complete platform for ${role || "interview preparation"}?`,
      "What database tables would you create and why?",
      "How would you make the platform scalable for thousands of users?",
      "How would you protect user CVs and interview data?",
      "How would you track user progress and generate analytics?",
    ];
  }

  if (mode === "technical") {
    return questionBanks[profession] || questionBanks.general;
  }

  return [
    "Tell me about yourself and your background.",
    `Why are you interested in ${role || "this role"}?`,
    cvName
      ? `Your uploaded resume is ${cvName}. Tell me about one project or experience from it.`
      : "Tell me about a project or experience you are proud of.",
    "Describe a time you solved a difficult problem independently.",
    "Why should we choose you for this opportunity?",
  ];
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function analyzeAnswer(answer) {
  const words = countWords(answer);
  const hasExample = /project|experience|built|created|developed|implemented|designed|managed|handled/i.test(answer);
  const hasTools = /react|javascript|python|api|database|security|patient|legal|finance|marketing|teaching|design|engineering|excel|figma|node|sql/i.test(answer);
  const hasImpact = /improved|increased|reduced|saved|helped|result|impact|users|accuracy|performance|successful|efficient/i.test(answer);
  const hasStructure = /first|second|then|finally|because|therefore|situation|task|action|result|challenge|solution/i.test(answer);
  const hasConfidence = words > 45;

  const communication = Math.min(96, 35 + Math.min(words, 120) * 0.45);
  const technical = Math.min(96, 42 + (hasTools ? 28 : 0) + (hasExample ? 12 : 0));
  const structure = Math.min(96, 45 + (hasStructure ? 30 : 0) + (words > 60 ? 10 : 0));
  const impact = Math.min(96, 38 + (hasImpact ? 35 : 0) + (hasExample ? 10 : 0));
  const confidence = Math.min(96, 45 + (hasConfidence ? 25 : 0) + (words > 90 ? 10 : 0));

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
      hasExample ? "Good use of experience-based examples." : "You answered the question directly.",
      hasTools ? "Relevant field-specific details were included." : "Your answer can be improved with more specific tools or methods.",
      hasStructure ? "The answer has a clear structure." : "The answer would be stronger with clearer structure.",
    ],
    improvements: [
      !hasImpact ? "Add measurable results or outcomes." : "Good impact explanation.",
      words < 55 ? "Expand the answer with more detail." : "Good answer length.",
      !hasStructure ? "Use STAR structure: Situation, Task, Action, Result." : "Keep the structure clear and concise.",
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
  const [mode, setMode] = useState("behavioral");
  const [cv, setCv] = useState("");
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("signin");
  const [verificationCode, setVerificationCode] = useState("");
  const [enteredCode, setEnteredCode] = useState("");
  const [darkMode, setDarkMode] = useState(localStorage.getItem("aic_dark") !== "false");
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("aic_user") || "null"));

  useEffect(() => {
    document.body.classList.toggle("light", !darkMode);
    localStorage.setItem("aic_dark", String(darkMode));
  }, [darkMode]);

  const historyKey = user ? `aic_history_${user.email}` : "aic_history_guest";
  const history = useMemo(() => JSON.parse(localStorage.getItem(historyKey) || "[]"), [historyKey, screen]);

  const average = useMemo(() => {
    if (!results.length) return 0;
    return Math.round(results.reduce((sum, r) => sum + r.analysis.overall, 0) / results.length);
  }, [results]);

  const stats = useMemo(() => {
    if (!history.length) return { total: 0, avg: 0, best: 0 };
    return {
      total: history.length,
      avg: Math.round(history.reduce((s, h) => s + h.score, 0) / history.length),
      best: Math.max(...history.map((h) => h.score)),
    };
  }, [history]);

  async function handleCvUpload(file) {
    if (!file) return;
    setCv(file.name);

    try {
      if (file.type === "application/pdf") {
        const buffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
        let text = "";

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          text += content.items.map((item) => item.str).join(" ") + " ";
        }

        localStorage.setItem("cv_text", text);
      } else {
        localStorage.setItem("cv_text", file.name);
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
    const updatedResults = [
      ...results,
      {
        question: questions[current],
        answer,
        analysis: analyzeAnswer(answer),
      },
    ];

    setResults(updatedResults);

    if (current < questions.length - 1) {
      setCurrent(current + 1);
      return;
    }

    const finalScore = Math.round(updatedResults.reduce((s, r) => s + r.analysis.overall, 0) / updatedResults.length);

    const session = {
      id: Date.now(),
      role: role || "General Interview",
      mode,
      cv: cv || "No CV uploaded",
      score: finalScore,
      date: new Date().toLocaleString(),
      results: updatedResults,
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
    const name = document.getElementById("signup-name")?.value.trim();
    const email = document.getElementById("signup-email")?.value.trim();
    const password = document.getElementById("signup-password")?.value;
    const confirm = document.getElementById("signup-confirm")?.value;

    if (!name || !email || !password) return alert("Fill all fields.");
    if (password.length < 6) return alert("Password must be at least 6 characters.");
    if (password !== confirm) return alert("Passwords do not match.");

    const accounts = getAccounts();
    if (accounts[email]) return alert("Account already exists.");

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(code);

    accounts[email] = { name, email, password, verified: false };
    saveAccounts(accounts);

    alert(`Demo email verification code: ${code}`);
    setAuthMode("verify");
  }

  function verifyEmail() {
    const email = document.getElementById("verify-email")?.value.trim();
    const accounts = getAccounts();

    if (!accounts[email]) return alert("Account not found.");
    if (enteredCode !== verificationCode) return alert("Incorrect code.");

    accounts[email].verified = true;
    saveAccounts(accounts);

    localStorage.setItem("aic_user", JSON.stringify(accounts[email]));
    setUser(accounts[email]);
    setShowAuth(false);
    alert("Email verified successfully.");
  }

  function signIn() {
    const email = document.getElementById("signin-email")?.value.trim();
    const password = document.getElementById("signin-password")?.value;
    const accounts = getAccounts();

    if (!accounts[email]) return alert("Account not found.");
    if (accounts[email].password !== password) return alert("Incorrect password.");
    if (!accounts[email].verified) return alert("Please verify your email first.");

    localStorage.setItem("aic_user", JSON.stringify(accounts[email]));
    setUser(accounts[email]);
    setShowAuth(false);
  }

  function signOut() {
    localStorage.removeItem("aic_user");
    setUser(null);
    setScreen("home");
  }

  function resetInterview() {
    setScreen("home");
    setQuestions([]);
    setCurrent(0);
    setAnswers({});
    setResults([]);
  }

  return (
    <div className="page">
      <nav className="navbar">
        <div className="brand">
          <img src="/logo.png" alt="AI Interview Coach" className="logo" />
          <div>
            <h1>AI Interview Coach</h1>
            <p>Practice smarter. Interview with confidence.</p>
          </div>
        </div>

        <div className="nav-actions">
          <button onClick={() => setScreen("home")}>Home</button>
          <button onClick={() => setScreen("dashboard")}>Dashboard</button>
          <button onClick={() => setScreen("admin")}>Admin</button>
          <button onClick={() => setDarkMode(!darkMode)}>{darkMode ? "Light" : "Dark"}</button>
          {user ? (
            <button className="primary small" onClick={signOut}>{user.name}</button>
          ) : (
            <button className="primary small" onClick={() => setShowAuth(true)}>Sign In</button>
          )}
        </div>
      </nav>

      {showAuth && (
        <div className="modal-backdrop">
          <div className="modal">
            {authMode === "signin" && (
              <>
                <p className="tag">Sign In</p>
                <h2>Welcome back</h2>
                <input id="signin-email" placeholder="Email Address" />
                <input id="signin-password" type="password" placeholder="Password" />
                <div className="actions">
                  <button className="secondary" onClick={() => setShowAuth(false)}>Cancel</button>
                  <button className="primary" onClick={signIn}>Sign In</button>
                </div>
                <p className="small-text">
                  Don’t have an account? <button onClick={() => setAuthMode("signup")}>Create account</button>
                </p>
              </>
            )}

            {authMode === "signup" && (
              <>
                <p className="tag">Create Account</p>
                <h2>Start tracking progress</h2>
                <input id="signup-name" placeholder="Full Name" />
                <input id="signup-email" placeholder="Email Address" />
                <input id="signup-password" type="password" placeholder="Password" />
                <input id="signup-confirm" type="password" placeholder="Confirm Password" />
                <div className="actions">
                  <button className="secondary" onClick={() => setShowAuth(false)}>Cancel</button>
                  <button className="primary" onClick={createAccount}>Create Account</button>
                </div>
              </>
            )}

            {authMode === "verify" && (
              <>
                <p className="tag">Email Verification</p>
                <h2>Verify your account</h2>
                <p className="muted">This demo shows the verification code in an alert.</p>
                <input id="verify-email" placeholder="Email Address" />
                <input value={enteredCode} onChange={(e) => setEnteredCode(e.target.value)} placeholder="Verification Code" />
                <button className="primary full" onClick={verifyEmail}>Verify Email</button>
              </>
            )}
          </div>
        </div>
      )}

      {screen === "home" && (
        <main className="hero">
          <section className="panel hero-panel">
            <p className="tag">AI-style mock interview platform</p>
            <h2>Practice interviews with scoring, reports, and progress tracking.</h2>
            <p className="subtitle">
              Upload your CV, generate role-specific interview questions, answer with text or voice, and receive a detailed performance report.
            </p>

            <div className="form-grid">
              <label>
                Target Role
                <input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Example: Cybersecurity Intern" />
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
                  <strong>{cv || "Click to upload your CV / Resume"}</strong>
                  <p>Accepted formats: PDF, DOC, DOCX</p>
                </div>
              </label>
            </div>

            <button className="primary" onClick={startInterview}>Start Interview</button>
          </section>

          <aside className="side">
            <div className="card">
              <p className="mini">Live Report Preview</p>
              <h3>87/100</h3>
              <Progress label="Communication" value={88} />
              <Progress label="Technical Depth" value={82} />
              <Progress label="Structure" value={91} />
            </div>
            <Feature number="01" title="Progress Tracking" text="Save interview history and compare previous scores." />
            <Feature number="02" title="PDF Reports" text="Print or save your score report as a PDF." />
          </aside>
        </main>
      )}

      {screen === "practice" && (
        <main className="panel practice">
          <p className="tag">Question {current + 1} of {questions.length}</p>
          <h2>{questions[current]}</h2>
          <textarea
            value={answers[current] || ""}
            onChange={(e) => setAnswers({ ...answers, [current]: e.target.value })}
            placeholder="Type your answer here. Use STAR: Situation, Task, Action, Result."
          />
          <div className="actions">
            <button className="secondary" onClick={startVoice}>Use Voice</button>
            <button className="secondary" onClick={resetInterview}>Restart</button>
            <button className="primary" onClick={submitAnswer}>{current === questions.length - 1 ? "Finish Interview" : "Submit Answer"}</button>
          </div>
        </main>
      )}

      {screen === "results" && (
        <main className="results">
          <section className="panel center">
            <p className="tag">Professional AI Report</p>
            <h2>Your Interview Score</h2>
            <div className="score">{average}/100</div>
            <p className="subtitle">{average >= 80 ? "Excellent performance. Keep refining examples and measurable impact." : average >= 65 ? "Strong performance. Add sharper examples and clearer outcomes." : "Good start. Use more structure, detail, and specific examples."}</p>
            <button className="primary" onClick={() => window.print()}>Download / Print PDF Report</button>
          </section>

          <section className="report-grid">
            <div className="panel">
              <h3>Score Breakdown</h3>
              <Progress label="Communication" value={avgMetric(results, "communication")} />
              <Progress label="Technical Depth" value={avgMetric(results, "technical")} />
              <Progress label="Answer Structure" value={avgMetric(results, "structure")} />
              <Progress label="Impact" value={avgMetric(results, "impact")} />
              <Progress label="Confidence" value={avgMetric(results, "confidence")} />
            </div>

            <div className="panel">
              <h3>Recommended Next Steps</h3>
              <ul>
                <li>Use STAR structure for every answer.</li>
                <li>Add measurable outcomes and impact.</li>
                <li>Mention tools, methods, and specific examples.</li>
                <li>Practice weaker categories from your score breakdown.</li>
              </ul>
            </div>
          </section>

          <section className="result-grid">
            {results.map((r, i) => (
              <div className="panel result-card" key={i}>
                <div className="result-top">
                  <span>Question {i + 1}</span>
                  <strong>{r.analysis.overall}/100</strong>
                </div>
                <h3>{r.question}</h3>
                <p><b>Strengths:</b></p>
                <ul>{r.analysis.strengths.map((s, idx) => <li key={idx}>{s}</li>)}</ul>
                <p><b>Improvements:</b></p>
                <ul>{r.analysis.improvements.map((s, idx) => <li key={idx}>{s}</li>)}</ul>
              </div>
            ))}
          </section>

          <button className="primary center-btn" onClick={resetInterview}>Start Another Interview</button>
        </main>
      )}

      {screen === "dashboard" && (
        <main className="dashboard">
          <section className="stat-grid">
            <Stat title="Total Interviews" value={stats.total} />
            <Stat title="Average Score" value={`${stats.avg}/100`} />
            <Stat title="Best Score" value={`${stats.best}/100`} />
          </section>

          <section className="panel">
            <p className="tag">Previous Scores</p>
            <h2>Interview History</h2>
            {history.length === 0 ? (
              <div className="empty">
                <h3>No interviews yet</h3>
                <p>Start an interview to track your progress.</p>
              </div>
            ) : (
              history.map((item) => (
                <div className="history-row" key={item.id}>
                  <strong>{item.role}</strong>
                  <span>{item.mode}</span>
                  <span>{item.score}/100</span>
                  <small>{item.date}</small>
                </div>
              ))
            )}
          </section>
        </main>
      )}

      {screen === "admin" && (
        <main className="dashboard">
          <section className="panel">
            <p className="tag">Admin Dashboard</p>
            <h2>Platform Overview</h2>
            <div className="stat-grid">
              <Stat title="Registered Accounts" value={Object.keys(getAccounts()).length} />
              <Stat title="Current User" value={user ? user.name : "Guest"} />
              <Stat title="Theme" value={darkMode ? "Dark" : "Light"} />
            </div>
            <p className="subtitle">Demo admin dashboard using local browser data.</p>
          </section>
        </main>
      )}
    </div>
  );
}

function Progress({ label, value }) {
  return (
    <div className="progress">
      <div className="progress-label">
        <span>{label}</span>
        <strong>{value}/100</strong>
      </div>
      <div className="track">
        <div className="fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function Feature({ number, title, text }) {
  return (
    <div className="card">
      <span className="feature-number">{number}</span>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="panel stat">
      <p>{title}</p>
      <h3>{value}</h3>
    </div>
  );
}

function avgMetric(results, key) {
  if (!results.length) return 0;
  return Math.round(results.reduce((s, r) => s + r.analysis[key], 0) / results.length);
}