import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Login.css";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user=await login(email, password);

      // ✅ REDIRECT AFTER LOGIN
      if(user.role==='admin'){
        navigate("/admin/home");
      }
      else {
        navigate("/dashboard");

      }
      
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

          

  return (
    <div className="login-container">
      <h1>ResolveX</h1>

        <form className="login-card" onSubmit={handleSubmit}>
          <h2>Welcome Back</h2>
          <p>Please login to continue</p>

          {error && <div className="error">{error}</div>}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="auth-links-container">
        
           <button
  type="button"
  className="forgot-password-btn"
  onClick={() => navigate("/forgot-password")}
>
  Forgot Password?
</button>

             <div className="auth-link">
              <span>New here?</span>{" "}
              <a href="/register">Create an account</a>
            </div>
          </div>
        </form>
      

      
    </div>
  );
}

export default Login;
