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
  {
    id: "oslo-clean",
    name: "Oslo Clean",
    desc: "ATS Score: 97% • Scandinavian Minimal",
    category: "minimal",
    isFree: true,
    atsScore: 97,
    color: "from-slate-50 to-white",
  },
  {
    id: "tokyo-pro",
    name: "Tokyo Pro",
    desc: "ATS Score: 96% • Tech Executive",
    category: "professional",
    isFree: true,
    atsScore: 96,
    color: "from-indigo-50 to-white",
  },
  {
    id: "austin-creative",
    name: "Austin Creative",
    desc: "ATS Score: 94% • Modern Creative",
    category: "professional",
    isFree: true,
    atsScore: 94,
    color: "from-rose-50 to-white",
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
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);

  const filtered = selectedCategory === "all"
    ? templates
    : templates.filter((t) => t.category === selectedCategory);

  const activeTemplate = templates.find((t) => t.id === previewTemplate || t.id === selectedTemplate);

  const handleUseTemplate = (templateId: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("selected_template", templateId);
    }
  };

  /* ─── Shared sample data for template previews ─── */
  const sampleName = "Alex Johnson";
  const sampleContact = "San Francisco, CA • alex@email.com • +1 (555) 000-0000";
  const sampleSummary = "Results-oriented product designer with 6+ years delivering user-centric experiences across SaaS platforms.";
  const sampleExp = {
    title: "Senior Product Designer",
    company: "DesignCo",
    location: "Remote",
    dates: "2020 – Present",
    bullets: [
      "Improved conversion by 23% through A/B tested UI flows.",
      "Led cross-functional workshops with 6+ stakeholders.",
    ],
  };
  const sampleSkills = ["Figma", "Prototyping", "UX Research", "Design Systems", "React"];
  const sampleEdu = { degree: "B.S. Computer Science", school: "Stanford University", dates: "2014 – 2018" };

  const TemplatePreview = ({ templateId }: { templateId: string }) => {
    if (templateId === "start-from-scratch") {
      return (
        <div className="flex items-center justify-center h-full text-slate-400 text-sm">
          Blank canvas ready for your content.
        </div>
      );
    }

    /* ═══════ TOKYO PRO — Two-column with dark sidebar ═══════ */
    if (templateId === "tokyo-pro") {
      return (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-slate-200 flex text-[11px] leading-relaxed min-h-[340px]">
          {/* Left dark sidebar */}
          <div className="w-[38%] bg-slate-900 text-white p-5">
            <div className="mb-5">
              <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center text-white text-lg font-bold mb-2.5">A</div>
              <h2 className="text-base font-bold">{sampleName}</h2>
              <p className="text-indigo-300 text-[10px] mt-0.5">Product Designer</p>
            </div>
            <div className="mb-4">
              <h4 className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 mb-1.5">Contact</h4>
              <p className="text-slate-300 text-[10px] leading-relaxed">San Francisco, CA<br/>alex@email.com<br/>+1 (555) 000-0000</p>
            </div>
            <div className="mb-4">
              <h4 className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 mb-1.5">Skills</h4>
              <div className="flex flex-wrap gap-1">
                {sampleSkills.map((s, i) => (
                  <span key={i} className="px-1.5 py-0.5 bg-slate-800 rounded text-[9px] text-slate-300">{s}</span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 mb-1.5">Education</h4>
              <p className="text-slate-300 text-[10px]">{sampleEdu.degree}</p>
              <p className="text-slate-400 text-[9px]">{sampleEdu.school}</p>
              <p className="text-slate-500 text-[9px]">{sampleEdu.dates}</p>
            </div>
          </div>
          {/* Right content area */}
          <div className="flex-1 p-5">
            <div className="mb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-1.5">Profile</h3>
              <p className="text-slate-600">{sampleSummary}</p>
            </div>
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 mb-2">Experience</h3>
              <div className="relative pl-3 border-l-2 border-indigo-200">
                <div className="absolute -left-[5px] top-0 h-2 w-2 rounded-full bg-indigo-500" />
                <div className="mb-1">
                  <span className="font-semibold text-slate-900">{sampleExp.title}</span>
                  <span className="text-slate-400 text-[9px] ml-2">{sampleExp.dates}</span>
                </div>
                <p className="text-slate-500 text-[10px] mb-1">{sampleExp.company} • {sampleExp.location}</p>
                <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                  {sampleExp.bullets.map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      );
    }

    /* ═══════ AUSTIN CREATIVE — Colored header banner ═══════ */
    if (templateId === "austin-creative") {
      return (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-slate-200 text-[11px] leading-relaxed">
          {/* Hero banner */}
          <div className="bg-gradient-to-r from-rose-500 to-orange-400 px-6 py-5 text-white">
            <h2 className="text-xl font-extrabold tracking-tight">{sampleName}</h2>
            <p className="text-rose-100 text-[10px] mt-0.5">{sampleContact}</p>
          </div>
          <div className="p-5">
            {/* Summary */}
            <div className="mb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-1">About Me</h3>
              <p className="text-slate-600 italic">{sampleSummary}</p>
            </div>
            {/* Skills as pill badges */}
            <div className="mb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-1.5">Core Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {sampleSkills.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-rose-50 text-rose-700 rounded-full text-[10px] font-medium border border-rose-200">{s}</span>
                ))}
              </div>
            </div>
            {/* Experience as cards */}
            <div className="mb-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-1.5">Experience</h3>
              <div className="bg-rose-50/50 border border-rose-100 rounded-lg p-3">
                <div className="flex justify-between items-baseline mb-0.5">
                  <span className="font-bold text-slate-900">{sampleExp.title}</span>
                  <span className="text-rose-400 text-[9px] font-medium">{sampleExp.dates}</span>
                </div>
                <p className="text-slate-500 text-[10px] mb-1">{sampleExp.company} • {sampleExp.location}</p>
                <ul className="space-y-0.5 text-slate-600">
                  {sampleExp.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-rose-400 mt-0.5">▸</span>{b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* Education */}
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-1">Education</h3>
              <p className="text-slate-700 font-semibold">{sampleEdu.degree}</p>
              <p className="text-slate-500 text-[10px]">{sampleEdu.school} — {sampleEdu.dates}</p>
            </div>
          </div>
        </div>
      );
    }

    /* ═══════ OSLO CLEAN — Timeline dots, left-aligned ═══════ */
    if (templateId === "oslo-clean") {
      return (
        <div className="bg-white shadow-sm rounded-lg p-6 text-[11px] leading-relaxed border border-slate-200">
          {/* Left-aligned name with thick accent line */}
          <div className="mb-4 pb-3 border-b-2 border-slate-800">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">{sampleName}</h2>
            <p className="text-slate-400 text-[10px] mt-1 font-mono">{sampleContact}</p>
          </div>
          {/* Summary */}
          <div className="mb-4">
            <p className="text-slate-600">{sampleSummary}</p>
          </div>
          {/* Experience with timeline */}
          <div className="mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Experience</h3>
            <div className="relative pl-4">
              <div className="absolute left-[5px] top-1 bottom-0 w-px bg-slate-200" />
              <div className="relative mb-2">
                <div className="absolute -left-[11.5px] top-1 h-2.5 w-2.5 rounded-full border-2 border-slate-400 bg-white" />
                <div className="flex justify-between items-baseline">
                  <span className="font-bold text-slate-800">{sampleExp.title}</span>
                  <span className="text-slate-400 text-[9px] font-mono">{sampleExp.dates}</span>
                </div>
                <p className="text-slate-400 text-[10px]">{sampleExp.company} · {sampleExp.location}</p>
                <ul className="mt-1 text-slate-600 space-y-0.5">
                  {sampleExp.bullets.map((b, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-slate-300 mt-0.5">—</span>{b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          {/* Skills as simple pipe-separated */}
          <div className="mb-4">
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1.5">Skills</h3>
            <p className="text-slate-700 font-mono text-[10px]">{sampleSkills.join("  |  ")}</p>
          </div>
          {/* Education */}
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-1.5">Education</h3>
            <p className="text-slate-800 font-semibold">{sampleEdu.degree}</p>
            <p className="text-slate-400 text-[10px] font-mono">{sampleEdu.school} — {sampleEdu.dates}</p>
          </div>
        </div>
      );
    }

    /* ═══════ DEFAULT — Classic single-column (all other templates) ═══════ */
    const accentMap: Record<string, string> = {
      "corporate-edge": "text-slate-800",
      "berlin-mono": "text-emerald-700",
      "the-boardroom": "text-amber-700",
      "scholar-v1": "text-green-700",
      "palo-alto": "text-purple-700",
      "the-traditionalist": "text-slate-900",
    };
    const accent = accentMap[templateId] || "text-blue-700";
    const border = templateId === "the-traditionalist" ? "border-slate-300" : "border-slate-200";

    return (
      <div className={`bg-white shadow-sm rounded-lg p-6 text-[11px] leading-relaxed border ${border}`}>
        <div className="text-center mb-4">
          <h2 className={`text-lg font-bold uppercase tracking-wide ${accent}`}>{sampleName}</h2>
          <p className="text-slate-500 text-[10px] mt-1">{sampleContact}</p>
        </div>
        <div className="mb-3">
          <h3 className={`text-[11px] font-bold uppercase border-b pb-1 mb-1.5 ${accent} ${border}`}>Professional Summary</h3>
          <p className="text-slate-600">{sampleSummary}</p>
        </div>
        <div className="mb-3">
          <h3 className={`text-[11px] font-bold uppercase border-b pb-1 mb-1.5 ${accent} ${border}`}>Experience</h3>
          <div className="mb-2">
            <div className="flex justify-between items-baseline">
              <span className="font-semibold text-slate-900">{sampleExp.title}</span>
              <span className="text-slate-400 text-[9px]">{sampleExp.dates}</span>
            </div>
            <p className="text-slate-500 text-[10px]">{sampleExp.company} • {sampleExp.location}</p>
            <ul className="list-disc list-inside mt-1 text-slate-600 space-y-0.5">
              {sampleExp.bullets.map((b, i) => <li key={i}>{b}</li>)}
            </ul>
          </div>
        </div>
        <div className="mb-3">
          <h3 className={`text-[11px] font-bold uppercase border-b pb-1 mb-1.5 ${accent} ${border}`}>Skills</h3>
          <p className="text-slate-600">{sampleSkills.join(", ")}</p>
        </div>
      </div>
    );
  };

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
                      {/* Mini resume preview — varies per template */}
                      {template.id === "tokyo-pro" ? (
                        <div className="w-[70%] h-[85%] bg-white shadow-sm rounded border border-slate-100 flex overflow-hidden text-[5px]">
                          <div className="w-[38%] bg-slate-900 p-2">
                            <div className="h-3 w-3 rounded-full bg-indigo-500 mb-1.5" />
                            <div className="h-1.5 w-10 bg-slate-700 rounded mb-1" />
                            <div className="h-1 w-8 bg-slate-700 rounded mb-2" />
                            <div className="space-y-0.5">{[1,2,3].map(k=><div key={k} className="h-1 w-9 bg-slate-800 rounded"/>)}</div>
                          </div>
                          <div className="flex-1 p-2">
                            <div className="h-1.5 w-8 bg-indigo-100 rounded mb-1" />
                            <div className="space-y-0.5 mb-2">{[1,2].map(k=><div key={k} className="h-1 w-full bg-slate-100 rounded"/>)}</div>
                            <div className="h-1.5 w-10 bg-indigo-100 rounded mb-1" />
                            <div className="space-y-0.5">{[1,2,3].map(k=><div key={k} className="h-1 w-full bg-slate-100 rounded"/>)}</div>
                          </div>
                        </div>
                      ) : template.id === "austin-creative" ? (
                        <div className="w-[70%] h-[85%] bg-white shadow-sm rounded border border-slate-100 overflow-hidden text-[5px]">
                          <div className="bg-gradient-to-r from-rose-400 to-orange-300 h-8 px-2 flex items-end pb-1">
                            <div className="h-2 w-14 bg-white/40 rounded" />
                          </div>
                          <div className="p-2">
                            <div className="h-1.5 w-10 bg-rose-100 rounded mb-1" />
                            <div className="flex gap-1 mb-2">{[1,2,3].map(k=><div key={k} className="h-2 w-6 bg-rose-50 border border-rose-200 rounded-full"/>)}</div>
                            <div className="bg-rose-50/70 border border-rose-100 rounded p-1.5 mb-2">
                              <div className="h-1 w-full bg-rose-100 rounded mb-0.5" />
                              <div className="h-1 w-[80%] bg-rose-100 rounded" />
                            </div>
                            <div className="h-1 w-12 bg-slate-100 rounded" />
                          </div>
                        </div>
                      ) : template.id === "oslo-clean" ? (
                        <div className="w-[70%] h-[85%] bg-white shadow-sm rounded border border-slate-100 p-3 text-[5px]">
                          <div className="border-b-2 border-slate-700 pb-1.5 mb-2">
                            <div className="h-2.5 w-20 bg-slate-800 rounded mb-0.5" />
                            <div className="h-1 w-24 bg-slate-200 rounded" />
                          </div>
                          <div className="h-1 w-full bg-slate-100 rounded mb-2" />
                          <div className="h-1 w-12 bg-slate-300 rounded mb-1.5" />
                          <div className="pl-2 border-l border-slate-200 space-y-1 mb-2">
                            <div className="h-1 w-full bg-slate-100 rounded" />
                            <div className="h-1 w-[80%] bg-slate-100 rounded" />
                          </div>
                          <div className="h-1 w-10 bg-slate-300 rounded mb-1" />
                          <div className="h-1 w-full bg-slate-100 rounded" />
                        </div>
                      ) : (
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
                      )}
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                        <Button
                          size="sm"
                          className="bg-white text-slate-900 hover:bg-slate-100 shadow-lg"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewTemplate(template.id);
                          }}
                        >
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
            <Link href={`/builder?template=${selectedTemplate}`}>
              <Button
                className="bg-blue-600 hover:bg-blue-700 shadow-xl px-8 h-12 text-base gap-2"
                onClick={() => handleUseTemplate(selectedTemplate)}
              >
                <Sparkles className="h-4 w-4" />
                Use &quot;{templates.find(t => t.id === selectedTemplate)?.name}&quot; Template
              </Button>
            </Link>
          </div>
        )}

        {/* Preview Modal */}
        {previewTemplate && activeTemplate && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 px-6">
            <div className="w-full max-w-3xl rounded-xl bg-white shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                <div>
                  <h3 className="font-semibold text-slate-900">{activeTemplate.name} Preview</h3>
                  <p className="text-xs text-slate-500">{activeTemplate.desc}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setPreviewTemplate(null)}>Close</Button>
              </div>
              <div className="p-6 bg-slate-50">
                <TemplatePreview templateId={activeTemplate.id} />
              </div>
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
                <Button variant="outline" onClick={() => setPreviewTemplate(null)}>Cancel</Button>
                <Link href={`/builder?template=${activeTemplate.id}`}>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleUseTemplate(activeTemplate.id)}
                  >
                    Use This Template
                  </Button>
                </Link>
              </div>
            </div>
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
