"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${isDarkMode ? 'bg-[#0A0A0F] text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse transition-colors duration-500 ${isDarkMode ? 'bg-indigo-500/20' : 'bg-indigo-500/10'}`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000 transition-colors duration-500 ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-500/10'}`}></div>
      </div>

      {/* Grid Pattern */}
      <div className={`absolute inset-0 transition-opacity duration-500 ${isDarkMode ? 'bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)]' : 'bg-[linear-gradient(rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.05)_1px,transparent_1px)]'} bg-[size:100px_100px]`}></div>

      {/* Theme Toggle - Top Right */}
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        className={`fixed top-6 right-6 z-50 p-3 rounded-xl transition-all duration-300 ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'}`}
        aria-label="Toggle theme"
      >
        {isDarkMode ? (
          <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      {/* Back Button */}
      <button 
        onClick={() => router.push("/")}
        className={`fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${isDarkMode ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="font-medium">Back</span>
      </button>

      <div className="relative z-10 w-full max-w-6xl px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - AI Dashboard Image */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-3xl blur-3xl opacity-30 animate-pulse"></div>
              <div className={`relative rounded-3xl overflow-hidden shadow-2xl ${isDarkMode ? 'border border-white/10' : 'border border-gray-200'}`}>
                <img 
                  src="https://mgx-backend-cdn.metadl.com/generate/images/953207/2026-02-05/8e2a78f5-9441-4537-badb-a57f5517cc81.png" 
                  alt="AI Recruitment Dashboard"
                  className="w-full h-auto"
                />
                <div className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent ${isDarkMode ? 'from-[#0A0A0F]/50' : 'from-gray-50/50'}`}></div>
              </div>
              
              {/* Floating Stats - Top Right - NEW PROJECT BADGE */}
              <div className={`absolute -top-4 -right-4 px-6 py-4 rounded-2xl backdrop-blur-xl ${isDarkMode ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/30' : 'bg-white/95 border border-indigo-200'} shadow-2xl animate-in slide-in-from-right duration-700`}>
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${isDarkMode ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gradient-to-br from-indigo-400 to-purple-500'}`}>
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className={`text-3xl font-bold ${isDarkMode ? 'bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent' : 'text-indigo-600'}`}>New</p>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-indigo-300' : 'text-indigo-600'}`}>Launch Ready</p>
                  </div>
                </div>
              </div>

              {/* Floating Stats - Bottom Left */}
              <div className={`absolute -bottom-4 -left-4 px-6 py-4 rounded-2xl backdrop-blur-xl ${isDarkMode ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30' : 'bg-white/95 border border-purple-200'} shadow-2xl animate-in slide-in-from-left duration-700 delay-300`}>
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${isDarkMode ? 'bg-gradient-to-br from-purple-500 to-pink-600' : 'bg-gradient-to-br from-purple-400 to-pink-500'}`}>
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div>
                    <p className={`text-3xl font-bold ${isDarkMode ? 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent' : 'text-purple-600'}`}>AI</p>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>Powered</p>
                  </div>
                </div>
              </div>

              {/* Floating Badge - Middle Right */}
              <div className={`absolute top-1/2 -translate-y-1/2 -right-6 px-5 py-3 rounded-xl backdrop-blur-xl ${isDarkMode ? 'bg-cyan-500/20 border border-cyan-400/30' : 'bg-cyan-50 border border-cyan-200'} shadow-xl animate-in fade-in duration-1000 delay-500`}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
                  <span className={`text-sm font-semibold ${isDarkMode ? 'text-cyan-300' : 'text-cyan-700'}`}>Live Now</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className={`rounded-3xl p-10 transition-all duration-500 ${isDarkMode ? 'bg-gradient-to-br from-[#13131A] to-[#1a1a24] border border-white/10' : 'bg-white border border-gray-200 shadow-2xl'}`}>
                {/* Logo */}
                <div className="flex justify-center mb-8">
                  <div className="w-48 h-14 rounded-xl overflow-hidden flex items-center justify-center">
                    <img 
                      src="/logo.png" 
                      alt="AI Cruiter Logo" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Title */}
                <div className="text-center mb-10">
                  <h1 className={`text-4xl font-bold mb-3 animate-in fade-in slide-in-from-bottom duration-700 ${isDarkMode ? 'bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent' : 'text-gray-900'}`}>
                    Welcome Back
                  </h1>
                  <p className={`text-lg transition-colors duration-500 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                    Sign in to revolutionize your hiring process
                  </p>
                </div>

                {/* Google Sign In Button */}
                <button
                  onClick={handleGoogleSignIn}
                  className={`group relative w-full flex items-center justify-center gap-4 px-8 py-5 rounded-2xl font-semibold text-lg transition-all duration-300 hover:scale-105 overflow-hidden ${isDarkMode ? 'bg-white text-gray-900 hover:shadow-2xl' : 'bg-white text-gray-900 border-2 border-gray-300 shadow-lg hover:shadow-xl'}`}
                >
                  <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${isDarkMode ? 'bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-cyan-500/10' : 'bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-cyan-500/5'}`}></div>
                  
                  <svg className="w-7 h-7 relative z-10" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  
                  <span className="relative z-10">Continue with Google</span>
                  
                  <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>

                {/* Benefits List */}
                <div className="mt-10 space-y-4">
                  {[
                    { 
                      icon: (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      ), 
                      text: "Quick & Secure Authentication", 
                      color: isDarkMode ? "from-indigo-500 to-purple-600" : "from-indigo-400 to-purple-500"
                    },
                    { 
                      icon: (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      ), 
                      text: "Your Data is Protected", 
                      color: isDarkMode ? "from-purple-500 to-pink-600" : "from-purple-400 to-pink-500"
                    },
                    { 
                      icon: (
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                        </svg>
                      ), 
                      text: "Get Started in Seconds", 
                      color: isDarkMode ? "from-cyan-500 to-indigo-600" : "from-cyan-400 to-indigo-500"
                    }
                  ].map((benefit, index) => (
                    <div key={index} className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 hover:scale-105 ${isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${benefit.color} flex items-center justify-center shadow-lg`}>
                        {benefit.icon}
                      </div>
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                        {benefit.text}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer Text */}
                <div className="mt-8 text-center">
                  <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                    By continuing, you agree to our{" "}
                    <a href="#" className={`underline transition-colors ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}>
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className={`underline transition-colors ${isDarkMode ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}>
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}