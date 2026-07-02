import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth.context";
import { Card } from "../components/card";
import { Button } from "../components/button";

// Todo: Decorate with bulma css
function LoginForm() {
  let navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState(null);
  const { login } = useAuth(); 

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // equivalent to document.getElementby..().addEventlistener('onClick')
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate("/ingredients");
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label className="label">Username</label>
        <div className="control">
          <input className="input" type="text" placeholder="your username"
            value={username} onChange={e => setUsername(e.target.value)} />
            {/* onClick event pass to e params , then we use reactHook to set state on form */}
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

      <div className="field" style={{ display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        {/* Button component — variant="primary" maps to Bulma "is-primary" inside button.jsx */}
        <Button variant="primary" type="submit" onClick={handleSubmit}>Login</Button>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Link to="/register" style={{ textDecoration: "underline" }}>
          Register
        </Link>
      </div>

      </div>
    </form>
  );
}


export default function LoginPage() {
  // AuthLayout provides the centered column wrapper
  return (
    <Card title="Login">
      <LoginForm />
    </Card>
  );
}