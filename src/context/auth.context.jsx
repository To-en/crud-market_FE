import { createContext, useContext, useState } from "react";
import { requestHTTP } from '../utils/api.js'
import { getConfig } from "../utils/api.js";

// 1.Context object -> Hold state transfer
const AuthContext = createContext(null);

// 2. Provider —> wraps the app tree, makes context accessible to all children
export function AuthProvider({ children }) {
  const config = getConfig();
  const [user, setUser] = useState(null); // null = ยังไม่ login

  const login = async ( user , pass ) => {
    const user_data = { username: user, password: pass };
    const data = await requestHTTP('POST', config.API_ENDPOINT_LOGIN, user_data  ,console.log);
    setUser(data.user ?? data); // { username, role , accessToken, refreshToken }
  };

  const register = async ( user , pass, classroom ) => {
    const user_data = { username: user, password: pass, classroom };
    const data = await requestHTTP('POST', '/auth/register', user_data  ,console.log);
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
