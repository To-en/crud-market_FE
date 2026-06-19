import { useRef, useEffect } from "react";

export function ApiLog({ logs }) {
  const endRef = useRef(null);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [logs]);

  return (
    <div className="card">
      <div className="card-header">
        <span>API log</span>
        <span style={{ fontWeight: 400, color: "var(--muted)" }}>{logs.length} calls</span>
      </div>
      {logs.length === 0 ? (
        <div className="empty"><div className="icon">📡</div>No requests yet</div>
      ) : (
        <ul className="log-list">
          {logs.map((l, i) => (
            <li key={i} className="log-entry">
              <span className={`log-method ${l.method}`}>{l.method}</span>
              <span className="log-path">{l.path}</span>
              <span className={`log-status ${l.ok ? "ok" : "err"}`}>
                {l.status} · {l.ms}ms
              </span>
            </li>
          ))}
          <li ref={endRef} />
        </ul>
      )}
    </div>
  );
}
