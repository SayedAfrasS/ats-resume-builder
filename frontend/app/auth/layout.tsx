import { FileText } from "lucide-react";
import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      {/* Full-screen background image */}
      <Image
        src="/auth_banner.jpeg"
        alt="SpellFolio"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/40" />

      {/* Content layer */}
      <div className="relative z-10 flex min-h-screen">
        {/* Left side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">SpellFolio</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-4 leading-tight text-white drop-shadow-lg">
              Build Resumes That<br />
              Beat the Bots
            </h1>
            <p className="text-white/80 text-lg max-w-md drop-shadow">
              Our AI-powered platform helps you create ATS-optimized resumes
              that get past automated filters and into the hands of recruiters.
            </p>
            <div className="flex items-center gap-6 mt-8 text-sm text-white/80">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                AI Content
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                ATS Scoring
              </div>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                Job Match
              </div>
            </div>
          </div>
          <p className="text-white/60 text-sm">&copy; 2026 SpellFolio. All rights reserved.</p>
        </div>

        {/* Right side - Auth Form */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
              <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">SpellFolio</span>
            </div>
            <div className="bg-white/95 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-white/30">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
