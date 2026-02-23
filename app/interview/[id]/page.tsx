"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, ArrowRight, Loader2, Shield, Sparkles, Zap } from "lucide-react";
import Image from "next/image";

interface Question {
  id: string;
  question: string;
  type: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit?: number;
}

interface Interview {
  _id: string;
  jobPosition: string;
  jobDescription: string;
  duration: string;
  interviewTypes: string[];
  experienceLevel: string;
  numberOfQuestions: string;
  questions: Question[];
  status: string;
  createdAt: string;
}

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchInterview(params.id as string);
    }
  }, [params.id]);

  const fetchInterview = async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/interviews/${id}`);
      
      if (!response.ok) {
        throw new Error("Interview not found");
      }

      const text = await response.text();
      if (!text) {
        throw new Error("Empty response from server");
      }

      const data = JSON.parse(text);
      
      if (data.success) {
        setInterview(data.data);
      } else {
        throw new Error(data.error || "Failed to load interview");
      }
    } catch (err) {
      console.error("Error fetching interview:", err);
      setError(err instanceof Error ? err.message : "Failed to load interview");
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!candidateName.trim() || !candidateEmail.trim()) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      router.push(`/interview/${params.id}/start?name=${encodeURIComponent(candidateName)}&email=${encodeURIComponent(candidateEmail)}`);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-lg">Loading interview...</p>
        </div>
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="h-screen bg-[#0a0e1a] flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Interview Not Found</h1>
          <p className="text-gray-400 mb-6">
            {error || "The interview you're looking for doesn't exist."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-semibold transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0e1a] relative overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a2332_1px,transparent_1px),linear-gradient(to_bottom,#1a2332_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)] opacity-30"></div>
      
      {/* Gradient Orbs - Purple & Cyan matching the image */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-purple-600/25 rounded-full blur-[140px] animate-pulse"></div>
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-fuchsia-600/15 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="relative h-full flex flex-col">
        {/* Logo Header */}
        <div className="absolute top-6 left-6 z-10">
          <div className="flex items-center gap-3">
            <div className="w-35 h-12 relative">
              <Image
                src="/logo.png"
                alt="AI Interview Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              
              {/* Left Column - Image */}
              <div className="hidden lg:block">
                <div className="relative">
                  {/* Glow Effect */}
                  <div className="absolute -inset-6 bg-gradient-to-r from-purple-600/40 via-fuchsia-600/40 to-cyan-600/40 rounded-3xl blur-3xl opacity-70"></div>
                  
                  {/* Image Container */}
                  <div className="relative rounded-2xl overflow-hidden border border-purple-500/20 shadow-2xl">
                    <div className="aspect-[4/3] relative">
                      <Image
                        src="https://mgx-backend-cdn.metadl.com/generate/images/957017/2026-02-06/f97362bf-0f7a-4b52-a1be-0b2cef0aa73a.png"
                        alt="AI Interview Platform"
                        fill
                        className="object-cover"
                        priority
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a]/70 via-transparent to-transparent"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 to-cyan-900/10 mix-blend-overlay"></div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-6 left-6">
                      <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-lg border border-white/20">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span className="text-white font-bold text-sm">AI Ready</span>
                      </div>
                    </div>
                  </div>

                  {/* Decorative Floating Elements */}
                  <div className="absolute -top-8 -right-8 w-32 h-32 bg-gradient-to-br from-purple-500 to-fuchsia-500 rounded-full blur-3xl opacity-50 animate-pulse"></div>
                  <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full blur-3xl opacity-50 animate-pulse" style={{ animationDelay: '1.5s' }}></div>
                </div>
              </div>

              {/* Right Column - Content */}
              <div className="space-y-6">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 via-fuchsia-500/10 to-cyan-500/10 border border-purple-500/30 rounded-full backdrop-blur-sm">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span className="text-sm font-semibold bg-gradient-to-r from-purple-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                    Next-Gen AI Assessment
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                    {interview.jobPosition}
                  </h1>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                      <Clock className="w-4 h-4 text-purple-400" />
                      <span className="text-white font-medium text-sm">{interview.duration} Minutes</span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                      <Zap className="w-4 h-4 text-cyan-400" />
                      <span className="text-white font-medium text-sm">AI Powered</span>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <div className="bg-white/[0.03] backdrop-blur-xl border border-purple-500/10 rounded-2xl p-6 shadow-2xl">
                  <form onSubmit={handleStartInterview} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={candidateName}
                        onChange={(e) => setCandidateName(e.target.value)}
                        placeholder="Enter your name"
                        className="w-full px-4 py-3 bg-black/40 border border-purple-500/20 rounded-xl text-white placeholder-gray-500 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={candidateEmail}
                        onChange={(e) => setCandidateEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 bg-black/40 border border-purple-500/20 rounded-xl text-white placeholder-gray-500 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* Quick Tips */}
                    <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="text-white font-semibold text-sm mb-2">Pre-Interview Checklist</h4>
                          <ul className="space-y-1.5 text-xs text-gray-300">
                            <li className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-purple-400 rounded-full"></div>
                              <span>Ensure camera & microphone are working</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                              <span>Stable internet connection required</span>
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1 h-1 bg-fuchsia-400 rounded-full"></div>
                              <span>Find a quiet, well-lit space</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting || !candidateName.trim() || !candidateEmail.trim()}
                      className="w-full group relative overflow-hidden px-6 py-4 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-600 hover:from-purple-500 hover:via-fuchsia-500 hover:to-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                      <div className="relative flex items-center justify-center gap-2">
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Launching Interview...</span>
                          </>
                        ) : (
                          <>
                            <span>Begin Interview</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </div>
                    </button>

                    <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1.5">
                      <Shield className="w-3 h-3" />
                      <span>Encrypted & Secure</span>
                    </p>
                  </form>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}