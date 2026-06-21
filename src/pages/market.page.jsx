import { useState, useEffect, useCallback } from "react";
import { request } from "../utils/api";
import { CATEGORY_EMOJI } from "../utils/constants";
import { CATEGORIES, UNITS } from "../utils/constants";
import { ApiLog } from "../components/ApiLog";
import { Toasts } from "../components/toast";

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


export default function IngredientsPage() {
  // ...

}