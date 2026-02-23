/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { Plus, ArrowLeft, ArrowRight, Briefcase, FileText, Clock, Users, Star, HelpCircle, Loader2, Check, RefreshCw, Sparkles, Copy, Mail, Share2 } from "lucide-react";

interface Question {
  id: string;
  question: string;
  type: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit?: number;
  // Removed expectedAnswer from interface - should never be displayed to candidates
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
  updatedAt: string;
}

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [currentInterviewId, setCurrentInterviewId] = useState<string | null>(null);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
  const [interviewLink, setInterviewLink] = useState<string>("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [formData, setFormData] = useState({
    jobPosition: "",
    jobDescription: "",
    duration: "",
    interviewTypes: [] as string[],
    experienceLevel: "",
    numberOfQuestions: "",
  });

  useEffect(() => {
    setMounted(true);
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    try {
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
    }
  };

  const stats = [
    {
      title: "Total Interviews",
      value: interviews.length.toString(),
      description: interviews.length === 0 ? "No interviews scheduled yet" : `${interviews.length} interview(s) created`,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradient: "from-indigo-500 to-purple-600",
      bgGlow: "bg-indigo-500/10 dark:bg-indigo-500/20",
      iconColor: "text-indigo-600 dark:text-indigo-400",
    },
    {
      title: "Scheduled",
      value: interviews.filter(i => i.status === "scheduled").length.toString(),
      description: "Upcoming interviews",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      gradient: "from-purple-500 to-pink-600",
      bgGlow: "bg-purple-500/10 dark:bg-purple-500/20",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Completed",
      value: interviews.filter(i => i.status === "completed").length.toString(),
      description: "Interviews finished",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: "from-green-500 to-emerald-600",
      bgGlow: "bg-green-500/10 dark:bg-green-500/20",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      title: "Candidates",
      value: "0",
      description: "Total candidates",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      gradient: "from-cyan-500 to-blue-600",
      bgGlow: "bg-cyan-500/10 dark:bg-cyan-500/20",
      iconColor: "text-cyan-600 dark:text-cyan-400",
    },
  ];

  const recentActivities = interviews.slice(0, 3).map((interview) => ({
    type: "interview",
    title: interview.jobPosition,
    candidate: `${interview.experienceLevel} level`,
    time: new Date(interview.createdAt).toLocaleDateString(),
    status: interview.status,
    avatar: interview.jobPosition.substring(0, 2).toUpperCase(),
  }));

  const interviewTypeOptions = [
    { id: "technical", label: "Technical", icon: "💻" },
    { id: "behavioral", label: "Behavioral", icon: "👤" },
    { id: "experience", label: "Experience", icon: "💼" },
    { id: "problemSolving", label: "Problem Solving", icon: "🧩" },
    { id: "leadership", label: "Leadership", icon: "⚡" },
  ];

  const toggleInterviewType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      interviewTypes: prev.interviewTypes.includes(type)
        ? prev.interviewTypes.filter(t => t !== type)
        : [...prev.interviewTypes, type]
    }));
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // First, save the interview data
      const response = await fetch("/api/interviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      if (!text) {
        throw new Error("Empty response from server");
      }

      const data = JSON.parse(text);

      if (data.success) {
        setCurrentInterviewId(data.data._id);
        // Move to step 2 and generate questions
        setCurrentStep(2);
        await generateQuestions(data.data._id);
      } else {
        setSubmitError(data.error || "Failed to create interview");
      }
    } catch (error) {
      console.error("Error creating interview:", error);
      setSubmitError(error instanceof Error ? error.message : "An error occurred while creating the interview");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateQuestions = async (interviewId: string) => {
    setIsGenerating(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/interviews/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          interviewId,
          ...formData,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      if (!text) {
        throw new Error("Empty response from server");
      }

      const data = JSON.parse(text);

      if (data.success) {
        // Sanitize questions to ensure no expectedAnswer is included
        const sanitizedQuestions = data.data.questions.map((q: any) => ({
          id: q.id,
          question: q.question,
          type: q.type,
          difficulty: q.difficulty,
          timeLimit: q.timeLimit,
          // Explicitly exclude expectedAnswer
        }));
        setGeneratedQuestions(sanitizedQuestions);
        // Generate interview link
        const link = `${window.location.origin}/interview/${interviewId}`;
        setInterviewLink(link);
        // Refresh interviews list
        await fetchInterviews();
      } else {
        setSubmitError(data.error || "Failed to generate questions");
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      setSubmitError(error instanceof Error ? error.message : "An error occurred while generating questions");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerateQuestions = async () => {
    if (currentInterviewId) {
      await generateQuestions(currentInterviewId);
    }
  };

  const handleProceedToLink = () => {
    setCurrentStep(3);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(interviewLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Interview Invitation - ${formData.jobPosition}`);
    const body = encodeURIComponent(`You have been invited to participate in an AI-powered interview for the position of ${formData.jobPosition}.\n\nInterview Link: ${interviewLink}\n\nDuration: ${formData.duration} minutes\nNumber of Questions: ${formData.numberOfQuestions}\n\nPlease complete the interview within 30 days.\n\nGood luck!`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleShareWhatsapp = () => {
    const text = encodeURIComponent(`You have been invited to participate in an AI-powered interview for ${formData.jobPosition}.\n\nInterview Link: ${interviewLink}\n\nDuration: ${formData.duration} minutes | Questions: ${formData.numberOfQuestions}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleFinish = async () => {
    setShowCreateForm(false);
    setCurrentStep(1);
    setCurrentInterviewId(null);
    setGeneratedQuestions([]);
    setInterviewLink("");
    setCopySuccess(false);
    setFormData({
      jobPosition: "",
      jobDescription: "",
      duration: "",
      interviewTypes: [],
      experienceLevel: "",
      numberOfQuestions: "",
    });
    await fetchInterviews();
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      setShowCreateForm(false);
      setCurrentStep(1);
      setCurrentInterviewId(null);
      setGeneratedQuestions([]);
      setInterviewLink("");
      setCopySuccess(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400";
      case "hard":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400";
    }
  };

  const getTypeLabel = (type: string) => {
    const option = interviewTypeOptions.find(opt => opt.id === type);
    return option ? `${option.icon} ${option.label}` : type;
  };

  if (showCreateForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={handleBack}
              className="p-2.5 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Interview</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Set up your AI-powered interview session</p>
            </div>
          </div>

          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 1 ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gray-300 dark:bg-gray-600'} text-white font-bold text-lg shadow-lg`}>
                {currentStep > 1 ? <Check className="w-5 h-5" /> : "1"}
              </div>
              <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded">
                <div className={`h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded transition-all duration-300 ${currentStep >= 2 ? 'w-full' : 'w-0'}`}></div>
              </div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 2 ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gray-300 dark:bg-gray-600'} text-white font-bold text-lg shadow-lg`}>
                {currentStep > 2 ? <Check className="w-5 h-5" /> : "2"}
              </div>
              <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 rounded">
                <div className={`h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded transition-all duration-300 ${currentStep >= 3 ? 'w-full' : 'w-0'}`}></div>
              </div>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${currentStep >= 3 ? 'bg-gradient-to-r from-indigo-500 to-purple-600' : 'bg-gray-300 dark:bg-gray-600'} text-white font-bold text-lg shadow-lg`}>
                3
              </div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span className={currentStep === 1 ? "font-medium text-indigo-600 dark:text-indigo-400" : ""}>Details</span>
              <span className={currentStep === 2 ? "font-medium text-indigo-600 dark:text-indigo-400" : ""}>AI Questions</span>
              <span className={currentStep === 3 ? "font-medium text-indigo-600 dark:text-indigo-400" : ""}>Share Link</span>
            </div>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-700 dark:text-red-400 text-sm font-medium">{submitError}</p>
            </div>
          )}

          {/* Step 1: Interview Details Form */}
          {currentStep === 1 && (
            <form onSubmit={handleStep1Submit} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
              {/* Form Header */}
              <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 dark:from-indigo-500/20 dark:to-purple-500/20 px-8 py-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                    <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Step 1: Job Information</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Enter the position details for your interview</p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                {/* Job Position */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    <Briefcase className="w-4 h-4 text-indigo-500" />
                    Job Position
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.jobPosition}
                    onChange={(e) => setFormData({ ...formData, jobPosition: e.target.value })}
                    placeholder="e.g. Full Stack Developer"
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-4 focus:ring-indigo-500/10 outline-none"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Job Description */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    <FileText className="w-4 h-4 text-indigo-500" />
                    Job Description
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.jobDescription}
                    onChange={(e) => setFormData({ ...formData, jobDescription: e.target.value })}
                    placeholder="Enter detailed job description including responsibilities, requirements, and qualifications..."
                    rows={5}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-4 focus:ring-indigo-500/10 outline-none resize-none"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {/* Interview Duration */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    <Clock className="w-4 h-4 text-indigo-500" />
                    Interview Duration
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none cursor-pointer"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select Duration</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                    <option value="120">2 hours</option>
                  </select>
                </div>

                {/* Interview Type */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    <Users className="w-4 h-4 text-indigo-500" />
                    Interview Type
                    <span className="text-red-500">*</span>
                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400">(Select multiple)</span>
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {interviewTypeOptions.map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => toggleInterviewType(type.id)}
                        disabled={isSubmitting}
                        className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium border-2 ${
                          formData.interviewTypes.includes(type.id)
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent shadow-lg shadow-indigo-500/25'
                            : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20'
                        } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span className="text-lg">{type.icon}</span>
                        <span>{type.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Experience Level */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    <Star className="w-4 h-4 text-indigo-500" />
                    Experience Level
                    <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.experienceLevel}
                    onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none cursor-pointer"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="">Select Experience Level</option>
                    <option value="entry">Entry Level (0-2 years)</option>
                    <option value="mid">Mid Level (2-5 years)</option>
                    <option value="senior">Senior Level (5-10 years)</option>
                    <option value="lead">Lead/Principal (10+ years)</option>
                  </select>
                </div>

                {/* Number of Questions */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    <HelpCircle className="w-4 h-4 text-indigo-500" />
                    Number of Questions
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.numberOfQuestions}
                    onChange={(e) => setFormData({ ...formData, numberOfQuestions: e.target.value })}
                    placeholder="e.g. 10"
                    min="1"
                    max="50"
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-700 focus:ring-4 focus:ring-indigo-500/10 outline-none"
                    required
                    disabled={isSubmitting}
                  />
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">AI will generate this many questions based on your selections</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    disabled={isSubmitting}
                    className="px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || formData.interviewTypes.length === 0}
                    className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <span>Next</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Step 2: AI Generated Questions */}
          {currentStep === 2 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 dark:from-purple-500/20 dark:to-pink-500/20 px-8 py-5 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-gray-700 rounded-lg shadow-sm">
                      <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Step 2: AI Generated Questions</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Review the questions generated for your interview</p>
                    </div>
                  </div>
                  <button
                    onClick={handleRegenerateQuestions}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg font-medium hover:bg-purple-200 dark:hover:bg-purple-900/50 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    Regenerate
                  </button>
                </div>
              </div>

              <div className="p-8">
                {isGenerating ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center mb-6">
                        <Sparkles className="w-10 h-10 text-white animate-pulse" />
                      </div>
                      <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 animate-ping opacity-20"></div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Generating Questions...</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-md">
                      Our AI is creating {formData.numberOfQuestions} tailored questions for your {formData.jobPosition} interview.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-semibold text-gray-900 dark:text-white">{generatedQuestions.length}</span> questions generated for <span className="font-semibold text-indigo-600 dark:text-indigo-400">{formData.jobPosition}</span>
                      </p>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                      {generatedQuestions.map((question, index) => (
                        <div
                          key={question.id}
                          className="p-5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-600"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-900 dark:text-white font-medium mb-3">{question.question}</p>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
                                  {getTypeLabel(question.type)}
                                </span>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getDifficultyColor(question.difficulty)}`}>
                                  {question.difficulty}
                                </span>
                                {question.timeLimit && (
                                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                                    ⏱️ {question.timeLimit}s
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back
                  </button>
                  <button
                    onClick={handleProceedToLink}
                    disabled={isGenerating || generatedQuestions.length === 0}
                    className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Interview Link */}
          {currentStep === 3 && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden">
              {/* Success Header */}
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-500/20 dark:to-emerald-500/20 px-8 py-8 border-b border-gray-200 dark:border-gray-700 text-center">
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                      <Check className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute inset-0 w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 animate-ping opacity-20"></div>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Your AI Interview is Ready!</h3>
                <p className="text-gray-600 dark:text-gray-400">Share this link with your candidates to start the interview process</p>
              </div>

              <div className="p-8 space-y-6">
                {/* Interview Link Box */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-6 border-2 border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Interview Link</h4>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                      Valid for 30 Days
                    </span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <input
                      type="text"
                      value={interviewLink}
                      readOnly
                      className="flex-1 bg-transparent text-gray-700 dark:text-gray-300 text-sm outline-none"
                    />
                    <button
                      onClick={handleCopyLink}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                        copySuccess
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                    >
                      {copySuccess ? (
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
                  </div>
                </div>

                {/* Interview Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{formData.duration} Min</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Questions</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{formData.numberOfQuestions} Questions</p>
                    </div>
                  </div>
                </div>

                {/* Share Via Section */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Share Via</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <button
                      onClick={handleShareEmail}
                      className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 transition-all group"
                    >
                      <div className="p-3 bg-white dark:bg-gray-600 rounded-lg group-hover:scale-110 transition-transform">
                        <Mail className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</span>
                    </button>
                    <button
                      onClick={handleShareWhatsapp}
                      className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 transition-all group"
                    >
                      <div className="p-3 bg-white dark:bg-gray-600 rounded-lg group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Whatsapp</span>
                    </button>
                    <button
                      onClick={handleCopyLink}
                      className="flex flex-col items-center gap-2 p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 transition-all group"
                    >
                      <div className="p-3 bg-white dark:bg-gray-600 rounded-lg group-hover:scale-110 transition-transform">
                        <Share2 className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Copy</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-2 px-6 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Dashboard
                  </button>
                  <button
                    onClick={handleFinish}
                    className="flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-green-500/25 hover:shadow-xl hover:shadow-green-500/30"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Create New Interview</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Help Card */}
          <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-lg">
                <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h4 className="font-semibold text-indigo-900 dark:text-indigo-100">
                  {currentStep === 1 ? "Need help?" : currentStep === 2 ? "About AI Questions" : "Share Your Interview"}
                </h4>
                <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                  {currentStep === 1 
                    ? "Fill in the job details to help our AI generate relevant interview questions tailored to your requirements."
                    : currentStep === 2
                    ? "These questions are generated based on your job requirements. You can regenerate them if needed or proceed to get the interview link."
                    : "Copy the interview link and share it with your candidates via email, WhatsApp, or any other platform. The link is valid for 30 days."
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Animated Header */}
        <div className={`transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
          <div className="flex items-center justify-between">
            <div className="relative">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <div className="absolute -top-2 -left-2 w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>Create Interview</span>
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mt-3 text-lg">Welcome to your AI-powered recruitment dashboard ✨</p>
        </div>

        {/* Stats Grid with Staggered Animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`transform transition-all duration-700 ${
                mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <div className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden">
                {/* Animated background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 dark:group-hover:opacity-10 transition-opacity duration-300`}></div>
                
                {/* Glow effect */}
                <div className={`absolute -top-10 -right-10 w-32 h-32 ${stat.bgGlow} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between pb-2">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{stat.title}</h3>
                    <div className={`p-3 rounded-xl ${stat.bgGlow} ${stat.iconColor} transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                      {stat.icon}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                      {stat.value}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{stat.description}</p>
                  </div>
                </div>

                {/* Corner decoration */}
                <div className={`absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl ${stat.gradient} opacity-5 dark:opacity-10 rounded-tl-full`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Activity Section */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '500ms' }}>
          {/* Recent Interviews */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Interviews</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your latest interview activities</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-4">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-transparent dark:from-gray-700/50 dark:to-transparent hover:from-indigo-50 hover:to-purple-50 dark:hover:from-indigo-900/30 dark:hover:to-purple-900/30 transition-all duration-300 border border-transparent hover:border-indigo-200 dark:hover:border-indigo-700 group"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                        {activity.avatar}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{activity.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{activity.candidate}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        activity.status === 'completed' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                          : activity.status === 'scheduled'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 dark:text-gray-400">No interviews yet. Create your first interview!</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Schedules */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Upcoming Schedules</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your next scheduled interviews</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            
            <div className="space-y-4">
              <div 
                onClick={() => setShowCreateForm(true)}
                className="relative p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-dashed border-purple-200 dark:border-purple-700 hover:border-purple-400 dark:hover:border-purple-500 transition-colors duration-300 group cursor-pointer"
              >
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Plus className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Schedule Your First Interview</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Click here to get started</p>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 mt-6">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                  <div key={index} className="text-center">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">{day}</p>
                    <div className="w-full aspect-square rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-600 hover:text-white transition-all duration-300 flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`} style={{ transitionDelay: '700ms' }}>
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full opacity-10 -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full opacity-10 -ml-24 -mb-24"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-2">Ready to get started?</h3>
              <p className="text-indigo-100 mb-6">Schedule your first AI-powered interview today</p>
              
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold hover:bg-indigo-50 hover:scale-105 transition-all duration-300 shadow-lg"
                >
                  Schedule Interview
                </button>
                <button className="px-6 py-3 bg-indigo-500/30 text-white rounded-xl font-semibold hover:bg-indigo-500/50 hover:scale-105 transition-all duration-300 backdrop-blur-sm border border-white/20">
                  Add Candidate
                </button>
                <button className="px-6 py-3 bg-indigo-500/30 text-white rounded-xl font-semibold hover:bg-indigo-500/50 hover:scale-105 transition-all duration-300 backdrop-blur-sm border border-white/20">
                  View Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}