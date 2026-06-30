// App shell for authenticated pages — Navbar on top, routed page in <Outlet/>
import { Outlet } from "react-router-dom";
import { Navbar } from "../../components/navbar";

export function MainLayout() {
  return (
    <>
      <Navbar />
      <main className="section">
        <div className="container">
          <Outlet />
        </div>
      </main>
    </>
  );
}
