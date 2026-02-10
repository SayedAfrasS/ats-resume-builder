"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp, Target, Lightbulb, Briefcase, MapPin,
  ExternalLink, BarChart3, ArrowUpRight, ChevronRight,
  Bookmark, Building2, Users, Loader2, Search, Globe,
  AlertCircle, CheckCircle2, ArrowRight
} from "lucide-react";
import { useApp } from "@/lib/context";
import { getJobMatchData } from "@/lib/api";
import toast from "react-hot-toast";

interface CompanyMatch {
  company: string;
  role: string;
  description: string;
  location: string;
  applyLink: string | null;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  totalSkills: number;
}

interface JobMatchState {
  atsScore: number;
  grade: string;
  breakdown: Record<string, any>;
  issues: string[];
  hiringLikelihood: { level: string; score: number };
  companyMatches: CompanyMatch[];
  missingSkills: string[];
  foundSkills: string[];
  suggestions: string[];
  jobSearchLinks: { linkedin: string; indeed: string; glassdoor: string; naukri: string };
  availableRoles: string[];
  totalOpenings: number;
  analyzedRole: string;
}

const COMPANY_COLORS: Record<string, string> = {
  Google: "bg-blue-600", Microsoft: "bg-emerald-600", Amazon: "bg-orange-500",
  Meta: "bg-blue-500", Apple: "bg-gray-800", Netflix: "bg-red-600",
  Stripe: "bg-violet-600", Zoho: "bg-red-500", Freshworks: "bg-blue-500",
  Infosys: "bg-cyan-600", Flipkart: "bg-yellow-500", Razorpay: "bg-blue-700",
  Atlassian: "bg-blue-600", Notion: "bg-gray-900", Vercel: "bg-black",
  Shopify: "bg-green-600", HashiCorp: "bg-black", GitLab: "bg-orange-600",
  CrowdStrike: "bg-red-700", OpenAI: "bg-gray-900", NVIDIA: "bg-green-700",
};

