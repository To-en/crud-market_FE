
// Backend url (เอาออกทีหลัง)
const baseurl     = import.meta.env.VITE_BASE_URL;
const apiendpoint = import.meta.env.VITE_API_ENDPOINT;

export async function getConfig() { 
  try {
    const res = await fetch('/config'); // 
    const config = await res.json();
    return config;
  } catch (err) {
    console.log("404 Not Found `config.json`");
  }
}

// Universal http fetch request 
export async function requestHTTP(method, path, body, onLog, token=null) {
  // token with be passed from auth context later time
  const opts = {
    method,
    headers: { 
      "Content-Type": "application/json" ,
      ...(token ? {"Authorization": `Bearer ${token}`} : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  };
  const start = Date.now();
  try {
    const res  = await fetch(`${apiendpoint}${path}`, opts);
    const data = await res.json();
    onLog({ method, path, status: res.status, ok: res.ok, ms: Date.now() - start });
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  } catch (err) {
    onLog({ method, path, status: "ERR", ok: false, ms: Date.now() - start });
    throw err;
  }
}

// Universal GQL fetch request
export async function requestGQL(queryString) {
  // call some apollo
}