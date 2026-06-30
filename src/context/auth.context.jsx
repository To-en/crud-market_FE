import { createContext, useContext, useState, useEffect } from "react";
import { requestHTTP, getConfig } from '../utils/api.js'

// 1.Context object -> Hold state transfer
const AuthContext = createContext(null);

// 2. Provider —> wraps the app tree, makes context accessible to all children
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = ยังไม่ login

  // getConfig() คืน Promise → ต้องใช้ useEffect เพื่อ await ข้างใน
  // ทำครั้งเดียวตอน mount ([] dependency = run once)
  const [config, setConfig] = useState(null);
  useEffect(() => {
    getConfig().then(setConfig);
  }, []);

  const login = async ( user , pass ) => {
    const user_data = { username: user, password: pass };
    // if config not yet loaded - throw error for caller to handle
    if (!config) throw new Error("Config not loaded yet");
    const data = await requestHTTP('POST', config.API_ENDPOINT_LOGIN, user_data  ,console.log);
    setUser(data.user ?? data); // { username, role , accessToken, refreshToken }
  };

  const register = async ( user , pass, classroom ) => {
    const user_data = { username: user, password: pass, classroom };
    if (!config) throw new Error("Config not loaded yet");
    const data = await requestHTTP('POST', config.API_ENDPOINT_REGISTER, user_data  ,console.log);
    setUser(data.user ?? data); // { username, role , accessToken, refreshToken }
  };
  
  const logout = () => {
    setUser(null);
    requestHTTP('POST', '/auth/logout', undefined, console.log).catch(() => {});
  };

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
