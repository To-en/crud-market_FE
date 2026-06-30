import { lazy, Suspense } from "react";
// Lazy react simpliy work like this
  // 
  // 
  // By wrapping around regular dynamic importStatement
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/auth.context";
import { CartProvider } from "./context/cart.context"
import { MainLayout } from "./pages/layout/mainlayout";
import { AuthLayout } from "./pages/layout/authlayout";
const LoginPage         = lazy(() => import("./pages/login.page"));
const RegisterPage      = lazy(() => import("./pages/register.page"));
const IngredientsPage   = lazy(() => import("./pages/ingredients.page"));
const OrderHistoryPage  = lazy(() => import("./pages/orderHistory.page"));
const AdminPage         = lazy(() => import("./pages/admin.page"));

// TODO Codex — auth guard: /admin (role 2) + /order-history need login. auth.context has no
//   session persistence yet, so a guard would log users out on refresh. Add persistence first
//   (localStorage/refresh-token), then wrap protected routes in a <RequireAuth role={...}/>.

// auth provider for all , but no guarded route , hmmm
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="loading-row"><span className="spinner" /> Loading…</div>}>
          <Routes>
            <Route element={<AuthLayout />}>
              <Route path="/login"          element={<LoginPage />} />
              <Route path="/login/register" element={<RegisterPage />} />
            </Route>
            <Route element={<MainLayout />}>
              <Route path="/"              element={<Navigate to="/ingredients" replace />} />
              <Route path="/ingredients"   element={<CartProvider><IngredientsPage /></CartProvider>} />
              <Route path="/order-history" element={<OrderHistoryPage />} />
              <Route path="/admin"         element={<AdminPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
