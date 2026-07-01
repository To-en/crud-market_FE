// Top navigation bar — app title + links to each page, highlights active route
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth.context";

const LINKS = [
  { to: "/ingredients",   label: "Market" },
  { to: "/order-history", label: "Orders" },
  { to: "/admin",         label: "Admin" },
];

export function Navbar() {
  const { pathname } = useLocation();
  const { isLoggedIn, user, logout } = useAuth();
  const links = LINKS.filter((l) => l.to !== "/admin" || user?.role === 2);

  return (
    <nav className="navbar" role="navigation" aria-label="main navigation">
      <div className="navbar-brand">
        <Link className="navbar-item has-text-weight-bold" to="/ingredients">🥕 Crud Market</Link>
      </div>
      <div className="navbar-menu">
        <div className="navbar-start">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`navbar-item ${pathname === l.to ? "is-active has-text-link" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="navbar-end">
          {/* ponytail: minimal auth affordance; */}
          <div className="navbar-item">
            {isLoggedIn
              ? <button className="button is-light is-small" onClick={logout}>Logout {user?.username}</button>
              : <Link className="button is-primary is-small" to="/login">Login</Link>}
          </div>
        </div>
      </div>
    </nav>
  );
}
