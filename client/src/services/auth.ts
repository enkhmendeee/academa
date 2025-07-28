import axios from "axios";

export const login = async (email: string, password: string) => {
  const res = await axios.post("http://localhost:3000/api/login", { email, password });
  
  return {
    token: res.data.token,
    user: res.data.user,
  };
};

export const register = async (username: string, email: string, password: string) => {
  const res = await axios.post("http://localhost:3000/api/register", { username, email, password });
  
  return {
    token: res.data.token,
    user: res.data.user,
  };
};

