import { FileText } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 text-white flex-col justify-between p-12">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 bg-white/20 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">ATS Resume AI</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Build Resumes That<br />
            Beat the Bots
          </h1>
          <p className="text-blue-200 text-lg max-w-md">
            Our AI-powered platform helps you create ATS-optimized resumes
            that get past automated filters and into the hands of recruiters.
          </p>
          <div className="flex items-center gap-6 mt-8 text-sm text-blue-200">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-white/10 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
              AI Content
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-white/10 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
              ATS Scoring
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-white/10 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
              Job Match
            </div>
          </div>
        </div>
        <p className="text-blue-300 text-sm">&copy; 2026 ATS Resume AI. All rights reserved.</p>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">ATS Resume AI</span>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
