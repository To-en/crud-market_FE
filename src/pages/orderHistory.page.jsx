import { useState, useEffect, useCallback } from "react";
import { requestHTTP, getConfig } from "../utils/api";
import { SearchBar } from "../components/searchbar";
import { ApiLog } from "../components/ApiLog";

const STATUS = { 0: "pending", 1: "confirmed", 2: "cancelled" };
const STATUS_CLASS = { 0: "is-warning", 1: "is-success", 2: "is-danger" };

// Past orders, scoped server-side by role (student=own, teacher=class, admin=all).
export default function OrderHistoryPage() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs]       = useState([]);
  const [query, setQuery]     = useState("");
  const [config, setConfig]   = useState(null);

  const addLog = useCallback((entry) => setLogs((l) => [...l, entry]), []);
  useEffect(() => { getConfig().then(setConfig); }, []);

  // TODO Codex — wire to config.API_ENDPOINT_ORDER (GET, paginated, needs auth token).
  //   Search: config.API_ENDPOINT_ORDER_SEARCH (?value=).
  //   Row click → bill detail GET `${API_ENDPOINT_ORDER}/:id`.
  //   Teacher/Admin (role 1,2): confirm/cancel via PATCH `${API_ENDPOINT_ORDER}/:id/status`.
  const fetchOrders = useCallback(async () => {
    if (!config) return;
    setLoading(true);
    try {
      const data = await requestHTTP("GET", config.API_ENDPOINT_ORDER, undefined, addLog);
      setOrders(Array.isArray(data) ? data : data.items ?? []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [config, addLog]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

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
              <tr key={o.id}>
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

      <ApiLog logs={logs} />
    </div>
  );
}
