/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Briefcase, CheckCircle, Clock, TrendingUp, Star, Mail, X, ChevronDown, ChevronUp } from "lucide-react";

interface Candidate {
  _id: string;
  userName: string;
  userEmail: string;
  rating: number;
  status: string;
  completedAt?: string;
  feedback?: any;
}

interface Interview {
  _id: string;
  jobPosition: string;
  questionList: any[];
  candidates: Candidate[];
}

export default function AllInterviewsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [expandedInterviews, setExpandedInterviews] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
      const response = await axios.get("/api/interviews/all");
      if (response.data.success) {
        setInterviews(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching interviews:", error);
      toast.error("Failed to load interviews");
    } finally {
      setLoading(false);
    }
  };

  const filteredInterviews = interviews.filter((interview) =>
    interview.jobPosition?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalInterviews = interviews.reduce((acc, int) => acc + (int.candidates?.length || 0), 0);
  const completedInterviews = interviews.reduce(
    (acc, int) => acc + (int.candidates?.filter((c) => c.status === "completed").length || 0),
    0
  );
  const pendingInterviews = interviews.reduce(
    (acc, int) => acc + (int.candidates?.filter((c) => c.status === "pending").length || 0),
    0
  );

  const getInitial = (name?: string) => {
    if (!name || name.trim() === "") return "?";
    return name.charAt(0).toUpperCase();
  };

  const toggleExpand = (interviewId: string) => {
    const newExpanded = new Set(expandedInterviews);
    if (newExpanded.has(interviewId)) {
      newExpanded.delete(interviewId);
    } else {
      newExpanded.add(interviewId);
    }
    setExpandedInterviews(newExpanded);
  };

  const handleViewDetails = (interview: Interview) => {
    setSelectedInterview(interview);
  };

  const handleViewFeedback = (candidateId: string) => {
    router.push(`/interview/${candidateId}/feedback`);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return {
          bg: "bg-gradient-to-r from-green-500 to-emerald-600",
          text: "text-white",
          icon: <CheckCircle className="w-4 h-4" />,
          label: "Completed"
        };
      case "in-progress":
        return {
          bg: "bg-gradient-to-r from-blue-500 to-cyan-600",
          text: "text-white",
          icon: <Clock className="w-4 h-4" />,
          label: "In Progress"
        };
      case "pending":
        return {
          bg: "bg-gradient-to-r from-yellow-500 to-orange-600",
          text: "text-white",
          icon: <Clock className="w-4 h-4" />,
          label: "Pending"
        };
      default:
        return {
          bg: "bg-gradient-to-r from-gray-500 to-gray-600",
          text: "text-white",
          icon: <Clock className="w-4 h-4" />,
          label: "Unknown"
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-5xl font-bold text-white mb-4">
              Interview Management Hub
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              Track, manage, and analyze all your candidate interviews in one place
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Statistics Dashboard - REDESIGNED VERSION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
        >
          {[
            { 
              label: "Total Interviews", 
              value: totalInterviews, 
              icon: <TrendingUp className="w-10 h-10" />, 
              gradient: "from-blue-500 via-blue-600 to-cyan-600",
              iconBg: "from-blue-400 to-cyan-500",
              borderColor: "border-blue-500/30"
            },
            { 
              label: "Completed", 
              value: completedInterviews, 
              icon: <CheckCircle className="w-10 h-10" />, 
              gradient: "from-green-500 via-emerald-600 to-teal-600",
              iconBg: "from-green-400 to-emerald-500",
              borderColor: "border-green-500/30"
            },
            { 
              label: "Pending", 
              value: pendingInterviews, 
              icon: <Clock className="w-10 h-10" />, 
              gradient: "from-yellow-500 via-orange-500 to-red-500",
              iconBg: "from-yellow-400 to-orange-500",
              borderColor: "border-orange-500/30"
            },
            { 
              label: "Positions", 
              value: interviews.length, 
              icon: <Briefcase className="w-10 h-10" />, 
              gradient: "from-purple-500 via-pink-600 to-rose-600",
              iconBg: "from-purple-400 to-pink-500",
              borderColor: "border-purple-500/30"
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`relative bg-gradient-to-br ${stat.gradient} rounded-2xl shadow-2xl p-6 border-2 ${stat.borderColor} hover:shadow-3xl transition-all duration-300 overflow-hidden group`}
            >
              {/* Glossy overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent opacity-50"></div>
              
              {/* Content */}
              <div className="relative z-10 flex flex-col h-full">
                {/* Icon at top */}
                <div className="flex justify-between items-start mb-4">
                  <div className={`bg-gradient-to-br ${stat.iconBg} p-3 rounded-xl shadow-lg text-white`}>
                    {stat.icon}
                  </div>
                </div>
                
                {/* Number - Large and Bold */}
                <div className="flex-1 flex items-center">
                  <p className="text-6xl font-black text-white drop-shadow-lg">
                    {stat.value}
                  </p>
                </div>
                
                {/* Label at bottom */}
                <div className="mt-4">
                  <p className="text-sm font-bold text-white/90 uppercase tracking-wider">
                    {stat.label}
                  </p>
                  {/* Bottom accent bar */}
                  <div className="mt-2 h-1 w-full bg-white/30 rounded-full">
                    <div className="h-full w-3/4 bg-white/60 rounded-full"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <Search className="w-6 h-6 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by job position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-14 pr-6 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg transition-all"
            />
          </div>
        </motion.div>

        {/* Interview Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {filteredInterviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="text-8xl mb-6 opacity-40">📋</div>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">No interviews found</p>
              <p className="text-base text-gray-500 dark:text-gray-400">Start conducting interviews to see them here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInterviews.map((interview, index) => {
                const completedCount = interview.candidates?.filter((c) => c.status === "completed").length || 0;
                const totalCandidates = interview.candidates?.length || 0;
                const completionRate = totalCandidates > 0 ? Math.round((completedCount / totalCandidates) * 100) : 0;
                const isExpanded = expandedInterviews.has(interview._id);

                return (
                  <motion.div
                    key={interview._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 dark:border-gray-700"
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 w-16 h-16 flex items-center justify-center shadow-lg">
                          <div className="text-2xl font-bold text-white">
                            {getInitial(interview.jobPosition)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">
                            {interview.jobPosition || "Untitled Position"}
                          </h3>
                          <div className="flex items-center gap-1 text-white/90 text-sm">
                            <span>❓</span>
                            <span className="font-semibold">{interview.questionList?.length || 0}</span>
                            <span>Questions</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 space-y-4">
                      {/* Candidates Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                          <span className="text-2xl">👥</span>
                          <span className="font-semibold text-lg">{totalCandidates}</span>
                          <span className="text-sm">Candidates</span>
                        </div>
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-lg text-sm font-bold shadow-md">
                          {completionRate}% Done
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                          <span>Progress</span>
                          <span>{completedCount}/{totalCandidates}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${completionRate}%` }}
                            transition={{ duration: 1, delay: index * 0.1 }}
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleViewDetails(interview)}
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-md"
                        >
                          <span>View Details</span>
                        </button>
                        <button
                          onClick={() => toggleExpand(interview._id)}
                          className="px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all shadow-md"
                        >
                          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                      </div>

                      {/* Quick Preview - Expandable */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden border-t border-gray-200 dark:border-gray-700 pt-4 mt-4"
                          >
                            <div className="space-y-3">
                              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quick Stats:</div>
                              <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                                  <div className="text-lg font-bold text-green-600 dark:text-green-400">{completedCount}</div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
                                </div>
                                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                                  <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                    {interview.candidates?.filter((c) => c.status === "in-progress").length || 0}
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">In Progress</div>
                                </div>
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded-lg">
                                  <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                                    {interview.candidates?.filter((c) => c.status === "pending").length || 0}
                                  </div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">Pending</div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedInterview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedInterview(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 w-16 h-16 flex items-center justify-center">
                      <div className="text-2xl font-bold text-white">
                        {getInitial(selectedInterview.jobPosition)}
                      </div>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-white">
                        {selectedInterview.jobPosition || "Untitled Position"}
                      </h2>
                      <div className="flex items-center gap-4 text-white/90 mt-1">
                        <span className="flex items-center gap-1">
                          <span>👥</span>
                          <span className="font-semibold">{selectedInterview.candidates?.length || 0} Candidates</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <span>❓</span>
                          <span className="font-semibold">{selectedInterview.questionList?.length || 0} Questions</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedInterview(null)}
                    className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 space-y-6">
                {/* Questions Section */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-600 p-3 rounded-lg">
                      <span className="text-2xl">❓</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Interview Questions</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedInterview.questionList?.length || 0} questions</p>
                    </div>
                  </div>
                  {selectedInterview.questionList && selectedInterview.questionList.length > 0 ? (
                    <div className="space-y-3">
                      {selectedInterview.questionList.map((q: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex gap-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
                        >
                          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                            {idx + 1}
                          </div>
                          <p className="flex-1 text-gray-800 dark:text-gray-200 pt-0.5">
                            {q?.question || q || "No question text"}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No questions available
                    </div>
                  )}
                </div>

                {/* Candidates Section */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-purple-600 p-3 rounded-lg">
                      <span className="text-2xl">👥</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Candidates</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{selectedInterview.candidates?.length || 0} candidates</p>
                    </div>
                  </div>
                  {!selectedInterview.candidates || selectedInterview.candidates.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      No candidates yet
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedInterview.candidates.map((candidate) => {
                        const statusConfig = getStatusConfig(candidate.status);
                        return (
                          <div
                            key={candidate._id}
                            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start gap-3 mb-3">
                              <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white rounded-lg w-12 h-12 flex items-center justify-center font-bold text-lg flex-shrink-0">
                                {getInitial(candidate.userName)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-base font-bold text-gray-900 dark:text-white truncate">
                                  {candidate.userName || "Unknown"}
                                </h4>
                                <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 mt-1">
                                  <Mail className="w-3 h-3" />
                                  <span className="truncate">{candidate.userEmail || "No email"}</span>
                                </div>
                                {candidate.completedAt && (
                                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{new Date(candidate.completedAt).toLocaleString()}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mb-3">
                              <div className={`${statusConfig.bg} ${statusConfig.text} px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5`}>
                                {statusConfig.icon}
                                <span>{statusConfig.label}</span>
                              </div>
                              {candidate.status === "completed" && candidate.rating > 0 && (
                                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5">
                                  <Star className="w-3 h-3 fill-current" />
                                  <span>{candidate.rating}/10</span>
                                </div>
                              )}
                            </div>

                            {candidate.status === "completed" && candidate.feedback && (
                              <button
                                onClick={() => handleViewFeedback(candidate._id)}
                                className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2"
                              >
                                <span>📄</span>
                                <span>View Feedback</span>
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}