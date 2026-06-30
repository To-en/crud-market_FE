import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth.context";

// Todo: Decorate with bulma css
function LoginForm() {
  let navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState(null);
  const { login } = useAuth(); // pull login

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // equivalent to document.getElementby..().addEventlistener('onClick')
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      // upon successful redirect to /Ingredient (This is be only instance of multipage redirect?)
      navigate("/ingredients");
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // onClick event pass to e params , then we use reactHook to set state
  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label className="label">Username</label>
        <div className="control">
          <input className="input" type="text" placeholder="your username"
            value={username} onChange={e => setUsername(e.target.value)} />
        </div>
      </div>

      <div className="field">
        <label className="label">Password</label>
        <div className="control">
          <input className="input" type="password" placeholder="••••••••"
            value={password} onChange={e => setPassword(e.target.value)} />
        </div>
      </div>

      {errorMsg && <div className="notification is-danger is-light">{errorMsg}</div>}

      <div className="field">
        <button className="button is-primary is-fullwidth" type="submit">Login</button>
      </div>
    </form>
  );
}


export default function LoginPage() {
  return (
    <section className="section">
      <div className="container">
        <div className="columns is-centered">
          <div className="column is-4">
            <div className="box">
              <h1 className="title has-text-centered">Login</h1>
              <LoginForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}