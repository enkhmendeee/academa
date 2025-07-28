import AuthForm from "../components/AuthForm";
import { login as loginService } from "../services/auth";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async ({ email, password }: { email: string; password: string }) => {
    try {
      const { token, user } = await loginService(email, password);
      login(token, user); // Save to context
      navigate("/dashboard");
    } catch (err) {
      alert("Login failed");
    }
  };

  return <AuthForm type="login" onSubmit={handleLogin} />;
}

