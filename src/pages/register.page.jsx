import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth.context";

function RegisterForm() {
  let navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState(null);
  const { register } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [classroom, setClassroom] = useState("");
  const [classrooms, setClassrooms] = useState([]);

  useEffect(() => {
    fetch("/api/classroom/list")
      .then((res) => res.json())
      .then(setClassrooms)
      .catch((err) => setErrorMsg(err.message));
  }, []);

  // equivalent to document.getElementby..().addEventlistener('onClick')
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(username, password, classroom);
      // upon successful redirect to /Ingredient (This is be only instance of multipage redirect?)
      navigate("/Ingredient");
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // onClick event pass to e params , then we use reactHook to set state
  return (
    <form onSubmit={handleSubmit}>
      <input value={username}    onChange={e => setUsername(e.target.value)} type="text" />
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" />
      <select value={classroom} onChange={e => setClassroom(e.target.value)}>
        <option value="">Select classroom</option>
        {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <button type="submit">Register</button>
      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}
    </form>
  );
}


export default function RegisterPage() {
  return (
    <div className="app">
      <header><h1>Register</h1></header>
      <RegisterForm />
    </div>
  );
}
