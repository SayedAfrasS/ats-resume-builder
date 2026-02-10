"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ui/score-ring";
import {
  Loader2, Upload, FileText, CheckCircle, AlertTriangle,
  Sparkles, Target, Type, Shield, Download, Zap, Eye,
  TrendingUp, TrendingDown, Building2, Award, Search,
  BarChart3, BookOpen, User, Hash, ChevronDown, ChevronUp,
  ExternalLink, XCircle
} from "lucide-react";
import { analyzeResumeFile, getSupportedRoles } from "@/lib/api";
import { useApp } from "@/lib/context";
import toast from "react-hot-toast";

/* ───────────────────── Types ───────────────────── */
interface BreakdownItem {
  score: number;
  weight: number;
  label: string;
}

interface CompanyMatch {
  company: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  applyLink: string | null;
  location: string;
}

interface AnalysisResult {
  totalScore: number;
  grade: string;
  breakdown: Record<string, BreakdownItem>;
  keywords: {
    criticalFound: string[];
    criticalMissing: string[];
    importantFound: string[];
    importantMissing: string[];
    bonusFound: string[];
  };
  skills: { matched: string[]; missing: string[] };
  sections: { found: string[]; missing: string[]; bonus: string[] };
  contact: { found: string[]; missing: string[] };
  quantification: { metricsFound: number };
  companyMatches: CompanyMatch[];
  benefits: string[];
  issues: string[];
}

/* ───────────── Score color helpers ─────────────── */
const scoreColor = (s: number) =>
  s >= 80 ? "text-green-600" : s >= 60 ? "text-amber-600" : "text-red-600";
const scoreBg = (s: number) =>
  s >= 80 ? "bg-green-600" : s >= 60 ? "bg-amber-500" : "bg-red-500";
const gradeColor = (g: string) =>
  g.startsWith("A") ? "bg-green-100 text-green-700" : g.startsWith("B") ? "bg-blue-100 text-blue-700" : g.startsWith("C") ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";

/* ─────────────────── SUPPORTED ROLES ─────────────────── */
const FALLBACK_ROLES = [
  "Software Engineer", "Data Analyst", "Data Scientist",
  "Frontend Developer", "Backend Developer", "Full Stack Developer",
  "DevOps Engineer", "Product Manager", "UI/UX Designer",
  "Cybersecurity Analyst", "Machine Learning Engineer",
];

