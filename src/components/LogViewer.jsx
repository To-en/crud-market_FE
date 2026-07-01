import { useState, useEffect, useCallback } from "react";
import { requestHTTP, getConfig } from "../utils/api";

const noop = () => {};

// Admin-only viewer for the backend log files (logs/combined.log + logs/error.log).
// Reads them via GET /api/log — server-side reserved to role 2.
export function LogViewer({ token }) {
  const [file, setFile]       = useState("combined");
  const [lines, setLines]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const config = await getConfig();
      const data = await requestHTTP(
        "GET",
        `${config.API_ENDPOINT_LOG}?file=${file}&lines=200`,
        undefined,
        noop,
        token,
      );
      setLines(data.lines ?? []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [file, token]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="card">
      <div className="card-header" style={{ justifyContent: "space-between", alignItems: "center", paddingRight: 8 }}>
        <span className="card-header-title">Server logs</span>
        <span className="buttons has-addons mb-0">
          <button className={`button is-small ${file === "combined" ? "is-primary" : ""}`} onClick={() => setFile("combined")}>combined</button>
          <button className={`button is-small ${file === "error" ? "is-danger" : ""}`} onClick={() => setFile("error")}>error</button>
          <button className="button is-small" onClick={load} title="Refresh">↻</button>
        </span>
      </div>
      <div className="card-content">
        {loading ? (
          <div className="loading-row"><span className="spinner" /> Loading…</div>
        ) : error ? (
          <div className="notification is-danger is-light">{error}</div>
        ) : lines.length === 0 ? (
          <div className="empty"><div className="icon">📭</div>No log lines</div>
        ) : (
          <pre style={{ maxHeight: 400, overflow: "auto", fontSize: 12, whiteSpace: "pre-wrap" }}>
            {lines.join("\n")}
          </pre>
        )}
      </div>
    </div>
  );
}
