import { lazy, Suspense } from "react";
// Lazy react simpliy work like this
  // 
  // 
  // By wrapping around regular dynamic importStatement
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/auth.context";
import { CartProvider } from "./context/cart.context"
const LoginPage         = lazy(() => import("./pages/login.page"));
const RegisterPage      = lazy(() => import("./pages/register.page"));
const IngredientsPage   = lazy(() => import("./pages/ingredients.page"));
const OrderHistoryPage  = lazy(() => import("./pages/orderHistory.page"));
const AdminPage         = lazy(() => import("./pages/admin.page"));

export default function App() {
  return (
    <AuthProvider> 
      <BrowserRouter>
        <Suspense fallback={<div className="loading-row"><span className="spinner" /> Loading…</div>}>
          <Routes>
            <Route path="/"              element={<Navigate to="/ingredients" replace />} />
            <Route path="/login"         element={<LoginPage />} />
            <Route path="/login/register"         element={<RegisterPage />} />
            <Route path="/ingredients"   element={<CartProvider><IngredientsPage /></CartProvider>} />
            <Route path="/order-history" element={<OrderHistoryPage />} />
            <Route path="/admin" element={<OrderHistoryPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
