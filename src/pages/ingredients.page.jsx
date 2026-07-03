import { useState, useEffect, useCallback } from "react";
import { requestHTTP, getConfig } from "../utils/api";
import { useCart } from "../context/cart.context";
import { useAuth } from "../context/auth.context";
import { SearchBar } from "../components/searchbar";
import { CategoryBar } from "../components/table";
import { Toasts } from "../components/toast";

// Student-facing market: browse available ingredients → filter → add to cart → submit order.
// Admin CRUD lives in admin.page.jsx.
export default function IngredientsPage() {
  const { items: cart, addItem, updateQty, removeItem, clearCart, totalPrice } = useCart();

  const { user } = useAuth();
  const [items, setItems]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts]   = useState([]);
  const [query, setQuery]     = useState("");
  const [category, setCategory] = useState(null);
  const [orderName, setOrderName] = useState("");
  const [config, setConfig]   = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const addLog = useCallback(() => {}, []); // request log UI moved to admin page
  const PAGE_SIZE = Number(import.meta.env.VITE_PAGESIZE) || 40;

  // Toast UI appear when order API fired success (No 500 error return)
  // For GQL Implementation
  const toast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  useEffect(() => { getConfig().then(setConfig); }, []);

  // getCategory name on first load
  useEffect(() => {
    if (!config) return;
    requestHTTP("GET", config.API_ENDPOINT_CATEGORY, undefined, addLog)
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [config, addLog]);

  // Server-side filter: /ingredients/search in q=, response is { data: [...] }.
  const fetchItems = useCallback(async () => {
    if (!config) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (category) params.set("category", category);
      params.set("page", page);
      params.set("limit", PAGE_SIZE);
      const path = `${config.API_ENDPOINT_INGREDIENT_SEARCH}?${params}`;
      const res = await requestHTTP("GET", path, undefined, addLog);
      setItems(res.data ?? []);
      setTotal(res.total ?? 0);
    } catch {
      toast("Cannot reach backend — is it running on correct:3000?", "error");
    } finally {
      setLoading(false);
    }
  }, [config, query, category, page, PAGE_SIZE, addLog, toast]);

  // Debounce so typing in search doesn't fire a request per keystroke.
  useEffect(() => {
    const t = setTimeout(fetchItems, 300);
    return () => clearTimeout(t);
  }, [fetchItems]);
  // only fetch per 300ms once after another fetch

  useEffect(() => setPage(1), [query, category]);

  async function submitOrder() {
    if (!user?.accessToken) { toast("Log in to submit an order", "error"); return; }
    if (cart.length === 0) return;
    if (!orderName.trim()) { toast("Name your order first", "error"); return; }
    try {
      await requestHTTP("POST", config.API_ENDPOINT_ORDER_SUBMIT, {
        name: orderName.trim(),
        ingreId: cart.map((c) => c.ingredient.id),
        qty: cart.map((c) => c.qty),

        // Need to sent back grandtotal as well
      }, addLog, user.accessToken);
      clearCart();
      setOrderName("");
      toast("Order submitted");
    } catch (e) {
      toast(e.message || "Order failed", "error");
    }
  }

  return (
    <div className="columns">
      {/* <img src="/images/food-svgrepo-com/svg" alt="React logo" width="40" height="40" /> */}
      <div className="column is-8">
        <h1 className="title is-4">Market</h1>
        <SearchBar value={query} onChange={setQuery} placeholder="Search ingredients…" />
        <CategoryBar categories={categories} selected={category} onSelect={setCategory} />

        {loading ? (
          <div className="loading-row"><span className="spinner" /> Loading market…</div>
        ) : items.length === 0 ? (
          <div className="notification">No ingredients match.</div>
        ) : (
          <div className="columns is-multiline">
            {items.map((item) => (
              <div key={item.id} className="column is-4">
                <div className="card">
                  <div className="card-content">
                    <p className="title is-6">{item.name}</p>
                    <p className="subtitle is-7">{item.unitPrice} / {item.unit} · {item.stock} in stock</p>
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
        {total > PAGE_SIZE && (
          <nav className="pagination is-centered" role="navigation" aria-label="pagination">
            <button
              className="pagination-previous"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </button>
            <button
              className="pagination-next"
              disabled={page >= Math.ceil(total / PAGE_SIZE)}
              onClick={() => setPage(page + 1)}
            >
              Next page
            </button>
            <ul className="pagination-list">
              {Array.from({ length: Math.ceil(total / PAGE_SIZE) }, (_, i) => i + 1).map((n) => (
                <li key={n}>
                  <button
                    className={`pagination-link${n === page ? " is-current" : ""}`}
                    aria-label={`Goto page ${n}`}
                    aria-current={n === page ? "page" : undefined}
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
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
                <input
                  className="input mb-2"
                  value={orderName}
                  onChange={(e) => setOrderName(e.target.value)}
                  placeholder="Order name (e.g. Monday Lunch)"
                />
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

// Next plan exclusive admin (will have dropdown on cart to choose which class to submit as)
