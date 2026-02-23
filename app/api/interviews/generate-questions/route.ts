import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Interview from "@/models/Interview";
import Bytez from "bytez.js";

interface QuestionGenerationRequest {
  interviewId?: string;
  jobPosition: string;
  jobDescription: string;
  interviewTypes: string[];
  experienceLevel: string;
  numberOfQuestions: number;
}

interface GeneratedQuestion {
  id: string;
  question: string;
  type: string;
  difficulty: "easy" | "medium" | "hard";
  expectedAnswer: string;
  timeLimit: number;
}

interface PublicQuestion {
  id: string;
  question: string;
  type: string;
  difficulty: "easy" | "medium" | "hard";
  timeLimit: number;
}

// Helper function to create a timeout promise
function createTimeout(ms: number, message: string): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(message)), ms);
  });
}

// Function to generate questions using Bytez AI with timeout
async function generateQuestionsWithAI(params: QuestionGenerationRequest): Promise<GeneratedQuestion[]> {
  const { jobPosition, jobDescription, interviewTypes, experienceLevel, numberOfQuestions } = params;
  
  if (!process.env.BYTEZ_API_KEY) {
    throw new Error("BYTEZ_API_KEY is not configured in environment variables");
  }

  const sdk = new Bytez(process.env.BYTEZ_API_KEY);
  const model = sdk.model("inference-net/Schematron-3B");

  // Calculate questions per type
  const questionsPerType = Math.floor(numberOfQuestions / interviewTypes.length);
  const remainingQuestions = numberOfQuestions % interviewTypes.length;
  
  // Build distribution string for the prompt
  const distributionParts = interviewTypes.map((type, index) => {
    const count = questionsPerType + (index < remainingQuestions ? 1 : 0);
    return `${count} ${type}`;
  });
  const distributionString = distributionParts.join(", ");

  const createPrompt = (requestedCount: number) => `You are an expert interview question generator. You MUST generate EXACTLY ${requestedCount} interview questions for a ${jobPosition} position.

Job Description: ${jobDescription || "Not provided"}
Experience Level: ${experienceLevel}

CRITICAL REQUIREMENTS:
1. Generate EXACTLY ${requestedCount} questions - no more, no less
2. Return ONLY valid JSON - no markdown, no explanations, no preamble
3. Each question must have: question, type, and expectedAnswer fields
4. Distribute questions as: ${distributionString}

Return ONLY this JSON structure with EXACTLY ${requestedCount} items:
[
  {
    "question": "Your interview question here",
    "type": "${interviewTypes[0]}",
    "expectedAnswer": "What to look for in the candidate's response"
  }
]

Requirements:
- Questions must be relevant and professional for ${experienceLevel} level
- Each "type" must be one of: ${interviewTypes.join(", ")}
- Expected answers should be concise guidelines (2-3 sentences)
- NO markdown formatting, NO code blocks, NO extra text
- Start directly with [ and end with ]

Generate all ${requestedCount} questions now:`;

  const maxRetries = 2; // Reduced retries to avoid long waits
  const timeoutMs = 45000; // 45 second timeout per attempt
  const allQuestions: Array<{ question: string; type: string; expectedAnswer: string }> = [];
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const questionsNeeded = numberOfQuestions - allQuestions.length;
      
      if (questionsNeeded <= 0) {
        console.log(`✅ Successfully generated all ${numberOfQuestions} questions`);
        break;
      }

      console.log(`\n🔄 Attempt ${attempt}/${maxRetries}: Generating ${questionsNeeded} questions...`);
      
      // Add delay between retries
      if (attempt > 1) {
        const delayMs = 5000; // 5 second delay
        console.log(`⏳ Waiting ${delayMs/1000}s before retry...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
      
      const prompt = createPrompt(questionsNeeded);
      
      // Create API call with timeout
      console.log(`⏱️ Starting API call with ${timeoutMs/1000}s timeout...`);
      const apiCallPromise = model.run([
        {
          role: "user",
          content: prompt
        }
      ]);

      // Race between API call and timeout
      const result = await Promise.race([
        apiCallPromise,
        createTimeout(timeoutMs, `API request timed out after ${timeoutMs/1000} seconds`)
      ]);

      const { error, output } = result;

      if (error) {
        console.error(`❌ Attempt ${attempt} - Error generating questions:`, error);
        
        // Check if it's a rate limit error
        if (error.toString().includes("Rate limited")) {
          console.log(`⚠️ Rate limit detected.`);
          if (attempt === maxRetries) {
            throw new Error(`The AI service is currently busy. Please try again in a few moments.`);
          }
          continue;
        }
        
        if (attempt === maxRetries) {
          throw new Error(`AI generation failed: ${error}`);
        }
        continue;
      }

      console.log(`📥 Attempt ${attempt} - Raw AI output received`);

      // Extract content from output object
      let textOutput = "";
      if (typeof output === "string") {
        textOutput = output;
      } else if (output && typeof output === "object" && "content" in output) {
        textOutput = output.content;
      } else {
        console.error(`❌ Attempt ${attempt} - Unexpected output format`);
        if (attempt === maxRetries) {
          throw new Error("Unexpected output format from AI");
        }
        continue;
      }

      // Parse AI response
      let batchQuestions: Array<{ question: string; type: string; expectedAnswer: string }> = [];
      
      try {
        // Clean the output
        let cleanedOutput = textOutput.trim();
        cleanedOutput = cleanedOutput.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        
        // Remove any preamble text before the JSON array
        const jsonStartIndex = cleanedOutput.indexOf('[');
        if (jsonStartIndex > 0) {
          cleanedOutput = cleanedOutput.substring(jsonStartIndex);
        }
        
        // Remove any text after the JSON array
        const jsonEndIndex = cleanedOutput.lastIndexOf(']');
        if (jsonEndIndex > 0 && jsonEndIndex < cleanedOutput.length - 1) {
          cleanedOutput = cleanedOutput.substring(0, jsonEndIndex + 1);
        }
        
        // Try to extract and parse JSON
        const jsonMatch = cleanedOutput.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          try {
            batchQuestions = JSON.parse(jsonMatch[0]);
            console.log(`✅ Attempt ${attempt} - Parsed ${batchQuestions.length} questions from JSON`);
          } catch (jsonError) {
            // Try to fix incomplete JSON
            console.log(`⚠️ Attempt ${attempt} - JSON parsing failed, attempting to fix...`);
            
            let jsonText = jsonMatch[0];
            
            // Fix incomplete JSON objects
            const openBrackets = (jsonText.match(/\{/g) || []).length;
            const closeBrackets = (jsonText.match(/\}/g) || []).length;
            
            if (openBrackets > closeBrackets) {
              const missing = openBrackets - closeBrackets;
              for (let i = 0; i < missing; i++) {
                jsonText += '\n  }';
              }
              jsonText += '\n]';
              
              console.log(`🔧 Attempt ${attempt} - Fixed incomplete JSON, retrying parse...`);
              batchQuestions = JSON.parse(jsonText);
              console.log(`✅ Attempt ${attempt} - Successfully parsed ${batchQuestions.length} questions after fixing`);
            } else {
              throw jsonError;
            }
          }
        } else {
          // Fallback: Parse numbered text format
          console.log(`⚠️ Attempt ${attempt} - No JSON found, parsing text format...`);
          
          const questionPattern = /(\d+)\.\s*(?:Question:\s*)?([^\n]+(?:\n(?!\d+\.|\n)[^\n]+)*)\s*(?:Type:\s*([^\n]+))?\s*(?:Expected(?:\s+Answer)?:\s*([^\n]+(?:\n(?!\d+\.|\n)[^\n]+)*))?/gi;
          const matches = [...textOutput.matchAll(questionPattern)];
          
          for (const match of matches) {
            const questionText = match[2].trim();
            const questionType = match[3] ? match[3].trim() : interviewTypes[0];
            const expectedAnswer = match[4] ? match[4].trim() : "Evaluate based on clarity, relevance, and depth of response.";
            
            // Skip preamble or invalid text
            if (questionText.toLowerCase().includes('analysis') || 
                questionText.toLowerCase().includes('generate') ||
                questionText.length < 20) {
              continue;
            }
            
            batchQuestions.push({
              question: questionText,
              type: interviewTypes.includes(questionType) ? questionType : interviewTypes[0],
              expectedAnswer: expectedAnswer,
            });
          }
          
          console.log(`✅ Attempt ${attempt} - Parsed ${batchQuestions.length} questions from text format`);
        }
      } catch (parseError) {
        console.error(`❌ Attempt ${attempt} - Failed to parse response:`, parseError);
        if (attempt === maxRetries) {
          throw new Error("Failed to parse AI response");
        }
        continue;
      }

      // Validate and add questions
      if (Array.isArray(batchQuestions) && batchQuestions.length > 0) {
        // Filter out invalid questions
        const validQuestions = batchQuestions.filter(q => 
          q.question && 
          q.question.trim().length >= 20 &&
          q.type &&
          q.expectedAnswer
        );
        
        allQuestions.push(...validQuestions);
        console.log(`📊 Total questions collected: ${allQuestions.length}/${numberOfQuestions}`);
        
        // If we have enough questions, break early
        if (allQuestions.length >= numberOfQuestions) {
          console.log(`✅ Successfully collected ${allQuestions.length} questions`);
          break;
        }
      } else {
        console.warn(`⚠️ Attempt ${attempt} - No valid questions generated`);
      }
      
    } catch (attemptError) {
      console.error(`❌ Attempt ${attempt} - Error:`, attemptError);
      
      // Check if it's a timeout error
      if (attemptError instanceof Error && attemptError.message.includes("timed out")) {
        console.log(`⏱️ Request timed out. The AI service may be overloaded.`);
      }
      
      if (attempt === maxRetries) {
        throw new Error("The AI service is currently unavailable or taking too long to respond. Please try again in a few moments.");
      }
    }
  }

  // Final validation
  if (allQuestions.length === 0) {
    throw new Error("Unable to generate questions at this time. Please try again in a few moments.");
  }

  if (allQuestions.length < numberOfQuestions) {
    console.warn(`⚠️ Only generated ${allQuestions.length}/${numberOfQuestions} questions`);
  }

  // Take only the requested number of questions (in case we got more)
  const selectedQuestions = allQuestions.slice(0, numberOfQuestions);

  // Process and format questions
  const questions: GeneratedQuestion[] = [];
  const difficulties: ("easy" | "medium" | "hard")[] = ["easy", "medium", "hard"];

  // Distribute questions across interview types
  const typeDistribution: Record<string, number> = {};
  interviewTypes.forEach((type, index) => {
    typeDistribution[type] = questionsPerType + (index < remainingQuestions ? 1 : 0);
  });

  for (let i = 0; i < selectedQuestions.length; i++) {
    const aiQuestion = selectedQuestions[i];
    
    // Assign type based on distribution
    let questionType = aiQuestion.type;
    
    // Validate and balance type distribution
    if (!interviewTypes.includes(questionType)) {
      const typeCounts = questions.reduce((acc, q) => {
        acc[q.type] = (acc[q.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      questionType = interviewTypes.find(type => 
        (typeCounts[type] || 0) < typeDistribution[type]
      ) || interviewTypes[0];
    }
    
    // Determine difficulty based on experience level
    let difficulty: "easy" | "medium" | "hard";
    if (experienceLevel === "entry") {
      difficulty = Math.random() > 0.7 ? "medium" : "easy";
    } else if (experienceLevel === "senior" || experienceLevel === "lead") {
      difficulty = Math.random() > 0.3 ? "hard" : "medium";
    } else {
      difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
    }

    // Calculate time limit based on difficulty and type
    let timeLimit = 120; // default 2 minutes
    if (difficulty === "easy") {
      timeLimit = 90;
    } else if (difficulty === "hard") {
      timeLimit = 180;
    }
    
    // Technical questions may need more time
    if (questionType === "technical" || questionType === "problemSolving") {
      timeLimit += 60;
    }

    questions.push({
      id: `q_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
      question: aiQuestion.question,
      type: questionType,
      difficulty: difficulty,
      expectedAnswer: aiQuestion.expectedAnswer,
      timeLimit: timeLimit,
    });
  }

  console.log(`\n✅ Final result: Generated ${questions.length} questions`);
  console.log("Questions summary:", questions.map((q, i) => `${i + 1}. [${q.type}] ${q.question.substring(0, 60)}...`));
  
  return questions;
}

