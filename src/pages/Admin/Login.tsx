import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig";
import "./css/login.css";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setError("");
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/admin");
    } catch (Err) {
      setError("THE ROBOTS ARE TAKING OVER!!!!!!! JK email or password was wrong please try again or contact Jacek");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">Tata Login</div>
        {error && <div className="login-error">{error}</div>}
        <input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
};

export default Login;
