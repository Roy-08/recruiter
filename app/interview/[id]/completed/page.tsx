"use client";

import { useParams, useRouter } from "next/navigation";
import { CheckCircle2, Home, Sparkles, Clock, Award, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

interface InterviewData {
  userName?: string;
  userEmail?: string;
  jobPosition?: string;
  status?: string;
  interviewData?: {
    questionList?: Array<{ question: string }>;
  };
}

export default function CompletedPage() {
  const params = useParams();
  const router = useRouter();
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInterviewData = async () => {
      try {
        console.log('📥 Fetching interview data for completed page...');
        const response = await axios.get(`/api/interviews/${params.id}`);
        if (response.data.success) {
          const data = response.data.data;
          console.log('✅ Interview data fetched:', data);
          setInterviewData(data);
        }
      } catch (error) {
        console.error('❌ Failed to fetch interview data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchInterviewData();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mb-4"></div>
          <div className="text-white text-xl font-semibold">Loading...</div>
        </div>
      </div>
    );
  }

  const candidateName = interviewData?.userName || 'Candidate';
  const jobPosition = interviewData?.jobPosition || 'the position';

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20"></div>
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "1.5s" }}></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "0.75s" }}></div>

      <div className="relative z-10 max-w-4xl mx-auto w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 rounded-full blur-3xl opacity-40 animate-pulse"></div>
            <div className="relative w-28 h-28 bg-gradient-to-br from-green-500 via-emerald-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl animate-bounce-slow">
              <CheckCircle2 className="w-14 h-14 text-white" strokeWidth={2.5} />
            </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
            Interview Completed!
          </h1>

          <p className="text-2xl text-gray-300 mb-2">
            Excellent work, <span className="text-transparent bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text font-bold">{candidateName}</span>!
          </p>
          <p className="text-gray-400">
            Position: <span className="text-blue-400 font-semibold">{jobPosition}</span>
          </p>
        </div>

        {/* Main Content Card */}
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 md:p-10 mb-8 shadow-2xl">
          {/* Success Message */}
          <div className="flex items-start gap-4 mb-8 pb-8 border-b border-gray-800">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <div className="text-left flex-1">
              <h3 className="text-2xl font-bold text-white mb-3">
                Your Responses Have Been Recorded
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Thank you for completing the interview! Our AI has successfully captured all your responses and is now analyzing your performance to generate a comprehensive evaluation report.
              </p>
            </div>
          </div>

          {/* Status Cards Grid */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                </div>
                <h4 className="text-white font-semibold">Completed</h4>
              </div>
              <p className="text-sm text-gray-400">All questions answered</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-400" />
                </div>
                <h4 className="text-white font-semibold">Processing</h4>
              </div>
              <p className="text-sm text-gray-400">AI analyzing responses</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-fuchsia-500/10 border border-purple-500/20 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-purple-400" />
                </div>
                <h4 className="text-white font-semibold">Evaluation</h4>
              </div>
              <p className="text-sm text-gray-400">Report being generated</p>
            </div>
          </div>

          {/* What Happens Next */}
          <div className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 border border-purple-500/20 rounded-xl p-6">
            <h4 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-400" />
              What Happens Next?
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-400 font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">AI Evaluation in Progress</p>
                  <p className="text-gray-400 text-sm">Our advanced AI is analyzing your responses, communication skills, and technical knowledge to provide detailed feedback.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-400 font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">Hiring Team Review</p>
                  <p className="text-gray-400 text-sm">The recruitment team will review your AI-generated evaluation report along with your interview performance.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-cyan-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-cyan-400 font-bold text-sm">3</span>
                </div>
                <div>
                  <p className="text-white font-semibold mb-1">We&apos;ll Contact You Soon</p>
                  <p className="text-gray-400 text-sm">You&apos;ll hear from us within the next few business days regarding the next steps in the hiring process.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        

        {/* Footer */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-gray-500 text-sm">
            Interview ID: <span className="font-mono text-gray-400">{params.id}</span>
          </p>
          <p className="text-gray-600 text-xs">
            Your interview data is securely stored and will be reviewed by our hiring team
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}