"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ui/score-ring";
import {
  FileText, ArrowUpRight, AlertCircle, CheckCircle2,
  Briefcase, Download, Upload, Plus, Lightbulb,
  Clock, Star, BookOpen, MapPin, ExternalLink, Loader2
} from "lucide-react";
import { useApp } from "@/lib/context";
import { getJobMatchData } from "@/lib/api";

export default function DashboardPage() {
  const { user, atsResult, savedResumes, improvements, userAnalyses, resumeData } = useApp();
  const latestAnalysis = userAnalyses?.[0];
  const score = latestAnalysis?.ats_score || atsResult?.totalScore || 0;
  const userName = user?.name || "Alex";
  const resumeCount = savedResumes?.length || 0;
  const analysisCount = userAnalyses?.length || 0;

  // Dynamic matched jobs from DB
  const [matchedJobs, setMatchedJobs] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  const fetchMatchedJobs = useCallback(async () => {
    if (!user?.id) return;
    setJobsLoading(true);
    try {
      const role = latestAnalysis?.job_role || resumeData.jobRole || "Software Engineer";
      const res = await getJobMatchData(user.id, role, resumeData.skills);
      if (res.success && res.companyMatches?.length > 0) {
        setMatchedJobs(res.companyMatches.slice(0, 4));
      }
    } catch (e) {
      console.error("Dashboard job match fetch:", e);
    } finally {
      setJobsLoading(false);
    }
  }, [user?.id, latestAnalysis?.job_role, resumeData.jobRole, resumeData.skills]);

  useEffect(() => { fetchMatchedJobs(); }, [fetchMatchedJobs]);

  const analysisIssues: string[] = Array.isArray(latestAnalysis?.issues) ? latestAnalysis.issues : [];
  const analysisBenefits: string[] = Array.isArray(latestAnalysis?.benefits) ? latestAnalysis.benefits : [];

  // Build improvement suggestions from latest analysis
  const improvementItems = analysisIssues.length > 0 || analysisBenefits.length > 0
    ? [
        ...analysisIssues.slice(0, 3).map((issue: string) => ({
          icon: AlertCircle,
          bg: "bg-amber-50",
          border: "border-amber-100",
          color: "text-amber-500",
          title: issue.split(".")[0],
          desc: issue,
        })),
        ...analysisBenefits.slice(0, 2).map((benefit: string) => ({
          icon: CheckCircle2,
          bg: "bg-blue-50",
          border: "border-blue-100",
          color: "text-blue-500",
          title: benefit.split(".")[0],
          desc: benefit,
        })),
      ]
    : (improvements?.suggestions?.length > 0
        ? [
            ...improvements.suggestions.slice(0, 2).map((s: string) => ({
              icon: AlertCircle,
              bg: "bg-amber-50",
              border: "border-amber-100",
              color: "text-amber-500",
              title: s.split(".")[0],
              desc: s,
            })),
            ...(improvements.missingSkills?.length > 0
              ? [{
                  icon: Lightbulb,
                  bg: "bg-blue-50",
                  border: "border-blue-100",
                  color: "text-blue-500",
                  title: `Add missing skills: ${improvements.missingSkills.slice(0, 3).join(", ")}`,
                  desc: `These skills appear in 85% of matched job descriptions for your target role.`,
                }]
              : []),
          ]
        : [
            { icon: AlertCircle, bg: "bg-amber-50", border: "border-amber-100", color: "text-amber-500", title: "Add more quantifiable achievements", desc: 'Resumes with "Increased sales by 30%" perform 40% better.' },
            { icon: CheckCircle2, bg: "bg-blue-50", border: "border-blue-100", color: "text-blue-500", title: "Include 'Python' in skills section", desc: "We detected this keyword in 85% of your matched job descriptions." },
            { icon: Lightbulb, bg: "bg-slate-50", border: "border-slate-100", color: "text-purple-500", title: "Improve job title clarity", desc: '"Creative Generalist" is too vague for most ATS parsers.' },
          ]);

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 page-transition">
      {/* Welcome Bar */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Welcome back, {userName}. {resumeCount > 0 ? `You have ${resumeCount} saved resume${resumeCount > 1 ? "s" : ""}.` : "Create your first resume to get started."}</p>
      </div>

      {/* Top Row */}
      <div className="grid gap-6 md:grid-cols-2 mb-6">
        {/* Overall ATS Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall ATS Score</CardTitle>
            <Badge variant="success" className="text-[10px]">
              <ArrowUpRight className="h-3 w-3 mr-0.5" />+12%
            </Badge>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-4xl font-bold text-slate-900">{score}%</div>
                <p className="text-xs text-slate-500 mt-2">Based on {analysisCount} resume analys{analysisCount === 1 ? "is" : "es"}</p>
              </div>
              <ScoreRing score={score} size={80} strokeWidth={6} label="" />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/builder">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 justify-center gap-2">
                <Plus className="h-4 w-4" /> Create New Resume
              </Button>
            </Link>
            <Link href="/analyzer" className="block mt-3">
              <Button variant="outline" className="w-full justify-center gap-2">
                <Upload className="h-4 w-4" /> Upload for Analysis
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Middle Row */}
      <div className="grid gap-6 lg:grid-cols-3 mb-6">
        {/* Recommended Improvements */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recommended Improvements</CardTitle>
            <Badge variant="destructive" className="text-xs">{Math.max(analysisIssues.length, 1)} Critical Action{analysisIssues.length === 1 ? "" : "s"}</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {improvementItems.map((item: any, i: number) => (
              <div key={i} className={`flex items-start gap-3 p-3 rounded-lg ${item.bg} border ${item.border}`}>
                <item.icon className={`h-5 w-5 ${item.color} mt-0.5 flex-shrink-0`} />
                <div>
                  <p className="font-medium text-slate-900 text-sm">{item.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tips Sidebar */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-3">
                <Star className="h-5 w-5 text-yellow-300" />
                <h3 className="font-bold">Tips for ATS Resumes</h3>
              </div>
              <ul className="space-y-2 text-sm text-blue-100">
                <li className="flex items-start gap-2"><span className="text-blue-200 mt-0.5">•</span>Use standard fonts like Arial or Helvetica</li>
                <li className="flex items-start gap-2"><span className="text-blue-200 mt-0.5">•</span>Don&apos;t use ATS-incompatible tables or images</li>
                <li className="flex items-start gap-2"><span className="text-blue-200 mt-0.5">•</span>Always upload in PDF or .docx format</li>
              </ul>
              <Link href="/guide">
                <Button variant="outline" size="sm" className="mt-4 w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white">
                  <BookOpen className="h-3.5 w-3.5 mr-1.5" /> Read Full Guide
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 text-white border-0">
            <CardContent className="p-6">
              <h3 className="font-bold mb-1">Get Unlimited Credits</h3>
              <p className="text-xs text-slate-300 mb-4">Upgrade to Pro to unlock AI-powered cover letters &amp; more.</p>
              <Button size="sm" className="w-full bg-blue-500 hover:bg-blue-400">Upgrade Now</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Matched Jobs</CardTitle>
            <Link href="/jobs" className="text-sm text-blue-600 hover:underline">View All</Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {jobsLoading ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600 mr-2" />
                <span className="text-sm text-slate-500">Loading matches...</span>
              </div>
            ) : matchedJobs.length > 0 ? (
              matchedJobs.map((job: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm">{job.company[0]}</div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{job.role}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        {job.company}
                        {job.location && <><span>•</span><MapPin className="h-3 w-3" />{job.location}</> }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={job.matchScore >= 60 ? "success" : "destructive"}>{job.matchScore}% Match</Badge>
                    {job.applyLink && (
                      <a href={job.applyLink} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 text-slate-400 hover:text-blue-600" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <Briefcase className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">Analyze your resume to see personalized job matches.</p>
                <Link href="/analyzer">
                  <Button size="sm" variant="outline" className="mt-3">Go to Analyzer</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Activity</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {analysisCount > 0 ? (
              userAnalyses.slice(0, 5).map((item: any, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">Resume Analyzed</p>
                    <p className="text-xs text-slate-500 truncate">{item.file_name || "Uploaded resume"} • {item.job_role || "Role"} • Score {item.ats_score}%</p>
                  </div>
                  <span className="text-xs text-slate-400 flex-shrink-0">{item.created_at ? new Date(item.created_at).toLocaleDateString() : ""}</span>
                </div>
              ))
            ) : (
              <div className="text-sm text-slate-500">No analysis activity yet. Upload a resume to see results here.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-xs text-slate-400 py-4 border-t border-slate-100">
        SpellFolio AI &copy; 2026
      </div>
    </main>
  );
}