export default function AnalyzerPage() {
  const { user, setAtsResult, loadUserAnalyses } = useApp();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [jobRole, setJobRole] = useState("");
  const [roles, setRoles] = useState<string[]>(FALLBACK_ROLES);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showAllIssues, setShowAllIssues] = useState(false);
  const [expandedCompany, setExpandedCompany] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getSupportedRoles()
      .then((d) => { if (d.roles?.length) setRoles(d.roles); })
      .catch(() => {});
  }, []);

  /* ── File Handlers ────────────────────── */
  const handleFile = useCallback((f: File) => {
    const maxSize = 5 * 1024 * 1024;
    if (f.size > maxSize) { toast.error("File is too large (max 5 MB)"); return; }
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!allowed.includes(f.type) && !f.name.endsWith(".txt") && !f.name.endsWith(".pdf") && !f.name.endsWith(".docx") && !f.name.endsWith(".doc")) {
      toast.error("Only PDF, DOC, DOCX and TXT files allowed");
      return;
    }
    setFile(f);
    setResult(null);
    toast.success(`"${f.name}" ready for analysis`);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(e.type === "dragover" || e.type === "dragenter");
  }, []);

  /* ── Analyze ────────────────────────── */
  const handleAnalyze = async () => {
    if (!jobRole) { toast.error("Please select a target job role"); return; }
    if (!file) { toast.error("Please upload a resume file"); return; }

    setLoading(true);
    setResult(null);
    try {
      const response = await analyzeResumeFile(file, jobRole, user?.id);
      if (response?.success && response.analysis) {
        setResult(response.analysis);
        setAiSuggestions(response.aiSuggestions || []);
        setAtsResult(response.analysis);
        await loadUserAnalyses();
        toast.success("ATS Analysis complete!");
      } else {
        toast.error(response?.error || "Analysis returned no data");
      }
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.error || "Analysis failed. Check backend.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ──────────────────────── UI ──────────────────────── */
  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 page-transition">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">ATS Resume Analyzer</h1>
          <p className="text-slate-500 mt-1">
            Upload your resume &amp; select a target role. Our 8-dimension ATS engine scores your resume, shows benefits &amp; issues, and matches you against top companies.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* ═══════ LEFT — Upload Panel ═══════ */}
          <div className="lg:col-span-2 space-y-6">
            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDrag}
              onDragEnter={handleDrag}
              onDragLeave={() => setDragActive(false)}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                dragActive ? "border-blue-500 bg-blue-50 scale-[1.01]" : "border-slate-200 bg-white hover:border-slate-300"
              }`}
            >
              <div className="flex flex-col items-center">
                <div className={`h-14 w-14 rounded-full flex items-center justify-center mb-4 ${file ? "bg-green-100" : "bg-slate-100"}`}>
                  {file ? <CheckCircle className="h-6 w-6 text-green-600" /> : <Upload className="h-6 w-6 text-slate-500" />}
                </div>
                {file ? (
                  <>
                    <p className="font-medium text-slate-700 mb-1 truncate max-w-full">{file.name}</p>
                    <p className="text-xs text-slate-500 mb-3">{(file.size / 1024).toFixed(1)} KB</p>
                    <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => { setFile(null); setResult(null); }}>
                      <XCircle className="h-3.5 w-3.5 mr-1" /> Remove
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-slate-700 mb-1">Drag and drop your resume here</p>
                    <p className="text-xs text-slate-500 mb-4">Supports PDF, DOCX, TXT (Max 5MB)</p>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={() => fileInputRef.current?.click()}>
                      Select File
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx,.doc,.txt"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFile(f);
                        // reset value so selecting same file again works
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Job Role Selector */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5"><Target className="h-3.5 w-3.5" /> Target Job Role</Label>
              <select
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
              >
                <option value="">Select a role...</option>
                {roles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Analyze Button */}
            <Button onClick={handleAnalyze} className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base" disabled={loading || !file || !jobRole}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
              {loading ? "Analyzing..." : "Analyze Resume"}
            </Button>

            {/* Current File Info */}
            {file && result && (
              <Card className="border-green-200 bg-green-50/50">
                <CardContent className="p-4 flex items-center gap-3">
                  <FileText className="h-5 w-5 text-green-600" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">Analyzed for: {jobRole}</p>
                  </div>
                  <Badge className={gradeColor(result.grade)}>{result.grade}</Badge>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ═══════ RIGHT — Results ═══════ */}
          <div className="lg:col-span-3 space-y-6">
            {result ? (
              <>
                {/* ── Score Hero ── */}
                <Card className="overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 flex flex-col md:flex-row items-center gap-6">
                    <ScoreRing score={result.totalScore} size={130} strokeWidth={10} />
                    <div className="text-center md:text-left">
                      <div className="flex items-center gap-2 mb-1 justify-center md:justify-start">
                        <h2 className="text-xl font-bold text-white">ATS Score: {result.totalScore}/100</h2>
                        <Badge className={gradeColor(result.grade) + " text-sm px-2"}>{result.grade}</Badge>
                      </div>
                      <p className="text-slate-300 text-sm">
                        {result.totalScore >= 80 ? "Excellent! Your resume is well-optimized for ATS." :
                         result.totalScore >= 60 ? "Good foundation, but several improvements will boost your score." :
                         result.totalScore >= 40 ? "Needs significant work to pass ATS screening effectively." :
                         "Major improvements needed to compete in ATS-filtered applications."}
                      </p>
                      <p className="text-slate-400 text-xs mt-2">Scored across 8 dimensions • Matched with {result.companyMatches?.length || 0} companies</p>
                    </div>
                  </div>
                </Card>

                {/* ── 8-Dimension Breakdown ── */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-blue-600" /> Score Breakdown (8 Dimensions)</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {Object.entries(result.breakdown).map(([key, item]) => (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-slate-700">{item.label}</span>
                          <span className={`text-sm font-bold ${scoreColor(item.score)}`}>{item.score}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${scoreBg(item.score)}`}
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-0.5">Weight: {Math.round(item.weight * 100)}%</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* ── Benefits & Issues ── */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Benefits */}
                  <Card className="border-green-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2 text-green-700">
                        <TrendingUp className="h-4 w-4" /> Benefits ({result.benefits.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {result.benefits.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Upload a stronger resume to see benefits</p>
                      ) : (
                        result.benefits.map((b, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 shrink-0" />
                            <span className="text-xs text-slate-700">{b}</span>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  {/* Issues */}
                  <Card className="border-red-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2 text-red-700">
                        <TrendingDown className="h-4 w-4" /> Issues ({result.issues.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {result.issues.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No issues detected — great resume!</p>
                      ) : (
                        <>
                          {(showAllIssues ? result.issues : result.issues.slice(0, 4)).map((issue, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                              <span className="text-xs text-slate-700">{issue}</span>
                            </div>
                          ))}
                          {result.issues.length > 4 && (
                            <Button size="sm" variant="ghost" className="w-full text-xs text-slate-500" onClick={() => setShowAllIssues(!showAllIssues)}>
                              {showAllIssues ? <><ChevronUp className="h-3 w-3 mr-1" /> Show Less</> : <><ChevronDown className="h-3 w-3 mr-1" /> Show All {result.issues.length} Issues</>}
                            </Button>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* ── Keywords & Skills ── */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2"><Search className="h-4 w-4 text-purple-600" /> Keywords &amp; Skills Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Critical Keywords */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Critical Keywords</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.keywords.criticalFound.map(kw => (
                          <Badge key={kw} className="bg-green-100 text-green-700 text-xs">{kw}</Badge>
                        ))}
                        {result.keywords.criticalMissing.map(kw => (
                          <Badge key={kw} variant="outline" className="border-red-300 text-red-600 text-xs line-through">{kw}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Important */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Important Keywords</p>
                      <div className="flex flex-wrap gap-1.5">
                        {result.keywords.importantFound.map(kw => (
                          <Badge key={kw} className="bg-blue-100 text-blue-700 text-xs">{kw}</Badge>
                        ))}
                        {result.keywords.importantMissing.map(kw => (
                          <Badge key={kw} variant="outline" className="border-slate-300 text-slate-400 text-xs">{kw}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Bonus */}
                    {result.keywords.bonusFound.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Bonus Keywords Found</p>
                        <div className="flex flex-wrap gap-1.5">
                          {result.keywords.bonusFound.map(kw => (
                            <Badge key={kw} className="bg-amber-100 text-amber-700 text-xs">{kw}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sections */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Resume Sections</p>
                        <div className="space-y-1">
                          {result.sections.found.map(s => (
                            <div key={s} className="flex items-center gap-1.5 text-xs text-green-700"><CheckCircle className="h-3 w-3" /> {s}</div>
                          ))}
                          {result.sections.missing.map(s => (
                            <div key={s} className="flex items-center gap-1.5 text-xs text-red-600"><XCircle className="h-3 w-3" /> {s}</div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase mb-2">Contact Info</p>
                        <div className="space-y-1">
                          {result.contact.found.map(c => (
                            <div key={c} className="flex items-center gap-1.5 text-xs text-green-700"><CheckCircle className="h-3 w-3" /> {c}</div>
                          ))}
                          {result.contact.missing.map(c => (
                            <div key={c} className="flex items-center gap-1.5 text-xs text-red-600"><XCircle className="h-3 w-3" /> {c}</div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Quantification */}
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                      <Hash className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-700">
                        Quantified achievements found: <strong>{result.quantification.metricsFound}</strong>
                        {result.quantification.metricsFound < 3 && <span className="text-red-500 ml-1">(aim for 5+)</span>}
                        {result.quantification.metricsFound >= 5 && <span className="text-green-600 ml-1">Excellent!</span>}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* ── Company Match ── */}
                {result.companyMatches && result.companyMatches.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2"><Building2 className="h-4 w-4 text-indigo-600" /> Company Match ({result.companyMatches.length} companies)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {result.companyMatches.map((company, i) => (
                        <div key={i} className="border rounded-lg overflow-hidden">
                          <button
                            onClick={() => setExpandedCompany(expandedCompany === i ? null : i)}
                            className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                                company.matchScore >= 70 ? "bg-green-600" : company.matchScore >= 40 ? "bg-amber-500" : "bg-red-500"
                              }`}>
                                {company.matchScore}%
                              </div>
                              <div className="text-left">
                                <p className="font-medium text-slate-900 text-sm">{company.company}</p>
                                <p className="text-xs text-slate-500">{company.location}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {company.applyLink && (
                                <a href={company.applyLink} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}>
                                  <Badge className="bg-blue-100 text-blue-700 text-xs hover:bg-blue-200">
                                    <ExternalLink className="h-3 w-3 mr-1" /> Apply
                                  </Badge>
                                </a>
                              )}
                              {expandedCompany === i ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                            </div>
                          </button>
                          {expandedCompany === i && (
                            <div className="p-3 pt-0 border-t bg-slate-50 space-y-2">
                              <div>
                                <p className="text-xs font-semibold text-green-700 mb-1">Matched Skills ({company.matchedSkills.length})</p>
                                <div className="flex flex-wrap gap-1">
                                  {company.matchedSkills.map(s => <Badge key={s} className="bg-green-100 text-green-700 text-[10px]">{s}</Badge>)}
                                </div>
                              </div>
                              {company.missingSkills.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-red-600 mb-1">Missing Skills ({company.missingSkills.length})</p>
                                  <div className="flex flex-wrap gap-1">
                                    {company.missingSkills.map(s => <Badge key={s} variant="outline" className="border-red-300 text-red-500 text-[10px]">{s}</Badge>)}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* ── AI Suggestions ── */}
                {aiSuggestions.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2"><Sparkles className="h-4 w-4 text-amber-500" /> AI Suggestions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {aiSuggestions.map((s, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg">
                          <Sparkles className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                          <span className="text-xs text-slate-700">{s}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* ── CTA ── */}
                <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base" onClick={() => { window.location.href = "/builder"; }}>
                  <Download className="h-4 w-4 mr-2" /> Build Optimized Resume
                </Button>
              </>
            ) : (
              /* ── Empty State ── */
              <div className="flex items-center justify-center h-full min-h-[500px]">
                <div className="text-center max-w-sm">
                  <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Eye className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="font-semibold text-slate-700 text-lg mb-2">Upload a resume to get started</h3>
                  <p className="text-sm text-slate-400 mb-4">
                    Our ATS engine analyzes your resume across 8 scoring dimensions, matches you against top companies, and shows clear benefits &amp; issues for your target role.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {["Keyword Match", "Formatting", "Readability", "Sections", "Contact", "Metrics", "Skills", "Company Fit"].map(d => (
                      <Badge key={d} variant="outline" className="text-[10px] text-slate-400">{d}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
