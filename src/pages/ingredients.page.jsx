import { useState, useEffect, useCallback, useMemo } from "react";
import { requestHTTP, getConfig } from "../utils/api";
import { CATEGORIES, CATEGORY_EMOJI } from "../utils/constants";
import { useCart } from "../context/cart.context";
import { SearchBar } from "../components/searchbar";
import { CategoryBar } from "../components/table";
import { ApiLog } from "../components/ApiLog";
import { Toasts } from "../components/toast";

// Student-facing market: browse available ingredients → filter → add to cart → submit order.
// Admin CRUD lives in admin.page.jsx.
export default function IngredientsPage() {
  const { items: cart, addItem, updateQty, removeItem, clearCart, totalPrice } = useCart();
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs]       = useState([]);
  const [toasts, setToasts]   = useState([]);
  const [query, setQuery]     = useState("");
  const [category, setCategory] = useState(null);
  const [config, setConfig]   = useState(null);

  const addLog = useCallback((entry) => setLogs((l) => [...l, entry]), []);
  const toast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  useEffect(() => { getConfig().then(setConfig); }, []);

  // TODO Codex — server-side filter option: config.API_ENDPOINT_INGREDIENT_SEARCH (?q=&category=&inStock=)
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

  // ponytail: client-side filter is fine for ~20 seed items; swap to /search endpoint if catalog grows
  const visible = useMemo(
    () => items.filter((i) =>
      (!category || i.category === category) &&
      (!query || i.name?.toLowerCase().includes(query.toLowerCase()))
    ),
    [items, category, query]
  );

  // TODO Codex — submit order: POST config.API_ENDPOINT_ORDER_SUBMIT
  //   body parallel arrays { ingreId: [...], qty: [...] } from cart, needs auth token, role 0.
  //   On success: clearCart() + toast + navigate to /order-history.
  async function submitOrder() { toast("TODO: wire order submit", "error"); }

  return (
    <div className="columns">
      <div className="column is-8">
        <h1 className="title is-4">Market</h1>
        <SearchBar value={query} onChange={setQuery} placeholder="Search ingredients…" />
        <CategoryBar categories={CATEGORIES} selected={category} onSelect={setCategory} />

        {loading ? (
          <div className="loading-row"><span className="spinner" /> Loading market…</div>
        ) : visible.length === 0 ? (
          <div className="notification">No ingredients match.</div>
        ) : (
          <div className="columns is-multiline">
            {visible.map((item) => (
              <div key={item.id} className="column is-4">
                <div className="card">
                  <div className="card-content">
                    <p className="title is-6">{CATEGORY_EMOJI[item.category] ?? "🍽️"} {item.name}</p>
                    <p className="subtitle is-7">{item.price} / {item.unit} · {item.stock} in stock</p>
                    <button
                      className="button is-primary is-small is-fullwidth"
                      disabled={item.stock <= 0}
                      onClick={() => { addItem(item); toast(`Added ${item.name}`); }}
                    >
                      {item.stock <= 0 ? "Out of stock" : "Add to cart"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <ApiLog logs={logs} />
      </div>

      {/* Cart summary */}
      <div className="column is-4">
        <div className="card">
          <div className="card-header"><p className="card-header-title">Cart ({cart.length})</p></div>
          <div className="card-content">
            {cart.length === 0 ? (
              <p className="has-text-grey">Cart is empty.</p>
            ) : (
              <>
                {cart.map(({ ingredient, qty }) => (
                  <div key={ingredient.id} className="level is-mobile mb-2">
                    <div className="level-left">{ingredient.name}</div>
                    <div className="level-right">
                      <button className="button is-small" onClick={() => updateQty(ingredient.id, qty - 1)}>−</button>
                      <span className="mx-2">{qty}</span>
                      <button className="button is-small" onClick={() => updateQty(ingredient.id, qty + 1)}>+</button>
                      <button className="button is-small is-danger ml-2" onClick={() => removeItem(ingredient.id)}>×</button>
                    </div>
                  </div>
                ))}
                <hr />
                <div className="level is-mobile">
                  <span>Total</span><strong>{totalPrice}</strong>
                </div>
                <button className="button is-primary is-fullwidth" onClick={submitOrder}>Submit order</button>
                <button className="button is-text is-fullwidth" onClick={clearCart}>Clear</button>
              </>
            )}
          </div>
        </div>
      </div>

      <Toasts toasts={toasts} />
    </div>
  );
}
