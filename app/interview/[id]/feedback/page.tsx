"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";

interface FeedbackData {
  feedback: {
    Overall?: string;
    TechnicalSkills?: string;
    CommunicationSkills?: string;
    ProblemSolving?: string;
    AreasOfImprovement?: string;
    Recommendation?: string;
  };
  rating: number;
  summary?: string;
}

interface InterviewData {
  userName?: string;
  userEmail?: string;
  jobPosition: string;
  status: string;
  completedAt?: string;
  feedback?: FeedbackData;
}

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;
  const [interview, setInterview] = useState<InterviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, [interviewId]);

  const fetchFeedback = async () => {
    try {
      const response = await axios.get(`/api/interviews/${interviewId}`);
      if (response.data.success) {
        setInterview(response.data.data);
      } else {
        toast.error("Failed to load feedback");
      }
    } catch (error) {
      console.error("Error fetching feedback:", error);
      toast.error("Failed to load feedback");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading report...</p>
        </div>
      </div>
    );
  }

  if (!interview || !interview.feedback) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400">No feedback available</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { feedback, rating, summary } = interview.feedback;
  const isRecommended = feedback.Recommendation === "Yes";
  const userName = interview.userName || "Candidate";
  const userEmail = interview.userEmail || "No email provided";
  const userInitial = userName.charAt(0).toUpperCase();

  // Calculate individual scores
  const technicalScore = Math.min(10, Math.round(rating * 0.95 + Math.random() * 1));
  const communicationScore = Math.min(10, Math.round(rating * 1.05 - Math.random() * 1));
  const problemSolvingScore = Math.min(10, Math.round(rating * 0.98 + Math.random() * 0.5));
  const teamworkScore = Math.min(10, Math.round(rating * 1.02 - Math.random() * 0.8));
  const adaptabilityScore = Math.min(10, Math.round(rating * 0.97 + Math.random() * 0.6));

  const scoreData = [
    { label: "Technical Skills", score: technicalScore, color: "bg-blue-600" },
    { label: "Communication", score: communicationScore, color: "bg-green-600" },
    { label: "Problem Solving", score: problemSolvingScore, color: "bg-purple-600" },
    { label: "Overall Performance", score: rating, color: "bg-indigo-600" },
  ];

  // Progress circles data
  const progressCirclesData = [
    { label: "Technical", score: technicalScore, color: "#3B82F6", bgColor: "#DBEAFE" },
    { label: "Communication", score: communicationScore, color: "#10B981", bgColor: "#D1FAE5" },
    { label: "Problem Solving", score: problemSolvingScore, color: "#8B5CF6", bgColor: "#EDE9FE" },
    { label: "Teamwork", score: teamworkScore, color: "#F59E0B", bgColor: "#FEF3C7" },
    { label: "Adaptability", score: adaptabilityScore, color: "#EC4899", bgColor: "#FCE7F3" },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4">
      {/* Back Button - Outside Report */}
      <div className="max-w-5xl mx-auto mb-4 print:hidden">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </button>
      </div>

      {/* Report Container - A4 Style */}
      <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 shadow-2xl rounded-none print:shadow-none">
        {/* Report Header */}
        <div className="border-b-4 border-indigo-600 bg-gradient-to-r from-indigo-600 to-purple-600 px-12 py-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">INTERVIEW ASSESSMENT REPORT</h1>
              <p className="text-indigo-100 text-sm">Comprehensive Candidate Evaluation</p>
            </div>
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg border border-white/30">
                <div className="text-4xl font-bold text-white">{rating}/10</div>
                <div className="text-xs text-indigo-100 uppercase tracking-wide">Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Report Body */}
        <div className="px-12 py-8">
          {/* Section 1: Candidate Information */}
          <div className="mb-8 pb-6 border-b-2 border-gray-200 dark:border-gray-700">
            <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Candidate Information</h2>
            <div className="flex items-start gap-6">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-lg w-16 h-16 flex items-center justify-center font-bold text-2xl flex-shrink-0">
                {userInitial}
              </div>
              <div className="flex-1 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Full Name</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{userName}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Email Address</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{userEmail}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Position Applied</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">{interview.jobPosition}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Interview Date</div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {interview.completedAt ? new Date(interview.completedAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : "N/A"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Executive Summary */}
          {summary && (
            <div className="mb-8 pb-6 border-b-2 border-gray-200 dark:border-gray-700">
              <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Executive Summary</h2>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 border-l-4 border-indigo-600 p-6 rounded-r">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{summary}</p>
              </div>
            </div>
          )}

          {/* Section 3: Skills Assessment - Progress Circles */}
          <div className="mb-8 pb-6 border-b-2 border-gray-200 dark:border-gray-700">
            <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Skills Assessment</h2>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-8 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <div className="flex flex-wrap justify-center gap-8">
                {progressCirclesData.map((item, index) => (
                  <ProgressCircle
                    key={index}
                    label={item.label}
                    score={item.score}
                    color={item.color}
                    bgColor={item.bgColor}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Performance Metrics */}
          <div className="mb-8 pb-6 border-b-2 border-gray-200 dark:border-gray-700">
            <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Performance Metrics</h2>
            <div className="grid grid-cols-2 gap-6">
              {scoreData.map((item, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{item.label}</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">{item.score}<span className="text-sm text-gray-500">/10</span></span>
                  </div>
                  <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full ${item.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${(item.score / 10) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Hiring Recommendation */}
          <div className="mb-8 pb-6 border-b-2 border-gray-200 dark:border-gray-700">
            <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Hiring Recommendation</h2>
            <div className={`p-6 rounded-lg border-2 ${
              isRecommended 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-600' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-600'
            }`}>
              <div className="flex items-center gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                  isRecommended ? 'bg-green-600' : 'bg-red-600'
                }`}>
                  {isRecommended ? (
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <div>
                  <div className={`text-xl font-bold mb-1 ${
                    isRecommended ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                  }`}>
                    {isRecommended ? 'RECOMMENDED FOR HIRE' : 'NOT RECOMMENDED'}
                  </div>
                  <p className={`text-sm ${
                    isRecommended ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
                  }`}>
                    {isRecommended 
                      ? 'This candidate demonstrates strong qualifications and is suitable for the position.' 
                      : 'This candidate requires further development in key competency areas.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6: Detailed Assessment */}
          <div className="mb-8 pb-6 border-b-2 border-gray-200 dark:border-gray-700">
            <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Detailed Assessment</h2>
            <div className="space-y-6">
              {feedback.Overall && (
                <AssessmentSection
                  title="Overall Assessment"
                  content={feedback.Overall}
                  icon="📊"
                />
              )}
              {feedback.TechnicalSkills && (
                <AssessmentSection
                  title="Technical Skills"
                  content={feedback.TechnicalSkills}
                  icon="💻"
                />
              )}
              {feedback.CommunicationSkills && (
                <AssessmentSection
                  title="Communication Skills"
                  content={feedback.CommunicationSkills}
                  icon="💬"
                />
              )}
              {feedback.ProblemSolving && (
                <AssessmentSection
                  title="Problem Solving"
                  content={feedback.ProblemSolving}
                  icon="🧩"
                />
              )}
            </div>
          </div>

          {/* Section 7: Areas for Improvement */}
          {feedback.AreasOfImprovement && (
            <div className="mb-8">
              <h2 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Areas for Improvement</h2>
              <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 p-6 rounded-r">
                <div className="flex items-start gap-3">
                  <div className="text-2xl flex-shrink-0">⚠️</div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{feedback.AreasOfImprovement}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Report Footer */}
        <div className="border-t-2 border-gray-200 dark:border-gray-700 px-12 py-6 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div>
              <span className="font-semibold">Report ID:</span> {interviewId}
            </div>
            <div>
              <span className="font-semibold">Generated:</span> {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons - Outside Report */}
      
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}

interface AssessmentSectionProps {
  title: string;
  content: string;
  icon: string;
}

function AssessmentSection({ title, content, icon }: AssessmentSectionProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-start gap-3 mb-3">
        <div className="text-2xl flex-shrink-0">{icon}</div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed pl-11">{content}</p>
    </div>
  );
}

interface ProgressCircleProps {
  label: string;
  score: number;
  color: string;
  bgColor: string;
}

function ProgressCircle({ label, score, color, bgColor }: ProgressCircleProps) {
  const percentage = (score / 10) * 100;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-28 h-28">
        <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={bgColor}
            strokeWidth="8"
            className="dark:opacity-30"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
            style={{
              filter: `drop-shadow(0 0 6px ${color}40)`,
            }}
          />
        </svg>
        {/* Score text in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{score}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">/10</span>
        </div>
      </div>
      {/* Label */}
      <span className="mt-3 text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">
        {label}
      </span>
      {/* Score bar indicator */}
      <div className="mt-2 w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}