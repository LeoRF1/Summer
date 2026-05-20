import { useState, useRef, useEffect } from "react";

const BACKEND = "http://localhost:5000";

const EXAMPLE_QUESTIONS = [
  "What are second-line treatments for HER2+ breast cancer?",
  "What is the role of immunotherapy in non-small cell lung cancer?",
  "How effective is metformin for type 2 diabetes prevention?",
  "What are the latest findings on BRCA1 mutation and ovarian cancer risk?",
];

function ArticleCard({ article, index }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      padding: "12px 14px",
      fontSize: 12,
    }}>
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{
          background: "var(--accent)",
          color: "#fff",
          borderRadius: 4,
          padding: "2px 7px",
          fontSize: 11,
          fontWeight: 700,
          flexShrink: 0,
          fontFamily: "var(--mono)",
        }}>[{index + 1}]</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.4, marginBottom: 3 }}>
            {article.title}
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: 11, marginBottom: 6 }}>
            {article.journal}{article.year ? ` · ${article.year}` : ""} ·{" "}
            <a
              href={`https://pubmed.ncbi.nlm.nih.gov/${article.pmid}/`}
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--accent)", textDecoration: "none" }}
            >
              PMID {article.pmid} ↗
            </a>
          </div>
          {expanded && (
            <div style={{ color: "var(--text-secondary)", lineHeight: 1.6, marginTop: 6, borderTop: "1px solid var(--border)", paddingTop: 8 }}>
              {article.abstract}
            </div>
          )}
          <button
            onClick={() => setExpanded(e => !e)}
            style={{
              background: "none",
              border: "none",
              color: "var(--accent)",
              cursor: "pointer",
              fontSize: 11,
              padding: 0,
              marginTop: 2,
            }}
          >
            {expanded ? "Hide abstract ▲" : "Show abstract ▼"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AnswerBlock({ text, streaming }) {
  const paragraphs = text.split("\n\n").filter(Boolean);
  return (
    <div style={{ lineHeight: 1.8, color: "var(--text-primary)", fontSize: 14 }}>
      {paragraphs.map((para, i) => (
        <p key={i} style={{ margin: "0 0 12px" }}>
          {para.split("\n").map((line, j) => (
            <span key={j}>
              {j > 0 && <br />}
              {line}
            </span>
          ))}
        </p>
      ))}
      {streaming && (
        <span style={{
          display: "inline-block",
          width: 8,
          height: 14,
          background: "var(--accent)",
          borderRadius: 2,
          animation: "blink 0.8s step-end infinite",
          verticalAlign: "middle",
          marginLeft: 2,
        }} />
      )}
    </div>
  );
}

export default function ClinicalQuery() {
  const [question, setQuestion] = useState("");
  const [theme, setTheme] = useState("light");
  const [phase, setPhase] = useState("idle"); // idle | searching | streaming | done | error
  const [articles, setArticles] = useState([]);
  const [answer, setAnswer] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [history, setHistory] = useState([]);
  const answerRef = useRef("");
  const textareaRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);


  useEffect(() => {
    const style = document.createElement("style");

    style.textContent = `
      :root {
        --bg: #f8f7f4;
        --surface: #ffffff;
        --surface2: #f2f0eb;
        --border: #e2dfd8;
        --text-primary: #1a1917;
        --text-secondary: #4a4845;
        --text-muted: #8a8780;
        --accent: #2563a8;
        --accent-light: #dbeafe;
        --mono: "DM Mono", "Fira Mono", monospace;
        --sans: "Lato", system-ui, sans-serif;
      }
    [data-theme="dark"] {
        --bg: #111110;
        --surface: #1c1c1a;
        --surface2: #242422;
        --border: #2e2e2b;
        --text-primary: #e8e6e1;
        --text-secondary: #a8a6a1;
        --text-muted: #6a6865;
        --accent: #5b9cf6;
        --accent-light: #1e3a5f;
}

      @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
      @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
      @keyframes spin { to{transform:rotate(360deg)} }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: var(--bg); font-family: var(--sans); color: var(--text-primary); }
      textarea { font-family: var(--sans); resize: none; outline: none; }
      textarea::placeholder { color: var(--text-muted); }
      a { color: var(--accent); }
      ::-webkit-scrollbar { width: 6px; } 
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
    `;
    document.head.appendChild(style);

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);

    return () => { document.head.removeChild(style); };
  }, []);

  async function runQuery(q) {
    const trimmed = q.trim();
    if (!trimmed || phase === "searching" || phase === "streaming") return;

    setQuestion(trimmed);
    setPhase("searching");
    setArticles([]);
    setAnswer("");
    answerRef.current = "";
    setErrorMsg("");

    try {
      const res = await fetch(`${BACKEND}/api/query`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });

      // Non-streaming fallback (no articles found)
      if (res.headers.get("content-type")?.includes("application/json")) {
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setAnswer(data.answer);
        setArticles(data.articles ?? []);
        setPhase("done");
        setHistory(h => [{ question: trimmed, answer: data.answer, articles: data.articles ?? [] }, ...h.slice(0, 4)]);
        return;
      }

      // SSE streaming
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const json = JSON.parse(line.slice(6));

          if (json.type === "articles") {
            setArticles(json.articles);
            setPhase("streaming");
          } else if (json.type === "text") {
            answerRef.current += json.text;
            setAnswer(answerRef.current);
          } else if (json.type === "done") {
            setPhase("done");
            setHistory(h => [{ question: trimmed, answer: answerRef.current, articles }, ...h.slice(0, 4)]);
          }
        }
      }
    } catch (err) {
      setErrorMsg(err.message.includes("fetch")
        ? "Cannot reach backend. Make sure the server is running on port 3001."
        : err.message);
      setPhase("error");
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      runQuery(question);
    }
  }

  const isActive = phase === "searching" || phase === "streaming";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <header style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
        padding: "0 24px",
        height: 52,
        display: "flex",
        alignItems: "center",
        gap: 10,
        flexShrink: 0,
      }}>
        <div style={{
          width: 28, height: 28,
          background: "var(--accent)",
          borderRadius: 6,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 13, fontWeight: 700,
          fontFamily: "var(--mono)",
        }}>CQ</div>
        <span style={{ fontWeight: 700, letterSpacing: "-0.02em", fontSize: 15 }}>ClinicalQuery</span>
        <span style={{
          marginLeft: 4,
          fontSize: 11,
          background: "var(--accent-light)",
          color: "var(--accent)",
          padding: "2px 8px",
          borderRadius: 20,
          fontWeight: 600,
        }}>PubMed + Claude</span>
        <div style={{ flex: 1 }} />
        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>Powered by Anthropic API · For research use only</span>

        <button
          onClick={() => setTheme(t => t === "light" ? "dark" : "light")}
          style={{
            background: "none",
            border: "1px solid var(--border)",
            borderRadius: 6,
            width: 32,
            height: 32,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 16,
            color: "var(--text-primary)",
          }}
          title="Toggle theme"
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>

      </header>

      <div style={{ flex: 1, display: "flex", maxWidth: 960, margin: "0 auto", width: "100%", padding: "0 16px" }}>

        {/* Sidebar — query history */}
        {history.length > 0 && (
          <aside style={{
            width: 200,
            flexShrink: 0,
            padding: "20px 0",
            borderRight: "1px solid var(--border)",
            marginRight: 24,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: "var(--text-muted)", marginBottom: 10, textTransform: "uppercase" }}>
              Recent
            </div>
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => { setQuestion(h.question); setAnswer(h.answer); setArticles(h.articles); setPhase("done"); }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  padding: "6px 8px",
                  borderRadius: 6,
                  cursor: "pointer",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  lineHeight: 1.4,
                  marginBottom: 2,
                }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--surface2)"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >
                {h.question.length > 60 ? h.question.slice(0, 60) + "…" : h.question}
              </button>
            ))}
          </aside>
        )}

        {/* Main content */}
        <main style={{ flex: 1, padding: "24px 0", minWidth: 0 }}>

          {/* Query input */}
          <div style={{
            background: "var(--surface)",
            border: `1.5px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
            borderRadius: 12,
            padding: "14px 16px",
            marginBottom: 16,
            transition: "border-color 0.2s",
          }}>
            <textarea
              ref={textareaRef}
              value={question}
              onChange={e => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter a clinical question..."
              rows={2}
              disabled={isActive}
              style={{
                width: "100%",
                background: "none",
                border: "none",
                fontSize: 15,
                color: "var(--text-primary)",
                lineHeight: 1.5,
              }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {EXAMPLE_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => { setQuestion(q); runQuery(q); }}
                    disabled={isActive}
                    style={{
                      background: "var(--surface2)",
                      border: "1px solid var(--border)",
                      borderRadius: 20,
                      padding: "3px 10px",
                      fontSize: 11,
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                      fontFamily: "var(--sans)",
                    }}
                  >
                    {q.length > 36 ? q.slice(0, 36) + "…" : q}
                  </button>
                ))}
              </div>
              <button
                onClick={() => runQuery(question)}
                disabled={isActive || !question.trim()}
                style={{
                  background: isActive || !question.trim() ? "var(--surface2)" : "var(--accent)",
                  color: isActive || !question.trim() ? "var(--text-muted)" : "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 18px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: isActive || !question.trim() ? "not-allowed" : "pointer",
                  fontFamily: "var(--sans)",
                  flexShrink: 0,
                  transition: "background 0.15s",
                }}
              >
                {phase === "searching" ? "Searching…" : phase === "streaming" ? "Answering…" : "Search"}
              </button>
            </div>
          </div>

          {/* Status indicators */}
          {phase === "searching" && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-muted)", fontSize: 13, padding: "8px 0" }}>
              <div style={{
                width: 14, height: 14,
                border: "2px solid var(--border)",
                borderTopColor: "var(--accent)",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                flexShrink: 0,
              }} />
              Searching PubMed for relevant abstracts…
            </div>
          )}

          {phase === "error" && (
            <div style={{
              background: "#fff1f0",
              border: "1px solid #fca5a5",
              borderRadius: 8,
              padding: "12px 14px",
              fontSize: 13,
              color: "#b91c1c",
              marginBottom: 16,
            }}>
              {errorMsg}
            </div>
          )}

          {/* Articles panel */}
          {articles.length > 0 && (
            <div style={{ animation: "fadeIn 0.3s ease", marginBottom: 20 }}>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".07em",
                color: "var(--text-muted)",
                textTransform: "uppercase",
                marginBottom: 8,
              }}>
                Retrieved {articles.length} PubMed abstract{articles.length !== 1 ? "s" : ""}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {articles.map((a, i) => <ArticleCard key={a.pmid} article={a} index={i} />)}
              </div>
            </div>
          )}

          {/* Answer panel */}
          {(answer || phase === "streaming") && (
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: "18px 20px",
              animation: "fadeIn 0.3s ease",
            }}>
              <div style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: ".07em",
                color: "var(--accent)",
                textTransform: "uppercase",
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                <span>Claude's synthesis</span>
                {phase === "streaming" && (
                  <span style={{ fontSize: 10, color: "var(--text-muted)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                    streaming…
                  </span>
                )}
              </div>
              <AnswerBlock text={answer} streaming={phase === "streaming"} />
            </div>
          )}

          {/* Empty state */}
          {phase === "idle" && (
            <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-muted)" }}>
              <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.4 }}>⚕</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 6, color: "var(--text-secondary)" }}>
                Ask a clinical question
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.6, maxWidth: 360, margin: "0 auto" }}>
                ClinicalQuery retrieves relevant PubMed abstracts and uses Claude to synthesize a grounded, cited answer.
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Footer disclaimer */}
      <footer style={{
        borderTop: "1px solid var(--border)",
        padding: "10px 24px",
        fontSize: 11,
        color: "var(--text-muted)",
        textAlign: "center",
        background: "var(--surface)",
      }}>
        For research and educational use only. Not for clinical decision-making. Always consult qualified healthcare professionals.
      </footer>
    </div>
  );
}