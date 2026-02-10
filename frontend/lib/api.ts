import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Auth APIs ───────────────────────────────────────────
export const signupUser = async (payload: {
  name: string;
  email: string;
  password: string;
}) => {
  const response = await api.post("/auth/signup", payload);
  return response.data;
};

export const loginUser = async (payload: {
  email: string;
  password: string;
}) => {
  const response = await api.post("/auth/login", payload);
  return response.data;
};

export const googleAuthUser = async (payload: {
  name: string;
  email: string;
  firebaseUid: string;
}) => {
  const response = await api.post("/auth/google", payload);
  return response.data;
};

// ─── Resume APIs ─────────────────────────────────────────
export const createResume = async (payload: {
  user_id: string | number;
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

/**
 * Analyze a resume file (PDF, DOCX, TXT) with the new ATS Engine
 */
export const analyzeResumeFile = async (file: File, jobRole: string, userId?: string | number) => {
  const formData = new FormData();
  formData.append("resume", file);
  formData.append("job_role", jobRole);
  if (userId) formData.append("user_id", String(userId));

  const response = await axios.post(`${API_URL}/resume/analyze`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Get all supported job roles from the ATS Engine
 */
export const getSupportedRoles = async () => {
  const response = await api.get("/resume/supported-roles");
  return response.data;
};

export const getResume = async (id: string) => {
  const response = await api.get(`/resume/${id}`);
  return response.data;
};

export const getUserResumes = async (userId: string | number) => {
  const response = await api.get(`/resume/user/${userId}`);
  return response.data;
};

// ─── Job Match API ───────────────────────────────────────
export const getJobMatch = async (payload: {
  job_role: string;
  content?: Record<string, any>;
}) => {
  const response = await api.post("/resume/job-match", payload);
  return response.data;
};

/**
 * Get user-specific job match data from DB with real apply links
 */
export const getJobMatchData = async (userId: string | number, role?: string, fallbackSkills?: string[]) => {
  const params = new URLSearchParams();
  if (role) params.set("role", role);
  if (fallbackSkills && fallbackSkills.length > 0) params.set("skills", fallbackSkills.join(","));
  const qs = params.toString() ? `?${params.toString()}` : "";
  const response = await api.get(`/resume/job-match-data/${userId}${qs}`);
  return response.data;
};

// ─── PDF Generation API ──────────────────────────────────
export const generatePDF = async (payload: {
  resumeData: Record<string, any>;
  template?: string;
}) => {
  const response = await api.post("/resume/generate-pdf", payload);
  return response.data;
};

// ─── ATS Suggestions API ─────────────────────────────────
export const generateATSSuggestions = async (payload: {
  resumeData: Record<string, any>;
  jobRole: string;
}) => {
  const response = await api.post("/resume/ats-suggestions", payload);
  return response.data;
};

// ─── User Analyses API ───────────────────────────────────
export const getUserAnalyses = async (userId: string | number) => {
  const response = await api.get(`/resume/analyses/user/${userId}`);
  return response.data;
};

// ─── Delete Resume API ───────────────────────────────────
export const deleteResume = async (id: string | number) => {
  const response = await api.delete(`/resume/${id}`);
  return response.data;
};

export default api;
