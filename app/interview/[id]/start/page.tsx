/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Mic, MicOff, Timer, PhoneOff, Volume2 } from "lucide-react";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import axios from "axios";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

interface InterviewInfo {
  userName?: string;
  userEmail?: string;
  jobPosition?: string;
  questions?: Array<{ question: string }>;
  interviewData?: {
    questionList?: Array<{ question: string }>;
  };
}

type InterviewStage = 'greeting' | 'waiting_for_ready' | 'starting' | 'asking_question' | 'waiting_for_answer' | 'completed';

function StartInterview() {
  const [interviewInfo, setInterviewInfo] = useState<InterviewInfo | null>(null);
  const [activeUser, setActiveUser] = useState(false);
  const [conversation, setConversation] = useState<any[]>([]);
  const conversationRef = useRef<any[]>([]);
  const params = useParams();
  const searchParams = useSearchParams();
  const templateId = params.id as string; // This is the interview template ID
  const [candidateResponseId, setCandidateResponseId] = useState<string | null>(null); // New: Candidate response ID
  const [callEnd, setCallEnd] = useState(false);
  const router = useRouter();
  const feedbackGeneratedRef = useRef(false);
  const [isMuted, setIsMuted] = useState(false);
  const isMutedRef = useRef(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const isCallActiveRef = useRef(false);
  const isGeneratingFeedbackRef = useRef(false);
  const callEndHandledRef = useRef(false);
  const candidateInstanceCreatedRef = useRef(false);
  
  // Voice recognition refs
  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const currentQuestionIndexRef = useRef(-1);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isSpeakingRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shouldListenRef = useRef(false);
  const isProcessingRef = useRef(false);
  const femaleVoiceRef = useRef<SpeechSynthesisVoice | null>(null);
  const lastQuestionRef = useRef<string>('');
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const restartAttemptRef = useRef(0);
  
  // Interview stage management
  const [interviewStage, setInterviewStage] = useState<InterviewStage>('greeting');
  const interviewStageRef = useRef<InterviewStage>('greeting');

  // Sound effect refs
  const startSoundRef = useRef<HTMLAudioElement | null>(null);
  const endSoundRef = useRef<HTMLAudioElement | null>(null);
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    conversationRef.current = conversation;
  }, [conversation]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    isCallActiveRef.current = isCallActive;
  }, [isCallActive]);

  useEffect(() => {
    interviewStageRef.current = interviewStage;
  }, [interviewStage]);

  useEffect(() => {
    currentQuestionIndexRef.current = currentQuestionIndex;
  }, [currentQuestionIndex]);

  // Initialize sound effects
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const createBeep = (frequency: number, duration: number, volume: number = 0.3) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    };

    const playStartSound = () => {
      createBeep(440, 0.1);
      setTimeout(() => createBeep(554, 0.15), 100);
    };

    const playEndSound = () => {
      createBeep(554, 0.1);
      setTimeout(() => createBeep(440, 0.15), 100);
    };

    const playNotificationSound = () => {
      createBeep(660, 0.1);
    };

    startSoundRef.current = { play: playStartSound } as any;
    endSoundRef.current = { play: playEndSound } as any;
    notificationSoundRef.current = { play: playNotificationSound } as any;
  }, []);

  const getQuestionText = (questionItem: any): string => {
    if (typeof questionItem === 'string') {
      return questionItem;
    }
    if (questionItem && typeof questionItem === 'object' && questionItem.question) {
      return questionItem.question;
    }
    return '';
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      
      const femaleVoice = voices.find(voice => 
        voice.name.includes('Google US English Female') ||
        voice.name.includes('Microsoft Zira') ||
        voice.name.includes('Samantha') ||
        voice.name.includes('Victoria') ||
        voice.name.includes('Karen') ||
        voice.name.includes('Female')
      );
      
      if (femaleVoice) {
        femaleVoiceRef.current = femaleVoice;
        console.log('✅ Selected female voice:', femaleVoice.name);
      }
    };

    loadVoices();
    
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  useEffect(() => {
    const fetchInterviewDataAndCreateResponse = async () => {
      if (candidateInstanceCreatedRef.current) return;
      
      try {
        const userName = searchParams.get('name') || '';
        const userEmail = searchParams.get('email') || '';
        
        if (!userName || !userEmail) {
          toast.error("Name and email are required");
          return;
        }
        
        console.log('📥 Fetching interview template for ID:', templateId);
        console.log('👤 Creating response for candidate:', userName, userEmail);
        
        // Create a NEW candidate response
        const createResponse = await axios.post('/api/interviews/create-candidate-instance', {
          templateId: templateId,
          userName: userName,
          userEmail: userEmail,
        });

        if (createResponse.data.success) {
          const responseData = createResponse.data.data;
          const newResponseId = responseData._id;
          
          setCandidateResponseId(newResponseId);
          candidateInstanceCreatedRef.current = true;
          
          // Set interview info from template data
          setInterviewInfo({
            userName: responseData.userName,
            userEmail: responseData.userEmail,
            jobPosition: responseData.jobPosition,
            questions: responseData.template.questions,
            interviewData: responseData.template.interviewData,
          });
          
          console.log('✅ New candidate response created with ID:', newResponseId);
          console.log('📋 Using template ID:', templateId);
          toast.success("Interview loaded!");
          notificationSoundRef.current?.play();
        } else {
          throw new Error('Failed to create candidate response');
        }
      } catch (error) {
        console.error("❌ Failed to create candidate response:", error);
        toast.error("Failed to load interview data");
      }
    };

    if (templateId) {
      fetchInterviewDataAndCreateResponse();
    }
  }, [templateId, searchParams]);

  useEffect(() => {
    if (isCallActive) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isCallActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      console.log('❌ No recognition ref');
      return;
    }

    if (isSpeakingRef.current) {
      console.log('⏸️ AI is speaking, cannot start listening');
      return;
    }

    if (isProcessingRef.current) {
      console.log('⏸️ Processing response, cannot start listening');
      return;
    }

    if (isMutedRef.current) {
      console.log('🔇 Muted, not starting');
      return;
    }

    if (!shouldListenRef.current) {
      console.log('⏸️ Should not listen');
      return;
    }

    if (!isCallActiveRef.current) {
      console.log('⏸️ Call not active');
      return;
    }

    try {
      recognitionRef.current.start();
      console.log('✅ Started listening - Attempt:', restartAttemptRef.current);
      startSoundRef.current?.play();
      restartAttemptRef.current = 0;
      
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
      
      silenceTimeoutRef.current = setTimeout(() => {
        console.log('⏱️ 4 seconds of silence detected, stopping...');
        if (recognitionRef.current) {
          try {
            recognitionRef.current.stop();
          } catch (e) {
            console.log('Stop error:', e);
          }
        }
      }, 4000);
      
    } catch (error: any) {
      if (error.message && error.message.includes('already started')) {
        console.log('⚠️ Recognition already running');
      } else {
        console.error('❌ Error starting recognition:', error);
        restartAttemptRef.current++;
        if (restartAttemptRef.current < 3) {
          setTimeout(() => startListening(), 500);
        }
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        endSoundRef.current?.play();
        console.log('🛑 Stopped listening');
      } catch (error) {
        console.log('Stop error:', error);
      }
    }
  }, []);

  const handleUserResponse = useCallback(async (transcript: string) => {
    const currentStage = interviewStageRef.current;
    console.log('📍 Current stage:', currentStage, 'User said:', transcript);

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }

    setConversation(prev => [...prev, {
      role: 'user',
      content: transcript,
      timestamp: Date.now()
    }]);

    const lowerTranscript = transcript.toLowerCase();
    if (lowerTranscript.includes("quit") || 
        lowerTranscript.includes("stop") || 
        lowerTranscript.includes("end the interview") ||
        lowerTranscript.includes("i want to quit") ||
        lowerTranscript.includes("i don't want to continue")) {
      shouldListenRef.current = false;
      await speakText("I understand. Thank you for your time and good luck!");
      setTimeout(() => endInterview(), 3000);
      return;
    }

    if (lowerTranscript.includes("repeat") || 
        lowerTranscript.includes("say that again") ||
        lowerTranscript.includes("can you repeat") ||
        lowerTranscript.includes("what was the question") ||
        lowerTranscript.includes("pardon") ||
        lowerTranscript.includes("sorry")) {
      if (lastQuestionRef.current) {
        await speakText(lastQuestionRef.current);
        return;
      }
    }

    if (currentStage === 'waiting_for_ready') {
      setInterviewStage('starting');
      await speakText("Okay, let's start this interview.");
      
      const questions = interviewInfo?.questions || interviewInfo?.interviewData?.questionList || [];
      if (questions.length > 0) {
        setCurrentQuestionIndex(0);
        setInterviewStage('asking_question');
        const firstQuestionText = getQuestionText(questions[0]);
        lastQuestionRef.current = firstQuestionText;
        await speakText(firstQuestionText);
        setInterviewStage('waiting_for_answer');
      }
    } else if (currentStage === 'waiting_for_answer') {
      const questions = interviewInfo?.questions || interviewInfo?.interviewData?.questionList || [];
      const nextIndex = currentQuestionIndexRef.current + 1;
      
      if (nextIndex < questions.length) {
        await speakText("Okay.");
        setCurrentQuestionIndex(nextIndex);
        setInterviewStage('asking_question');
        const nextQuestionText = getQuestionText(questions[nextIndex]);
        lastQuestionRef.current = nextQuestionText;
        await speakText(nextQuestionText);
        setInterviewStage('waiting_for_answer');
      } else {
        shouldListenRef.current = false;
        setInterviewStage('completed');
        await speakText("That concludes our interview. Thank you for your time and good luck!");
        setTimeout(() => endInterview(), 3000);
      }
    }
  }, [interviewInfo]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      console.log('🎤 Listening started');
      setIsListening(true);
      setActiveUser(true);
    };

    recognition.onresult = async (event: any) => {
      if (isProcessingRef.current) {
        console.log('Already processing, ignoring...');
        return;
      }

      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript.trim();
      
      console.log('💬 User said:', transcript);
    
      if (!transcript) return;
      
      isProcessingRef.current = true;
      
      try {
        recognition.stop();
      } catch (e) {
        console.log('Stop error:', e);
      }
      
      await handleUserResponse(transcript);
      
      isProcessingRef.current = false;
    };

    recognition.onerror = (event: any) => {
      console.error('❌ Speech recognition error:', event.error);
      
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        toast.error('Microphone access denied. Please allow microphone and refresh.');
        setIsCallActive(false);
        isCallActiveRef.current = false;
        return;
      }
      
      if (event.error === 'no-speech') {
        console.log('⚠️ No speech detected, restarting...');
        setIsListening(false);
        if (shouldListenRef.current && isCallActiveRef.current && !isMutedRef.current && !isSpeakingRef.current && !isProcessingRef.current) {
          setTimeout(() => startListening(), 300);
        }
        return;
      }
      
      if (event.error === 'aborted') {
        console.log('Recognition aborted');
        setIsListening(false);
        if (shouldListenRef.current && isCallActiveRef.current && !isMutedRef.current && !isSpeakingRef.current && !isProcessingRef.current) {
          setTimeout(() => startListening(), 300);
        }
        return;
      }

      if (event.error === 'network') {
        console.log('Network error, restarting...');
        setIsListening(false);
        if (shouldListenRef.current && isCallActiveRef.current && !isMutedRef.current && !isSpeakingRef.current && !isProcessingRef.current) {
          setTimeout(() => startListening(), 500);
        }
        return;
      }
    };

    recognition.onend = () => {
      console.log('🔇 Recognition ended');
      setIsListening(false);
      
      if (shouldListenRef.current && isCallActiveRef.current && !isMutedRef.current && !isSpeakingRef.current && !isProcessingRef.current) {
        console.log('♻️ Auto-restarting recognition...');
        setTimeout(() => {
          startListening();
        }, 200);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          console.log('Cleanup error:', error);
        }
      }
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current);
      }
    };
  }, [startListening, handleUserResponse]);

  const speakWithBrowser = (text: string): Promise<void> => {
    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.1;
      utterance.volume = 1;

      if (femaleVoiceRef.current) {
        utterance.voice = femaleVoiceRef.current;
      }

      utterance.onend = () => {
        console.log('🔇 Browser speech finished');
        resolve();
      };

      utterance.onerror = () => {
        console.error('Browser speech error');
        resolve();
      };

      window.speechSynthesis.speak(utterance);
    });
  };

  const speakText = async (text: string) => {
    try {
      setIsSpeaking(true);
      isSpeakingRef.current = true;
      setActiveUser(false);
      stopListening();
      
      console.log('🔊 AI speaking:', text);
      
      try {
        const response = await fetch('/api/elevenlabs-tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text })
        });

        if (response.ok) {
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          
          if (audioRef.current) {
            audioRef.current.pause();
          }
          
          audioRef.current = new Audio(audioUrl);
          
          await new Promise<void>((resolve, reject) => {
            if (!audioRef.current) {
              reject(new Error('No audio ref'));
              return;
            }
            
            audioRef.current.onended = () => {
              console.log('✅ ElevenLabs audio finished');
              resolve();
            };
            
            audioRef.current.onerror = () => {
              reject(new Error('Audio playback error'));
            };
            
            audioRef.current.play().catch(reject);
          });
        } else {
          throw new Error('ElevenLabs failed');
        }
      } catch (elevenLabsError) {
        console.log('⚠️ Using browser TTS (female voice)');
        await speakWithBrowser(text);
      }
      
      setConversation(prev => [...prev, {
        role: 'assistant',
        content: text,
        timestamp: Date.now()
      }]);
      
    } catch (error) {
      console.error('❌ Speech error:', error);
    } finally {
      console.log('✅ Speech completed, starting listening NOW');
      setIsSpeaking(false);
      isSpeakingRef.current = false;
      setActiveUser(true);
      
      shouldListenRef.current = true;
      
      if (shouldListenRef.current && isCallActiveRef.current && !isMutedRef.current) {
        console.log('🎤 Calling startListening()...');
        setTimeout(() => startListening(), 300);
      }
    }
  };

  const toggleMic = () => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    isMutedRef.current = newMutedState;
    
    if (newMutedState) {
      stopListening();
      toast("Microphone Muted");
      endSoundRef.current?.play();
    } else {
      toast("Microphone Unmuted");
      startSoundRef.current?.play();
      if (isCallActiveRef.current && !isSpeakingRef.current) {
        shouldListenRef.current = true;
        setTimeout(() => startListening(), 200);
      }
    }
  };

  const GenerateFeedback = useCallback(async () => {
    if (feedbackGeneratedRef.current || isGeneratingFeedbackRef.current) {
      console.log('⚠️ Feedback already generated or in progress');
      return;
    }
    
    if (!candidateResponseId) {
      console.error('❌ No candidate response ID');
      toast.error("No candidate response ID found");
      return;
    }
    
    console.log('🔄 Starting feedback generation for candidate response:', candidateResponseId);
    isGeneratingFeedbackRef.current = true;
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const finalConversation = conversationRef.current;
    
    console.log('📊 Conversation data:', {
      messageCount: finalConversation.length,
      messages: finalConversation
    });
    
    if (finalConversation.length === 0) {
      console.error('❌ No conversation data captured');
      toast.error("No conversation data captured");
      isGeneratingFeedbackRef.current = false;
      router.replace("/interview/" + candidateResponseId);
      return;
    }

    try {
      feedbackGeneratedRef.current = true;
      
      console.log('📤 Calling AI feedback API...');
      const result = await axios.post("/api/ai-feedback", {
        conversation: finalConversation,
      });
      
      console.log('✅ AI feedback API response:', result.data);

      let feedbackContent = result.data.content;
      if (typeof feedbackContent === 'object' && feedbackContent.content) {
        feedbackContent = feedbackContent.content;
      }
      
      if (typeof feedbackContent === 'string') {
        feedbackContent = feedbackContent.replace(/```json/g, "").replace(/```/g, "").trim();
      }

      let feedbackData;
      let rating = 0;
      try {
        feedbackData = JSON.parse(feedbackContent);
        rating = feedbackData.rating || 0;
        console.log('✅ Parsed feedback data:', feedbackData);
      } catch {
        feedbackData = { raw: feedbackContent || "No feedback returned" };
        console.log('⚠️ Could not parse feedback, using raw:', feedbackData);
      }

      console.log('📤 Updating candidate response with feedback...');
      const updateResponse = await axios.put(`/api/candidate-responses/${candidateResponseId}`, {
        conversation: finalConversation,
        feedback: feedbackData,
        rating: rating,
        status: "completed",
        recommended: feedbackData?.feedback?.Recommendation === "Yes",
        completedAt: new Date().toISOString(),
      });

      console.log('✅ Update response:', updateResponse.data);
      console.log('✅ Feedback saved successfully!');
      toast.success("Feedback saved successfully!");
      notificationSoundRef.current?.play();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('🔄 Redirecting to feedback page...');
      router.replace("/interview/" + candidateResponseId + "/completed");
    } catch (error: any) {
      console.error("❌ Failed to generate feedback:", error);
      console.error("Error details:", error.response?.data || error.message);
      toast.error("Failed to save feedback");
      feedbackGeneratedRef.current = false;
      isGeneratingFeedbackRef.current = false;
    }
  }, [candidateResponseId, router]);

  const endInterview = async () => {
    if (callEndHandledRef.current) {
      console.log('⚠️ Interview already ended');
      return;
    }
    callEndHandledRef.current = true;
    
    console.log('🔚 Ending interview...');
    shouldListenRef.current = false;
    setIsCallActive(false);
    isCallActiveRef.current = false;
    setCallEnd(true);
    stopListening();
    
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    toast("Interview Ended...Generating feedback...");
    endSoundRef.current?.play();
    await GenerateFeedback();
  };

  const startInterview = async () => {
    if (!interviewInfo || !candidateResponseId) {
      toast.error("Interview data not loaded");
      return;
    }

    const questions = interviewInfo.questions || interviewInfo.interviewData?.questionList || [];
    if (questions.length === 0) {
      toast.error("No questions found");
      return;
    }

    console.log('🎬 Starting interview with', questions.length, 'questions');
    setIsCallActive(true);
    isCallActiveRef.current = true;
    shouldListenRef.current = true;
    setInterviewStage('greeting');
    
    const greeting = `Hi ${interviewInfo.userName || "there"}, how are you? Ready for your interview for the ${interviewInfo.jobPosition} position?`;
    
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Microphone permission granted');
      startSoundRef.current?.play();
      
      setInterviewStage('waiting_for_ready');
      await speakText(greeting);
    } catch (error) {
      console.error('❌ Microphone permission denied:', error);
      toast.error('Please allow microphone access');
      setIsCallActive(false);
      isCallActiveRef.current = false;
    }
  };

  useEffect(() => {
    if (interviewInfo && candidateResponseId && !isCallActive && !callEnd) {
      const timer = setTimeout(() => {
        startInterview();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [interviewInfo, candidateResponseId]);

  useEffect(() => {
    return () => {
      shouldListenRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Cleanup error:', e);
        }
      }
      if (audioRef.current) audioRef.current.pause();
      if (window.speechSynthesis) window.speechSynthesis.cancel();
    };
  }, []);

  if (!interviewInfo || !candidateResponseId) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
          <div className="text-white text-xl font-semibold">Loading interview data...</div>
        </div>
      </div>
    );
  }

  const getStageMessage = () => {
    switch (interviewStage) {
      case 'greeting':
        return 'Starting interview...';
      case 'waiting_for_ready':
        return 'Your turn - Are you ready?';
      case 'starting':
        return 'AI is speaking...';
      case 'asking_question':
        return 'AI is asking a question...';
      case 'waiting_for_answer':
        return 'Your turn - Please answer';
      case 'completed':
        return 'Interview completed!';
      default:
        return 'Processing...';
    }
  };

  const questions = interviewInfo?.questions || interviewInfo?.interviewData?.questionList || [];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8 lg:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 mb-8 border border-gray-800 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">AI Interview Session</h1>
              <p className="text-gray-400 text-sm">{interviewInfo.jobPosition}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-[#0a0a0a] px-4 py-2 rounded-lg border border-gray-800">
                <Timer className="w-5 h-5 text-blue-400" />
                <span className="text-white font-mono text-lg">{formatTime(timer)}</span>
              </div>
              {isCallActive && (
                <div className="flex items-center gap-2 bg-green-500/10 px-4 py-2 rounded-lg border border-green-500/30">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-semibold">LIVE</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Progress bar */}
          {isCallActive && questions.length > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-[#0a0a0a] rounded-full h-2 overflow-hidden border border-gray-800">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* AI Recruiter */}
          <div className="bg-[#1a1a1a] rounded-xl p-8 border border-gray-800 shadow-xl">
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              <div className="relative">
                {isSpeaking && (
                  <>
                    <span className="absolute -inset-4 rounded-full bg-blue-500 opacity-20 animate-ping"></span>
                    <span className="absolute -inset-2 rounded-full bg-blue-500 opacity-10 animate-pulse"></span>
                  </>
                )}
                <div className="relative w-40 h-40 rounded-full overflow-hidden border-4 border-blue-500 shadow-2xl">
                  <Image 
                    src="/ai.png" 
                    alt="AI Recruiter"
                    width={160}
                    height={160}
                    className="object-cover"
                  />
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white">AI Recruiter</h3>
                <div className="flex items-center gap-2 justify-center">
                  {isSpeaking ? (
                    <>
                      <Volume2 className="w-5 h-5 text-blue-400 animate-pulse" />
                      <span className="text-blue-300 text-sm font-semibold">Speaking...</span>
                    </>
                  ) : (
                    <span className="text-gray-500 text-sm">Listening</span>
                  )}
                </div>
              </div>

              {isSpeaking && (
                <div className="flex gap-1 items-end h-12">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 bg-blue-500 rounded-full"
                      style={{
                        height: `${20 + Math.random() * 30}px`,
                        animation: `pulse 0.6s ease-in-out ${i * 0.1}s infinite`
                      }}
                    ></div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* User */}
          <div className="bg-[#1a1a1a] rounded-xl p-8 border border-gray-800 shadow-xl">
            <div className="flex flex-col items-center justify-center h-full space-y-6">
              <div className="relative">
                {isListening && (
                  <>
                    <span className="absolute -inset-4 rounded-full bg-green-500 opacity-20 animate-ping"></span>
                    <span className="absolute -inset-2 rounded-full bg-green-500 opacity-10 animate-pulse"></span>
                  </>
                )}
                <div className="relative w-40 h-40 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-6xl font-bold text-white shadow-2xl border-4 border-cyan-500">
                  {interviewInfo?.userName?.[0]?.toUpperCase() || "U"}
                </div>
              </div>
              
              <div className="text-center space-y-2">
                <h3 className="text-xl font-bold text-white">{interviewInfo?.userName || "Candidate"}</h3>
                <div className="flex items-center gap-2 justify-center">
                  {isListening ? (
                    <>
                      <Mic className="w-5 h-5 text-green-400 animate-pulse" />
                      <span className="text-green-300 text-sm font-semibold">Listening...</span>
                    </>
                  ) : (
                    <span className="text-gray-500 text-sm">Waiting</span>
                  )}
                </div>
              </div>

              {isListening && (
                <div className="flex gap-1 items-end h-12">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-2 bg-green-500 rounded-full"
                      style={{
                        height: `${20 + Math.random() * 30}px`,
                        animation: `pulse 0.6s ease-in-out ${i * 0.1}s infinite`
                      }}
                    ></div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-[#1a1a1a] rounded-xl p-6 border border-gray-800 shadow-xl">
          <div className="flex flex-col items-center gap-6">
            {/* Status message */}
            <div className="text-center">
              <p className="text-lg text-white font-semibold mb-2">
                {getStageMessage()}
              </p>
              <p className="text-sm text-gray-400">
                {isSpeaking 
                  ? "AI is speaking... Please listen" 
                  : isListening 
                  ? "Speak now - I'm listening"
                  : isCallActive 
                  ? "Waiting for next action..." 
                  : "Initializing interview..."}
              </p>
            </div>

            {/* Control buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleMic}
                className={`group relative p-6 rounded-full transition-all duration-300 shadow-lg ${
                  isMuted 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isMuted ? (
                  <MicOff className="w-8 h-8 text-white" />
                ) : (
                  <Mic className="w-8 h-8 text-white" />
                )}
              </button>

              {isCallActive && interviewStage !== 'completed' && (
                <button
                  onClick={endInterview}
                  className="group relative p-6 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-300 shadow-lg"
                >
                  <PhoneOff className="w-8 h-8 text-white" />
                </button>
              )}
            </div>

            {/* Debug info */}
            <div className="text-xs text-gray-600 text-center space-y-1">
              <p>Messages: {conversation.length} | Stage: {interviewStage}</p>
              <p className="text-cyan-400">Response ID: {candidateResponseId?.slice(-8)}</p>
              <div className="flex items-center justify-center gap-4">
                {isListening && <span className="text-green-400">● LISTENING</span>}
                {isSpeaking && <span className="text-blue-400">● AI SPEAKING</span>}
                {isMuted && <span className="text-red-400">● MUTED</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StartInterview;