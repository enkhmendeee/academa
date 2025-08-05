import { api } from "./auth";

export const getCourses = async () => {
  const res = await api.get("/courses");
  return res.data;
};

export const createCourse = async (name: string, semester?: string) => {
  const res = await api.post("/courses", { name, semester });
  return res.data;
};

export const deleteCourse = async (id: number) => {
  await api.delete(`/courses/${id}`);
};

export const updateCourse = async (id: number, data: any) => {
  const res = await api.patch(`/courses/${id}`, data);
  return res.data;
};