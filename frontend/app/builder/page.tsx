"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, CheckCircle, Plus, Trash2, ArrowRight, ArrowLeft,
  Sparkles, GripVertical, RefreshCw, Save, Zap, Download
} from "lucide-react";
import { useApp } from "@/lib/context";
import { createResume, generatePDF, generateATSSuggestions } from "@/lib/api";
import toast from "react-hot-toast";
import { useSearchParams } from "next/navigation";

const STEPS = [
  { id: 1, label: "CONTACT" },
  { id: 2, label: "EXPERIENCE" },
  { id: 3, label: "PROJECTS" },
  { id: 4, label: "EDUCATION" },
  { id: 5, label: "AI CONTENT" },
  { id: 6, label: "SKILLS" },
  { id: 7, label: "FINALIZE" },
];

export default function BuilderPage() {
  const { resumeData, setResumeData, updateResumeField, setAtsResult, setAiContent, setCompanyMatches, setImprovements, user } = useApp();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiGenerated, setAiGenerated] = useState<any>(null);
  const [generatedBullets, setGeneratedBullets] = useState<string[]>([]);
  const [acceptedBullets, setAcceptedBullets] = useState<Set<number>>(new Set());
  const [selectedTemplate, setSelectedTemplate] = useState<string>("the-zurich");
  const [atsSuggestions, setAtsSuggestions] = useState<any>(null);
  const [atsLoading, setAtsLoading] = useState(false);

  const templateNames: Record<string, string> = {
    "start-from-scratch": "Start from Scratch",
    "the-zurich": "The Zurich",
    "corporate-edge": "Corporate Edge",
    "berlin-mono": "Berlin Mono",
    "the-boardroom": "The Boardroom",
    "scholar-v1": "Scholar V1",
    "palo-alto": "Palo Alto",
    "the-traditionalist": "The Traditionalist",
    "oslo-clean": "Oslo Clean",
    "tokyo-pro": "Tokyo Pro",
    "austin-creative": "Austin Creative",
  };

  const getTemplateStyle = (id: string) => {
    switch (id) {
      case "tokyo-pro":
        return { accent: "text-indigo-700", border: "border-indigo-200" };
      case "austin-creative":
        return { accent: "text-rose-600", border: "border-rose-200" };
      case "oslo-clean":
        return { accent: "text-slate-700", border: "border-slate-200" };
      case "the-traditionalist":
        return { accent: "text-slate-900", border: "border-slate-300" };
      case "corporate-edge":
        return { accent: "text-slate-800", border: "border-slate-300" };
      case "berlin-mono":
        return { accent: "text-emerald-700", border: "border-emerald-200" };
      case "the-boardroom":
        return { accent: "text-amber-700", border: "border-amber-200" };
      case "scholar-v1":
        return { accent: "text-green-700", border: "border-green-200" };
      case "palo-alto":
        return { accent: "text-purple-700", border: "border-purple-200" };
      default:
        return { accent: "text-blue-700", border: "border-slate-200" };
    }
  };

  useEffect(() => {
    const templateParam = searchParams.get("template");
    if (templateParam) {
      setSelectedTemplate(templateParam);
      if (typeof window !== "undefined") {
        localStorage.setItem("selected_template", templateParam);
      }
      return;
    }
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("selected_template");
      if (stored) setSelectedTemplate(stored);
    }
  }, [searchParams]);

  // Experience helpers
  const addExperience = () => {
    updateResumeField("experience", [
      ...resumeData.experience,
      { title: "", company: "", location: "", startDate: "", endDate: "", bullets: [""] },
    ]);
  };

  const updateExperience = (index: number, field: string, value: any) => {
    const updated = [...resumeData.experience];
    (updated[index] as any)[field] = value;
    updateResumeField("experience", updated);
  };

  const removeExperience = (index: number) => {
    updateResumeField("experience", resumeData.experience.filter((_, i) => i !== index));
  };

  const addBullet = (expIndex: number) => {
    const updated = [...resumeData.experience];
    updated[expIndex].bullets.push("");
    updateResumeField("experience", updated);
  };

  const updateBullet = (expIndex: number, bulletIndex: number, value: string) => {
    const updated = [...resumeData.experience];
    updated[expIndex].bullets[bulletIndex] = value;
    updateResumeField("experience", updated);
  };

  // Education helpers
  const addEducation = () => {
    updateResumeField("education", [
      ...resumeData.education,
      { degree: "", school: "", location: "", startDate: "", endDate: "", gpa: "" },
    ]);
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...resumeData.education];
    (updated[index] as any)[field] = value;
    updateResumeField("education", updated);
  };

  const removeEducation = (index: number) => {
    updateResumeField("education", resumeData.education.filter((_, i) => i !== index));
  };

  // Project helpers
  const addProject = () => {
    updateResumeField("projects", [
      ...resumeData.projects,
      { name: "", description: "", technologies: "", bullets: [""] },
    ]);
  };
  const updateProject = (index: number, field: string, value: any) => {
    const updated = [...resumeData.projects];
    (updated[index] as any)[field] = value;
    updateResumeField("projects", updated);
  };
  const removeProject = (index: number) => {
    updateResumeField("projects", resumeData.projects.filter((_, i) => i !== index));
  };
  const addProjectBullet = (projIndex: number) => {
    const updated = [...resumeData.projects];
    updated[projIndex].bullets.push("");
    updateResumeField("projects", updated);
  };
  const updateProjectBullet = (projIndex: number, bulletIndex: number, value: string) => {
    const updated = [...resumeData.projects];
    updated[projIndex].bullets[bulletIndex] = value;
    updateResumeField("projects", updated);
  };

  // Skills helpers
  const [skillInput, setSkillInput] = useState("");
  const addSkill = () => {
    if (skillInput.trim()) {
      updateResumeField("skills", [...resumeData.skills, skillInput.trim()]);
      setSkillInput("");
    }
  };
  const removeSkill = (index: number) => {
    updateResumeField("skills", resumeData.skills.filter((_, i) => i !== index));
  };

  // AI Generate (original — still used for full AI generation)
  const handleGenerate = async () => {
    if (!resumeData.jobRole) {
      toast.error("Please enter a job role first");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        user_id: user?.id || "guest-" + Date.now(),
        job_role: resumeData.jobRole,
        raw_input: {
          name: resumeData.name,
          email: resumeData.email,
          phone: resumeData.phone,
          location: resumeData.location,
          linkedin: resumeData.linkedin,
          github: resumeData.github,
          experience: resumeData.experience,
          education: resumeData.education,
          skills: resumeData.skills,
          projects: resumeData.projects,
          internships: resumeData.internships,
          hobbies: resumeData.hobbies,
          extraCurricular: resumeData.extraCurricular,
        },
      };

      const response = await createResume(payload);
      setAiGenerated(response);
      setAtsResult(response.ats);
      setAiContent(response.data);
      setImprovements(response.improvements);
      setCompanyMatches(response.companyMatches || []);

      // Extract generated bullets for user to accept/reject
      const content = typeof response.data?.ai_generated === "string"
        ? JSON.parse(response.data.ai_generated)
        : response.data?.ai_generated || response.data;

      const bltList: string[] = [];
      if (content?.experience) {
        content.experience.forEach((exp: any) => {
          if (exp.bullets) bltList.push(...exp.bullets);
          if (exp.description) bltList.push(exp.description);
        });
      }
      if (content?.projects) {
        content.projects.forEach((p: any) => {
          if (p.bullets) bltList.push(...p.bullets);
          if (p.description) bltList.push(p.description);
        });
      }
      setGeneratedBullets(bltList);
      toast.success("AI content generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate content. Check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  // ATS Suggestions — analyze existing inputs and return section-mapped suggestions
  const handleATSSuggestions = async () => {
    if (!resumeData.jobRole) {
      toast.error("Please enter a job role in the Contact step first");
      return;
    }
    const hasContent = resumeData.experience.some(e => e.title || e.company) ||
      resumeData.projects.some(p => p.name) ||
      resumeData.summary || resumeData.skills.length > 0;
    if (!hasContent) {
      toast.error("Please fill in some resume sections first (experience, projects, skills, etc.)");
      return;
    }
    setAtsLoading(true);
    try {
      const response = await generateATSSuggestions({
        resumeData: {
          name: resumeData.name,
          summary: resumeData.summary,
          experience: resumeData.experience,
          education: resumeData.education,
          skills: resumeData.skills,
          projects: resumeData.projects,
        },
        jobRole: resumeData.jobRole,
      });
      setAtsSuggestions(response.suggestions);
      toast.success("ATS suggestions generated! Click any suggestion to apply it.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate suggestions. Check backend connection.");
    } finally {
      setAtsLoading(false);
    }
  };

  // Apply an ATS suggestion to the corresponding resume field
  const applySummary = (text: string) => {
    updateResumeField("summary", text);
    toast.success("Summary updated!");
  };
  const applyExpBullet = (expIndex: number, bulletIndex: number, text: string) => {
    const updated = [...resumeData.experience];
    if (updated[expIndex]) {
      while (updated[expIndex].bullets.length <= bulletIndex) updated[expIndex].bullets.push("");
      updated[expIndex].bullets[bulletIndex] = text;
      updateResumeField("experience", updated);
      toast.success("Experience bullet updated!");
    }
  };
  const applyExpTitle = (expIndex: number, text: string) => {
    const updated = [...resumeData.experience];
    if (updated[expIndex]) {
      updated[expIndex].title = text;
      updateResumeField("experience", updated);
      toast.success("Job title updated!");
    }
  };
  const applyProjectBullet = (projIndex: number, bulletIndex: number, text: string) => {
    const updated = [...resumeData.projects];
    if (updated[projIndex]) {
      while (updated[projIndex].bullets.length <= bulletIndex) updated[projIndex].bullets.push("");
      updated[projIndex].bullets[bulletIndex] = text;
      updateResumeField("projects", updated);
      toast.success("Project bullet updated!");
    }
  };
  const applyProjectDesc = (projIndex: number, text: string) => {
    const updated = [...resumeData.projects];
    if (updated[projIndex]) {
      updated[projIndex].description = text;
      updateResumeField("projects", updated);
      toast.success("Project description updated!");
    }
  };
  const applySkills = (skills: string[]) => {
    const merged = [...new Set([...resumeData.skills, ...skills])];
    updateResumeField("skills", merged);
    toast.success(`${skills.length} skills added!`);
  };

  const toggleBullet = (index: number) => {
    const newSet = new Set(acceptedBullets);
    if (newSet.has(index)) newSet.delete(index);
    else newSet.add(index);
    setAcceptedBullets(newSet);
  };

  // PDF Download handler
  const handleDownloadPDF = async () => {
    try {
      toast.loading("Generating PDF...", { id: "pdf" });
      const response = await generatePDF({ resumeData, template: selectedTemplate || "the-zurich" });
      const htmlContent = response.html;

      // Open a new window and print to PDF
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        setTimeout(() => {
          printWindow.print();
          toast.success("PDF ready! Use Print > Save as PDF", { id: "pdf" });
        }, 500);
      } else {
        // Fallback: download as HTML
        const blob = new Blob([htmlContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${resumeData.name || "resume"}_${resumeData.jobRole || "role"}.html`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Resume downloaded as HTML", { id: "pdf" });
      }
    } catch (error) {
      console.error(error);
      toast.error("PDF generation failed. Check backend connection.", { id: "pdf" });
    }
  };

  // Download as plain text / LaTeX-like format
  const handleDownloadTex = () => {
    const lines: string[] = [];
    lines.push(`% Resume - ${resumeData.name || "Your Name"}`);
    lines.push(`% Generated by SpellFolio AI`);
    lines.push(`\\documentclass[11pt,a4paper]{article}`);
    lines.push(`\\usepackage[margin=1in]{geometry}`);
    lines.push(`\\begin{document}`);
    lines.push(``);
    lines.push(`\\begin{center}`);
    lines.push(`{\\LARGE \\textbf{${resumeData.name || "Your Name"}}}`);
    lines.push(`\\\\[4pt]`);
    const contactParts = [resumeData.location, resumeData.email, resumeData.phone, resumeData.linkedin].filter(Boolean);
    lines.push(`${contactParts.join(" $\\cdot$ ")}`);
    lines.push(`\\end{center}`);
    lines.push(``);

    if (resumeData.summary) {
      lines.push(`\\section*{Professional Summary}`);
      lines.push(resumeData.summary);
      lines.push(``);
    }

    if (resumeData.experience.length > 0) {
      lines.push(`\\section*{Experience}`);
      resumeData.experience.forEach((exp) => {
        lines.push(`\\textbf{${exp.title}} \\hfill ${exp.startDate} -- ${exp.endDate}`);
        lines.push(`\\\\${exp.company}${exp.location ? ", " + exp.location : ""}`);
        lines.push(`\\begin{itemize}`);
        exp.bullets.filter((b) => b.trim()).forEach((b) => {
          lines.push(`  \\item ${b}`);
        });
        lines.push(`\\end{itemize}`);
        lines.push(``);
      });
    }

    if (resumeData.education.length > 0) {
      lines.push(`\\section*{Education}`);
      resumeData.education.forEach((edu) => {
        lines.push(`\\textbf{${edu.degree}} \\hfill ${edu.startDate} -- ${edu.endDate}`);
        lines.push(`\\\\${edu.school}${edu.gpa ? " \\textit{GPA: " + edu.gpa + "}" : ""}`);
        lines.push(``);
      });
    }

    if (resumeData.skills.length > 0) {
      lines.push(`\\section*{Skills}`);
      lines.push(resumeData.skills.join(", "));
      lines.push(``);
    }

    if (resumeData.projects.length > 0) {
      lines.push(`\\section*{Projects}`);
      resumeData.projects.forEach((proj) => {
        lines.push(`\\textbf{${proj.name}}${proj.technologies ? ` \\textit{(${proj.technologies})}` : ""}`);
        if (proj.description) lines.push(proj.description);
        lines.push(`\\begin{itemize}`);
        proj.bullets.filter((b) => b.trim()).forEach((b) => {
          lines.push(`  \\item ${b}`);
        });
        lines.push(`\\end{itemize}`);
        lines.push(``);
      });
    }

    lines.push(`\\end{document}`);

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resumeData.name || "resume"}_${resumeData.jobRole || "role"}.tex`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("LaTeX file downloaded!");
  };

  const templateStyle = getTemplateStyle(selectedTemplate);
  const selectedTemplateName = templateNames[selectedTemplate] || "The Zurich";

  return (
    <main className="flex-1 overflow-hidden page-transition">
      <div className="flex h-full">
        {/* Left: Form */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Step Indicator */}
          <div className="px-8 py-4 bg-white border-b border-slate-200">
            <div className="flex items-center justify-between max-w-2xl">
              {STEPS.map((s, i) => (
                <div key={s.id} className="flex items-center">
                  <button
                    onClick={() => setStep(s.id)}
                    className="flex flex-col items-center gap-1"
                  >
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      step === s.id
                        ? "bg-blue-600 text-white ring-4 ring-blue-100"
                        : step > s.id
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-400"
                    }`}>
                      {step > s.id ? <CheckCircle className="h-4 w-4" /> : s.id}
                    </div>
                    <span className={`text-[10px] font-semibold tracking-wider ${
                      step === s.id ? "text-blue-600" : "text-slate-400"
                    }`}>{s.label}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`w-8 lg:w-16 h-0.5 mx-1 ${step > s.id ? "bg-blue-600" : "bg-slate-200"}`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-2xl">
              {/* Step 1: Contact */}
              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Contact Information</h2>
                  <p className="text-slate-500 mb-6">Start with your basic contact details.</p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input placeholder="Alex Johnson" value={resumeData.name} onChange={(e) => updateResumeField("name", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" placeholder="alex@email.com" value={resumeData.email} onChange={(e) => updateResumeField("email", e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Phone</Label>
                        <Input placeholder="+1 (555) 000-0000" value={resumeData.phone} onChange={(e) => updateResumeField("phone", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>Location</Label>
                        <Input placeholder="San Francisco, CA" value={resumeData.location} onChange={(e) => updateResumeField("location", e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>LinkedIn URL</Label>
                        <Input placeholder="linkedin.com/in/alexjohnson" value={resumeData.linkedin} onChange={(e) => updateResumeField("linkedin", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <Label>GitHub URL</Label>
                        <Input placeholder="github.com/ajohnson" value={resumeData.github} onChange={(e) => updateResumeField("github", e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Target Job Role</Label>
                      <Input placeholder="e.g. Software Engineer" value={resumeData.jobRole} onChange={(e) => updateResumeField("jobRole", e.target.value)} />
                      <p className="text-xs text-slate-500">AI will optimize your resume for this specific role.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Experience */}
              {step === 2 && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Work Experience</h2>
                  <p className="text-slate-500 mb-6">Add your professional experience, most recent first.</p>
                  <div className="space-y-6">
                    {resumeData.experience.map((exp, i) => (
                      <Card key={i}>
                        <CardContent className="p-5 space-y-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-slate-700">Experience {i + 1}</span>
                            <Button variant="ghost" size="sm" onClick={() => removeExperience(i)} className="text-red-500 hover:text-red-700 h-8">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs">Job Title</Label>
                              <Input placeholder="Senior Software Engineer" value={exp.title} onChange={(e) => updateExperience(i, "title", e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">Company</Label>
                              <Input placeholder="Google" value={exp.company} onChange={(e) => updateExperience(i, "company", e.target.value)} />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs">Location</Label>
                              <Input placeholder="Mountain View, CA" value={exp.location} onChange={(e) => updateExperience(i, "location", e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">Start Date</Label>
                              <Input placeholder="2020" value={exp.startDate} onChange={(e) => updateExperience(i, "startDate", e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">End Date</Label>
                              <Input placeholder="Present" value={exp.endDate} onChange={(e) => updateExperience(i, "endDate", e.target.value)} />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Bullet Points</Label>
                              <Button variant="ghost" size="sm" onClick={() => addBullet(i)} className="h-7 text-xs text-blue-600">
                                <Plus className="h-3 w-3 mr-1" /> Add Point
                              </Button>
                            </div>
                            {exp.bullets.map((bullet, bi) => (
                              <div key={bi} className="flex items-start gap-2">
                                <GripVertical className="h-4 w-4 text-slate-300 mt-3 cursor-grab" />
                                <Textarea
                                  className="min-h-[60px] text-sm"
                                  placeholder="Engineered a scalable microservices architecture..."
                                  value={bullet}
                                  onChange={(e) => updateBullet(i, bi, e.target.value)}
                                />
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Button variant="outline" onClick={addExperience} className="w-full border-dashed">
                      <Plus className="h-4 w-4 mr-2" /> Add Experience
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Projects */}
              {step === 3 && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Projects</h2>
                  <p className="text-slate-500 mb-6">Add personal or professional projects that showcase your skills.</p>
                  <div className="space-y-6">
                    {resumeData.projects.map((proj, i) => (
                      <Card key={i}>
                        <CardContent className="p-5 space-y-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-slate-700">Project {i + 1}</span>
                            <Button variant="ghost" size="sm" onClick={() => removeProject(i)} className="text-red-500 hover:text-red-700 h-8">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs">Project Name</Label>
                              <Input placeholder="E-Commerce Platform" value={proj.name} onChange={(e) => updateProject(i, "name", e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">Technologies</Label>
                              <Input placeholder="React, Node.js, PostgreSQL" value={proj.technologies} onChange={(e) => updateProject(i, "technologies", e.target.value)} />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">Description</Label>
                            <Textarea className="min-h-[60px] text-sm" placeholder="A full-stack web application for..." value={proj.description} onChange={(e) => updateProject(i, "description", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="text-xs">Key Highlights</Label>
                              <Button variant="ghost" size="sm" onClick={() => addProjectBullet(i)} className="h-7 text-xs text-blue-600">
                                <Plus className="h-3 w-3 mr-1" /> Add Point
                              </Button>
                            </div>
                            {proj.bullets.map((bullet, bi) => (
                              <div key={bi} className="flex items-start gap-2">
                                <GripVertical className="h-4 w-4 text-slate-300 mt-3 cursor-grab" />
                                <Textarea
                                  className="min-h-[50px] text-sm"
                                  placeholder="Implemented real-time notifications using WebSockets..."
                                  value={bullet}
                                  onChange={(e) => updateProjectBullet(i, bi, e.target.value)}
                                />
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Button variant="outline" onClick={addProject} className="w-full border-dashed">
                      <Plus className="h-4 w-4 mr-2" /> Add Project
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Education */}
              {step === 4 && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Education</h2>
                  <p className="text-slate-500 mb-6">Add your educational background.</p>
                  <div className="space-y-6">
                    {resumeData.education.map((edu, i) => (
                      <Card key={i}>
                        <CardContent className="p-5 space-y-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-slate-700">Education {i + 1}</span>
                            <Button variant="ghost" size="sm" onClick={() => removeEducation(i)} className="text-red-500 hover:text-red-700 h-8">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs">Degree</Label>
                              <Input placeholder="B.S. Computer Science" value={edu.degree} onChange={(e) => updateEducation(i, "degree", e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">School</Label>
                              <Input placeholder="Stanford University" value={edu.school} onChange={(e) => updateEducation(i, "school", e.target.value)} />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs">Location</Label>
                              <Input placeholder="Stanford, CA" value={edu.location} onChange={(e) => updateEducation(i, "location", e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">Start</Label>
                              <Input placeholder="2016" value={edu.startDate} onChange={(e) => updateEducation(i, "startDate", e.target.value)} />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs">End</Label>
                              <Input placeholder="2020" value={edu.endDate} onChange={(e) => updateEducation(i, "endDate", e.target.value)} />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs">GPA (optional)</Label>
                            <Input placeholder="3.8/4.0" value={edu.gpa} onChange={(e) => updateEducation(i, "gpa", e.target.value)} />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Button variant="outline" onClick={addEducation} className="w-full border-dashed">
                      <Plus className="h-4 w-4 mr-2" /> Add Education
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 5: AI Content — section-mapped ATS suggestions */}
              {step === 5 && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Generate ATS-Friendly Content</h2>
                  <p className="text-slate-500 mb-6">We&apos;ll analyze your existing inputs and suggest ATS-optimized replacements for each section. Click any suggestion to apply it instantly.</p>

                  {/* Generate Suggestions */}
                  <Card className="mb-6">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Sparkles className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">Analyze &amp; Optimize</h3>
                            <p className="text-sm text-slate-500">Analyzes your &quot;{resumeData.jobRole || "Job Role"}&quot; resume &amp; generates ATS-ready content.</p>
                          </div>
                        </div>
                        <Button onClick={handleATSSuggestions} disabled={atsLoading} className="bg-blue-600 hover:bg-blue-700 px-6">
                          {atsLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                          Generate ATS Friendly Content
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* ATS Suggestions — section mapped */}
                  {atsSuggestions && (
                    <div className="space-y-6">
                      {/* Summary suggestion */}
                      {atsSuggestions.summary && (
                        <div>
                          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">PROFESSIONAL SUMMARY</h3>
                          {resumeData.summary && (
                            <Card className="mb-2 bg-slate-50">
                              <CardContent className="p-3">
                                <p className="text-xs text-slate-400 mb-1">Current:</p>
                                <p className="text-sm text-slate-600">{resumeData.summary}</p>
                              </CardContent>
                            </Card>
                          )}
                          <Card className="border-2 border-blue-200 bg-blue-50/30 cursor-pointer hover:bg-blue-50/60 transition-all" onClick={() => applySummary(atsSuggestions.summary)}>
                            <CardContent className="p-3">
                              <div className="flex items-start gap-2">
                                <Badge className="bg-blue-600 text-white text-[9px] shrink-0 mt-0.5">ATS OPTIMIZED</Badge>
                                <p className="text-sm text-slate-700 flex-1">{atsSuggestions.summary}</p>
                                <CheckCircle className="h-5 w-5 text-blue-400 shrink-0" />
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}

                      {/* Experience suggestions */}
                      {atsSuggestions.experience?.map((expSug: any, ei: number) => {
                        const orig = resumeData.experience[expSug.index ?? ei];
                        if (!orig) return null;
                        return (
                          <div key={`exp-sug-${ei}`}>
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                              EXPERIENCE: {orig.company?.toUpperCase() || `ENTRY ${ei+1}`}
                            </h3>
                            {/* Title suggestion */}
                            {expSug.title && expSug.title !== orig.title && (
                              <Card className="border-2 border-indigo-200 bg-indigo-50/30 cursor-pointer hover:bg-indigo-50/60 transition-all mb-2" onClick={() => applyExpTitle(expSug.index ?? ei, expSug.title)}>
                                <CardContent className="p-3">
                                  <div className="flex items-start gap-2">
                                    <Badge className="bg-indigo-600 text-white text-[9px] shrink-0 mt-0.5">TITLE</Badge>
                                    <div className="flex-1">
                                      <p className="text-xs text-slate-400 line-through">{orig.title}</p>
                                      <p className="text-sm text-slate-700">{expSug.title}</p>
                                    </div>
                                    <CheckCircle className="h-5 w-5 text-indigo-400 shrink-0" />
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                            {/* Bullet suggestions */}
                            {expSug.bullets?.map((bullet: string, bi: number) => (
                              <Card key={`exp-${ei}-b-${bi}`} className="border-2 border-blue-200 bg-blue-50/20 cursor-pointer hover:bg-blue-50/50 transition-all mb-2" onClick={() => applyExpBullet(expSug.index ?? ei, bi, bullet)}>
                                <CardContent className="p-3">
                                  <div className="flex items-start gap-2">
                                    <Badge className="bg-blue-600 text-white text-[9px] shrink-0 mt-0.5">BULLET {bi+1}</Badge>
                                    <div className="flex-1">
                                      {orig.bullets[bi] && <p className="text-xs text-slate-400 line-through mb-0.5">{orig.bullets[bi]}</p>}
                                      <p className="text-sm text-slate-700">{bullet}</p>
                                    </div>
                                    <CheckCircle className="h-5 w-5 text-blue-400 shrink-0" />
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        );
                      })}

                      {/* Project suggestions */}
                      {atsSuggestions.projects?.map((projSug: any, pi: number) => {
                        const orig = resumeData.projects[projSug.index ?? pi];
                        if (!orig) return null;
                        return (
                          <div key={`proj-sug-${pi}`}>
                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                              PROJECT: {orig.name?.toUpperCase() || `PROJECT ${pi+1}`}
                            </h3>
                            {projSug.description && (
                              <Card className="border-2 border-purple-200 bg-purple-50/30 cursor-pointer hover:bg-purple-50/60 transition-all mb-2" onClick={() => applyProjectDesc(projSug.index ?? pi, projSug.description)}>
                                <CardContent className="p-3">
                                  <div className="flex items-start gap-2">
                                    <Badge className="bg-purple-600 text-white text-[9px] shrink-0 mt-0.5">DESCRIPTION</Badge>
                                    <div className="flex-1">
                                      {orig.description && <p className="text-xs text-slate-400 line-through mb-0.5">{orig.description}</p>}
                                      <p className="text-sm text-slate-700">{projSug.description}</p>
                                    </div>
                                    <CheckCircle className="h-5 w-5 text-purple-400 shrink-0" />
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                            {projSug.bullets?.map((bullet: string, bi: number) => (
                              <Card key={`proj-${pi}-b-${bi}`} className="border-2 border-purple-200 bg-purple-50/20 cursor-pointer hover:bg-purple-50/50 transition-all mb-2" onClick={() => applyProjectBullet(projSug.index ?? pi, bi, bullet)}>
                                <CardContent className="p-3">
                                  <div className="flex items-start gap-2">
                                    <Badge className="bg-purple-600 text-white text-[9px] shrink-0 mt-0.5">BULLET {bi+1}</Badge>
                                    <div className="flex-1">
                                      {orig.bullets[bi] && <p className="text-xs text-slate-400 line-through mb-0.5">{orig.bullets[bi]}</p>}
                                      <p className="text-sm text-slate-700">{bullet}</p>
                                    </div>
                                    <CheckCircle className="h-5 w-5 text-purple-400 shrink-0" />
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        );
                      })}

                      {/* Skill suggestions */}
                      {atsSuggestions.skills?.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">SUGGESTED SKILLS</h3>
                          <Card className="border-2 border-emerald-200 bg-emerald-50/30 cursor-pointer hover:bg-emerald-50/60 transition-all" onClick={() => applySkills(atsSuggestions.skills)}>
                            <CardContent className="p-3">
                              <div className="flex items-start gap-2">
                                <Badge className="bg-emerald-600 text-white text-[9px] shrink-0 mt-0.5">SKILLS</Badge>
                                <div className="flex-1 flex flex-wrap gap-1.5">
                                  {atsSuggestions.skills.map((s: string, si: number) => (
                                    <span key={si} className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                                      resumeData.skills.includes(s) ? "bg-slate-100 text-slate-400 border-slate-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    }`}>{resumeData.skills.includes(s) ? "✓ " : "+ "}{s}</span>
                                  ))}
                                </div>
                                <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Divider + Full AI generation (legacy) */}
                  <div className="border-t border-slate-200 mt-8 pt-6">
                    <p className="text-xs text-slate-400 mb-3">Or generate full AI content from scratch (creates a complete resume):</p>
                    <Button variant="outline" onClick={handleGenerate} disabled={loading} size="sm">
                      {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                      Full AI Generation
                    </Button>
                  </div>

                  {/* ATS Score Preview */}
                  {aiGenerated && (
                    <Card className="mt-6 bg-green-50 border-green-200">
                      <CardContent className="p-4 flex items-center gap-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                        <div>
                          <p className="font-semibold text-green-800">ATS Score: {aiGenerated.ats?.totalScore || 0}%</p>
                          <p className="text-sm text-green-600">Content optimized for &quot;{resumeData.jobRole}&quot; role</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Step 6: Skills */}
              {step === 6 && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Skills</h2>
                  <p className="text-slate-500 mb-6">Add relevant skills for your target role.</p>
                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Type a skill and press Enter..."
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSkill(); } }}
                    />
                    <Button onClick={addSkill}>Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {resumeData.skills.map((skill, i) => (
                      <Badge key={i} variant="secondary" className="px-3 py-1.5 text-sm">
                        {skill}
                        <button onClick={() => removeSkill(i)} className="ml-2 text-slate-400 hover:text-red-500">×</button>
                      </Badge>
                    ))}
                  </div>

                  {/* Suggested skills */}
                  {aiGenerated?.improvements?.missingSkills?.length > 0 && (
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm font-semibold text-slate-700 mb-3">Suggested Skills for {resumeData.jobRole}:</p>
                        <div className="flex flex-wrap gap-2">
                          {aiGenerated.improvements.missingSkills.map((skill: string, i: number) => (
                            <button
                              key={i}
                              onClick={() => {
                                if (!resumeData.skills.includes(skill)) {
                                  updateResumeField("skills", [...resumeData.skills, skill]);
                                }
                              }}
                              className="px-3 py-1.5 rounded-full text-sm border border-dashed border-blue-300 text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              + {skill}
                            </button>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Other fields */}
                  <div className="mt-6 space-y-4">
                    <div className="space-y-2">
                      <Label>Internships</Label>
                      <Textarea placeholder="Describe your internship experience..." value={resumeData.internships} onChange={(e) => updateResumeField("internships", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Hobbies</Label>
                      <Textarea placeholder="Your hobbies and interests..." value={resumeData.hobbies} onChange={(e) => updateResumeField("hobbies", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Extra Curricular Activities</Label>
                      <Textarea placeholder="Clubs, organizations, volunteering..." value={resumeData.extraCurricular} onChange={(e) => updateResumeField("extraCurricular", e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 7: Finalize */}
              {step === 7 && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Finalize Your Resume</h2>
                  <p className="text-slate-500 mb-6">Review your resume and download it.</p>

                  {/* Summary Section */}
                  <Card className="mb-6">
                    <CardContent className="p-5 space-y-4">
                      <div className="space-y-2">
                        <Label>Professional Summary</Label>
                        <Textarea
                          className="min-h-[100px]"
                          placeholder="Results-oriented Software Engineer with 5+ years of experience..."
                          value={resumeData.summary}
                          onChange={(e) => updateResumeField("summary", e.target.value)}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* ATS Score */}
                  {aiGenerated && (
                    <Card className="mb-6">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-900">Your ATS Score</h3>
                            <p className="text-sm text-slate-500">Based on AI analysis for &quot;{resumeData.jobRole}&quot;</p>
                          </div>
                          <div className="text-3xl font-bold text-blue-600">{aiGenerated.ats?.totalScore}%</div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Download Actions */}
                  <div className="grid grid-cols-2 gap-4">
                    <Button className="h-12 bg-blue-600 hover:bg-blue-700" onClick={handleDownloadPDF}>
                      <Download className="h-4 w-4 mr-2" /> Download PDF
                    </Button>
                    <Button variant="outline" className="h-12" onClick={handleDownloadTex}>
                      <Download className="h-4 w-4 mr-2" /> Download .TEX
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bottom Nav */}
          <div className="flex items-center justify-between px-8 py-4 bg-white border-t border-slate-200">
            <Button
              variant="ghost"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Previous
            </Button>
            <Button variant="outline" onClick={() => toast.success("Draft saved!")}>
              <Save className="h-4 w-4 mr-2" /> Save Draft
            </Button>
            {step < 7 ? (
              <Button onClick={() => setStep(step + 1)}>
                Next: {STEPS[step]?.label} <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button className="bg-green-600 hover:bg-green-700" onClick={() => toast.success("Resume finalized!")}>
                <CheckCircle className="h-4 w-4 mr-2" /> Finish
              </Button>
            )}
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="hidden xl:flex w-[400px] flex-col border-l border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
            <div>
              <span className="text-sm font-semibold text-slate-700">LIVE PREVIEW</span>
              <p className="text-[10px] text-slate-400">Template: {selectedTemplateName}</p>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded hover:bg-slate-100 text-slate-500"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg></button>
              <button className="p-1.5 rounded hover:bg-slate-100 text-slate-500"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {/* ═══════ TOKYO PRO — Two-column dark sidebar ═══════ */}
            {selectedTemplate === "tokyo-pro" ? (
              <>
                <div className="bg-white shadow-sm rounded-lg overflow-hidden text-[11px] leading-relaxed min-h-[600px] flex">
                  {/* Dark sidebar */}
                  <div className="w-[38%] bg-slate-900 text-white p-5">
                    <div className="mb-5">
                      <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center text-white text-lg font-bold mb-2">
                        {(resumeData.name || "A").charAt(0).toUpperCase()}
                      </div>
                      <h2 className="text-sm font-bold">{resumeData.name || "ALEX JOHNSON"}</h2>
                      <p className="text-indigo-300 text-[10px] mt-0.5">{resumeData.jobRole || "Professional"}</p>
                    </div>
                    <div className="mb-4">
                      <h4 className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 mb-1.5">Contact</h4>
                      <p className="text-slate-300 text-[10px] leading-relaxed">
                        {resumeData.location || "City, State"}<br/>
                        {resumeData.email || "email@example.com"}<br/>
                        {resumeData.phone || "+1 (555) 000-0000"}
                        {resumeData.linkedin && <><br/>{resumeData.linkedin}</>}
                      </p>
                    </div>
                    {resumeData.skills.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 mb-1.5">Skills</h4>
                        <div className="flex flex-wrap gap-1">
                          {resumeData.skills.map((s, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-slate-800 rounded text-[9px] text-slate-300">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {resumeData.education.length > 0 && (
                      <div>
                        <h4 className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 mb-1.5">Education</h4>
                        {resumeData.education.map((edu, i) => (
                          <div key={i} className="mb-2">
                            <p className="text-slate-300 text-[10px]">{edu.degree || "Degree"}</p>
                            <p className="text-slate-400 text-[9px]">{edu.school}</p>
                            <p className="text-slate-500 text-[9px]">{edu.startDate} – {edu.endDate}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {/* Right content */}
                  <div className="flex-1 p-5">
                    {(resumeData.summary || aiGenerated) && (
                      <div className="mb-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-1.5">Profile</h3>
                        <p className="text-slate-600">{resumeData.summary || "Results-oriented professional."}</p>
                      </div>
                    )}
                    {resumeData.experience.length > 0 && (
                      <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-2">Experience</h3>
                        {resumeData.experience.map((exp, i) => (
                          <div key={i} className="relative pl-3 border-l-2 border-indigo-200 mb-3">
                            <div className="absolute -left-[5px] top-0 h-2 w-2 rounded-full bg-indigo-500" />
                            <div className="mb-0.5">
                              <span className="font-semibold text-slate-900">{exp.title || "Job Title"}</span>
                              <span className="text-slate-400 text-[9px] ml-2">{exp.startDate} – {exp.endDate}</span>
                            </div>
                            <p className="text-slate-500 text-[10px] mb-1">{exp.company}{exp.location ? ` • ${exp.location}` : ""}</p>
                            <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                              {exp.bullets.filter(b => b.trim()).map((b, bi) => <li key={bi}>{b}</li>)}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                    {resumeData.projects.length > 0 && (
                      <div className="mt-3">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-2">Projects</h3>
                        {resumeData.projects.map((proj, i) => (
                          <div key={i} className="relative pl-3 border-l-2 border-indigo-200 mb-3">
                            <div className="absolute -left-[5px] top-0 h-2 w-2 rounded-full bg-indigo-500" />
                            <span className="font-semibold text-slate-900">{proj.name}</span>
                            {proj.technologies && <span className="text-slate-400 text-[9px] ml-2">{proj.technologies}</span>}
                            {proj.description && <p className="text-slate-500 text-[10px] mb-1">{proj.description}</p>}
                            <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                              {proj.bullets.filter(b => b.trim()).map((b, bi) => <li key={bi}>{b}</li>)}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>

            /* ═══════ AUSTIN CREATIVE — Colored header banner ═══════ */
            ) : selectedTemplate === "austin-creative" ? (
              <>
                <div className="bg-white shadow-sm rounded-lg overflow-hidden text-[11px] leading-relaxed min-h-[600px]">
                  {/* Banner */}
                  <div className="bg-gradient-to-r from-rose-500 to-orange-400 px-6 py-5 text-white">
                    <h2 className="text-lg font-extrabold tracking-tight">{resumeData.name || "ALEX JOHNSON"}</h2>
                    <p className="text-rose-100 text-[10px] mt-0.5">
                      {[resumeData.location, resumeData.email, resumeData.phone, resumeData.linkedin].filter(Boolean).join(" • ") || "City • email • phone"}
                    </p>
                  </div>
                  <div className="p-5">
                    {(resumeData.summary || aiGenerated) && (
                      <div className="mb-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-1">About Me</h3>
                        <p className="text-slate-600 italic">{resumeData.summary || "Results-oriented professional."}</p>
                      </div>
                    )}
                    {resumeData.skills.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-1.5">Core Skills</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {resumeData.skills.map((s, i) => (
                            <span key={i} className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full text-[10px] font-medium border border-rose-200">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {resumeData.experience.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-1.5">Experience</h3>
                        {resumeData.experience.map((exp, i) => (
                          <div key={i} className="bg-rose-50/50 border border-rose-100 rounded-lg p-3 mb-2">
                            <div className="flex justify-between items-baseline mb-0.5">
                              <span className="font-bold text-slate-900">{exp.title || "Job Title"}</span>
                              <span className="text-rose-400 text-[9px] font-medium">{exp.startDate} – {exp.endDate}</span>
                            </div>
                            <p className="text-slate-500 text-[10px] mb-1">{exp.company}{exp.location ? ` • ${exp.location}` : ""}</p>
                            <ul className="space-y-0.5 text-slate-600">
                              {exp.bullets.filter(b => b.trim()).map((b, bi) => (
                                <li key={bi} className="flex items-start gap-1.5"><span className="text-rose-400 mt-0.5">▸</span>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                    {resumeData.education.length > 0 && (
                      <div>
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-1">Education</h3>
                        {resumeData.education.map((edu, i) => (
                          <div key={i} className="mb-1">
                            <p className="text-slate-700 font-semibold">{edu.degree || "Degree"}</p>
                            <p className="text-slate-500 text-[10px]">{edu.school} — {edu.startDate} – {edu.endDate}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {resumeData.projects.length > 0 && (
                      <div className="mb-4">
                        <h3 className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-1.5">Projects</h3>
                        {resumeData.projects.map((proj, i) => (
                          <div key={i} className="bg-rose-50/50 border border-rose-100 rounded-lg p-3 mb-2">
                            <div className="flex justify-between items-baseline mb-0.5">
                              <span className="font-bold text-slate-900">{proj.name}</span>
                              {proj.technologies && <span className="text-rose-400 text-[9px] font-medium">{proj.technologies}</span>}
                            </div>
                            {proj.description && <p className="text-slate-500 text-[10px] mb-1">{proj.description}</p>}
                            <ul className="space-y-0.5 text-slate-600">
                              {proj.bullets.filter(b => b.trim()).map((b, bi) => (
                                <li key={bi} className="flex items-start gap-1.5"><span className="text-rose-400 mt-0.5">▸</span>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>

            /* ═══════ OSLO CLEAN — Timeline dots, left-aligned ═══════ */
            ) : selectedTemplate === "oslo-clean" ? (
              <>
                <div className="bg-white shadow-sm rounded-lg p-6 text-[11px] leading-relaxed min-h-[600px]">
                  <div className="mb-4 pb-3 border-b-2 border-slate-800">
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">{resumeData.name || "ALEX JOHNSON"}</h2>
                    <p className="text-slate-400 text-[10px] mt-1 font-mono">
                      {[resumeData.location, resumeData.email, resumeData.phone, resumeData.linkedin].filter(Boolean).join(" • ") || "City • email • phone"}
                    </p>
                  </div>
                  {(resumeData.summary || aiGenerated) && (
                    <div className="mb-4">
                      <p className="text-slate-600">{resumeData.summary || "Results-oriented professional."}</p>
                    </div>
                  )}
                  {resumeData.experience.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Experience</h3>
                      <div className="relative pl-4">
                        <div className="absolute left-[5px] top-1 bottom-0 w-px bg-slate-200" />
                        {resumeData.experience.map((exp, i) => (
                          <div key={i} className="relative mb-3">
                            <div className="absolute -left-[11.5px] top-1 h-2.5 w-2.5 rounded-full border-2 border-slate-400 bg-white" />
                            <div className="flex justify-between items-baseline">
                              <span className="font-bold text-slate-800">{exp.title || "Job Title"}</span>
                              <span className="text-slate-400 text-[9px] font-mono">{exp.startDate} – {exp.endDate}</span>
                            </div>
                            <p className="text-slate-400 text-[10px]">{exp.company}{exp.location ? ` · ${exp.location}` : ""}</p>
                            <ul className="mt-1 text-slate-600 space-y-0.5">
                              {exp.bullets.filter(b => b.trim()).map((b, bi) => (
                                <li key={bi} className="flex items-start gap-1.5"><span className="text-slate-300 mt-0.5">—</span>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {resumeData.skills.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1.5">Skills</h3>
                      <p className="text-slate-700 font-mono text-[10px]">{resumeData.skills.join("  |  ")}</p>
                    </div>
                  )}
                  {resumeData.projects.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Projects</h3>
                      <div className="relative pl-4">
                        <div className="absolute left-[5px] top-1 bottom-0 w-px bg-slate-200" />
                        {resumeData.projects.map((proj, i) => (
                          <div key={i} className="relative mb-3">
                            <div className="absolute -left-[11.5px] top-1 h-2.5 w-2.5 rounded-full border-2 border-slate-400 bg-white" />
                            <span className="font-bold text-slate-800">{proj.name}</span>
                            {proj.technologies && <span className="text-slate-400 text-[9px] font-mono ml-2">{proj.technologies}</span>}
                            {proj.description && <p className="text-slate-400 text-[10px]">{proj.description}</p>}
                            <ul className="mt-1 text-slate-600 space-y-0.5">
                              {proj.bullets.filter(b => b.trim()).map((b, bi) => (
                                <li key={bi} className="flex items-start gap-1.5"><span className="text-slate-300 mt-0.5">—</span>{b}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {resumeData.education.length > 0 && (
                    <div>
                      <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1.5">Education</h3>
                      {resumeData.education.map((edu, i) => (
                        <div key={i} className="mb-1">
                          <p className="text-slate-800 font-semibold">{edu.degree || "Degree"}</p>
                          <p className="text-slate-400 text-[10px] font-mono">{edu.school} — {edu.startDate} – {edu.endDate}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>

            /* ═══════ DEFAULT — Classic single-column (all other templates) ═══════ */
            ) : (
              <div className="bg-white shadow-sm rounded-lg p-8 text-[11px] leading-relaxed min-h-[600px]">
              {/* Resume Preview */}
              <div className="text-center mb-4">
                <h2 className={`text-lg font-bold uppercase tracking-wide ${templateStyle.accent}`}>
                  {resumeData.name || "ALEX JOHNSON"}
                </h2>
                <p className="text-slate-500 text-[10px] mt-1">
                  {[resumeData.location, resumeData.email, resumeData.phone, resumeData.linkedin, resumeData.github]
                    .filter(Boolean).join(" • ") || "San Francisco, CA • alex@email.com • +1 (555) 000-0000"}
                </p>
              </div>

              {/* Summary */}
              {(resumeData.summary || aiGenerated) && (
                <div className="mb-3">
                  <h3 className={`text-[11px] font-bold uppercase border-b pb-1 mb-1.5 ${templateStyle.accent} ${templateStyle.border}`}>Professional Summary</h3>
                  <p className="text-slate-600">
                    {resumeData.summary || "Results-oriented professional with experience in developing robust applications. Expert in modern technologies."}
                  </p>
                </div>
              )}

              {/* Experience */}
              {resumeData.experience.length > 0 && (
                <div className="mb-3">
                  <h3 className={`text-[11px] font-bold uppercase border-b pb-1 mb-1.5 ${templateStyle.accent} ${templateStyle.border}`}>Experience</h3>
                  {resumeData.experience.map((exp, i) => (
                    <div key={i} className="mb-2">
                      <div className="flex justify-between items-baseline">
                        <span className="font-semibold text-slate-900">{exp.title || "Job Title"}</span>
                        <span className="text-slate-400 text-[9px]">{exp.startDate} – {exp.endDate}</span>
                      </div>
                      <p className="text-slate-500 text-[10px]">{exp.company}{exp.location ? `, ${exp.location}` : ""}</p>
                      <ul className="list-disc list-inside mt-1 text-slate-600 space-y-0.5">
                        {exp.bullets.filter(b => b.trim()).map((b, bi) => (
                          <li key={bi}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Education */}
              {resumeData.education.length > 0 && (
                <div className="mb-3">
                  <h3 className={`text-[11px] font-bold uppercase border-b pb-1 mb-1.5 ${templateStyle.accent} ${templateStyle.border}`}>Education</h3>
                  {resumeData.education.map((edu, i) => (
                    <div key={i} className="mb-1">
                      <div className="flex justify-between">
                        <span className="font-semibold text-slate-900">{edu.degree || "Degree"}</span>
                        <span className="text-slate-400 text-[9px]">{edu.startDate} – {edu.endDate}</span>
                      </div>
                      <p className="text-slate-500">{edu.school}{edu.gpa ? ` • GPA: ${edu.gpa}` : ""}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills */}
              {resumeData.skills.length > 0 && (
                <div className="mb-3">
                  <h3 className={`text-[11px] font-bold uppercase border-b pb-1 mb-1.5 ${templateStyle.accent} ${templateStyle.border}`}>Skills</h3>
                  <p className="text-slate-600">{resumeData.skills.join(", ")}</p>
                </div>
              )}

              {/* Projects */}
              {resumeData.projects.length > 0 && (
                <div className="mb-3">
                  <h3 className={`text-[11px] font-bold uppercase border-b pb-1 mb-1.5 ${templateStyle.accent} ${templateStyle.border}`}>Projects</h3>
                  {resumeData.projects.map((proj, i) => (
                    <div key={i} className="mb-2">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-slate-900">{proj.name}</span>
                        {proj.technologies && <span className="text-slate-400 text-[9px]">{proj.technologies}</span>}
                      </div>
                      {proj.description && <p className="text-slate-500 text-[10px]">{proj.description}</p>}
                      <ul className="list-disc list-inside mt-1 text-slate-600 space-y-0.5">
                        {proj.bullets.filter(b => b.trim()).map((b, bi) => (
                          <li key={bi}>{b}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
            )}
            {/* Auto-save indicator */}
            <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-green-600">
              <CheckCircle className="h-3 w-3" />
              <span>ALL CHANGES SAVED AUTOMATICALLY</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
