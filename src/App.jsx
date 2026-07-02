import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/auth.context";
import { CartProvider } from "./context/cart.context"
import { MainLayout } from "./pages/layout/mainlayout";
import { AuthLayout } from "./pages/layout/authlayout";
const LoginPage         = lazy(() => import("./pages/login.page"));
const RegisterPage      = lazy(() => import("./pages/register.page"));
const IngredientsPage   = lazy(() => import("./pages/ingredients.page"));
const OrderHistoryPage  = lazy(() => import("./pages/orderHistory.page"));
const AdminPage         = lazy(() => import("./pages/admin.page"));

const PrivateRoutes = ({ role }) => {
  const { user, isLoggedIn } = useAuth();
  
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (role !== undefined && user?.role !== role) return <Navigate to="/ingredients" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Suspense fallback={<div className="loading-row"><span className="spinner" /> Loading…</div>}>
          <Routes>

            <Route element={<AuthLayout />}>
              <Route path="/login"          element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>
            
            <Route element={<MainLayout />}>
              {/* Route path / to ingredient page */}
              <Route path="/"              element={<Navigate to="/ingredients" replace />} />
              <Route path="/ingredients"   element={<CartProvider><IngredientsPage /></CartProvider>} />
              <Route element={<PrivateRoutes />}>
                <Route path="/order" element={<OrderHistoryPage />} />
              </Route>
              <Route element={<PrivateRoutes role={2} />}>
                <Route path="/admin" element={<AdminPage />} />
              </Route>
            </Route>

          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}
