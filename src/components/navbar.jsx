// Top navigation bar — app title + links to each page, highlights active route
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth.context";
import { Button } from "../components/button"

const LINKS = [
  { to: "/ingredients",   label: "Market" },
  { to: "/order", label: "Orders" },
  { to: "/admin",         label: "Admin" },
];

export function Navbar() {
  const { pathname } = useLocation();
  const { user, isLoggedIn, logout } = useAuth();
  // Use auth context to pull out user's role -> only filter /admin to react router -> if role = 2
  const links = LINKS.filter((l) => l.to !== "/admin" || user?.role === 2);
  const displayName = user && user.userName ? user.userName : "User";

  const logoutButton = (params) => {
    // Execute logout after

    // Do not reload , and redirect

  }

  return (
    <nav className="navbar is-primary" role="navigation" aria-label="main navigation">
      <div className="navbar-brand" style={{ flexGrow: 0.05, justifyContent: "center" }}>
        <img src="/images/market-supermarket-svgrepo-com.svg" alt="React logo" width="40" height="40" />
        <Link className="navbar-item has-text-weight-bold is-size-4" to="/ingredients">CRUD Market</Link>
      </div>
      <div className="navbar-menu">
        <div className="navbar-start">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`navbar-item ${pathname === l.to ? "is-active" : ""}`}
              // active: white bg + black text; inactive inherits navbar white text
              // Typically in bulma CSS it will be ...
              style={pathname === l.to ? { backgroundColor: "#fff", color: "#000" } : undefined}
            >
              {l.label}
            </Link>
          ))}
        </div>
        <div className="navbar-end">
          {isLoggedIn ? (
            <>
              <div className="navbar-item">
                <span className="icon">
                  <i className="fas fa-user" aria-hidden="true"></i>
                </span>
                <span>{displayName}</span>
                {/* Backend sentback userName */}
              </div>
              <div className="navbar-item">
                <Link to='/login'>
                  <Button variant="danger" onClick={logout}>Logout</Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="navbar-item">
              <Link to="/login">
                <Button variant="secondary">Login</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
