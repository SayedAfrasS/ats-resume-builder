"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ui/score-ring";
import {
  Loader2, Upload, FileText, CheckCircle, AlertTriangle,
  Sparkles, Target, Type, Shield, Download, Zap, X, Eye
} from "lucide-react";
import { analyzeResume } from "@/lib/api";
import { useApp } from "@/lib/context";
import toast from "react-hot-toast";

export default function AnalyzerPage() {
  const { setAtsResult } = useApp();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [jobRole, setJobRole] = useState("");
  const [fileName, setFileName] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setResumeText(text);
    };
    reader.readAsText(file);
    toast.success(`File "${file.name}" loaded`);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(e.type === "dragover" || e.type === "dragenter");
  }, []);

  const handleAnalyze = async () => {
    if (!jobRole) {
      toast.error("Please enter a target job role");
      return;
    }
    if (!resumeText) {
      toast.error("Please upload or paste resume content");
      return;
    }

    setLoading(true);
    try {
      let content;
      try {
        content = JSON.parse(resumeText);
      } catch {
        // If not JSON, wrap it in a basic structure
        content = {
          summary: resumeText.substring(0, 200),
          projects: [{ name: "Project", bullets: resumeText.split("\n").filter((l: string) => l.trim()) }],
          experience: [],
        };
      }

      const response = await analyzeResume({ job_role: jobRole, content });
      setResult(response);
      setAtsResult(response.ats);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error(error);
      toast.error("Analysis failed. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 page-transition">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Resume Analysis & ATS Scoring</h1>
          <p className="text-slate-500 mt-1">Upload your resume to see how it performs against industry standards and get AI-powered improvement suggestions.</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Left - Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDrag}
              onDragEnter={handleDrag}
              onDragLeave={() => setDragActive(false)}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                dragActive ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex flex-col items-center">
                <div className="h-14 w-14 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <Upload className="h-6 w-6 text-slate-500" />
                </div>
                <p className="font-medium text-slate-700 mb-1">Drag and drop your resume here</p>
                <p className="text-xs text-slate-500 mb-4">Supports PDF, DOCX (Max 5MB)</p>
                <label className="cursor-pointer">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Select File
                  </Button>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.txt,.json"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFile(file);
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Job Role */}
            <div className="space-y-2">
              <Label>Target Job Role</Label>
              <Input
                placeholder="e.g. Software Engineer"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
              />
            </div>

            {/* Resume Text for JSON input */}
            <div className="space-y-2">
              <Label>Resume Content (Paste JSON or text)</Label>
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-mono ring-offset-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                placeholder='{"summary": "...", "projects": [...]}'
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
            </div>

            {/* Currently Analyzing */}
            {fileName && (
              <Card>
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Currently Analyzing</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{fileName}</p>
                      <p className="text-xs text-slate-500">{(resumeText.length / 1024).toFixed(1)} KB • Uploaded just now</p>
                    </div>
                    {result && <CheckCircle className="h-5 w-5 text-green-500" />}
                  </div>
                </CardContent>
              </Card>
            )}

            <Button onClick={handleAnalyze} className="w-full h-12 bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
              {loading ? "Analyzing..." : "Analyze Resume"}
            </Button>
          </div>

          {/* Right - Results */}
          <div className="lg:col-span-3 space-y-6">
            {result ? (
              <>
                {/* Score Section */}
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <Card className="flex-1 w-full">
                    <CardContent className="p-6 flex items-center gap-6">
                      <ScoreRing score={Math.round(result.ats.totalScore)} size={110} strokeWidth={8} />
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">
                          {result.ats.totalScore >= 80 ? "Excellent Match!" : result.ats.totalScore >= 60 ? "Good Match" : "Needs Work"}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          {result.ats.totalScore >= 80
                            ? "Your resume is ready for most top-tier job applications."
                            : "We found areas where you can optimize keywords to rank even higher."}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Skills Match</p>
                      <div className="text-2xl font-bold text-slate-900">{Math.round(result.ats.breakdown.keyword)}%</div>
                      <div className="h-1.5 bg-slate-100 rounded-full mt-2">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: `${result.ats.breakdown.keyword}%` }} />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Keywords</p>
                      <div className="text-2xl font-bold text-green-600">Good</div>
                      <p className="text-xs text-green-500 mt-1">Above average</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Formatting</p>
                      <div className="text-2xl font-bold text-slate-900">{result.ats.issues.length === 0 ? "None" : result.ats.issues.length}</div>
                      <p className="text-xs text-slate-500 mt-1">{result.ats.issues.length === 0 ? "No issues found" : "Issues found"}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* AI Suggestions */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-slate-900">AI Suggestions to Improve Resume</h3>
                    <Button variant="link" className="text-blue-600 text-sm p-0 h-auto">View All Suggestions</Button>
                  </div>
                  <div className="space-y-3">
                    {result.improvements.suggestions.map((suggestion: string, i: number) => {
                      const icons = [Target, Shield, Sparkles, Type];
                      const colors = ["text-amber-500", "text-purple-500", "text-green-500", "text-blue-500"];
                      const bgColors = ["bg-amber-50", "bg-purple-50", "bg-green-50", "bg-blue-50"];
                      const Icon = icons[i % icons.length];
                      return (
                        <Card key={i}>
                          <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`h-10 w-10 rounded-full ${bgColors[i % bgColors.length]} flex items-center justify-center`}>
                                <Icon className={`h-5 w-5 ${colors[i % colors.length]}`} />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 text-sm">{suggestion.split(".")[0]}</p>
                                <p className="text-xs text-slate-500">{suggestion}</p>
                              </div>
                            </div>
                            <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                              <Sparkles className="h-3.5 w-3.5 mr-1" /> Fix with AI
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}

                    {/* Missing Skills */}
                    {result.improvements.missingSkills.length > 0 && (
                      <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
                              <Shield className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900 text-sm">Missing Keywords: &quot;{result.improvements.missingSkills.slice(0, 2).join('", "')}&quot;</p>
                              <p className="text-xs text-slate-500">Adding these keywords would increase your match rate by 12%.</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                            <Sparkles className="h-3.5 w-3.5 mr-1" /> Fix with AI
                          </Button>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>

                {/* Download */}
                <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700" onClick={() => toast.success("Optimized resume download coming soon!")}>
                  <Download className="h-4 w-4 mr-2" /> Download Optimized Resume
                </Button>
              </>
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center">
                  <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="h-7 w-7 text-slate-400" />
                  </div>
                  <h3 className="font-medium text-slate-600 mb-1">Upload a resume to get started</h3>
                  <p className="text-sm text-slate-400">Analysis results and suggestions will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