// Helper function to remove expected answers from questions for public display
function sanitizeQuestionsForDisplay(questions: GeneratedQuestion[]): PublicQuestion[] {
  return questions.map(({ id, question, type, difficulty, timeLimit }) => ({
    id,
    question,
    type,
    difficulty,
    timeLimit,
  }));
}

// POST - Generate questions for an interview
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    const {
      interviewId,
      jobPosition,
      jobDescription,
      interviewTypes,
      experienceLevel,
      numberOfQuestions,
    } = body;

    // Validate required fields
    if (!jobPosition || !interviewTypes || !experienceLevel || !numberOfQuestions) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields for question generation",
        },
        { status: 400 }
      );
    }

    // Validate interview types array
    if (!Array.isArray(interviewTypes) || interviewTypes.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Interview types must be a non-empty array",
        },
        { status: 400 }
      );
    }

    // Validate number of questions
    const numQuestions = parseInt(numberOfQuestions);
    if (isNaN(numQuestions) || numQuestions < 1 || numQuestions > 50) {
      return NextResponse.json(
        {
          success: false,
          error: "Number of questions must be between 1 and 50",
        },
        { status: 400 }
      );
    }

    console.log(`\n🚀 Starting question generation for ${jobPosition}`);
    console.log(`📋 Parameters: ${numQuestions} questions, types: ${interviewTypes.join(", ")}, level: ${experienceLevel}`);

    // Generate questions using AI with timeout and retry logic
    const questions = await generateQuestionsWithAI({
      jobPosition,
      jobDescription,
      interviewTypes,
      experienceLevel,
      numberOfQuestions: numQuestions,
    });

    // Verify we got questions
    if (questions.length < numQuestions) {
      console.warn(`⚠️ Warning: Only generated ${questions.length}/${numQuestions} questions`);
    }

    // Remove expected answers for public display
    const publicQuestions = sanitizeQuestionsForDisplay(questions);

    // If interviewId is provided, update the existing interview
    if (interviewId) {
      // Save full questions (with expected answers) to database
      const interview = await Interview.findByIdAndUpdate(
        interviewId,
        { 
          questions, // Store complete questions with expected answers in DB
          status: "scheduled",
        },
        { new: true, runValidators: true }
      );

      if (!interview) {
        return NextResponse.json(
          {
            success: false,
            error: "Interview not found",
          },
          { status: 404 }
        );
      }

      // Return sanitized questions (without expected answers) to client
      return NextResponse.json({
        success: true,
        data: {
          interview: {
            ...interview.toObject(),
            questions: publicQuestions, // Override with sanitized questions
          },
          questions: publicQuestions, // Return sanitized questions
        },
        message: questions.length === numQuestions 
          ? "Questions generated and saved successfully"
          : `Generated ${questions.length}/${numQuestions} questions and saved successfully`,
      });
    }

    // If no interviewId, just return the sanitized questions
    return NextResponse.json({
      success: true,
      data: {
        questions: publicQuestions, // Return sanitized questions
      },
      message: questions.length === numQuestions
        ? "Questions generated successfully"
        : `Generated ${questions.length}/${numQuestions} questions successfully`,
    });
  } catch (error) {
    console.error("❌ Error generating questions:", error);
    
    // Provide user-friendly error messages
    let errorMessage = "Failed to generate questions. Please try again.";
    if (error instanceof Error) {
      if (error.message.includes("timeout") || error.message.includes("timed out")) {
        errorMessage = "The request took too long. The AI service may be busy. Please try again in a few moments.";
      } else if (error.message.includes("Rate limit") || error.message.includes("busy")) {
        errorMessage = "The AI service is currently busy. Please wait a few moments and try again.";
      } else if (error.message.includes("BYTEZ_API_KEY")) {
        errorMessage = "AI service configuration error. Please contact support.";
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}