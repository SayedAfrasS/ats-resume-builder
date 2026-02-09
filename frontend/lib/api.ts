import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Resume APIs
export const createResume = async (payload: {
  user_id: string;
  job_role: string;
  raw_input: Record<string, any>;
}) => {
  const response = await api.post("/resume/create", payload);
  return response.data;
};

export const analyzeResume = async (payload: {
  job_role: string;
  content: Record<string, any>;
}) => {
  const response = await api.post("/resume/analyze", payload);
  return response.data;
};

export const getResume = async (id: string) => {
  const response = await api.get(`/resume/${id}`);
  return response.data;
};

export default api;
