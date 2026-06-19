import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

const IngredientsPage  = lazy(() => import("./pages/ingredients.page"));
const LoginPage        = lazy(() => import("./pages/login.page"));
const MarketPage       = lazy(() => import("./pages/market.page"));
const ShoppingCartPage = lazy(() => import("./pages/shoppingCart.page"));
const OrderHistoryPage = lazy(() => import("./pages/orderHistory.page"));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div className="loading-row"><span className="spinner" /> Loading…</div>}>
        <Routes>
          <Route path="/"              element={<Navigate to="/ingredients" replace />} />
          <Route path="/ingredients"   element={<IngredientsPage />} />
          <Route path="/login"         element={<LoginPage />} />
          <Route path="/market"        element={<MarketPage />} />
          <Route path="/cart"          element={<ShoppingCartPage />} />
          <Route path="/order-history" element={<OrderHistoryPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
