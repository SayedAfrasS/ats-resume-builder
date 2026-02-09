"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ui/score-ring";
import {
  FileText, ArrowUpRight, AlertCircle, CheckCircle2,
  Briefcase, Download, Upload, Plus, Lightbulb,
  Clock, Star, BookOpen
} from "lucide-react";
import { useApp } from "@/lib/context";

export default function DashboardPage() {
  const { user, atsResult } = useApp();
  const score = atsResult?.totalScore || 85;
  const userName = user?.name || "Alex";

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 page-transition">
      {/* Welcome Bar */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">Welcome back, {userName}. Your resume is performing better than 78% of applicants.</p>
      </div>

      {/* Top Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
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
                <p className="text-xs text-slate-500 mt-2">Calculated from 4 active resumes</p>
              </div>
              <ScoreRing score={score} size={80} strokeWidth={6} label="" />
            </div>
          </CardContent>
        </Card>

        {/* Last Resume Generated */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Resume Generated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900 truncate">Senior_Product_Designer_v2.pdf</p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Clock className="h-3 w-3" /> Generated 2 hours ago
                </p>
              </div>
            </div>
            <Button variant="link" className="px-0 mt-3 text-blue-600 h-auto text-sm">
              <Download className="h-3.5 w-3.5 mr-1" /> Download Copy
            </Button>
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
            <Badge variant="destructive" className="text-xs">3 Critical Actions</Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 border border-amber-100">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900 text-sm">Add more quantifiable achievements</p>
                <p className="text-xs text-slate-500 mt-0.5">Resumes with &quot;Increased sales by 30%&quot; perform 40% better.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
              <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900 text-sm">Include &apos;Python&apos; in skills section</p>
                <p className="text-xs text-slate-500 mt-0.5">We detected this keyword in 85% of your matched job descriptions.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
              <Lightbulb className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-slate-900 text-sm">Improve job title clarity</p>
                <p className="text-xs text-slate-500 mt-0.5">Your title &quot;Creative Generalist&quot; is too vague for most ATS parsers.</p>
              </div>
            </div>
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
              <Button variant="outline" size="sm" className="mt-4 w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white">
                <BookOpen className="h-3.5 w-3.5 mr-1.5" /> Read Full Guide
              </Button>
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
            {[
              { company: "Google", role: "Senior Product Designer", match: 92, color: "bg-slate-900" },
              { company: "Stripe", role: "UX Engineer", match: 88, color: "bg-indigo-600" },
            ].map((job, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-lg ${job.color} flex items-center justify-center text-white font-bold text-sm`}>{job.company[0]}</div>
                  <div>
                    <p className="font-medium text-slate-900 text-sm">{job.role}</p>
                    <p className="text-xs text-slate-500">{job.company} • Remote</p>
                  </div>
                </div>
                <Badge variant="success">{job.match}% Match</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Recent Activity</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { icon: CheckCircle2, color: "text-green-500", title: "Resume Analyzed", desc: "Marketing_Resume_final.pdf", time: "2h ago" },
              { icon: FileText, color: "text-blue-500", title: "Resume Created", desc: "Senior_Product_Designer_v2.pdf", time: "5h ago" },
              { icon: Briefcase, color: "text-purple-500", title: "Account Created", desc: "Welcome to ATS Resume AI", time: "1d ago" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <item.icon className={`h-5 w-5 ${item.color} mt-0.5`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500 truncate">{item.desc}</p>
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">{item.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="text-center text-xs text-slate-400 py-4 border-t border-slate-100">
        ATS Resume AI &copy; 2026
      </div>
    </main>
  );
}
