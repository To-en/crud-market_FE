import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { requestHTTP, getConfig } from '../utils/api.js'


// 1.Context object -> Hold state transfer
const AuthContext = createContext(null);

// 2. Provider —> wraps the app tree, makes context accessible to all children
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("userAuth") || "null")
  ); // null = ยังไม่ login

  const [config, setConfig] = useState(null);
  const refreshTimerRef = useRef(null);

  useEffect(() => {
    getConfig().then(setConfig);
  }, []);

  // expiresAt = absolute ms timestamp when accessToken expires (stored in localStorage)
  const scheduleRefresh = useCallback((expiresAt, refreshToken) => {
    clearTimeout(refreshTimerRef.current);
    if (!expiresAt) return;
    const refreshAt = expiresAt - Date.now() - 60_000; // 1 min before expire

    // DEBUG: ลด accessExpire ใน BE config เพื่อเทส เช่น 2 นาที → refresh fire ที่นาทีที่ 1
    console.log(`[auth] refresh scheduled in ${(refreshAt / 1000).toFixed(1)}s`);

    if (refreshAt <= 0) return;

    // เมื่อถึงเวลา 1 min before expire จะ async execute Endpoint /api/refresh ทันที
    refreshTimerRef.current = setTimeout(async () => {
      console.log('[auth] refreshing token...');
      try {
        const cfg = await getConfig();
        const data = await requestHTTP('POST', cfg.API_ENDPOINT_REFRESH, { refreshToken }, console.log);
        const nextExpiresAt = Date.now() + data.expires * 60 * 1000;
        setUser(prev => {
          const updated = { ...prev, accessToken: data.accessToken, expiresAt: nextExpiresAt };
          localStorage.setItem("userAuth", JSON.stringify(updated));
          return updated;
        });
        scheduleRefresh(nextExpiresAt, refreshToken);
      } catch {
        logout();
      }
    }, refreshAt);
  }, []);

  const login = async ( user , pass ) => {
    const user_data = { username: user, password: pass };
    if (!config) throw new Error("Config not loaded yet");
    const data = await requestHTTP('POST', config.API_ENDPOINT_LOGIN, user_data  ,console.log);
    const nextUser = data.user ?? data;
    const expiresAt = Date.now() + nextUser.expires * 60 * 1000;
    const stored = { ...nextUser, expiresAt };
    setUser(stored);
    localStorage.setItem("userAuth", JSON.stringify(stored));
    scheduleRefresh(expiresAt, stored.refreshToken);
  };

  const register = async ( user , pass, classroom ) => {
    const user_data = { username: user, password: pass, classroom };
    if (!config) throw new Error("Config not loaded yet");
    const data = await requestHTTP('POST', config.API_ENDPOINT_REGISTER, user_data  ,console.log);
    const nextUser = data.user ?? data;
    const expiresAt = Date.now() + nextUser.expires * 60 * 1000;
    const stored = { ...nextUser, expiresAt };
    setUser(stored);
    localStorage.setItem("userAuth", JSON.stringify(stored));
    scheduleRefresh(expiresAt, stored.refreshToken);
  };

  const logout = () => {
    clearTimeout(refreshTimerRef.current);
    setUser(null);
    localStorage.removeItem("userAuth");
    requestHTTP('POST', '/auth/logout', undefined, console.log).catch(() => {});
  };

  // on mount: if user loaded from localStorage, reschedule refresh
  useEffect(() => {
    if (user?.accessToken) scheduleRefresh(user.expiresAt, user.refreshToken);
    return () => clearTimeout(refreshTimerRef.current);
  }, []);

  const isLoggedIn = !!user; // เมื่อ user not null ก็แปลว่า isLoggedIn แล้ว
  return (
    <AuthContext.Provider value={{ user, isLoggedIn, login, register, logout }}> {children} </AuthContext.Provider>
  );
  // By wraping Context object around the child element , it does not alter the UI , it just inject data
}

// 3. Consumer hook -> call this in any component inside the provider to access auth related method
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
  // return prop wrapped in <AuthContext.Provider>
}
