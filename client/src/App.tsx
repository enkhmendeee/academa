import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Home from "./pages/Home";
import Courses from "./pages/Courses";
import Homeworks from "./pages/Homeworks";
import Exams from "./pages/Exams";
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
        <Route 
          path="/exams" 
          element={
            <PrivateRoute>
              <Exams />
            </PrivateRoute>
          } 
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;


