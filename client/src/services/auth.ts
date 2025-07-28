const API_URL = "http://localhost:3000/api/auth"; // adjust if needed

export const login = async (email: string, password: string) => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error("Login failed");
  const data = await res.json();
  localStorage.setItem("token", data.token);
};

export const register = async (email: string, password: string, name: string) => {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  if (!res.ok) throw new Error("Register failed");
  const data = await res.json();
  localStorage.setItem("token", data.token);
};
