import { readFileSync } from "node:fs";
import vm from "node:vm";
import { test, expect } from "vitest";

// vm harness for AuthProvider.
// Stubs React hooks + strips JSX return so pure state logic is testable
// without a DOM or real HTTP calls.
function loadAuthProvider(initialUser = null) {
  const stateStore = [];
  let hookIdx = 0;

  const storage = {
    data: initialUser ? { userAuth: JSON.stringify(initialUser) } : {},
    getItem(k)    { return this.data[k] ?? null; },
    setItem(k, v) { this.data[k] = v; },
    removeItem(k) { delete this.data[k]; },
  };

  const ctx = {
    JSON,
    Date,
    console: { log: () => {} }, // silence the [auth] debug logs
    clearTimeout: () => {},
    setTimeout:   () => null,
    localStorage: storage,
    createContext: () => ({}),
    useContext:    () => null,
    useEffect:     (fn) => fn?.(),
    useRef:        () => ({ current: null }),
    useCallback:   (fn) => fn,
    useState: (initial) => {
      const i = hookIdx++;
      if (stateStore[i] === undefined)
        stateStore[i] = typeof initial === "function" ? initial() : initial;
      return [
        stateStore[i],
        (next) => { stateStore[i] = typeof next === "function" ? next(stateStore[i]) : next; },
      ];
    },
    // API stubs — no real network
    requestHTTP: () => Promise.resolve({}),
    getConfig:   () => Promise.resolve({}),
  };

  const source = readFileSync(
    new URL("../src/context/auth.context.jsx", import.meta.url),
    "utf8"
  )
    .replace(/^import .+ from "react";\n/, "")
    // api.js import: use multiline flag so ^ matches mid-string after React line is stripped
    .replace(/^import .+ from ['"]\.\.\/utils\/api\.js['"];?\n?/m, "")
    .replace("export function AuthProvider", "function AuthProvider")
    .replace("export function useAuth",     "function useAuth")
    // Replace JSX provider return with plain object
    .replace(
      /return \(\n\s*<AuthContext\.Provider[\s\S]*?<\/AuthContext\.Provider>\s*\);[\s\S]*?\n\}/,
      "return { user, isLoggedIn, login, register, logout };\n}"
    );

  vm.runInNewContext(`${source}\nthis.AuthProvider = AuthProvider;`, ctx);

  function call() {
    hookIdx = 0; // reset hook index each invocation (mirrors React's rules-of-hooks order)
    return ctx.AuthProvider({ children: null });
  }

  return { call, storage };
}

test("AuthProvider: default state — user null, not logged in", () => {
  const { call } = loadAuthProvider();
  const { user, isLoggedIn } = call();
  expect(user).toBeNull();
  expect(isLoggedIn).toBe(false);
});

test("AuthProvider: loads user from localStorage — isLoggedIn true", () => {
  const fakeUser = { id: 1, username: "alice", accessToken: "tok", expiresAt: Date.now() + 9999999 };
  const { call } = loadAuthProvider(fakeUser);
  const { user, isLoggedIn } = call();
  expect(isLoggedIn).toBe(true);
  expect(user.username).toBe("alice");
});

test("AuthProvider: logout clears user state and localStorage", () => {
  const fakeUser = { id: 1, username: "bob", accessToken: "tok", expiresAt: Date.now() + 9999999 };
  const { call, storage } = loadAuthProvider(fakeUser);

  expect(call().isLoggedIn).toBe(true);

  call().logout();

  expect(call().isLoggedIn).toBe(false);
  expect(call().user).toBeNull();
  expect(storage.data["userAuth"]).toBeUndefined();
});
