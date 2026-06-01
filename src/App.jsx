import { useEffect, useMemo, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker?url";
import "./App.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const modes = {
  behavioral: "Behavioral",
  technical: "Technical",
  system: "System Design",
};

const roleQuestionMap = {
  frontend: [
    "How would you structure reusable components in a React application?",
    "How would you improve the performance of a slow frontend application?",
    "How would you connect a frontend application to a backend API?",
    "Describe how you would make a website responsive and accessible.",
    "Tell me about a frontend project you built and the challenges you faced.",
  ],
  backend: [
    "Explain how REST APIs work and how you would design one.",
    "How would you structure the backend for an interview coaching platform?",
    "What is authentication and how would you implement it securely?",
    "How would you design a database schema for saving interview history?",
    "How would you handle errors, validation, and logging in a backend system?",
  ],
  data: [
    "How would you use data to improve interview preparation?",
    "Explain the difference between supervised and unsupervised learning.",
    "How would you evaluate whether an AI-generated answer is useful?",
    "Describe a data project you would build for students or job seekers.",
    "How would you clean and prepare messy data before analysis?",
  ],
  general: [
    "Tell me about yourself and your background.",
    "Why are you interested in this role?",
    "Describe a project you are proud of.",
    "Tell me about a time you learned something difficult quickly.",
    "Why should we choose you for this opportunity?",
  ],
};

function getRoleType(role) {
  const text = role.toLowerCase();
  if (text.includes("front") || text.includes("react") || text.includes("ui")) return "frontend";
  if (text.includes("back") || text.includes("api") || text.includes("server")) return "backend";
  if (text.includes("data") || text.includes("ai") || text.includes("machine")) return "data";
  return "general";
}

