import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/auth.context";
import { requestHTTP, getConfig } from "../utils/api";
import { Card } from "../components/card";
import { Button } from "../components/button";

function RegisterForm() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState(null);
  const { register } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [classroom, setClassroom] = useState("");
  const [classrooms, setClassrooms] = useState([]);

  useEffect(() => {
    getConfig()
      .then(config => requestHTTP("GET", config.API_ENDPOINT_CLASSROOM_LIST, undefined, () => {}))
      .then(setClassrooms)
      .catch(err => setErrorMsg(err.message));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(username, password, classroom);
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
          <input className="input" type="text" placeholder="e.g. M6/2-group1"
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
      <div className="field">
        <label className="label">Classroom</label>
        <div className="control">
          <select className="input" value={classroom} onChange={e => setClassroom(e.target.value)}>
            <option value="">Select classroom</option>
            {classrooms.map(room => (
              <option key={room.id} value={room.id}>{room.name}</option>
            ))}
          </select>
        </div>
      </div>

      {errorMsg && <div className="notification is-danger is-light">{errorMsg}</div>}

      <div className="field">
        <Button variant="primary" type="submit" onClick={handleSubmit}>Register</Button>
      </div>
      <p className="has-text-grey is-size-7">Already have an account? <Link to="/login">Login</Link></p>
    </form>
  );
}

export default function RegisterPage() {
  // AuthLayout provides the centered column wrapper
  return (
    <Card title="Register">
      <RegisterForm />
    </Card>
  );
}
