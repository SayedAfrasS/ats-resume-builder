import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, FileText, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Navigation */}
      <header className="flex h-16 items-center justify-between px-6 border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
          <FileText className="h-6 w-6" />
          <span>ATS Resume AI</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link href="#features">Features</Link>
            <Link href="#pricing">Pricing</Link>
            <Link href="#about">About</Link>
        </nav>
        <div className="flex items-center gap-4">
            <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/signup">
                <Button>Get Started</Button>
            </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 tracking-tight mb-6">
                Build an <span className="text-blue-600">ATS-Friendly</span> Resume <br/> in Minutes with AI
            </h1>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10">
                Stop getting rejected by bots. Our AI-powered resume builder optimizes your resume for Applicant Tracking Systems (ATS) to increase your interview chances.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth/signup">
                    <Button size="lg" className="h-12 px-8 text-lg">
                        Build My Resume
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </Link>
                <Link href="/dashboard">
                    <Button variant="outline" size="lg" className="h-12 px-8 text-lg">
                        View Demo Dashboard
                    </Button>
                </Link>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 bg-slate-50 px-6">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Why Choose ATS Resume AI?</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-6">
                            <Zap className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">AI Content Generation</h3>
                        <p className="text-slate-600">Automatically generate professional summaries and bullet points tailored to your job role.</p>
                    </div>
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                        <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600 mb-6">
                            <CheckCircle className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Real-time ATS Scoring</h3>
                        <p className="text-slate-600">Get instant feedback on your resume's formatting, keywords, and readability.</p>
                    </div>
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
                        <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-6">
                            <FileText className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-3">Smart Templates</h3>
                        <p className="text-slate-600">Choose from a variety of ATS-optimized templates that recruiters love.</p>
                    </div>
                </div>
            </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-100 py-12 px-6 text-center text-slate-500 text-sm">
        © 2026 ATS Resume AI. All rights reserved.
      </footer>
    </div>
  );
}
