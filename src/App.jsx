import { useState, useEffect, useCallback, useRef } from "react";

const API        = "http://localhost:3001";
const CATEGORIES = ["Grain", "Protein", "Vegetable", "Dairy", "Spice"];
const UNITS      = ["kg", "g", "L", "ml", "pcs"];

const CATEGORY_EMOJI = {
  Grain: "🌾", Protein: "🥩", Vegetable: "🥦", Dairy: "🥛", Spice: "🧄",
};

// ── api helper ───────────────────────────────────────────────────────────────
async function request(method, path, body, onLog) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
  const start = Date.now();
  try {
    const res  = await fetch(`${API}${path}`, opts);
    const data = await res.json();
    onLog({ method, path, status: res.status, ok: res.ok, ms: Date.now() - start });
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  } catch (err) {
    onLog({ method, path, status: "ERR", ok: false, ms: Date.now() - start });
    throw err;
  }
}

// ── IngredientForm ───────────────────────────────────────────────────────────
function IngredientForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(
    initial || { name: "", unit: "kg", stock: "", category: "Grain" }
  );
  const isEdit = !!initial;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <>
      <div className="form-body">
        <div className="form-group">
          <label>Name</label>
          <input value={form.name} onChange={set("name")} placeholder="e.g. Tomato" />
        </div>
        <div className="form-group">
          <label>Category</label>
          <select value={form.category} onChange={set("category")}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Unit</label>
          <select value={form.unit} onChange={set("unit")}>
            {UNITS.map((u) => <option key={u}>{u}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Stock</label>
          <input value={form.stock} onChange={set("stock")} placeholder="0" type="number" min="0" />
        </div>
      </div>
      <div className="form-actions">
        <button
          className="btn-primary"
          disabled={loading || !form.name || form.stock === ""}
          onClick={() => onSubmit({ ...form, stock: Number(form.stock) })}
        >
          {loading ? <span className="spinner" /> : isEdit ? "Save changes" : "Add ingredient"}
        </button>
        <button className="btn-edit" onClick={onCancel}>Cancel</button>
      </div>
    </>
  );
}

// ── Toast ────────────────────────────────────────────────────────────────────
function Toasts({ toasts }) {
  return (
    <div className="toast-wrap">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>{t.msg}</div>
      ))}
    </div>
  );
}

// ── ApiLog ───────────────────────────────────────────────────────────────────
function ApiLog({ logs }) {
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

// ── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [online, setOnline]     = useState(false);
  const [logs, setLogs]         = useState([]);
  const [toasts, setToasts]     = useState([]);
  const [formMode, setFormMode] = useState(null);   // null | "create" | {item}
  const [formLoading, setFormLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const addLog = useCallback((entry) => setLogs((l) => [...l, entry]), []);

  const toast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  const api = useCallback(
    (method, path, body) => request(method, path, body, addLog),
    [addLog]
  );

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api("GET", "/crud/ingredients");
      setItems(data);
      setOnline(true);
    } catch {
      setOnline(false);
      toast("Cannot reach backend — is it running on :3001?", "error");
    } finally {
      setLoading(false);
    }
  }, [api, toast]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  async function handleCreate(form) {
    setFormLoading(true);
    try {
      const created = await api("POST", "/crud/ingredients", form);
      setItems((i) => [...i, created]);
      setFormMode(null);
      toast(`Added ${created.name}`);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleUpdate(form) {
    setFormLoading(true);
    try {
      const updated = await api("PUT", `/crud/ingredients/${formMode.id}`, form);
      setItems((i) => i.map((x) => (x.id === updated.id ? updated : x)));
      setFormMode(null);
      toast(`Updated ${updated.name}`);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id) {
    setDeleteId(id);
    try {
      const res = await api("DELETE", `/crud/ingredients/${id}`);
      setItems((i) => i.filter((x) => x.id !== id));
      toast(`Removed ${res.ingredient.name}`);
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setDeleteId(null);
    }
  }

  const isEditing = formMode && formMode !== "create";
  const formTitle = formMode === "create" ? "Add ingredient" : "Edit ingredient";

  return (
    <div className="app">
      <header>
        <h1>Ingredient Admin</h1>
        <span className="badge">Express + React</span>
        <span
          className={`status-dot ${online ? "online" : ""}`}
          title={online ? "Backend connected" : "Backend offline"}
        />
      </header>

      <div className="layout">
        {/* ── Left: ingredient list ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div className="card">
            <div className="card-header">
              <span>Ingredients ({items.length})</span>
              <button
                className="btn-primary btn-sm"
                onClick={() => setFormMode("create")}
                disabled={!!formMode}
              >
                + Add
              </button>
            </div>

            {loading ? (
              <div className="loading-row">
                <span className="spinner" /> Fetching from backend…
              </div>
            ) : items.length === 0 ? (
              <div className="empty">
                <div className="icon">🥕</div>
                No ingredients yet. Add one!
              </div>
            ) : (
              <ul className="user-list">
                {items.map((item) => (
                  <li key={item.id} className="user-row">
                    <div className="avatar">{CATEGORY_EMOJI[item.category] ?? "🍽️"}</div>
                    <div className="user-info">
                      <div className="user-name">{item.name}</div>
                      <div className="user-email">{item.category}</div>
                    </div>
                    <span className="role-pill">{item.stock} {item.unit}</span>
                    <div className="user-actions">
                      <button
                        className="btn-edit"
                        onClick={() => setFormMode(item)}
                        disabled={!!formMode}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-danger"
                        onClick={() => handleDelete(item.id)}
                        disabled={deleteId === item.id}
                      >
                        {deleteId === item.id ? <span className="spinner" /> : "Delete"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <ApiLog logs={logs} />
        </div>

        {/* ── Right: form / endpoint reference ── */}
        <div>
          {formMode ? (
            <div className="card">
              <div className="card-header">{formTitle}</div>
              <IngredientForm
                initial={isEditing ? { name: formMode.name, unit: formMode.unit, stock: formMode.stock, category: formMode.category } : null}
                onSubmit={isEditing ? handleUpdate : handleCreate}
                onCancel={() => setFormMode(null)}
                loading={formLoading}
              />
            </div>
          ) : (
            <div className="card">
              <div className="card-header">Endpoints</div>
              <div style={{ padding: "12px 14px", fontFamily: "var(--mono)", fontSize: "11px", display: "flex", flexDirection: "column", gap: "6px" }}>
                {[
                  ["GET",    "/crud/ingredients",     "list all"],
                  ["GET",    "/crud/ingredients/:id", "get one"],
                  ["POST",   "/crud/ingredients",     "create"],
                  ["PUT",    "/crud/ingredients/:id", "update"],
                  ["DELETE", "/crud/ingredients/:id", "remove"],
                ].map(([m, p, d]) => (
                  <div key={m + p} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className={`log-method ${m}`} style={{ fontSize: "9px" }}>{m}</span>
                    <span style={{ color: "var(--text)" }}>{p}</span>
                    <span style={{ color: "var(--muted)", marginLeft: "auto", fontSize: "10px" }}>{d}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "10px 14px", borderTop: "1px solid var(--border)" }}>
                <button className="btn-edit btn-sm" style={{ width: "100%" }} onClick={fetchItems}>
                  ↻ Refresh
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Toasts toasts={toasts} />
    </div>
  );
}
