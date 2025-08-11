import axios from 'axios';

const API_URL = window.location.hostname === 'localhost' 
  ? "http://localhost:3000/api"
  : "https://academa-gl5b.onrender.com/api";

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('token');

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getExams = async () => {
  try {
    const response = await api.get('/exams');
    return response.data;
  } catch (error) {
    console.error('Error fetching exams:', error);
    throw error;
  }
};

export const createExam = async (examData: any) => {
  try {
    const response = await api.post('/exams', examData);
    return response.data;
  } catch (error) {
    console.error('Error creating exam:', error);
    throw error;
  }
};

export const updateExam = async (examId: number, examData: any) => {
  try {
    const response = await api.patch(`/exams/${examId}`, examData);
    return response.data;
  } catch (error) {
    console.error('Error updating exam:', error);
    throw error;
  }
};

export const deleteExam = async (examId: number) => {
  try {
    const response = await api.delete(`/exams/${examId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting exam:', error);
    throw error;
  }
}; 