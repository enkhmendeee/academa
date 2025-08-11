import { api } from './auth';

export const getUserSemesters = async () => {
  const res = await api.get('/semesters');
  return res.data;
};

export const addUserSemester = async (name: string) => {
  const res = await api.post('/semesters', { name });
  return res.data;
};

export const updateUserSemester = async (oldName: string, newName: string) => {
  const res = await api.patch('/semesters', { oldName, newName });
  return res.data;
};

export const deleteUserSemester = async (name: string) => {
  await api.delete(`/semesters/${encodeURIComponent(name)}`);
};
