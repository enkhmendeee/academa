import AuthForm from "../components/AuthForm";
import { register } from "../services/auth";

export default function Register() {
  const handleRegister = async ({ email, password, name }: any) => {
    try {
      await register(email, password, name);
      window.location.href = "/";
    } catch (err) {
      alert("Register failed");
    }
  };

  return <AuthForm type="register" onSubmit={handleRegister} />;
}
