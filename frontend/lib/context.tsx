"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
  login: (email: string, password: string) => void;
  signup: (name: string, email: string, password: string) => void;
  logout: () => void;
  savedResumes: any[];
  setSavedResumes: (resumes: any[]) => void;
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
  }, []);

  const isLoggedIn = !!user;

  const login = (email: string, _password: string) => {
    const u: UserProfile = {
      id: "user-" + Date.now(),
      name: email.split("@")[0],
      email,
      plan: "Free",
    };
    setUser(u);
    localStorage.setItem("ats_user", JSON.stringify(u));
  };

  const signup = (name: string, email: string, _password: string) => {
    const u: UserProfile = {
      id: "user-" + Date.now(),
      name,
      email,
      plan: "Free",
    };
    setUser(u);
    localStorage.setItem("ats_user", JSON.stringify(u));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("ats_user");
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
        logout,
        savedResumes,
        setSavedResumes,
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
