import axios from "axios";

export const getCourses = async (token: string) => {
  const res = await axios.get("http://localhost:3000/api/courses", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createCourse = async (name: string, token: string, semester?: string) => {
  const res = await axios.post(
    "http://localhost:3000/api/courses",
    { name, semester },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};

export const deleteCourse = async (id: number, token: string) => {
  await axios.delete(`http://localhost:3000/api/courses/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateCourse = async (id: number, data: any, token: string) => {
  const res = await axios.patch(
    `http://localhost:3000/api/courses/${id}`,
    data,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
};