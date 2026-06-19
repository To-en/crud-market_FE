import { API } from "./constants";

export async function request(method, path, body, onLog) {
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