export default function JobMatchPage() {
  const { user, resumeData, userAnalyses } = useApp();
  const [selectedRole, setSelectedRole] = useState(resumeData.jobRole || "Software Engineer");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<JobMatchState | null>(null);
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());

  const fetchMatchData = useCallback(async (role: string) => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // Send builder skills as fallback in case DB has no analysis yet
      const response = await getJobMatchData(user.id, role, resumeData.skills);
      if (response.success) setData(response);
    } catch (error) {
      console.error("Job match fetch failed:", error);
      toast.error("Failed to load job match data");
    } finally {
      setLoading(false);
    }
  }, [user?.id, resumeData.skills]);

  useEffect(() => {
    if (user?.id && selectedRole) fetchMatchData(selectedRole);
  }, [user?.id, selectedRole, fetchMatchData]);

  // Load bookmarks from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("ats_bookmarked_jobs");
    if (stored) {
      try { setBookmarked(new Set(JSON.parse(stored))); } catch {}
    }
  }, []);

  const toggleBookmark = (company: string) => {
    setBookmarked(prev => {
      const next = new Set(prev);
      if (next.has(company)) next.delete(company);
      else next.add(company);
      localStorage.setItem("ats_bookmarked_jobs", JSON.stringify([...next]));
      return next;
    });
  };

  // Derive display values
  const score = data?.atsScore || 0;
  const grade = data?.grade || "N/A";
  const matches = data?.companyMatches || [];
  const missingSkills = data?.missingSkills || [];
  const foundSkills = data?.foundSkills || [];
  const suggestions = data?.suggestions || [];
  const hiring = data?.hiringLikelihood || { level: "N/A", score: 0 };
  const roles = data?.availableRoles || [];
  const jobLinks = data?.jobSearchLinks || { linkedin: "#", indeed: "#", glassdoor: "#", naukri: "#" };

  // If user not logged in
  if (!user) {
    return (
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Login Required</h2>
            <p className="text-slate-500 text-sm mb-6">Sign in and analyze your resume first to get personalized job matches with real apply links.</p>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => window.location.href = "/auth/login"}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 page-transition">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Job Match & Prediction Analytics</h1>
            <p className="text-slate-500 mt-1">
              Personalized matches from your ATS analysis — real roles with direct apply links.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-600">Target Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px]"
            >
              {roles.length > 0 ? (
                roles.map((r) => <option key={r} value={r}>{r}</option>)
              ) : (
                <>
                  <option>Software Engineer</option>
                  <option>Data Analyst</option>
                  <option>Data Scientist</option>
                  <option>Frontend Developer</option>
                  <option>Backend Developer</option>
                  <option>Full Stack Developer</option>
                  <option>DevOps Engineer</option>
                  <option>Product Manager</option>
                  <option>UI/UX Designer</option>
                  <option>Cybersecurity Analyst</option>
                  <option>Machine Learning Engineer</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 mr-3" />
            <span className="text-slate-500 text-lg">Analyzing job matches for {selectedRole}...</span>
          </div>
        )}

        {!loading && (
          <>
            {/* No Analysis Warning */}
            {score === 0 && userAnalyses.length === 0 && (
              <Card className="mb-8 border-amber-200 bg-amber-50">
                <CardContent className="p-6 flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900">No Resume Analysis Found</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Go to the <a href="/analyzer" className="underline font-medium">Analyzer page</a> and upload your resume first.
                      Job matches will be personalized based on your ATS scores and detected skills.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              {/* Resume Match Score */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">ATS Score</p>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-4xl font-bold text-slate-900">{score}%</span>
                        <Badge variant={score >= 70 ? "success" : "destructive"} className="text-[10px]">
                          Grade: {grade}
                        </Badge>
                      </div>
                    </div>
                    <div className="h-14 w-14 bg-blue-50 rounded-xl flex items-center justify-center">
                      <Target className="h-7 w-7 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    {score >= 80 ? "Excellent! Your resume is well-optimized for ATS systems." :
                     score >= 60 ? "Good foundation. Add more role-specific keywords to improve." :
                     score > 0 ? "Needs improvement. Analyze your resume for specific gaps." :
                     "Upload and analyze your resume to see your score."}
                  </p>
                </CardContent>
              </Card>

              {/* Hiring Likelihood */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hiring Likelihood</p>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className={`text-4xl font-bold ${
                          hiring.level === "High" ? "text-green-700" :
                          hiring.level === "Medium" ? "text-amber-600" : "text-slate-900"
                        }`}>{hiring.level}</span>
                        <span className="text-sm text-slate-500">Score: {hiring.score}</span>
                      </div>
                    </div>
                    <div className={`h-14 w-14 rounded-xl flex items-center justify-center ${
                      hiring.level === "High" ? "bg-green-50" :
                      hiring.level === "Medium" ? "bg-amber-50" : "bg-slate-50"
                    }`}>
                      <TrendingUp className={`h-7 w-7 ${
                        hiring.level === "High" ? "text-green-600" :
                        hiring.level === "Medium" ? "text-amber-600" : "text-slate-400"
                      }`} />
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Calculated from your ATS score ({score}%) weighted at 40% and average company match
                    ({matches.length > 0 ? Math.round(matches.reduce((s, m) => s + m.matchScore, 0) / matches.length) : 0}%) at 60%.
                  </p>
                </CardContent>
              </Card>

              {/* Matching Companies */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Matching Companies</p>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-4xl font-bold text-slate-900">{matches.length}</span>
                        <span className="text-sm text-slate-500">for {selectedRole}</span>
                      </div>
                    </div>
                    <div className="h-14 w-14 bg-purple-50 rounded-xl flex items-center justify-center">
                      <Building2 className="h-7 w-7 text-purple-600" />
                    </div>
                  </div>
                  <div className="flex items-end gap-1 h-8 mt-2">
                    {matches.slice(0, 10).map((m, i) => (
                      <div key={i} className={`flex-1 rounded-sm ${m.matchScore >= 60 ? "bg-blue-600" : "bg-slate-200"}`}
                        style={{ height: `${Math.max(m.matchScore, 10)}%` }}
                        title={`${m.company}: ${m.matchScore}%`} />
                    ))}
                    {matches.length === 0 && Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex-1 rounded-sm bg-slate-100" style={{ height: "20%" }} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Middle Row: Keyword Gaps + Improvement Tips */}
            <div className="grid gap-6 lg:grid-cols-2 mb-8">
              {/* Keyword Gaps */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-red-500" />
                    Skill Gaps (Missing Keywords)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {missingSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {missingSkills.map((skill: string, i: number) => (
                        <Badge key={i} variant="destructive" className="px-3 py-1.5 text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 mb-4">No missing keywords detected — analyze your resume to see gaps.</p>
                  )}
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4 mb-2">Your Matched Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {foundSkills.length > 0 ? foundSkills.slice(0, 12).map((skill: string, i: number) => (
                      <Badge key={i} variant="success" className="px-3 py-1.5 text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />{skill}
                      </Badge>
                    )) : (
                      resumeData.skills.slice(0, 8).map((skill, i) => (
                        <Badge key={i} variant="success" className="px-3 py-1.5 text-xs">{skill}</Badge>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Improvement Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    Improvement Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {suggestions.length > 0 ? (
                    suggestions.slice(0, 4).map((suggestion: string, i: number) => {
                      const icons = [BarChart3, ExternalLink, Target, Lightbulb];
                      const bgColors = ["bg-blue-50", "bg-purple-50", "bg-green-50", "bg-amber-50"];
                      const iconColors = ["text-blue-600", "text-purple-600", "text-green-600", "text-amber-600"];
                      const Icon = icons[i % icons.length];
                      return (
                        <div key={i} className="flex items-start gap-3">
                          <div className={`h-8 w-8 ${bgColors[i % bgColors.length]} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                            <Icon className={`h-4 w-4 ${iconColors[i % iconColors.length]}`} />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 text-sm">{suggestion.split(".")[0]}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{suggestion}</p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4">
                      <Lightbulb className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm text-slate-400">Analyze your resume to get personalized improvement tips.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Job Search Links */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Search className="h-5 w-5 text-blue-600" />
                  Search Jobs on Top Platforms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <a href={jobLinks.linkedin} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                    <div className="h-8 w-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">in</div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">LinkedIn</p>
                      <p className="text-[10px] text-slate-500">{selectedRole} jobs</p>
                    </div>
                    <ExternalLink className="h-3 w-3 text-slate-400 ml-auto" />
                  </a>
                  <a href={jobLinks.indeed} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 rounded-lg border border-slate-200 hover:bg-purple-50 hover:border-purple-300 transition-colors">
                    <div className="h-8 w-8 bg-purple-700 rounded flex items-center justify-center text-white text-xs font-bold">iD</div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Indeed</p>
                      <p className="text-[10px] text-slate-500">{selectedRole} jobs</p>
                    </div>
                    <ExternalLink className="h-3 w-3 text-slate-400 ml-auto" />
                  </a>
                  <a href={jobLinks.glassdoor} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 rounded-lg border border-slate-200 hover:bg-green-50 hover:border-green-300 transition-colors">
                    <div className="h-8 w-8 bg-green-600 rounded flex items-center justify-center text-white text-xs font-bold">GD</div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Glassdoor</p>
                      <p className="text-[10px] text-slate-500">{selectedRole} jobs</p>
                    </div>
                    <ExternalLink className="h-3 w-3 text-slate-400 ml-auto" />
                  </a>
                  <a href={jobLinks.naukri} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-3 rounded-lg border border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition-colors">
                    <div className="h-8 w-8 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold">NK</div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">Naukri</p>
                      <p className="text-[10px] text-slate-500">{selectedRole} jobs</p>
                    </div>
                    <ExternalLink className="h-3 w-3 text-slate-400 ml-auto" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* Companies Hiring */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900">
                  Companies Hiring for {selectedRole}
                  <span className="text-sm font-normal text-slate-500 ml-2">({matches.length} matches)</span>
                </h2>
              </div>

              {matches.length === 0 && !loading && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Building2 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500">No company matches found for this role. Try a different role or analyze your resume.</p>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {matches.map((match, i) => {
                  const color = COMPANY_COLORS[match.company] || "bg-slate-600";
                  return (
                    <Card key={i} className="hover:shadow-md transition-shadow group">
                      <CardContent className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 ${color} rounded-lg flex items-center justify-center text-white font-bold text-sm`}>
                              {match.company[0]}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{match.role}</p>
                              <p className="text-xs text-slate-500">{match.company}</p>
                            </div>
                          </div>
                          <Badge variant={match.matchScore >= 70 ? "success" : match.matchScore >= 40 ? "warning" : "destructive"}
                            className="text-[10px]">
                            {match.matchScore}% Match
                          </Badge>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-1 text-xs text-slate-500 mb-3">
                          <MapPin className="h-3 w-3" /> {match.location}
                        </div>

                        {/* Match progress bar */}
                        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3">
                          <div className={`h-1.5 rounded-full ${
                            match.matchScore >= 70 ? "bg-green-500" :
                            match.matchScore >= 40 ? "bg-amber-500" : "bg-red-400"
                          }`} style={{ width: `${match.matchScore}%` }} />
                        </div>

                        {/* Matched skills preview */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {match.matchedSkills.slice(0, 4).map((skill, j) => (
                            <span key={j} className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded">{skill}</span>
                          ))}
                          {match.matchedSkills.length > 4 && (
                            <span className="text-[10px] text-slate-400">+{match.matchedSkills.length - 4} more</span>
                          )}
                        </div>

                        {/* Missing skills */}
                        {match.missingSkills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {match.missingSkills.slice(0, 3).map((skill, j) => (
                              <span key={j} className="text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded">missing: {skill}</span>
                            ))}
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          {match.applyLink ? (
                            <a href={match.applyLink} target="_blank" rel="noopener noreferrer" className="flex-1">
                              <Button size="sm" className="w-full bg-blue-600 hover:bg-blue-700">
                                Apply Now <ExternalLink className="h-3 w-3 ml-1" />
                              </Button>
                            </a>
                          ) : (
                            <Button size="sm" className="flex-1 bg-slate-400" disabled>
                              No Link Available
                            </Button>
                          )}
                          <Button size="sm" variant="outline" className="px-3"
                            onClick={() => {
                              toggleBookmark(match.company + match.role);
                              toast.success(bookmarked.has(match.company + match.role) ? "Removed bookmark" : "Bookmarked!");
                            }}>
                            <Bookmark className={`h-4 w-4 ${bookmarked.has(match.company + match.role) ? "fill-blue-600 text-blue-600" : ""}`} />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-slate-400 py-8 mt-8 border-t border-slate-100">
              &copy; 2026 SpellFolio AI. Job data sourced from company career pages. Apply links open in new tabs.
            </div>
          </>
        )}
      </div>
    </main>
  );
}
