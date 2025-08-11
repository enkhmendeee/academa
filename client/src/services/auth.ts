import axios from "axios";

// Create axios instance with interceptors
const api = axios.create({
  baseURL: window.location.hostname === 'localhost' 
    ? "http://localhost:3000/api"
    : "https://academa-gl5b.onrender.com/api",
});

// Log the API base URL for debugging
console.log('API Base URL:', api.defaults.baseURL);
console.log('Current hostname:', window.location.hostname);

// Request interceptor to add token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error instanceof Error ? error : new Error(error.message || 'Unknown error'));
  }
);

export const login = async (email: string, password: string) => {
  const res = await api.post("/auth/login", { email, password });
  
  return {
    token: res.data.token,
    user: res.data.user,
  };
};

export const register = async (username: string, email: string, password: string, confirmPassword: string) => {
  const res = await api.post("/auth/register", { username, email, password, confirmPassword });
  
  return {
    token: res.data.token,
    user: res.data.user,
  };
};

export const updateProfile = async (data: any) => {
  const res = await api.patch("/auth/profile", data);
  return res.data;
};

// Export the api instance for other services to use
export { api };

