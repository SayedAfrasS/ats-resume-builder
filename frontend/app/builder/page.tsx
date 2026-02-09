"use client";

import { useState } from "react";
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
import { createResume } from "@/lib/api";
import toast from "react-hot-toast";

const STEPS = [
  { id: 1, label: "CONTACT" },
  { id: 2, label: "EXPERIENCE" },
  { id: 3, label: "EDUCATION" },
  { id: 4, label: "AI CONTENT" },
  { id: 5, label: "SKILLS" },
  { id: 6, label: "FINALIZE" },
];

export default function BuilderPage() {
  const { resumeData, setResumeData, updateResumeField, setAtsResult, setAiContent, setCompanyMatches, setImprovements } = useApp();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiGenerated, setAiGenerated] = useState<any>(null);
  const [generatedBullets, setGeneratedBullets] = useState<string[]>([]);
  const [acceptedBullets, setAcceptedBullets] = useState<Set<number>>(new Set());

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

  // AI Generate
  const handleGenerate = async () => {
    if (!resumeData.jobRole) {
      toast.error("Please enter a job role first");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        user_id: "user-" + Date.now(),
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

      const bullets: string[] = [];
      if (content?.experience) {
        content.experience.forEach((exp: any) => {
          if (exp.bullets) bullets.push(...exp.bullets);
          if (exp.description) bullets.push(exp.description);
        });
      }
      if (content?.projects) {
        content.projects.forEach((p: any) => {
          if (p.bullets) bullets.push(...p.bullets);
          if (p.description) bullets.push(p.description);
        });
      }
      setGeneratedBullets(bullets);
      toast.success("AI content generated successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate content. Check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const toggleBullet = (index: number) => {
    const newSet = new Set(acceptedBullets);
    if (newSet.has(index)) newSet.delete(index);
    else newSet.add(index);
    setAcceptedBullets(newSet);
  };

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

              {/* Step 3: Education */}
              {step === 3 && (
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

              {/* Step 4: AI Content */}
              {step === 4 && (
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">AI Content Generation</h2>
                  <p className="text-slate-500 mb-6">Optimize your experience for ATS filters and recruiter impact with AI-powered suggestions.</p>

                  {/* Generate Button Card */}
                  <Card className="mb-6">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center">
                            <Sparkles className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">Generate ATS-Optimized Content</h3>
                            <p className="text-sm text-slate-500">We&apos;ll analyze your &quot;{resumeData.jobRole || "Job Role"}&quot; role and optimize.</p>
                          </div>
                        </div>
                        <Button onClick={handleGenerate} disabled={loading} className="bg-blue-600 hover:bg-blue-700 px-6">
                          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                          Generate ATS Content
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Generated bullets */}
                  {generatedBullets.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                        WORK EXPERIENCE: {resumeData.experience[0]?.company?.toUpperCase() || "YOUR COMPANY"}
                      </h3>

                      {/* Existing experience bullets */}
                      {resumeData.experience[0]?.bullets?.filter(b => b.trim()).map((bullet, i) => (
                        <Card key={`existing-${i}`}>
                          <CardContent className="p-4 flex items-start gap-3">
                            <GripVertical className="h-5 w-5 text-slate-300 mt-0.5 cursor-grab" />
                            <p className="text-sm text-slate-700 flex-1">{bullet}</p>
                          </CardContent>
                        </Card>
                      ))}

                      {/* AI Generated */}
                      {generatedBullets.map((bullet, i) => (
                        <Card key={`ai-${i}`} className={`border-2 transition-all ${
                          acceptedBullets.has(i) ? "border-blue-200 bg-blue-50/30" : "border-blue-100 bg-blue-50/10"
                        }`}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <GripVertical className="h-5 w-5 text-slate-300 mt-0.5 cursor-grab" />
                              <div className="flex-1">
                                <Badge className="mb-2 bg-blue-600 text-white text-[10px]">NEWLY GENERATED</Badge>
                                <p className="text-sm text-slate-700">{bullet}</p>
                              </div>
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={() => toggleBullet(i)}
                                  className={`h-7 w-7 rounded-full flex items-center justify-center transition-all ${
                                    acceptedBullets.has(i)
                                      ? "bg-blue-600 text-white"
                                      : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                  }`}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </button>
                                <button className="h-7 w-7 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-slate-200">
                                  <RefreshCw className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

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

              {/* Step 5: Skills */}
              {step === 5 && (
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

              {/* Step 6: Finalize */}
              {step === 6 && (
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
                    <Button className="h-12 bg-blue-600 hover:bg-blue-700" onClick={() => toast.success("PDF download coming soon!")}>
                      <Download className="h-4 w-4 mr-2" /> Download PDF
                    </Button>
                    <Button variant="outline" className="h-12" onClick={() => toast.success("DOCX download coming soon!")}>
                      <Download className="h-4 w-4 mr-2" /> Download DOCX
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
            {step < 6 ? (
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
            <span className="text-sm font-semibold text-slate-700">LIVE PREVIEW</span>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded hover:bg-slate-100 text-slate-500"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg></button>
              <button className="p-1.5 rounded hover:bg-slate-100 text-slate-500"><svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="bg-white shadow-sm rounded-lg p-8 text-[11px] leading-relaxed min-h-[600px]">
              {/* Resume Preview */}
              <div className="text-center mb-4">
                <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
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
                  <h3 className="text-[11px] font-bold text-blue-700 uppercase border-b border-slate-200 pb-1 mb-1.5">Professional Summary</h3>
                  <p className="text-slate-600">
                    {resumeData.summary || "Results-oriented professional with experience in developing robust applications. Expert in modern technologies."}
                  </p>
                </div>
              )}

              {/* Experience */}
              {resumeData.experience.length > 0 && (
                <div className="mb-3">
                  <h3 className="text-[11px] font-bold text-blue-700 uppercase border-b border-slate-200 pb-1 mb-1.5">Experience</h3>
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
                  <h3 className="text-[11px] font-bold text-blue-700 uppercase border-b border-slate-200 pb-1 mb-1.5">Education</h3>
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
                  <h3 className="text-[11px] font-bold text-blue-700 uppercase border-b border-slate-200 pb-1 mb-1.5">Skills</h3>
                  <p className="text-slate-600">{resumeData.skills.join(", ")}</p>
                </div>
              )}
            </div>
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
