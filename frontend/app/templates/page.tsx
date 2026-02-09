"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Star, FileText, Layers, ChevronDown, Check, Sparkles, Eye
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const templates = [
  {
    id: "start-from-scratch",
    name: "Start from Scratch",
    desc: "Build your own resume with our AI assistant",
    category: "all",
    isFree: true,
    isBlank: true,
    atsScore: null,
  },
  {
    id: "the-zurich",
    name: "The Zurich",
    desc: "ATS Score: 98% • Clean & Minimal",
    category: "ats-friendly",
    isFree: true,
    atsScore: 98,
    color: "from-slate-50 to-white",
  },
  {
    id: "corporate-edge",
    name: "Corporate Edge",
    desc: "ATS Score: 96% • Professional Bold",
    category: "professional",
    isFree: true,
    atsScore: 96,
    color: "from-blue-50 to-white",
  },
  {
    id: "berlin-mono",
    name: "Berlin Mono",
    desc: "ATS Score: 94% • Modern Minimal",
    category: "minimal",
    isFree: true,
    atsScore: 94,
    color: "from-slate-100 to-white",
  },
  {
    id: "the-boardroom",
    name: "The Boardroom",
    desc: "ATS Score: 97% • Executive Style",
    category: "executive",
    isFree: false,
    atsScore: 97,
    color: "from-amber-50 to-white",
  },
  {
    id: "scholar-v1",
    name: "Scholar V1",
    desc: "ATS Score: 95% • Academic Focus",
    category: "academic",
    isFree: true,
    atsScore: 95,
    color: "from-green-50 to-white",
  },
  {
    id: "palo-alto",
    name: "Palo Alto",
    desc: "ATS Score: 93% • Tech Industry",
    category: "professional",
    isFree: false,
    atsScore: 93,
    color: "from-purple-50 to-white",
  },
  {
    id: "the-traditionalist",
    name: "The Traditionalist",
    desc: "ATS Score: 99% • Classic Format",
    category: "ats-friendly",
    isFree: true,
    atsScore: 99,
    color: "from-gray-50 to-white",
  },
];

const categories = [
  { value: "all", label: "All Levels" },
  { value: "ats-friendly", label: "ATS Friendly" },
  { value: "professional", label: "Professional" },
  { value: "minimal", label: "Minimal" },
  { value: "academic", label: "Academic" },
  { value: "executive", label: "Executive" },
];

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const filtered = selectedCategory === "all"
    ? templates
    : templates.filter((t) => t.category === selectedCategory);

  return (
    <main className="flex-1 overflow-y-auto p-6 lg:p-8 page-transition">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Choose your ATS-Optimized Foundation</h1>
          <p className="text-slate-500 mt-2 max-w-xl mx-auto">
            Select a professionally designed template that guarantees readability for recruiters and Automated Tracking Systems.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === cat.value
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
              }`}
            >
              {cat.label}
            </button>
          ))}
          <Button variant="outline" size="sm" className="rounded-full">
            Apply Filters
          </Button>
        </div>

        {/* Templates Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-lg group ${
                selectedTemplate === template.id ? "ring-2 ring-blue-600" : ""
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <CardContent className="p-0">
                {/* Preview Area */}
                <div className={`relative h-52 bg-gradient-to-b ${template.color || "from-slate-50 to-white"} rounded-t-lg flex items-center justify-center overflow-hidden`}>
                  {template.isBlank ? (
                    <div className="flex flex-col items-center text-slate-400">
                      <div className="h-16 w-16 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center mb-3">
                        <FileText className="h-7 w-7" />
                      </div>
                      <span className="text-sm font-medium">Blank Canvas</span>
                    </div>
                  ) : (
                    <>
                      {/* Mini resume preview */}
                      <div className="w-[70%] h-[85%] bg-white shadow-sm rounded border border-slate-100 p-3 text-[6px] leading-relaxed text-slate-400">
                        <div className="h-2 w-16 bg-slate-200 rounded mb-1.5" />
                        <div className="h-1 w-24 bg-slate-100 rounded mb-2" />
                        <div className="h-1.5 w-12 bg-blue-100 rounded mb-1" />
                        <div className="space-y-1">
                          <div className="h-1 w-full bg-slate-100 rounded" />
                          <div className="h-1 w-[80%] bg-slate-100 rounded" />
                          <div className="h-1 w-[90%] bg-slate-100 rounded" />
                        </div>
                        <div className="h-1.5 w-10 bg-blue-100 rounded mt-2 mb-1" />
                        <div className="space-y-1">
                          <div className="h-1 w-full bg-slate-100 rounded" />
                          <div className="h-1 w-[70%] bg-slate-100 rounded" />
                        </div>
                      </div>
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-100 shadow-lg">
                          <Eye className="h-3.5 w-3.5 mr-1.5" /> Preview
                        </Button>
                      </div>
                      {/* Tags */}
                      {template.atsScore && (
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-green-100 text-green-700 text-[9px]">ATS {template.atsScore}%</Badge>
                        </div>
                      )}
                      {!template.isFree && (
                        <div className="absolute top-2 left-2">
                          <Badge className="bg-amber-100 text-amber-700 text-[9px]">
                            <Star className="h-2.5 w-2.5 mr-0.5" /> Pro
                          </Badge>
                        </div>
                      )}
                    </>
                  )}
                  {selectedTemplate === template.id && (
                    <div className="absolute top-2 left-2">
                      <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center">
                        <Check className="h-3.5 w-3.5 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 text-sm">{template.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{template.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More */}
        <div className="flex justify-center mt-8">
          <Button variant="outline" className="gap-2">
            Load More Templates <ChevronDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Use Template Button */}
        {selectedTemplate && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
            <Link href="/builder">
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-xl px-8 h-12 text-base gap-2">
                <Sparkles className="h-4 w-4" />
                Use &quot;{templates.find(t => t.id === selectedTemplate)?.name}&quot; Template
              </Button>
            </Link>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 py-8 mt-4 border-t border-slate-100">
          &copy; 2026 ResumeBuilder SaaS. All templates are ATS-certified.
        </div>
      </div>
    </main>
  );
}
