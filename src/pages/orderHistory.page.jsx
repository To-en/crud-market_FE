import { useState, useEffect, useCallback } from "react";
import { requestHTTP, getConfig } from "../utils/api";
import { useAuth } from "../context/auth.context";
import { SearchBar } from "../components/searchbar";
import { Checkbox } from "../components/checkbox"

const STATUS = { 0: "Pending", 1: "Approved", 2: "Cancelled" };
// Bulma css variant
const STATUS_CLASS = { 0: "is-warning", 1: "is-success", 2: "is-danger" };

// Define method to calculate the order-history dymanic url
// (url change by order)
const orderUrl = (config, id, action = "") =>
  `${config.API_ENDPOINT_ORDER}/${encodeURIComponent(id)}${action ? `/${action}` : ""}`;

// Past orders, scoped server-side by role (student=own, teacher=class, admin=all).
//
// How this page works:
//  1. Mount → getConfig() loads API endpoints into `config`.
//  2. `config` / auth token / search `query` ready or changed → fetchOrders()
//     hits /order (or /order/search?value=) and fills the `orders` table.
//  3. User types in SearchBar → `query` changes → fetchOrders re-runs
//     (re-run driven purely by React re-render; no explicit debounce).
//  4. User clicks a row → openOrder(id) fetches the full bill into
//     `selectedOrder`, rendering the item breakdown box at the bottom.
// One-way flow: query/token/config drive fetchOrders; row click drives openOrder.
export default function OrderHistoryPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 2;   // teacher=1, admin=2 — admin sees extra owner/classroom columns
  const isTeacher = user?.role === 1;   // teacher=1, admin=2 — admin sees extra owner/classroom columns
  const [orders, setOrders]   = useState([]);               // Hold array of orders object
  const [selectedOrder, setSelectedOrder] = useState(null); // Hold selected order array element
  const [loading, setLoading] = useState(true);             // hold loading state until fetch success (then cleared , set null).
  const [query, setQuery]     = useState("");
  const [config, setConfig]   = useState(null);

  // Fetch config file at first page render
  useEffect(() => { getConfig().then(setConfig); }, []);

  // action 1. List all order related to user's class
  // to /order?userId= ...
  const fetchOrders = useCallback(async () => {
    // No user token -> Do not fetch -> return
    if (!config || !user?.accessToken) return;
    setLoading(true);
    try {
      // if have query search use API search , having none use listall associated order
      const path = query
      ? `${config.API_ENDPOINT_ORDER_SEARCH}?${new URLSearchParams({ value: query })}`
      : config.API_ENDPOINT_ORDER;
      const data = await requestHTTP("GET", path, undefined, undefined, user.accessToken);
      
      setOrders(Array.isArray(data) ? data : data.data ?? []);
    } catch {
      setOrders([]);
    } finally {
      // Upon resolved fetch , disable loading screen
      setLoading(false);
    }
  }, [config, user?.accessToken, query]);

  // First render + subsequence change on fetchOrders
  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // updateOrderStatus fetch
  async function changeOrderStatus(orderId, status) {
    await requestHTTP("PATCH", orderUrl(config, orderId, "status"), { status }, undefined, user.accessToken);
    fetchOrders();
  }

  // OpenOrderBill fetch
  async function openOrder(id) {
    try {
      const data = await requestHTTP("GET", orderUrl(config, id), undefined, undefined, user.accessToken);
      setSelectedOrder(data);
    } catch {
      setSelectedOrder(null);
    }
  }

  // editOrderBill fetch
  async function editOrder(params) {
    try {
      const data = await requestHTTP("GET", orderUrl(config, id, "edit"), undefined, undefined, user.accessToken);
      setSelectedOrder(data);
    } catch {
      setSelectedOrder(null);
    }
  }

  // deleteOrderBill fetch
  async function deleteOrder(params) {
    try {
      const data = await requestHTTP("GET", orderUrl(config, id, "delete"), undefined, undefined, user.accessToken);
      setSelectedOrder(data);
    } catch {
      
    }
  }

  return (
    <div>
      <h1 className="title is-4">Order History</h1>
      <SearchBar value={query} onChange={setQuery} placeholder="Search by name or order id…" />

      {loading ? (
        <div className="loading-row"><span className="spinner" /> Loading orders…</div>
      ) : orders.length === 0 ? (
        <div className="notification">No orders yet.</div>
      ) : (

        // One table per class Loop (May)
        <table className="table is-fullwidth is-hoverable">
          <thead>
            <tr>
              <th>Order</th>
              <th>Name</th>
              <th>Total</th>
              <th>Status </th>
              <th>Date</th>
              {(isAdmin || isTeacher) && (
                <>
                  <th>Owner</th>
                  <th>Classroom</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {/* Map order array orderElem = element from order array */}

            {/* Move up the guard condition up above to the table header , as for admin , 
              will see another column name classroom -> in the future might be grouped by classroom view (But leave it for later release) */}

            {orders.map((orderElem) => (
              <tr key={orderElem.id} onClick={() => openOrder(orderElem.id)} style={{ cursor: "pointer" }}>
                <td>{orderElem.id}</td>
                <td>{orderElem.name}</td>
                <td>{orderElem.grandTotal}</td>
                <td>
                  {user?.role === 1 || user?.role === 2 ? (
                    <div className="select is-small" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={orderElem.status}
                        onChange={(e) => changeOrderStatus(orderElem.id, Number(e.target.value))}
                      >
                        {/* May change to bulma drop down or custom drop down entirely */}
                        <option value="0" className={`tag ${STATUS_CLASS[0]}`}>Pending</option>
                        <option value="1" className={`tag ${STATUS_CLASS[1]}`}>Approved</option>
                        <option value="2" className={`tag ${STATUS_CLASS[2]}`}>Cancelled</option>
                      </select>
                    </div>
                  ) : (
                    <span className={`tag ${STATUS_CLASS[orderElem.status] ?? ""}`}>
                      {STATUS[orderElem.status] ?? orderElem.status}
                    </span>
                  )}
                </td>
                <td>{orderElem.createdDate ? new Date(orderElem.createdDate).toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' }) : '—'}</td>
                {(isAdmin || isTeacher) && (
                  <>
                    <td>{orderElem.owner ?? "—"}</td>
                    <td>{orderElem.classroom ?? "—"}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Bill subpage (Should be floating windows) Not appear on Order  */}
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
