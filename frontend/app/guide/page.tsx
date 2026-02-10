"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen, FileText, Upload, CheckCircle2, Target, Briefcase,
  Layers, Zap, Star, AlertTriangle, ChevronDown, ChevronUp,
  ArrowRight, Lightbulb, Award, TrendingUp, Search, PenTool,
  Layout, BarChart3, Users, ExternalLink, Heart, Shield
} from "lucide-react";

/* ── Section Data ── */
const sections = [
  {
    id: "getting-started",
    icon: Zap,
    title: "Getting Started",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    id: "create-resume",
    icon: PenTool,
    title: "Creating Your Resume",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  {
    id: "analyzer",
    icon: Search,
    title: "ATS Resume Analyzer",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    id: "templates",
    icon: Layers,
    title: "Choosing Templates",
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    id: "job-match",
    icon: Briefcase,
    title: "Job Match & Predictions",
    color: "text-red-600",
    bg: "bg-red-50",
  },
  {
    id: "killer-resume",
    icon: Award,
    title: "How a Killer Resume Looks",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    id: "ats-tips",
    icon: Shield,
    title: "ATS Best Practices",
    color: "text-cyan-600",
    bg: "bg-cyan-50",
  },
  {
    id: "faq",
    icon: Heart,
    title: "FAQ & Common Mistakes",
    color: "text-pink-600",
    bg: "bg-pink-50",
  },
];

export default function GuidePage() {
  const [activeSection, setActiveSection] = useState("getting-started");

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Hero */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Complete User Guide</h1>
              <p className="text-slate-500 text-sm">Everything you need to build a professional, ATS-optimized resume</p>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Left Nav */}
          <nav className="hidden lg:block w-64 flex-shrink-0 sticky top-6 self-start">
            <div className="space-y-1">
              {sections.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveSection(s.id);
                    document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left ${
                    activeSection === s.id
                      ? `${s.bg} ${s.color} shadow-sm`
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`}
                >
                  <s.icon className="h-4 w-4 flex-shrink-0" />
                  {s.title}
                </button>
              ))}
            </div>
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0 space-y-12">

            {/* ═══ 1. GETTING STARTED ═══ */}
            <section id="getting-started">
              <SectionHeader icon={Zap} title="Getting Started" color="text-blue-600" bg="bg-blue-50" badge="Start Here" />
              <div className="space-y-4 mt-4">
                <p className="text-slate-700 leading-relaxed">
                  Welcome to SpellFolio — your all-in-one platform to create, analyze, and optimize your resume
                  for Applicant Tracking Systems (ATS). Over 90% of companies use ATS software to screen resumes before a human
                  ever sees them. This tool ensures your resume passes that critical first filter.
                </p>
                <StepList steps={[
                  { title: "Create an Account", desc: "Sign up with your email from the signup page. Your data is saved securely so you can return anytime." },
                  { title: "Build Your Resume", desc: "Go to Create Resume in the sidebar. Fill in your details step-by-step — contact, experience, projects, education, skills." },
                  { title: "Choose a Template", desc: "Pick from 4 professionally designed templates (Classic, Tokyo Pro, Austin Creative, Oslo Clean)." },
                  { title: "Analyze for ATS", desc: "Upload your resume PDF in the Analyzer to get an 8-dimension ATS score with specific improvement tips." },
                  { title: "Match with Jobs", desc: "Visit Job Match to see which companies match your skills, with real apply links to career pages." },
                ]} />
              </div>
            </section>

            {/* ═══ 2. CREATING YOUR RESUME ═══ */}
            <section id="create-resume">
              <SectionHeader icon={PenTool} title="Creating Your Resume" color="text-purple-600" bg="bg-purple-50" badge="7 Steps" />
              <div className="space-y-4 mt-4">
                <p className="text-slate-700 leading-relaxed">
                  The resume builder guides you through 7 structured steps. Each step collects specific information. You see
                  a live preview on the right side that updates as you type.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <StepCard num="1" title="Contact Information" desc="Name, email, phone, location, LinkedIn URL, GitHub profile. Every field matters — ATS systems scan for contact details." />
                  <StepCard num="2" title="Work Experience" desc="Job title, company name, dates, location, and bullet points. Use action verbs and quantify your achievements (e.g., 'Increased sales by 30%')." />
                  <StepCard num="3" title="Projects" desc="Side projects, academic projects, or open-source contributions. Include project name, technologies used, description, and key outcomes." />
                  <StepCard num="4" title="Education" desc="Degree, university name, dates, GPA (if strong). Keep it concise — 2-3 lines per entry." />
                  <StepCard num="5" title="AI Content Suggestions" desc="Our AI analyzes your content and suggests ATS-optimized replacements for every section — summary, bullets, and skills." />
                  <StepCard num="6" title="Skills" desc="Add technical and soft skills. The system matches these against job role requirements. Include tools, languages, and frameworks." />
                  <StepCard num="7" title="Finalize & Download" desc="Review the live preview, switch templates, and download as PDF. The PDF is ATS-compatible and print-ready." />
                </div>

                <TipBox icon={Lightbulb} title="Pro Tip" color="bg-purple-50 border-purple-200">
                  Click the &quot;Apply&quot; buttons on AI suggestions in Step 5 to instantly upgrade your bullet points with
                  stronger action verbs and quantified metrics.
                </TipBox>
              </div>
            </section>

            {/* ═══ 3. ATS ANALYZER ═══ */}
            <section id="analyzer">
              <SectionHeader icon={Search} title="ATS Resume Analyzer" color="text-green-600" bg="bg-green-50" badge="8 Dimensions" />
              <div className="space-y-4 mt-4">
                <p className="text-slate-700 leading-relaxed">
                  The Analyzer is the most powerful feature. Upload any resume (PDF, DOCX, or TXT), select a target job role,
                  and receive a comprehensive analysis scored across 8 dimensions.
                </p>

                <h3 className="font-bold text-slate-900 mt-6">The 8 Scoring Dimensions</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <DimensionCard title="Keyword Match" weight="25%" desc="How many critical, important, and bonus keywords from the job role appear in your resume." />
                  <DimensionCard title="Formatting & Structure" weight="15%" desc="Proper section headers, bullet points, no tables or images that ATS can't read." />
                  <DimensionCard title="Readability" weight="10%" desc="Sentence length, active vs. passive voice, strong action verbs vs. weak ones." />
                  <DimensionCard title="Section Completeness" weight="15%" desc="Does your resume have summary, experience, education, skills, and bonus sections?" />
                  <DimensionCard title="Contact Information" weight="10%" desc="Email, phone, LinkedIn, and location detected." />
                  <DimensionCard title="Quantified Impact" weight="10%" desc="Metrics and numbers (%, $, users, projects) in your bullet points." />
                  <DimensionCard title="Skill Alignment" weight="10%" desc="How well your listed skills match the role's required skills." />
                  <DimensionCard title="Company Fit" weight="5%" desc="How your profile matches specific companies hiring for this role." />
                </div>

                <TipBox icon={Target} title="How to Get 80+" color="bg-green-50 border-green-200">
                  Focus on Keyword Match (25% weight) and Section Completeness (15%) first. Add all missing critical
                  keywords to your skills or experience bullets. Ensure you have Summary, Experience, Education, and Skills sections.
                </TipBox>
              </div>
            </section>

            {/* ═══ 4. TEMPLATES ═══ */}
            <section id="templates">
              <SectionHeader icon={Layers} title="Choosing Templates" color="text-amber-600" bg="bg-amber-50" badge="4 Designs" />
              <div className="space-y-4 mt-4">
                <p className="text-slate-700 leading-relaxed">
                  All templates are ATS-compatible — they use clean HTML/CSS structure that ATS parsers can read. Pick one
                  that matches your industry and personality.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <TemplateCard name="Classic Professional" desc="Clean single-column layout. Best for traditional industries: finance, consulting, legal, government. Uses serif-inspired styling." />
                  <TemplateCard name="Tokyo Pro" desc="Two-column design with a dark sidebar. Great for tech roles: software engineering, data science, DevOps. Modern and compact." />
                  <TemplateCard name="Austin Creative" desc="Colored header banner with a warm design. Ideal for creative and marketing roles. Stands out while remaining ATS-safe." />
                  <TemplateCard name="Oslo Clean" desc="Minimalist timeline-dot layout. Perfect for design, product, and UX roles. Uses visual hierarchy without sacrificing readability." />
                </div>
              </div>
            </section>

            {/* ═══ 5. JOB MATCH ═══ */}
            <section id="job-match">
              <SectionHeader icon={Briefcase} title="Job Match & Predictions" color="text-red-600" bg="bg-red-50" badge="Live Data" />
              <div className="space-y-4 mt-4">
                <p className="text-slate-700 leading-relaxed">
                  The Job Match page pulls your analyzed skills from the database and matches them against 24+ real company
                  roles. Each company shows a match percentage, matched/missing skills, location, and a direct link
                  to their careers page.
                </p>

                <h3 className="font-bold text-slate-900 mt-6">How Matching Works</h3>
                <StepList steps={[
                  { title: "Skills Extraction", desc: "When you analyze a resume, the system extracts all keywords (critical, important, bonus) and skills from your resume text." },
                  { title: "Company Database", desc: "We maintain a database of 24+ company roles with extracted_skills from real job descriptions at Google, Amazon, Microsoft, Meta, etc." },
                  { title: "Score Calculation", desc: "Match % = (your matched skills / company's required skills) × 100. Higher match means better fit." },
                  { title: "Hiring Likelihood", desc: "Combines your ATS score (40% weight) with average match score (60% weight) to predict interview probability." },
                ]} />

                <TipBox icon={ExternalLink} title="Real Apply Links" color="bg-red-50 border-red-200">
                  Every company card has an &quot;Apply Now&quot; button that opens the company&apos;s actual careers page in a
                  new tab. You can also search across LinkedIn, Indeed, Glassdoor, and Naukri with pre-filled role queries.
                </TipBox>
              </div>
            </section>

            {/* ═══ 6. KILLER RESUME ═══ */}
            <section id="killer-resume">
              <SectionHeader icon={Award} title="How a Killer Resume Looks" color="text-indigo-600" bg="bg-indigo-50" badge="Must Read" />
              <div className="space-y-6 mt-4">
                <p className="text-slate-700 leading-relaxed">
                  A killer resume isn&apos;t about fancy design — it&apos;s about clear communication, measurable impact, and
                  strategic keyword placement. Here&apos;s what separates a good resume from a great one:
                </p>

                {/* Structure */}
                <Card className="border-indigo-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2"><Layout className="h-4 w-4 text-indigo-600" /> The Perfect Structure</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-slate-700">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-semibold text-slate-900 mb-2">Required Sections (in order)</p>
                        <ol className="space-y-1.5 list-decimal list-inside">
                          <li><strong>Contact Info</strong> — Name, phone, email, LinkedIn, city</li>
                          <li><strong>Professional Summary</strong> — 2-3 sentences, role-specific</li>
                          <li><strong>Work Experience</strong> — Reverse chronological, 3-5 bullets each</li>
                          <li><strong>Projects</strong> — 2-3 relevant projects with tech stack</li>
                          <li><strong>Education</strong> — Degree, university, dates</li>
                          <li><strong>Skills</strong> — Grouped by category (Languages, Frameworks, Tools)</li>
                        </ol>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 mb-2">Bonus Sections</p>
                        <ul className="space-y-1.5">
                          <li className="flex items-start gap-2"><Star className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" /> Certifications (AWS, Google, Azure)</li>
                          <li className="flex items-start gap-2"><Star className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" /> Awards & Achievements</li>
                          <li className="flex items-start gap-2"><Star className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" /> Publications or Talks</li>
                          <li className="flex items-start gap-2"><Star className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" /> Volunteer Experience</li>
                          <li className="flex items-start gap-2"><Star className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" /> Languages (Human languages)</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Bullet Points */}
                <Card className="border-indigo-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="h-4 w-4 text-indigo-600" /> Writing Killer Bullet Points</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-700">
                    <p className="mb-3">Every bullet point should follow the <strong>Action + Context + Result</strong> formula:</p>

                    <div className="space-y-4">
                      <div>
                        <p className="font-semibold text-red-600 text-xs uppercase mb-1">❌ Weak (Avoid These)</p>
                        <div className="space-y-1.5 bg-red-50 p-3 rounded-lg border border-red-100">
                          <p className="text-red-800">&quot;Worked on the backend team&quot;</p>
                          <p className="text-red-800">&quot;Responsible for managing databases&quot;</p>
                          <p className="text-red-800">&quot;Helped with testing&quot;</p>
                          <p className="text-red-800">&quot;Assisted in developing features&quot;</p>
                        </div>
                      </div>

                      <div>
                        <p className="font-semibold text-green-600 text-xs uppercase mb-1">✅ Strong (Use These)</p>
                        <div className="space-y-1.5 bg-green-50 p-3 rounded-lg border border-green-100">
                          <p className="text-green-800">&quot;Engineered RESTful API microservices handling 10K+ requests/min, reducing response latency by 40%&quot;</p>
                          <p className="text-green-800">&quot;Optimized PostgreSQL queries across 3 production databases, cutting average load time from 800ms to 200ms&quot;</p>
                          <p className="text-green-800">&quot;Spearheaded automated testing pipeline with 95% coverage, reducing production bugs by 60%&quot;</p>
                          <p className="text-green-800">&quot;Led cross-functional team of 5 engineers to deliver payment integration 2 weeks ahead of schedule&quot;</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                      <p className="font-semibold text-indigo-900 text-sm mb-2">Power Action Verbs to Use:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {["Engineered", "Architected", "Spearheaded", "Optimized", "Implemented", "Deployed",
                          "Automated", "Mentored", "Reduced", "Increased", "Launched", "Migrated",
                          "Designed", "Streamlined", "Orchestrated", "Delivered", "Scaled", "Transformed"
                        ].map((v) => (
                          <Badge key={v} className="bg-indigo-100 text-indigo-700 text-xs">{v}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Skills Section */}
                <Card className="border-indigo-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="h-4 w-4 text-indigo-600" /> Skills That Get You Hired</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-700 space-y-3">
                    <p>Group your skills by category for easy scanning:</p>
                    <div className="grid md:grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="font-semibold text-slate-900 mb-1">For Software Engineers</p>
                        <p className="text-xs"><strong>Languages:</strong> JavaScript, Python, Java, TypeScript</p>
                        <p className="text-xs"><strong>Frameworks:</strong> React, Node.js, Next.js, Express</p>
                        <p className="text-xs"><strong>Tools:</strong> Docker, Git, AWS, PostgreSQL, Redis</p>
                        <p className="text-xs"><strong>Practices:</strong> CI/CD, Agile, System Design, Testing</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="font-semibold text-slate-900 mb-1">For Data Analysts</p>
                        <p className="text-xs"><strong>Languages:</strong> Python, SQL, R</p>
                        <p className="text-xs"><strong>Tools:</strong> Tableau, Power BI, Excel, BigQuery</p>
                        <p className="text-xs"><strong>Libraries:</strong> Pandas, NumPy, Matplotlib, Scikit-learn</p>
                        <p className="text-xs"><strong>Practices:</strong> A/B Testing, Statistics, ETL, Reporting</p>
                      </div>
                    </div>
                    <TipBox icon={AlertTriangle} title="Mistake to Avoid" color="bg-amber-50 border-amber-200">
                      Never list generic skills like &quot;Microsoft Office&quot; or &quot;Teamwork&quot; at the top.
                      Lead with role-specific technical skills — that&apos;s what ATS scanners look for first.
                    </TipBox>
                  </CardContent>
                </Card>

                {/* Resume Length */}
                <Card className="border-indigo-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4 text-indigo-600" /> The Right Length</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-slate-700">
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                        <p className="text-2xl font-bold text-green-700">1 Page</p>
                        <p className="text-xs text-green-600 mt-1">Students &amp; 0-3 yrs experience</p>
                      </div>
                      <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <p className="text-2xl font-bold text-blue-700">1-2 Pages</p>
                        <p className="text-xs text-blue-600 mt-1">3-10 yrs experience</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <p className="text-2xl font-bold text-purple-700">2 Pages</p>
                        <p className="text-xs text-purple-600 mt-1">Senior / Management roles</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-3">
                      For students: <strong>Always one page.</strong> Recruiters spend 6-7 seconds on an initial scan. Make every word count.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* ═══ 7. ATS BEST PRACTICES ═══ */}
            <section id="ats-tips">
              <SectionHeader icon={Shield} title="ATS Best Practices" color="text-cyan-600" bg="bg-cyan-50" badge="Critical" />
              <div className="space-y-4 mt-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <DoCard title="DO: Use Standard Section Headers" items={[
                    "\"Experience\" not \"Where I've Worked\"",
                    "\"Education\" not \"Academic Journey\"",
                    "\"Skills\" not \"What I'm Good At\"",
                    "\"Projects\" not \"Things I've Built\"",
                  ]} />
                  <DontCard title="DON'T: Include These" items={[
                    "Tables, columns, or complex layouts",
                    "Images, logos, or graphics",
                    "Headers or footers (ATS can't read them)",
                    "Fancy fonts or colored text",
                  ]} />
                  <DoCard title="DO: Format Correctly" items={[
                    "Save as PDF (best) or DOCX",
                    "Use 10-12pt standard fonts (Arial, Calibri, Helvetica)",
                    "1-inch margins all around",
                    "Consistent date format (Jan 2024 – Present)",
                  ]} />
                  <DontCard title="DON'T: Make These Errors" items={[
                    "Typos or grammatical errors",
                    "Unexplained employment gaps",
                    "Listing every job you ever had",
                    "Using pronouns (\"I\", \"me\", \"my\")",
                  ]} />
                </div>

                <TipBox icon={Shield} title="The #1 Rule" color="bg-cyan-50 border-cyan-200">
                  <strong>Tailor your resume for each job application.</strong> Study the job description, identify the top 5-10 keywords,
                  and naturally include them in your experience and skills sections. Our Analyzer shows you exactly which keywords you&apos;re missing.
                </TipBox>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">ATS File Format Priority</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="flex-1 text-center p-3 bg-green-50 rounded-lg border-2 border-green-300">
                        <p className="text-lg font-bold text-green-700">PDF</p>
                        <p className="text-xs text-green-600">Best Choice</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-300 flex-shrink-0" />
                      <div className="flex-1 text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-lg font-bold text-blue-700">DOCX</p>
                        <p className="text-xs text-blue-600">Good Choice</p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-slate-300 flex-shrink-0" />
                      <div className="flex-1 text-center p-3 bg-red-50 rounded-lg border border-red-200">
                        <p className="text-lg font-bold text-red-700">DOC / TXT</p>
                        <p className="text-xs text-red-600">Avoid</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>

            {/* ═══ 8. FAQ ═══ */}
            <section id="faq">
              <SectionHeader icon={Heart} title="FAQ & Common Mistakes" color="text-pink-600" bg="bg-pink-50" badge="Help" />
              <div className="space-y-3 mt-4">
                <FAQItem
                  q="What is an ATS and why does it matter?"
                  a="An Applicant Tracking System (ATS) is software that companies use to filter resumes before a human recruiter sees them. Over 90% of Fortune 500 companies use ATS. If your resume isn't ATS-optimized, it may never reach a human — regardless of how qualified you are."
                />
                <FAQItem
                  q="What score should I aim for?"
                  a="Aim for 75+ to consistently pass ATS screening. Scores above 85 are excellent. If you're below 60, focus on adding missing keywords, quantifying your achievements, and ensuring all required sections are present."
                />
                <FAQItem
                  q="Should I use the same resume for every application?"
                  a="No! You should tailor your resume for each job. Study the job description, identify the top keywords, and adjust your summary, skills, and bullet points accordingly. Our Analyzer shows you exactly which keywords each role expects."
                />
                <FAQItem
                  q="How many bullet points per job?"
                  a="3-5 bullets for recent or relevant roles, 2-3 for older ones. Every bullet should start with a strong action verb and include a measurable outcome when possible."
                />
                <FAQItem
                  q="Should I include my photo on my resume?"
                  a="No — not for US/UK/Canada/India markets. It can trigger unconscious bias and ATS systems can't parse images. Some European countries expect photos, but when in doubt, leave it out."
                />
                <FAQItem
                  q="What if I'm a student with no work experience?"
                  a="Focus on Projects, Internships, Academic work, Hackathons, and relevant coursework. Lead with a strong summary that highlights your target role and technical skills. Our Projects section in the builder is perfect for this."
                />
                <FAQItem
                  q="How does the Job Match percentage work?"
                  a="We compare your skills (extracted from your analyzed resume) against the required skills for each company role in our database. Match % = (your matched skills ÷ total required skills) × 100."
                />
                <FAQItem
                  q="Can I download my resume as PDF?"
                  a="Yes! After building your resume in the Create Resume page, click 'Download PDF' in the final step. The PDF preserves the exact template design and is ATS-compatible."
                />
              </div>
            </section>

            {/* Footer */}
            <div className="text-center text-xs text-slate-400 py-8 border-t border-slate-100 mt-12">
              SpellFolio &copy; 2026 — Built to help students land their dream jobs.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ═══════ Reusable Components ═══════ */

function SectionHeader({ icon: Icon, title, color, bg, badge }: { icon: any; title: string; color: string; bg: string; badge: string }) {
  return (
    <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
      <div className={`h-9 w-9 ${bg} rounded-lg flex items-center justify-center`}>
        <Icon className={`h-4.5 w-4.5 ${color}`} />
      </div>
      <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      <Badge className="bg-slate-100 text-slate-600 text-[10px]">{badge}</Badge>
    </div>
  );
}

function StepList({ steps }: { steps: { title: string; desc: string }[] }) {
  return (
    <div className="space-y-3">
      {steps.map((step, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="h-6 w-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">
            {i + 1}
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">{step.title}</p>
            <p className="text-xs text-slate-600 mt-0.5">{step.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function StepCard({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="p-4 rounded-lg border border-slate-200 bg-white hover:shadow-sm transition-shadow">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-6 w-6 rounded bg-purple-600 flex items-center justify-center text-white text-xs font-bold">{num}</div>
        <p className="font-semibold text-slate-900 text-sm">{title}</p>
      </div>
      <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}

function DimensionCard({ title, weight, desc }: { title: string; weight: string; desc: string }) {
  return (
    <div className="p-3 rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between mb-1">
        <p className="font-semibold text-slate-900 text-sm">{title}</p>
        <Badge className="bg-green-100 text-green-700 text-[10px]">{weight}</Badge>
      </div>
      <p className="text-xs text-slate-600">{desc}</p>
    </div>
  );
}

function TemplateCard({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="p-4 rounded-lg border border-slate-200 bg-white">
      <p className="font-semibold text-slate-900 text-sm mb-1">{name}</p>
      <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}

function TipBox({ icon: Icon, title, color, children }: { icon: any; title: string; color: string; children?: React.ReactNode }) {
  return (
    <div className={`p-4 rounded-lg border ${color}`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4 flex-shrink-0" />
        <p className="font-semibold text-sm">{title}</p>
      </div>
      <div className="text-xs text-slate-700 leading-relaxed">{children}</div>
    </div>
  );
}

function DoCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="p-4 rounded-lg bg-green-50 border border-green-200">
      <p className="font-semibold text-green-800 text-sm mb-2 flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> {title}</p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-green-700 flex items-start gap-1.5">
            <span className="mt-0.5">✓</span> {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function DontCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="p-4 rounded-lg bg-red-50 border border-red-200">
      <p className="font-semibold text-red-800 text-sm mb-2 flex items-center gap-1.5"><AlertTriangle className="h-4 w-4" /> {title}</p>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-red-700 flex items-start gap-1.5">
            <span className="mt-0.5">✗</span> {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-lg bg-white overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors">
        <p className="font-medium text-slate-900 text-sm pr-4">{q}</p>
        {open ? <ChevronUp className="h-4 w-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-slate-100">
          <p className="text-sm text-slate-600 leading-relaxed pt-3">{a}</p>
        </div>
      )}
    </div>
  );
}
