/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Calendar, Clock, Briefcase, Users } from "lucide-react";

interface Interview {
  _id: string;
  jobPosition: string;
  jobDescription: string;
  duration: string;
  interviewTypes: string[];
  experienceLevel: string;
  numberOfQuestions: string;
  questions: any[];
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function SchedulesPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/interviews");
      if (!response.ok) {
        console.error("Failed to fetch interviews:", response.status);
        return;
      }
      const text = await response.text();
      if (!text) {
        console.error("Empty response from interviews API");
        return;
      }
      const data = JSON.parse(text);
      if (data.success) {
        setInterviews(data.data);
      }
    } catch (error) {
      console.error("Error fetching interviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async (interviewId: string) => {
    try {
      const link = `${window.location.origin}/interview/${interviewId}`;
      await navigator.clipboard.writeText(link);
      setCopiedId(interviewId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
      case "completed":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400";
    }
  };

  const interviewTypeOptions: { [key: string]: { label: string; icon: string } } = {
    technical: { label: "Technical", icon: "💻" },
    behavioral: { label: "Behavioral", icon: "👤" },
    experience: { label: "Experience", icon: "💼" },
    problemSolving: { label: "Problem Solving", icon: "🧩" },
    leadership: { label: "Leadership", icon: "⚡" },
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Schedules</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {interviews.length > 0 
              ? `${interviews.length} interview${interviews.length !== 1 ? "s" : ""} created`
              : "Manage your interview schedules"
            }
          </p>
        </div>
        <button 
          onClick={() => window.location.href = '/dashboard'}
          className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-xl hover:scale-105 duration-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Schedule Interview
        </button>
      </div>

      {/* Statistics */}
      {interviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Interviews</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{interviews.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {interviews.filter((i) => i.status === "scheduled").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {interviews.filter((i) => i.status === "completed").length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-lg">
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 dark:text-gray-400">Loading interviews...</p>
          </div>
        </div>
      ) : interviews.length === 0 ? (
        <>
          {/* Empty State - Calendar View */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Interview Calendar</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View and manage your interview schedule</p>
            </div>
            <div className="flex flex-col items-center justify-center py-20 text-gray-500 dark:text-gray-400">
              <div className="relative">
                <svg className="w-24 h-24 mb-6 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur-2xl opacity-10"></div>
              </div>
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No schedules yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">Click &quot;Schedule Interview&quot; to create your first schedule</p>
            </div>
          </div>

          {/* Empty State - Upcoming Schedules */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upcoming This Week</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your scheduled interviews for this week</p>
            </div>
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <div className="relative">
                <svg className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full blur-2xl opacity-10"></div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">No upcoming interviews this week</p>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Interview Grid - 4 cards per row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {interviews.map((interview) => (
              <div
                key={interview._id}
                className="group relative bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-xl transition-all duration-300"
              >
                {/* Header */}
                <div className="mb-3">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1 flex-1">
                      {interview.jobPosition}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${getStatusColor(interview.status)}`}>
                      {interview.status}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">
                      {interview.duration} min
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <span className="text-xs text-gray-700 dark:text-gray-300 capitalize">
                      {interview.experienceLevel}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-pink-600 dark:text-pink-400 flex-shrink-0" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">
                      {interview.numberOfQuestions} Questions
                    </span>
                  </div>
                </div>

                {/* Interview Types */}
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {interview.interviewTypes.slice(0, 2).map((type) => (
                      <span
                        key={type}
                        className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400"
                      >
                        {interviewTypeOptions[type]?.icon}
                      </span>
                    ))}
                    {interview.interviewTypes.length > 2 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400">
                        +{interview.interviewTypes.length - 2}
                      </span>
                    )}
                  </div>
                </div>

                {/* Copy Link Button */}
                <button
                  onClick={() => handleCopyLink(interview._id)}
                  className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                    copiedId === interview._id
                      ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                      : "bg-indigo-500 hover:bg-indigo-600 text-white"
                  }`}
                >
                  {copiedId === interview._id ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>

                {/* Timestamp */}
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(interview.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}