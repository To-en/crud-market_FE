import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // null = ยังไม่ login

  // TODO: login(credentials) — ส่ง POST /auth/login
  //   ถ้า success → setUser(responseData.user)
  //   ถ้า fail → throw error ให้ caller จัดการ

  // TODO: logout() — เคลียร์ user state + เรียก POST /auth/logout (optional)

  // isLoggedIn — derive จาก user ไม่ต้องเป็น state แยก
  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{ user, isLoggedIn }}>
      {/* TODO: ใส่ login, logout ใน value ด้วย */}
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  // TODO: throw error ถ้าเรียกนอก AuthProvider
  return ctx;
}
