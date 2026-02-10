"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { loginUser, signupUser, googleAuthUser, getUserResumes, getUserAnalyses } from "@/lib/api";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  plan: string;
}

export interface ResumeData {
  // Contact
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  // Experience
  experience: {
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }[];
  // Education
  education: {
    degree: string;
    school: string;
    location: string;
    startDate: string;
    endDate: string;
    gpa: string;
  }[];
  // Skills
  skills: string[];
  // Projects
  projects: {
    name: string;
    description: string;
    technologies: string;
    bullets: string[];
  }[];
  // Other
  jobRole: string;
  internships: string;
  hobbies: string;
  extraCurricular: string;
  summary: string;
}

export interface ATSResult {
  totalScore: number;
  breakdown: {
    keyword: number;
    formatting: number;
    readability: number;
  };
  issues: string[];
}

export interface AppState {
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  resumeData: ResumeData;
  setResumeData: (data: ResumeData) => void;
  updateResumeField: (field: string, value: any) => void;
  atsResult: ATSResult | null;
  setAtsResult: (result: ATSResult | null) => void;
  aiContent: any;
  setAiContent: (content: any) => void;
  improvements: any;
  setImprovements: (imp: any) => void;
  companyMatches: any[];
  setCompanyMatches: (matches: any[]) => void;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  googleLogin: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  savedResumes: any[];
  setSavedResumes: (resumes: any[]) => void;
  loadUserResumes: () => Promise<void>;
  userAnalyses: any[];
  setUserAnalyses: (analyses: any[]) => void;
  loadUserAnalyses: () => Promise<void>;
}

const defaultResumeData: ResumeData = {
  name: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  github: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  jobRole: "",
  internships: "",
  hobbies: "",
  extraCurricular: "",
  summary: "",
};

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [atsResult, setAtsResult] = useState<ATSResult | null>(null);
  const [aiContent, setAiContent] = useState<any>(null);
  const [improvements, setImprovements] = useState<any>(null);
  const [companyMatches, setCompanyMatches] = useState<any[]>([]);
  const [savedResumes, setSavedResumes] = useState<any[]>([]);
  const [userAnalyses, setUserAnalyses] = useState<any[]>([]);

  // Check localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("ats_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch { }
    }
    const storedResumes = localStorage.getItem("ats_resumes");
    if (storedResumes) {
      try {
        setSavedResumes(JSON.parse(storedResumes));
      } catch { }
    }
    const storedAnalyses = localStorage.getItem("ats_analyses");
    if (storedAnalyses) {
      try {
        setUserAnalyses(JSON.parse(storedAnalyses));
      } catch { }
    }
  }, []);

  // Load user resumes from DB when user logs in
  useEffect(() => {
    if (user?.id) {
      loadUserResumes();
      loadUserAnalyses();
    }
  }, [user?.id]);

  const isLoggedIn = !!user;

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await loginUser({ email, password });
      const u: UserProfile = {
        id: String(response.user.id),
        name: response.user.name,
        email: response.user.email,
        plan: response.user.plan || "Free",
      };
      setUser(u);
      localStorage.setItem("ats_user", JSON.stringify(u));
      return { success: true };
    } catch (error: any) {
      const msg = error?.response?.data?.error || "Login failed. Check if backend is running.";
      console.error("Login failed:", msg);
      return { success: false, error: msg };
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await signupUser({ name, email, password });
      const u: UserProfile = {
        id: String(response.user.id),
        name: response.user.name,
        email: response.user.email,
        plan: response.user.plan || "Free",
      };
      setUser(u);
      localStorage.setItem("ats_user", JSON.stringify(u));
      return { success: true };
    } catch (error: any) {
      const msg = error?.response?.data?.error || "Signup failed. Check if backend is running.";
      console.error("Signup failed:", msg);
      return { success: false, error: msg };
    }
  };

  const googleLogin = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      // Sync with backend DB
      const response = await googleAuthUser({
        name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "User",
        email: firebaseUser.email || "",
        firebaseUid: firebaseUser.uid,
      });
      const u: UserProfile = {
        id: String(response.user.id),
        name: response.user.name,
        email: response.user.email,
        plan: response.user.plan || "Free",
      };
      setUser(u);
      localStorage.setItem("ats_user", JSON.stringify(u));
      return { success: true };
    } catch (error: any) {
      console.error("Google login failed:", error);
      const msg = error?.code === "auth/popup-closed-by-user"
        ? "Sign-in popup was closed"
        : error?.code === "auth/cancelled-popup-request"
          ? "Sign-in was cancelled"
          : "Google sign-in failed. Please try again.";
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    setUser(null);
    setSavedResumes([]);
    setUserAnalyses([]);
    localStorage.removeItem("ats_user");
    localStorage.removeItem("ats_resumes");
    localStorage.removeItem("ats_analyses");
  };

  const loadUserResumes = async () => {
    if (!user?.id) return;
    try {
      const response = await getUserResumes(user.id);
      const resumes = response.resumes || [];
      setSavedResumes(resumes);
      localStorage.setItem("ats_resumes", JSON.stringify(resumes));
    } catch (error) {
      console.error("Failed to load user resumes:", error);
    }
  };

  const loadUserAnalyses = async () => {
    if (!user?.id) return;
    try {
      const response = await getUserAnalyses(user.id);
      const analyses = response.analyses || [];
      setUserAnalyses(analyses);
      localStorage.setItem("ats_analyses", JSON.stringify(analyses));
    } catch (error) {
      console.error("Failed to load user analyses:", error);
    }
  };

  const updateResumeField = (field: string, value: any) => {
    setResumeData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        resumeData,
        setResumeData,
        updateResumeField,
        atsResult,
        setAtsResult,
        aiContent,
        setAiContent,
        improvements,
        setImprovements,
        companyMatches,
        setCompanyMatches,
        isLoggedIn,
        login,
        signup,
        googleLogin,
        logout,
        savedResumes,
        setSavedResumes,
        loadUserResumes,
        userAnalyses,
        setUserAnalyses,
        loadUserAnalyses,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
