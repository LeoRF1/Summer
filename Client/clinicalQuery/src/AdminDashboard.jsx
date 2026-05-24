import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const BACKEND = "https://summer-production-f51d.up.railway.app";

function formatDate(iso) {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function queriesByDay(logs) {
  const counts = {};
  for (const log of logs) {
    const day = new Date(log.date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
    counts[day] = (counts[day] ?? 0) + 1;
  }
  return Object.entries(counts)
    .map(([day, count]) => ({ day, count }))
    .reverse();
}

export default function AdminDashboard() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: var(--bg); font-family: var(--sans); color: var(--text-primary); }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  useEffect(() => {
    fetch(`${BACKEND}/api/logs`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load logs (${res.status})`);
        return res.json();
      })
      .then(setLogs)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const totalArticles = logs.reduce((sum, l) => sum + (l.articleCount ?? 0), 0);
  const avgArticles = logs.length ? (totalArticles / logs.length).toFixed(1) : "—";
  const chartData = queriesByDay(logs);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      <header style={{
        borderBottom: "1px solid var(--border)",
        background: "var(--surface)",
        padding: "0 24px",
        height: 52,
        display: "flex",
        alignItems: "center",
        gap: 10,
      }}>
        <div style={{
          width: 28, height: 28,
          background: "var(--accent)",
          borderRadius: 6,
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "#fff", fontSize: 13, fontWeight: 700,
          fontFamily: "var(--mono)",
        }}>CQ</div>
        <span style={{ fontWeight: 700, fontSize: 15 }}>Admin Dashboard</span>
        <div style={{ flex: 1 }} />
        <Link
          to="/"
          style={{
            fontSize: 13,
            color: "var(--accent)",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          ← Back to app
        </Link>
      </header>

      <main style={{ flex: 1, maxWidth: 960, margin: "0 auto", width: "100%", padding: "24px 16px" }}>
        {loading && (
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Loading query logs…</p>
        )}

        {error && (
          <div style={{
            background: "#fff1f0",
            border: "1px solid #fca5a5",
            borderRadius: 8,
            padding: "12px 14px",
            fontSize: 13,
            color: "#b91c1c",
            marginBottom: 16,
          }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Total queries", value: logs.length },
                { label: "Avg articles", value: avgArticles },
                { label: "Articles retrieved", value: totalArticles },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    padding: "14px 16px",
                  }}
                >
                  <div style={{ fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 4 }}>
                    {label}
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--mono)" }}>{value}</div>
                </div>
              ))}
            </div>

            {chartData.length > 0 && (
              <div style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                padding: "16px 12px 8px",
                marginBottom: 24,
                height: 220,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 12, paddingLeft: 8 }}>
                  Queries per day
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              overflow: "hidden",
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: ".06em", padding: "14px 16px", borderBottom: "1px solid var(--border)" }}>
                Recent queries
              </div>
              {logs.length === 0 ? (
                <p style={{ padding: 16, fontSize: 13, color: "var(--text-muted)" }}>No queries logged yet.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      style={{
                        padding: "12px 16px",
                        borderBottom: "1px solid var(--border)",
                        fontSize: 13,
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.4 }}>
                          {log.question}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--text-muted)", flexShrink: 0, fontFamily: "var(--mono)" }}>
                          {formatDate(log.date)}
                        </span>
                      </div>
                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {log.articleCount} article{log.articleCount !== 1 ? "s" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

