"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HomePage() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleGetStarted = () => {
    router.push("/login");
  };

  return (
    <div className={`min-h-screen overflow-x-hidden transition-colors duration-500 ${isDarkMode ? 'bg-[#0A0A0F] text-white' : 'bg-gray-50 text-gray-900'}`}>
      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b transition-colors duration-500 ${isDarkMode ? 'bg-[#0A0A0F]/80 border-white/10' : 'bg-white/80 border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-34 h-10 rounded-xl overflow-hidden flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="AI Cruiter Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className={`transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>Features</a>
            <a href="#how-it-works" className={`transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>How It Works</a>
          </div>
          <div className="flex items-center gap-3">
            {/* Dark/Light Mode Toggle */}
            <button 
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl transition-all duration-300 ${isDarkMode ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-200 hover:bg-gray-300'}`}
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
            <button 
              onClick={handleGetStarted}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 font-semibold text-white hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse transition-colors duration-500 ${isDarkMode ? 'bg-indigo-500/20' : 'bg-indigo-500/10'}`}></div>
          <div className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full blur-3xl animate-pulse delay-1000 transition-colors duration-500 ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-500/10'}`}></div>
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl transition-colors duration-500 ${isDarkMode ? 'bg-cyan-500/10' : 'bg-cyan-500/5'}`}></div>
        </div>

        {/* Grid Pattern */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${isDarkMode ? 'bg-[linear-gradient(rgba(99,102,241,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.03)_1px,transparent_1px)]' : 'bg-[linear-gradient(rgba(99,102,241,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.05)_1px,transparent_1px)]'} bg-[size:100px_100px]`}></div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
          <div className="text-center animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
              <span className="block">Revolutionize Your</span>
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Hiring Process
              </span>
            </h1>

            {/* Subheadline */}
            <p className={`text-xl md:text-2xl max-w-3xl mx-auto mb-8 leading-relaxed transition-colors duration-500 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              AI Cruiter conducts intelligent interviews, evaluates candidates with precision, 
              and delivers comprehensive reports — just like your best recruiter, but faster.
            </p>

            {/* CTA Button */}
            <div className="flex justify-center mb-12">
              <button 
                onClick={handleGetStarted}
                className="group relative px-10 py-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 font-bold text-lg text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Get Started
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </div>

            {/* Hero Image */}
            <div className="relative max-w-4xl mx-auto">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-3xl blur-2xl opacity-20"></div>
              <div className={`relative rounded-2xl overflow-hidden shadow-2xl transition-colors duration-500 ${isDarkMode ? 'border border-white/10' : 'border border-gray-200'}`}>
                <img 
                  src="https://mgx-backend-cdn.metadl.com/generate/images/952861/2026-02-04/ba38c13f-3ffa-4b38-b01d-15c1dc8c4c9e.png" 
                  alt="AI Cruiter conducting interview"
                  className="w-full h-auto"
                />
                <div className={`absolute inset-0 bg-gradient-to-t via-transparent to-transparent transition-colors duration-500 ${isDarkMode ? 'from-[#0A0A0F]' : 'from-gray-50'}`}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4 ${isDarkMode ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
              Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything You Need to
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"> Hire Smarter</span>
            </h2>
            <p className={`text-xl max-w-2xl mx-auto transition-colors duration-500 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              Our AI-powered platform handles the entire interview process, from screening to detailed evaluation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
                title: "AI Interview Conductor",
                description: "Our AI conducts natural, conversational interviews tailored to each role and candidate.",
                image: "https://mgx-backend-cdn.metadl.com/generate/images/952861/2026-02-04/21973ed1-5531-4767-9106-9c5b72544ced.png",
                gradient: "from-indigo-500 to-blue-500"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: "Detailed Reports",
                description: "Get comprehensive candidate assessments with skill ratings, strengths, and improvement areas.",
                image: "https://mgx-backend-cdn.metadl.com/generate/images/952861/2026-02-04/0e1070ab-1c5d-400f-bb4f-205e06d8785a.png",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                title: "Smart Evaluation",
                description: "Advanced algorithms analyze responses, body language cues, and technical accuracy.",
                image: "https://mgx-backend-cdn.metadl.com/generate/images/952861/2026-02-04/21973ed1-5531-4767-9106-9c5b72544ced.png",
                gradient: "from-cyan-500 to-teal-500"
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                title: "Time-Saving Automation",
                description: "Reduce hiring time significantly with automated scheduling, interviews, and follow-ups.",
                image: "https://mgx-backend-cdn.metadl.com/generate/images/952861/2026-02-04/0ab1aa3b-2e99-4f11-afe3-8c998e3593b8.png",
                gradient: "from-orange-500 to-red-500"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className={`group relative p-6 rounded-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden ${isDarkMode ? 'bg-white/5 border border-white/10 hover:border-white/20' : 'bg-white border border-gray-200 hover:border-gray-300 shadow-lg'}`}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-5`}></div>
                </div>
                
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">{feature.icon}</div>
                </div>
                
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className={`mb-4 transition-colors duration-500 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>{feature.description}</p>
                
                <div className="relative h-32 rounded-lg overflow-hidden">
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-110 transition-all duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t to-transparent transition-colors duration-500 ${isDarkMode ? 'from-[#13131A]' : 'from-white'}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className={`relative py-20 transition-colors duration-500 ${isDarkMode ? 'bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent' : 'bg-gradient-to-b from-transparent via-indigo-50 to-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4 ${isDarkMode ? 'bg-purple-500/10 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
              How It Works
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Three Simple Steps to
              <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent"> Better Hiring</span>
            </h2>
            <p className={`text-xl max-w-2xl mx-auto transition-colors duration-500 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
              Get started in minutes and let AI handle the heavy lifting.
            </p>
          </div>

          <div className="relative">
            {/* Connection Line */}
            <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 -translate-y-1/2"></div>

            <div className="grid md:grid-cols-3 gap-6 relative">
              {[
                {
                  step: "01",
                  title: "Upload Job Requirements",
                  description: "Simply paste your job description and requirements. Our AI will understand the role and create tailored interview questions.",
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  )
                },
                {
                  step: "02",
                  title: "AI Conducts Interview",
                  description: "Candidates receive a link to their AI interview. Our system adapts questions based on their responses in real-time.",
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  )
                },
                {
                  step: "03",
                  title: "Get Detailed Report",
                  description: "Receive comprehensive candidate evaluations with scores, insights, and hiring recommendations within minutes.",
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )
                }
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className={`rounded-2xl p-8 transition-all duration-300 hover:-translate-y-2 ${isDarkMode ? 'bg-[#13131A] border border-white/10 hover:border-white/20' : 'bg-white border border-gray-200 hover:border-gray-300 shadow-lg'}`}>
                    {/* Step Number */}
                    <div className="absolute -top-4 left-8 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-sm font-bold text-white">
                      Step {item.step}
                    </div>
                    
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mt-4 ${isDarkMode ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20' : 'bg-gradient-to-br from-indigo-100 to-purple-100'}`}>
                      <div className={`${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        {item.icon}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                    <p className={`leading-relaxed transition-colors duration-500 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 rounded-3xl blur-3xl opacity-20"></div>
            
            <div className={`relative rounded-3xl p-12 transition-colors duration-500 ${isDarkMode ? 'bg-gradient-to-br from-[#13131A] to-[#1a1a24] border border-white/10' : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-xl'}`}>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Ready to Transform Your
                <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent"> Hiring?</span>
              </h2>
              <p className={`text-xl mb-8 max-w-2xl mx-auto transition-colors duration-500 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Start using AI Cruiter today and experience the future of recruitment — completely free.
              </p>
              
              <button 
                onClick={handleGetStarted}
                className="group relative px-10 py-5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 font-bold text-xl text-white overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30"
              >
                <span className="relative z-10 flex items-center gap-3">
                  Get Started Now
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              
              <p className={`mt-4 text-sm transition-colors duration-500 ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>100% Free • No Credit Card Required</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`relative py-12 border-t transition-colors duration-500 ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-34 h-10 rounded-xl overflow-hidden flex items-center justify-center">
                  <img 
                    src="/logo.png" 
                    alt="AI Cruiter Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <p className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Revolutionizing recruitment with AI-powered interviews and intelligent candidate evaluation.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                {["Features", "How It Works", "FAQ"].map((item) => (
                  <li key={item}>
                    <a href="#" className={`text-sm transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                {["Help Center", "Contact Us", "Privacy Policy", "Terms of Service"].map((item) => (
                  <li key={item}>
                    <a href="#" className={`text-sm transition-colors ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>{item}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={`flex flex-col md:flex-row items-center justify-between mt-8 pt-6 border-t transition-colors duration-500 ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
            <p className={`text-sm transition-colors duration-500 ${isDarkMode ? 'text-slate-500' : 'text-gray-500'}`}>© 2026 AI Cruiter. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}