function generateQuestions(role, mode, cv) {
  const cvText = localStorage.getItem("cv_text") || "";
  const combined = `${role} ${cv} ${cvText}`.toLowerCase();

  const cvQuestions = [];

  // Tech / CS / Cybersecurity
  if (combined.includes("cybersecurity") || combined.includes("security")) {
    cvQuestions.push("Your CV mentions cybersecurity. Explain what you learned from your cybersecurity authentication system project.");
    cvQuestions.push("How would you protect user data in a real application?");
  }

  if (combined.includes("authentication")) {
    cvQuestions.push("Tell me how your authentication system worked and what security features you implemented.");
  }

  if (combined.includes("python")) {
    cvQuestions.push("I see Python on your CV. Tell me about a Python project you worked on.");
  }

  if (combined.includes("html") || combined.includes("css") || combined.includes("web development")) {
    cvQuestions.push("Your CV mentions web development. Walk me through one website you developed.");
  }

  if (combined.includes("github")) {
    cvQuestions.push("Your CV mentions GitHub. Tell me about a project from your GitHub that shows your best work.");
  }

  // Lawyers
  if (combined.includes("lawyer") || combined.includes("law") || combined.includes("legal") || combined.includes("case")) {
    cvQuestions.push("Your CV mentions law or legal work. Describe a legal case or matter that challenged your analytical skills.");
    cvQuestions.push("How do you research and prepare for a legal argument or client matter?");
    cvQuestions.push("Tell me about a time you had to explain complex legal information clearly.");
  }

  // Teachers
  if (combined.includes("teacher") || combined.includes("teaching") || combined.includes("education") || combined.includes("classroom")) {
    cvQuestions.push("Your CV mentions teaching. How do you keep students engaged during lessons?");
    cvQuestions.push("Describe a time you helped a student understand a difficult concept.");
    cvQuestions.push("How do you adapt your teaching style for different learners?");
  }

  // Accountants
  if (combined.includes("accountant") || combined.includes("accounting") || combined.includes("finance") || combined.includes("audit") || combined.includes("tax")) {
    cvQuestions.push("Your CV mentions accounting or finance. Tell me about your experience handling financial records or reports.");
    cvQuestions.push("How do you ensure accuracy when working with financial data?");
    cvQuestions.push("Describe a time you found or prevented an error in financial work.");
  }

  // Engineers
  if (combined.includes("engineer") || combined.includes("engineering") || combined.includes("civil") || combined.includes("mechanical") || combined.includes("electrical")) {
    cvQuestions.push("Your CV mentions engineering. Tell me about an engineering project you worked on.");
    cvQuestions.push("Describe a technical problem you solved and how you approached it.");
    cvQuestions.push("How do you balance safety, cost, and performance in engineering decisions?");
  }

  // Nurses
  if (combined.includes("nurse") || combined.includes("nursing") || combined.includes("patient care")) {
    cvQuestions.push("Your CV mentions nursing. Describe a challenging patient situation and how you handled it.");
    cvQuestions.push("How do you prioritize patient care during a busy shift?");
    cvQuestions.push("Tell me about a time you worked with a healthcare team.");
  }

  // Pharmacists
  if (combined.includes("pharmacist") || combined.includes("pharmacy") || combined.includes("medication") || combined.includes("prescription")) {
    cvQuestions.push("Your CV mentions pharmacy. How do you ensure medication safety and accuracy?");
    cvQuestions.push("Describe a time you had to explain medication information to a patient.");
    cvQuestions.push("How would you handle a prescription error or drug interaction concern?");
  }

  // Designers
  if (combined.includes("designer") || combined.includes("design") || combined.includes("figma") || combined.includes("photoshop") || combined.includes("canva") || combined.includes("ui") || combined.includes("ux")) {
    cvQuestions.push("Your CV mentions design. Walk me through your design process from concept to completion.");
    cvQuestions.push("How do you balance creativity with user needs?");
    cvQuestions.push("Tell me about a design project you are proud of.");
  }

  // Marketing Professionals
  if (combined.includes("marketing") || combined.includes("campaign") || combined.includes("seo") || combined.includes("social media") || combined.includes("branding")) {
    cvQuestions.push("Your CV mentions marketing. Describe a campaign you worked on and its results.");
    cvQuestions.push("How do you measure whether a marketing campaign is successful?");
    cvQuestions.push("Tell me about a time you improved engagement, reach, or conversions.");
  }

  // Sales / Customer / Client Work
  if (combined.includes("sales") || combined.includes("customer") || combined.includes("client")) {
    cvQuestions.push("Your CV mentions customer or client work. Tell me about a time you handled a client professionally.");
    cvQuestions.push("Describe a time you successfully convinced a customer or client.");
  }

  // Soft Skills
  if (combined.includes("teamwork") || combined.includes("team")) {
    cvQuestions.push("Your CV mentions teamwork. Describe a time you worked with others to complete a task.");
  }

  if (combined.includes("leadership")) {
    cvQuestions.push("Your CV mentions leadership. Tell me about a time you led or guided others.");
  }

  if (combined.includes("communication")) {
    cvQuestions.push("Your CV mentions communication. Give an example of how you used communication skills professionally.");
  }

  if (cvQuestions.length >= 5) {
    return cvQuestions.slice(0, 5);
  }

  const type = getRoleType(role);
  const base = roleQuestionMap[type];

  if (mode === "technical") return base;

  if (mode === "system") {
    return [
      `How would you design a complete platform for ${role || "interview preparation"}?`,
      "What database tables would you create and why?",
      "How would you make the platform scalable for thousands of users?",
      "How would you protect user CVs and interview data?",
      "How would you track user progress and generate analytics?",
    ];
  }

  return [
    "Tell me about yourself and your background.",
    `Why are you interested in ${role || "this role"}?`,
    cv
      ? `Your uploaded resume is ${cv}. Tell me about one project or experience from it.`
      : "Tell me about a project you are proud of and what you learned.",
    "Describe a time you solved a difficult problem independently.",
    "Why should we choose you for this opportunity?",
  ];
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function analyzeAnswer(answer) {
  const words = countWords(answer);

  const hasProject = /project|built|created|developed|implemented|designed/i.test(answer);
  const hasTech = /react|javascript|python|api|database|backend|frontend|github|sql|node|fastapi|css|html/i.test(answer);
  const hasImpact = /improved|increased|reduced|users|performance|result|impact|efficient|secure|faster/i.test(answer);
  const hasStructure = /first|then|after|because|therefore|result|finally|challenge|solution/i.test(answer);

  const communication = Math.min(95, 35 + Math.min(words, 90) * 0.45);
  const technical = Math.min(95, 45 + (hasTech ? 28 : 0) + (hasProject ? 12 : 0));
  const structure = Math.min(95, 45 + (hasStructure ? 30 : 0) + (words > 50 ? 10 : 0));
  const impact = Math.min(95, 40 + (hasImpact ? 35 : 0) + (hasProject ? 10 : 0));
  const confidence = Math.min(95, 45 + (words > 35 ? 20 : 0) + (words > 80 ? 15 : 0));

  const overall = Math.round(
    communication * 0.25 +
      technical * 0.25 +
      structure * 0.2 +
      impact * 0.15 +
      confidence * 0.15
  );

  const strengths = [];
  const weaknesses = [];

  if (hasProject) strengths.push("Strong use of project-based examples.");
  else weaknesses.push("Add a real project example from your GitHub or resume.");

  if (hasTech) strengths.push("Good technical detail and relevant tools mentioned.");
  else weaknesses.push("Mention specific technologies, APIs, databases, or frameworks.");

  if (hasImpact) strengths.push("You explained impact and results clearly.");
  else weaknesses.push("Add measurable impact such as users, speed, accuracy, or improvements.");

  if (hasStructure) strengths.push("Answer has a clear structure.");
  else weaknesses.push("Use STAR: Situation, Task, Action, Result.");

  if (words < 35) weaknesses.push("Answer is too short. Add more detail and context.");

  return {
    overall,
    communication: Math.round(communication),
    technical: Math.round(technical),
    structure: Math.round(structure),
    impact: Math.round(impact),
    confidence: Math.round(confidence),
    strengths: strengths.length ? strengths : ["Clear answer with room to develop more detail."],
    weaknesses: weaknesses.length ? weaknesses : ["Make the answer more concise and interview-focused."],
  };
}

function getReportSummary(score) {
  if (score >= 85) return "Excellent performance. Your answers are detailed, structured, and recruiter-ready.";
  if (score >= 70) return "Strong performance. Add more measurable impact and sharper technical examples.";
  if (score >= 55) return "Good foundation. Improve answer structure, technical detail, and confidence.";
  return "Keep practicing. Focus on longer answers, real project examples, and STAR structure.";
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
  const [name, setName] = useState(localStorage.getItem("aic_user") || "");
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("signin");
  const [history, setHistory] = useState(() =>
    JSON.parse(localStorage.getItem("aic_history") || "[]")
  );

  const average = useMemo(() => {
    if (!results.length) return 0;
    return Math.round(results.reduce((sum, item) => sum + item.analysis.overall, 0) / results.length);
  }, [results]);

  const dashboardStats = useMemo(() => {
    const total = history.length;
    const best = total ? Math.max(...history.map((h) => h.score)) : 0;
    const avg = total ? Math.round(history.reduce((s, h) => s + h.score, 0) / total) : 0;
    return { total, best, avg };
  }, [history]);

  function startInterview() {
    setQuestions(generateQuestions(role, mode, cv));
    setCurrent(0);
    setAnswers({});
    setResults([]);
    setScreen("practice");
  }

  function submitAnswer() {
    const answer = answers[current] || "";
    const item = {
      question: questions[current],
      answer,
      analysis: analyzeAnswer(answer),
    };

    const updated = [...results, item];
    setResults(updated);

    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      const finalScore = Math.round(
        updated.reduce((sum, entry) => sum + entry.analysis.overall, 0) / updated.length
      );

      const session = {
        id: Date.now(),
        role: role || "General Interview",
        mode: modes[mode],
        score: finalScore,
        date: new Date().toLocaleString(),
      };

      const updatedHistory = [session, ...history].slice(0, 8);
      setHistory(updatedHistory);
      localStorage.setItem("aic_history", JSON.stringify(updatedHistory));
      setScreen("results");
    }
  }

  function startVoice() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Try Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      setAnswers({ ...answers, [current]: event.results[0][0].transcript });
    };
    recognition.start();
  }

  function saveUser() {
    const email = document.getElementById("auth-email")?.value || "";
    const password = document.getElementById("auth-password")?.value || "";

    if (!email.trim() || !password.trim()) {
      alert("Please enter your email and password.");
      return;
    }

    const savedAccount = JSON.parse(localStorage.getItem("aic_account") || "null");

    if (!savedAccount) {
      alert("No account found. Please create an account first.");
      return;
    }

    if (savedAccount.email !== email || savedAccount.password !== password) {
      alert("Incorrect email or password.");
      return;
    }

    setName(savedAccount.name);
    localStorage.setItem("aic_user", savedAccount.name);
    alert("Signed in successfully!");
    setShowAuth(false);
  }

  function createAccount() {
    const fullName = document.getElementById("signup-name")?.value || "";
    const email = document.getElementById("signup-email")?.value || "";
    const password = document.getElementById("signup-password")?.value || "";
    const confirm = document.getElementById("signup-confirm")?.value || "";

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirm) {
      alert("Passwords do not match.");
      return;
    }

    const account = {
      name: fullName.trim(),
      email: email.trim(),
      password,
    };

    localStorage.setItem("aic_account", JSON.stringify(account));
    localStorage.setItem("aic_user", account.name);
    setName(account.name);

    alert("Account created successfully!");
    setShowAuth(false);
    setAuthMode("signin");
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
          <button className="main-btn small glow-btn" onClick={() => setShowAuth(true)}>
            {name ? name : "Sign In"}
          </button>
        </div>
      </nav>

      {showAuth && (
        <div className="modal-backdrop">
          <div className="modal pop-modal">
            {authMode === "signin" ? (
              <>
                <p className="tag">Sign In</p>
                <h2>Welcome back</h2>
                <p className="muted">
                  Sign in to access your interview history and progress.
                </p>

                <input id="auth-email" type="email" placeholder="Email Address" />
                <input id="auth-password" type="password" placeholder="Password" />

                <div className="actions">
                  <button className="secondary" onClick={() => setShowAuth(false)}>
                    Cancel
                  </button>
                  <button className="main-btn glow-btn" onClick={saveUser}>
                    Sign In
                  </button>
                </div>

                <p className="auth-switch">
                  Don’t have an account?{" "}
                  <button type="button" onClick={() => setAuthMode("signup")}>
                    Create an account
                  </button>
                </p>
              </>
            ) : (
              <>
                <p className="tag">Create Account</p>
                <h2>Join AI Interview Coach</h2>
                <p className="muted">
                  Create your account to save interview history, reports, and progress.
                </p>

                <input id="signup-name" placeholder="Full Name" />
                <input id="signup-email" type="email" placeholder="Email Address" />
                <input id="signup-password" type="password" placeholder="Password" />
                <input id="signup-confirm" type="password" placeholder="Confirm Password" />

                <div className="actions">
                  <button className="secondary" onClick={() => setShowAuth(false)}>
                    Cancel
                  </button>
                  <button className="main-btn glow-btn" onClick={createAccount}>
                    Create Account
                  </button>
                </div>

                <p className="auth-switch">
                  Already have an account?{" "}
                  <button type="button" onClick={() => setAuthMode("signin")}>
                    Sign in
                  </button>
                </p>
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
              Train for behavioral, technical, and system design interviews with role-based questions,
              voice practice, smart scoring, detailed feedback, and a professional interview report.
            </p>

            <div className="grid-form">
              <label>
                Target Role
                <input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Example: Frontend Intern, Backend Engineer, Data & AI Intern"
                />
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
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  setCv(file.name);

  if (file.type === "application/pdf") {
    const arrayBuffer = await file.arrayBuffer();


    const pdf = await pdfjsLib.getDocument({
      data: arrayBuffer,
    }).promise;

    let text = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();

      text += content.items
        .map(item => item.str)
        .join(" ");
    }

    localStorage.setItem("cv_text", text);
  }
}}
                  />
                  <div>
                    <strong>{cv || "Click to upload your CV / Resume"}</strong>
                    <p>Accepted formats: PDF, DOC, DOCX</p>
                  </div>
                </div>
              </label>
            </div>

            <button className="main-btn glow-btn" onClick={startInterview}>
              Start Interview
            </button>
          </section>

          <section className="side">
            <div className="card preview-card reveal delay-1">
              <p className="mini">Live Report Preview</p>
              <h3><CountUp target={87} />/100</h3>
              <Progress label="Communication" value={88} />
              <Progress label="Technical Depth" value={82} />
              <Progress label="Structure" value={91} />
            </div>

            <div className="card reveal delay-2">
              <span>01</span>
              <h3>Smart Scoring</h3>
              <p>Evaluates structure, technical depth, impact, confidence, and communication.</p>
            </div>

            <div className="card reveal delay-3">
              <span>02</span>
              <h3>Voice Practice</h3>
              <p>Practice speaking answers using browser speech recognition.</p>
            </div>
          </section>
        </main>
      )}

      {screen === "practice" && (
        <main className="panel practice reveal">
          <p className="tag">Question {current + 1} of {questions.length}</p>
          <h2>{questions[current]}</h2>

          <textarea
            className="answer"
            value={answers[current] || ""}
            onChange={(e) => setAnswers({ ...answers, [current]: e.target.value })}
            placeholder="Type your answer here. Use STAR: Situation, Task, Action, Result."
          />

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
            <p className="subtitle center-text">{getReportSummary(average)}</p>
            <button className="main-btn glow-btn" onClick={() => window.print()}>
              Download / Print Report
            </button>
          </section>

          <section className="report-layout">
            <div className="panel reveal delay-1">
              <h3>Score Breakdown</h3>
              <Progress label="Communication" value={avgMetric(results, "communication")} />
              <Progress label="Technical Depth" value={avgMetric(results, "technical")} />
              <Progress label="Answer Structure" value={avgMetric(results, "structure")} />
              <Progress label="Impact" value={avgMetric(results, "impact")} />
              <Progress label="Confidence" value={avgMetric(results, "confidence")} />
            </div>

            <div className="panel reveal delay-2">
              <h3>Recommended Next Steps</h3>
              <ul>
                <li>Prepare 3 strong GitHub project stories.</li>
                <li>Use STAR structure for every behavioral answer.</li>
                <li>Mention tools, APIs, databases, and measurable outcomes.</li>
                <li>Keep answers specific, confident, and result-focused.</li>
              </ul>
            </div>
          </section>

          <section className="result-grid">
            {results.map((result, index) => (
              <div className="panel result-card reveal" key={index}>
                <div className="result-top">
                  <span>Question {index + 1}</span>
                  <strong>{result.analysis.overall}/100</strong>
                </div>
                <h3>{result.question}</h3>

                <p><b>Strengths:</b></p>
                <ul>{result.analysis.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>

                <p><b>Improvements:</b></p>
                <ul>{result.analysis.weaknesses.map((w, i) => <li key={i}>{w}</li>)}</ul>
              </div>
            ))}
          </section>

          <section className="panel center reveal">
            <button className="main-btn glow-btn" onClick={resetPractice}>
              Start Another Interview
            </button>
          </section>
        </main>
      )}

      {screen === "dashboard" && (
        <main className="dashboard-wrap">
          <section className="stat-grid">
            <Stat title="Total Interviews" value={dashboardStats.total} />
            <Stat title="Average Score" value={`${dashboardStats.avg}/100`} />
            <Stat title="Best Score" value={`${dashboardStats.best}/100`} />
          </section>

          <section className="panel reveal">
            <p className="tag">Progress Dashboard</p>
            <h2>Recent Practice Sessions</h2>

            {history.length === 0 ? (
              <div className="empty">
                <h3>No sessions yet</h3>
                <p>Start your first interview to begin tracking your progress.</p>
              </div>
            ) : (
              <>
                <div className="chart">
                  {history.slice().reverse().map((h) => (
                    <div className="bar-wrap" key={h.id}>
                      <div className="bar" style={{ height: `${h.score}%` }}></div>
                      <small>{h.score}</small>
                    </div>
                  ))}
                </div>

                {history.map((item) => (
                  <div className="history-row" key={item.id}>
                    <strong>{item.role}</strong>
                    <span>{item.mode}</span>
                    <span>{item.score}/100</span>
                    <small>{item.date}</small>
                  </div>
                ))}
              </>
            )}
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
    const duration = 900;
    const stepTime = 18;
    const increment = target / (duration / stepTime);

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [target]);

  return <>{value}</>;
}

function Progress({ label, value }) {
  return (
    <div className="progress-item">
      <div className="progress-label">
        <span>{label}</span>
        <strong>{value}/100</strong>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ "--target-width": `${value}%` }}></div>
      </div>
    </div>
  );
}

function Stat({ title, value }) {
  return (
    <div className="panel stat-card reveal">
      <p>{title}</p>
      <h3>{value}</h3>
    </div>
  );
}

function avgMetric(results, key) {
  if (!results.length) return 0;
  return Math.round(results.reduce((sum, item) => sum + item.analysis[key], 0) / results.length);
}