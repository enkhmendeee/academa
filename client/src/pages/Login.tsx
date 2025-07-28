import AuthForm from "../components/AuthForm";
import { login } from "../services/auth";

export default function Login() {
  const handleLogin = async ({ email, password }: any) => {
    try {
      await login(email, password);
      // redirect to dashboard or home
      window.location.href = "/";
    } catch (err) {
      alert("Login failed");
    }
  };

  return <AuthForm type="login" onSubmit={handleLogin} />;
}
