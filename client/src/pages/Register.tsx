import AuthForm from "../components/AuthForm";
import { register as registerService } from "../services/auth";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async ({
    name,
    email,
    password,
  }: {
    name?: string;
    email: string;
    password: string;
  }) => {
    try {
      // Map form's "name" to backend's "username"
      const { token, user } = await registerService(name || "", email, password);

      login(token, user);
      navigate("/dashboard");
    } catch (err) {
      alert("Registration failed");
    }
  };

  return <AuthForm type="register" onSubmit={handleRegister} />;
}
