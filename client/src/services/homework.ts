import { api } from "./auth";

export const getHomeworks = async () => {
  const res = await api.get("/homeworks");
  return res.data;
};

export const createHomework = async (data: any) => {
  const res = await api.post("/homeworks", data);
  return res.data;
};

export const deleteHomework = async (id: number) => {
  await api.delete(`/homeworks/${id}`);
};

export const updateHomework = async (id: number, data: any) => {
  const res = await api.patch(`/homeworks/${id}`, data);
  return res.data;
};