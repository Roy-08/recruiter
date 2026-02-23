/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import Bytez from "bytez.js";

const key = process.env.BYTEZ_API_KEY || "e99b917d01e614241b0bc5726eafb837";
const sdk = new Bytez(key);

export async function POST(request: NextRequest) {
  try {
    const { conversation } = await request.json();

    if (!conversation || conversation.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No conversation data provided",
        },
        { status: 400 }
      );
    }

    // Build conversation history
    const conversationText = conversation
      .map((msg: any) => {
        const role = msg.role === "assistant" ? "AI Recruiter" : "Candidate";
        return `${role}: ${msg.message || msg.content || ""}`;
      })
      .join("\n");

    // Use Bytez Schematron-3B model
    const model = sdk.model("inference-net/Schematron-3B");

    const { error, output } = await model.run([
      {
        role: "system",
        content: `You are an expert technical interviewer analyzing a completed interview. 

IMPORTANT: The AI Recruiter in this interview was instructed to ONLY greet the candidate and ask questions - NOT to provide answers, hints, or solutions. 

Analyze the following interview conversation and provide detailed feedback in JSON format.

Your response MUST be a valid JSON object with this exact structure:
{
  "feedback": {
    "Overall": "Brief overall assessment of candidate's performance",
    "TechnicalSkills": "Assessment of technical knowledge demonstrated",
    "CommunicationSkills": "Assessment of communication abilities and clarity",
    "ProblemSolving": "Assessment of problem-solving approach and reasoning",
    "AreasOfImprovement": "Specific areas where candidate can improve",
    "Recommendation": "Yes or No - based on whether you'd recommend this candidate"
  },
  "rating": 7,
  "summary": "2-3 sentence summary of the interview performance"
}

Rating should be 1-10 based on:
- Quality and accuracy of answers
- Depth of technical understanding
- Communication clarity
- Problem-solving approach
- Overall readiness for the role

Recommendation should be "Yes" or "No" based on overall performance (typically "Yes" for rating 7+).

Focus your analysis on the CANDIDATE'S responses, not the interviewer's questions.`,
      },
      {
        role: "user",
        content: `Analyze this interview conversation and provide feedback:\n\n${conversationText}`,
      },
    ]);

    if (error) {
      console.error("Bytez API error:", error);
      return NextResponse.json(
        {
          success: false,
          error: typeof error === 'string' ? error : (error as any)?.message || "Failed to generate AI feedback",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      content: output,
    });
  } catch (error) {
    console.error("Error generating AI feedback:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate AI feedback",
      },
      { status: 500 }
    );
  }
}