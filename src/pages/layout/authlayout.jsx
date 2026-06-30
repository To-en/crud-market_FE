// Bare shell for login/register — centered card, no navbar
import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <section className="hero is-fullheight has-background-light">
      <div className="hero-body">
        <div className="container">
          <div className="columns is-centered">
            <div className="column is-4">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
