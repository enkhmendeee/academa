import axios from "axios";

export const login = async (email: string, password: string) => {
  const res = await axios.post("http://localhost:3000/api/auth/login", { email, password });
  
  return {
    token: res.data.token,
    user: res.data.user,
  };
};

export const register = async (username: string, email: string, password: string, confirmPassword: string) => {
  const res = await axios.post("http://localhost:3000/api/auth/register", { username, email, password, confirmPassword });
  
  return {
    token: res.data.token,
    user: res.data.user,
  };
};

export const updateProfile = async (data: any, token: string) => {
  const res = await axios.patch("http://localhost:3000/api/auth/profile", data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

