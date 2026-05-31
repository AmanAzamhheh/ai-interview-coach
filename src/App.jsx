import { useMemo, useState } from "react";
import "./App.css";

const questionSets = {
  frontend: [
    "How would you make a React application faster and more responsive?",
    "Explain how you structure reusable components in a frontend project.",
    "How would you connect a frontend application to a backend API?",
    "Tell me about a UI problem you solved in one of your projects.",
    "How do you make a website look professional and user-friendly?",
  ],
  backend: [
    "Explain how REST APIs work.",
    "How would you design a backend for an interview coaching platform?",
    "What is the difference between authentication and authorization?",
    "How would you connect a backend to a database?",
    "How would you handle errors in an API?",
  ],
  ai: [
    "How would you use AI to improve interview preparation?",
    "What is the difference between AI, machine learning, and automation?",
    "How would you evaluate whether an AI response is useful?",
    "What risks should companies consider when using AI?",
    "Describe a project where you used data, automation, or AI tools.",
  ],
  general: [
    "Tell me about yourself.",
    "Why are you interested in this role?",
    "Describe a project you are proud of.",
    "Tell me about a time you learned something difficult.",
    "Why should we choose you for this internship?",
  ],
};

function generateQuestions(role) {
  const text = role.toLowerCase();

  if (text.includes("frontend") || text.includes("react")) return questionSets.frontend;
  if (text.includes("backend") || text.includes("api")) return questionSets.backend;
  if (text.includes("ai") || text.includes("data") || text.includes("machine")) return questionSets.ai;

  return questionSets.general;
}

function scoreAnswer(answer) {
  const words = answer.trim().split(/\s+/).filter(Boolean).length;

  if (words >= 90) return 90;
  if (words >= 60) return 80;
  if (words >= 35) return 68;
  if (words >= 15) return 52;
  return 35;
}

function feedback(answer) {
  const words = answer.trim().split(/\s+/).filter(Boolean).length;

  if (words >= 60) {
    return "Strong answer. To improve further, add a specific project example and measurable result.";
  }

  if (words >= 25) {
    return "Good start. Add more technical detail, explain your actions, and mention the impact.";
  }

  return "Answer is too short. Use the STAR method: Situation, Task, Action, Result.";
}

export default function App() {
  const [role, setRole] = useState("");
  const [cv, setCv] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [results, setResults] = useState([]);
  const [screen, setScreen] = useState("home");

  const averageScore = useMemo(() => {
    if (results.length === 0) return 0;
    return Math.round(results.reduce((total, item) => total + item.score, 0) / results.length);
  }, [results]);

  function startInterview() {
    const generated = generateQuestions(role || "software intern");
    setQuestions(generated);
    setCurrentQuestion(0);
    setAnswers({});
    setResults([]);
    setScreen("practice");
  }

  function submitAnswer() {
    const answer = answers[currentQuestion] || "";
    const result = {
      question: questions[currentQuestion],
      answer,
      score: scoreAnswer(answer),
      feedback: feedback(answer),
    };

    setResults([...results, result]);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setScreen("results");
    }
  }

  function restart() {
    setScreen("home");
    setRole("");
    setCv("");
    setQuestions([]);
    setCurrentQuestion(0);
    setAnswers({});
    setResults([]);
  }

  return (
    <div className="page">
      <header className="navbar">
        <div className="brand">
          <div className="logo">AI</div>
          <div>
            <h1>AI Interview Coach</h1>
            <p>Built by Aman Azam</p>
          </div>
        </div>

        <div className="badge">Recruiter-ready portfolio project</div>
      </header>

      {screen === "home" && (
        <main className="hero">
          <section className="hero-left">
            <p className="tag">AI-powered interview preparation</p>
            <h2>Practice interviews with personalized questions and instant feedback.</h2>
            <p className="subtitle">
              Paste your CV, choose a target role, and receive a realistic interview
              simulation with scoring, feedback, and a custom improvement plan.
            </p>

            <div className="form-card">
              <label>
                Target role
                <input
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Example: Data & AI Intern"
                />
              </label>

              <label>
                Paste CV / resume text
                <textarea
                  value={cv}
                  onChange={(e) => setCv(e.target.value)}
                  placeholder="Paste your CV text here..."
                />
              </label>

              <button onClick={startInterview}>Generate Interview Questions</button>
            </div>
          </section>

          <section className="hero-right">
            <div className="glass-card large">
              <p className="small-label">Live interview report</p>
              <h3>Score: 87/100</h3>
              <div className="score-bar">
                <span style={{ width: "87%" }}></span>
              </div>
              <p>
                Strong technical explanation. Add measurable impact and mention tools used.
              </p>
            </div>

            <div className="glass-card">
              <h3>What this project shows</h3>
              <ul>
                <li>React frontend development</li>
                <li>AI product thinking</li>
                <li>Interview evaluation logic</li>
                <li>Clean UI and user experience</li>
              </ul>
            </div>
          </section>
        </main>
      )}

      {screen === "practice" && (
        <main className="practice">
          <div className="practice-card">
            <p className="tag">
              Question {currentQuestion + 1} of {questions.length}
            </p>

            <h2>{questions[currentQuestion]}</h2>

            <textarea
              className="answer-box"
              value={answers[currentQuestion] || ""}
              onChange={(e) =>
                setAnswers({
                  ...answers,
                  [currentQuestion]: e.target.value,
                })
              }
              placeholder="Type your answer here. Use the STAR method: Situation, Task, Action, Result."
            />

            <div className="actions">
              <button className="secondary" onClick={restart}>
                Restart
              </button>
              <button onClick={submitAnswer}>
                {currentQuestion === questions.length - 1 ? "Finish Interview" : "Submit Answer"}
              </button>
            </div>
          </div>
        </main>
      )}

      {screen === "results" && (
        <main className="results">
          <section className="result-hero">
            <p className="tag">Interview complete</p>
            <h2>Your Interview Report</h2>
            <div className="final-score">{averageScore}/100</div>
          </section>

          <section className="result-grid">
            {results.map((item, index) => (
              <div className="result-card" key={index}>
                <div className="result-top">
                  <span>Question {index + 1}</span>
                  <strong>{item.score}/100</strong>
                </div>
                <h3>{item.question}</h3>
                <p>{item.feedback}</p>
              </div>
            ))}
          </section>

          <section className="improvement-plan">
            <h3>Improvement Plan</h3>
            <ul>
              <li>Prepare 3 strong project stories from your GitHub.</li>
              <li>Practice explaining APIs, databases, and frontend/backend flow.</li>
              <li>Use the STAR method for behavioral questions.</li>
              <li>Keep answers specific, technical, and result-focused.</li>
            </ul>

            <button onClick={restart}>Start Another Interview</button>
          </section>
        </main>
      )}
    </div>
  );
}