import { useState, useEffect, useCallback } from "react";
import { requestHTTP, getConfig } from "../utils/api";
import { SearchBar } from "../components/searchbar";
import { useAuth } from "../context/auth.context";

const STATUS = { 0: "pending", 1: "confirmed", 2: "cancelled" };
const STATUS_CLASS = { 0: "is-warning", 1: "is-success", 2: "is-danger" };

// Calculate the Order URL
const orderUrl = (config, id, action = "") =>
  `${config.API_ENDPOINT_ORDER}/${encodeURIComponent(id)}${action ? `/${action}` : ""}`;

// Past orders, scoped server-side by role (student=own, teacher=class, admin=all).
export default function OrderHistoryPage() {
  const { user } = useAuth();
  const [orders, setOrders]   = useState([]);               // setOrder state
  const [selectedOrder, setSelectedOrder] = useState(null); // setOrder
  const [loading, setLoading] = useState(true);             // 
  const [query, setQuery]     = useState("");
  const [config, setConfig]   = useState(null);

  const addLog = useCallback(() => {}, []);

  // Fetch config file at first page render
  useEffect(() => { getConfig().then(setConfig); }, []);

  // action 1. List all order related to user's class
  // to /order?userId= ...
  const fetchOrders = useCallback(async () => {
    if (!config || !user?.accessToken) return;
    setLoading(true);
    try {
      const path = query
        ? `${config.API_ENDPOINT_ORDER_SEARCH}?${new URLSearchParams({ value: query })}`
        : config.API_ENDPOINT_ORDER;
      const data = await requestHTTP("GET", path, undefined, addLog, user.accessToken);
      setOrders(Array.isArray(data) ? data : data.data ?? []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [config, user?.accessToken, query, addLog]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Open Order Bill action
  async function openOrder(id) {
    try {
      const data = await requestHTTP("GET", orderUrl(config, id), undefined, addLog, user.accessToken);
      setSelectedOrder(data);
    } catch {
      setSelectedOrder(null);
    }
  }
  // Edit order Bill action
  
  // Delete Order Bill action


  return (
    <div>
      <h1 className="title is-4">Order History</h1>
      <SearchBar value={query} onChange={setQuery} placeholder="Search by name or order id…" />

      {loading ? (
        <div className="loading-row"><span className="spinner" /> Loading orders…</div>
      ) : orders.length === 0 ? (
        <div className="notification">No orders yet.</div>
      ) : (
        <table className="table is-fullwidth is-hoverable">
          <thead><tr><th>ID</th><th>Name</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} onClick={() => openOrder(o.id)} style={{ cursor: "pointer" }}>
                <td>{o.id}</td>
                <td>{o.name}</td>
                <td>{o.grandTotal}</td>
                <td><span className={`tag ${STATUS_CLASS[o.status] ?? ""}`}>{STATUS[o.status] ?? o.status}</span></td>
                <td>{o.createdDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedOrder && (
        <div className="box mt-4">
          <h2 className="title is-6">Order #{selectedOrder.id}</h2>
          {(selectedOrder.items ?? []).map((item) => (
            <div key={item.ingredientId} className="level is-mobile mb-1">
              <span>{item.name}</span>
              <span>{item.qty} {item.unit} · {item.subtotal}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
