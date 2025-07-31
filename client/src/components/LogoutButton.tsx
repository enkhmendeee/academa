import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { LogoutOutlined } from "@ant-design/icons";

export default function LogoutButton() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Clears token & user from context and localStorage
    navigate("/login"); // Redirect to login page
  };

  return (
    <Button
      onClick={handleLogout}
      type="primary"
      icon={<LogoutOutlined />}
      style={{
        background: "#1976d2",
        borderColor: "#1976d2",
        borderRadius: 8,
        fontWeight: 500,
      }}
    >
      Logout
    </Button>
  );
}
