import { useState, useEffect, useCallback } from "react";
import { requestHTTP, getConfig } from "../utils/api";
import { CATEGORIES, UNITS, CATEGORY_EMOJI } from "../utils/constants";
import { ApiLog } from "../components/ApiLog";
import { Toasts } from "../components/toast";
import { useAuth } from "../context/auth.context";

// --- Admin-only ingredient create/edit form (moved here from ingredients.page) ---
function IngredientForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(
    initial || { name: "", unit: "kg", price: "", stock: "", category: "Grain" }
  );
  const isEdit = !!initial;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <>
      <div className="field">
        <label className="label">Name</label>
        <input className="input" value={form.name} onChange={set("name")} placeholder="e.g. Tomato" />
      </div>
      <div className="field">
        <label className="label">Category</label>
        <div className="select is-fullwidth">
          <select value={form.category} onChange={set("category")}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label className="label">Unit</label>
        <div className="select is-fullwidth">
          <select value={form.unit} onChange={set("unit")}>
            {UNITS.map((u) => <option key={u}>{u}</option>)}
          </select>
        </div>
      </div>
      <div className="field">
        <label className="label">Price</label>
        <input className="input" value={form.price} onChange={set("price")} placeholder="0" type="number" min="0" />
      </div>
      <div className="field">
        <label className="label">Stock</label>
        <input className="input" value={form.stock} onChange={set("stock")} placeholder="0" type="number" min="0" />
      </div>
      <div className="field is-grouped">
        <button
          className={`button is-primary ${loading ? "is-loading" : ""}`}
          disabled={loading || !form.name || form.stock === "" || form.price === ""}
          onClick={() => onSubmit({ ...form, price: Number(form.price), stock: Number(form.stock) })}
        >
          {isEdit ? "Save changes" : "Add ingredient"}
        </button>
        <button className="button" onClick={onCancel}>Cancel</button>
      </div>
    </>
  );
}

export default function AdminPage() {
  const { user } = useAuth();
  const [items, setItems]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [logs, setLogs]         = useState([]);
  const [toasts, setToasts]     = useState([]);
  const [formMode, setFormMode] = useState(null); // "create" | item | null
  const [formLoading, setFormLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [config, setConfig]     = useState(null);

  const addLog = useCallback((entry) => setLogs((l) => [...l, entry]), []);
  const toast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  // get config file 
  useEffect(() => { getConfig().then(setConfig); }, []);

  const fetchItems = useCallback(async () => {
    if (!config) return;
    setLoading(true);
    try {
      const data = await requestHTTP("GET", config.API_ENDPOINT_INGREDIENT, undefined, addLog);
      setItems(Array.isArray(data) ? data : data.items ?? []);
    } catch {
      toast("Cannot reach backend — is it running on :3001?", "error");
    } finally {
      setLoading(false);
    }
  }, [config, addLog, toast]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  async function handleSubmit(form) {
    const isUpdating = formMode && formMode !== "create";
    setFormLoading(true);
    try {
      const data = isUpdating
        ? await requestHTTP("PUT", `${config.API_ENDPOINT_INGREDIENT}/${formMode.id}`, form, addLog, user.accessToken)
        : await requestHTTP("POST", config.API_ENDPOINT_INGREDIENT_CREATE, form, addLog, user.accessToken);
      const item = data.item ?? data;
      setItems((current) => isUpdating
        ? current.map((existing) => existing.id === formMode.id ? item : existing)
        : [...current, item]
      );
      setFormMode(null);
      toast(isUpdating ? "Ingredient updated" : "Ingredient created");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setFormLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this ingredient permanently?")) return;
    setDeletingId(id);
    try {
      await requestHTTP("DELETE", `${config.API_ENDPOINT_INGREDIENT}/${id}`, undefined, addLog, user.accessToken);
      setItems((current) => current.filter((item) => item.id !== id));
      toast("Ingredient deleted");
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setDeletingId(null);
    }
  }

  const isEdit = formMode && formMode !== "create";

  return (
    <div className="columns">
      <div className="column is-7">
        <div className="level">
          <div className="level-left"><h1 className="title is-4">Ingredient Admin</h1></div>
          <div className="level-right">
            <button className="button is-primary is-small" onClick={() => setFormMode("create")} disabled={!!formMode}>
              + Add
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading-row"><span className="spinner" /> Fetching…</div>
        ) : items.length === 0 ? (
          <div className="notification">🥕 No ingredients yet. Add one!</div>
        ) : (
          <table className="table is-fullwidth is-hoverable">
            <thead><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th></th></tr></thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>{CATEGORY_EMOJI[item.category] ?? "🍽️"}</td>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.price}</td>
                  <td>{item.stock} {item.unit}</td>
                  <td>
                    <button className="button is-small" onClick={() => setFormMode(item)} disabled={!!formMode}>Edit</button>
                    <button
                      className={`button is-small is-danger ${deletingId === item.id ? "is-loading" : ""}`}
                      onClick={() => handleDelete(item.id)}
                      disabled={!!formMode || deletingId === item.id}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <ApiLog logs={logs} />
      </div>

      <div className="column is-5">
        {formMode ? (
          <div className="card">
            <div className="card-header"><p className="card-header-title">{isEdit ? "Edit ingredient" : "Add ingredient"}</p></div>
            <div className="card-content">
              <IngredientForm
                initial={isEdit ? formMode : null}
                onSubmit={handleSubmit}
                onCancel={() => setFormMode(null)}
                loading={formLoading}
              />
            </div>
          </div>
        ) : (
          <div className="notification is-light">Select <strong>+ Add</strong> or <strong>Edit</strong> to manage stock.</div>
        )}
      </div>

      <Toasts toasts={toasts} />
    </div>
  );
}
