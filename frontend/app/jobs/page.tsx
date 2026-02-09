"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ui/score-ring";
import {
  TrendingUp, Target, Lightbulb, Briefcase, MapPin,
  ExternalLink, BarChart3, ArrowUpRight, ChevronRight,
  Bookmark, Building2, Users
} from "lucide-react";
import { useApp } from "@/lib/context";
import toast from "react-hot-toast";

export default function JobMatchPage() {
  const { atsResult, companyMatches, resumeData } = useApp();
  const [selectedRole, setSelectedRole] = useState("Senior Product Designer");

  const score = atsResult?.totalScore || 85;
  const matches = companyMatches?.length > 0 ? companyMatches : [
    { company: "Google", matchScore: 92, hiringProbability: 88 },
    { company: "Zoho", matchScore: 85, hiringProbability: 78 },
    { company: "Freshworks", matchScore: 80, hiringProbability: 72 },
  ];

  const keywordGaps = [
    { label: "Design Systems", type: "important" },
    { label: "Figma Variants", type: "important" },
    { label: "User Research", type: "important" },
    { label: "A/B Testing", type: "important" },
    { label: "Prototyping", type: "important" },
  ];

  const strongMatches = [
    { label: "Visual Design" },
    { label: "Accessibility" },
    { label: "Typography" },
  ];

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 page-transition">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Job Match & Prediction Analytics</h1>
            <p className="text-slate-500 mt-1">Evaluate your current resume against real-time market requirements for specific roles.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-600">Target Job Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Senior Product Designer</option>
              <option>Software Engineer</option>
              <option>Data Analyst</option>
              <option>UX Engineer</option>
            </select>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* Resume Match Score */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resume Match Score</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-bold text-slate-900">{score}%</span>
                    <Badge variant="success" className="text-[10px]">
                      <ArrowUpRight className="h-3 w-3 mr-0.5" />+8.5%
                    </Badge>
                  </div>
                </div>
                <div className="h-14 w-14 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Target className="h-7 w-7 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-slate-500">Your profile is highly optimized for this role compared to 85% of other applicants.</p>
            </CardContent>
          </Card>

          {/* Hiring Likelihood */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hiring Likelihood</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-bold text-slate-900">High</span>
                    <span className="text-sm text-slate-500">Score: 8.3</span>
                  </div>
                </div>
                <div className="h-14 w-14 bg-green-50 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-7 w-7 text-green-600" />
                </div>
              </div>
              <p className="text-xs text-slate-500">Based on historical data from similar candidates, you have a 3.4x higher chance of reaching the interview stage.</p>
            </CardContent>
          </Card>

          {/* Market Demand */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Market Demand</p>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-bold text-slate-900">Stable</span>
                    <span className="text-sm text-slate-500">824 Openings</span>
                  </div>
                </div>
                <div className="h-14 w-14 bg-purple-50 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-7 w-7 text-purple-600" />
                </div>
              </div>
              {/* Mini bar chart */}
              <div className="flex items-end gap-1 h-8 mt-2">
                {[40, 55, 65, 50, 70, 80, 75, 85, 90, 82].map((h, i) => (
                  <div key={i} className={`flex-1 rounded-sm ${i >= 7 ? "bg-blue-600" : "bg-slate-200"}`} style={{ height: `${h}%` }} />
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
                Keyword Gaps (ATS Optimization)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {keywordGaps.map((kw, i) => (
                  <Badge key={i} variant="destructive" className="px-3 py-1.5 text-xs">
                    {kw.label}
                  </Badge>
                ))}
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4 mb-2">Strongest Matches</p>
              <div className="flex flex-wrap gap-2">
                {strongMatches.map((kw, i) => (
                  <Badge key={i} variant="success" className="px-3 py-1.5 text-xs">
                    {kw.label}
                  </Badge>
                ))}
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
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 text-sm">Quantify Your Impact</p>
                  <p className="text-xs text-slate-500">Add metrics like &quot;15%&quot; to your experience section.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ExternalLink className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 text-sm">Update Portfolio Link</p>
                  <p className="text-xs text-slate-500">Include a case study specifically highlighting Design Systems.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Target className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900 text-sm">Professional Summary</p>
                  <p className="text-xs text-slate-500">Change &quot;Strategic Product Designer&quot; for better ATS parsing.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Companies Hiring */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Companies Hiring for This Role</h2>
            <Button variant="link" className="text-blue-600">
              View all 824 jobs <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {matches.map((match, i) => {
              const companies = [
                { name: match.company, role: selectedRole, location: "San Francisco, CA", color: "bg-green-600" },
              ];
              const company = companies[0];
              return (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 ${company.color} rounded-lg flex items-center justify-center text-white font-bold`}>
                          {match.company[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{selectedRole}</p>
                          <p className="text-xs text-slate-500">{match.company}</p>
                        </div>
                      </div>
                      <Badge variant="success" className="text-[10px]">{match.matchScore}% Match</Badge>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mb-4">
                      <MapPin className="h-3 w-3" /> San Francisco, CA
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => toast.success("Apply flow coming soon!")}>
                        Apply Now
                      </Button>
                      <Button size="sm" variant="outline" className="px-3">
                        <Bookmark className="h-4 w-4" />
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
          &copy; 2026 ATS Resume AI. Powered by Next-Gen ATS Data.
        </div>
      </div>
    </main>
  );
}
