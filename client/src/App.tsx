import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import Homeworks from "./pages/Homeworks";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import 'antd/dist/reset.css';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/courses" 
          element={
            <PrivateRoute>
              <Courses />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/homeworks" 
          element={
            <PrivateRoute>
              <Homeworks />
            </PrivateRoute>
          } 
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;


