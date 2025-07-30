import axios from "axios";

export const getHomeworks = async (token: string) => {
  const res = await axios.get("http://localhost:3000/api/homeworks", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createHomework = async (data: any, token: string) => {
  const res = await axios.post(
    "http://localhost:3000/api/homeworks",
    data,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const deleteHomework = async (id: number, token: string) => {
  await axios.delete(`http://localhost:3000/api/homeworks/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};