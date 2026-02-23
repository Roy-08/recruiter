import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Interview from "@/models/Interview";
import CandidateResponse from "@/models/CandidateResponse";
import mongoose from "mongoose";

// POST - Create a new candidate response for an interview template
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { templateId, userName, userEmail } = body;
    
    // Validate required fields
    if (!userName || !userEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "User name and email are required",
        },
        { status: 400 }
      );
    }
    
    // Validate templateId
    if (!templateId || !mongoose.Types.ObjectId.isValid(templateId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid template ID",
        },
        { status: 400 }
      );
    }
    
    // Fetch the interview template
    const template = await Interview.findById(templateId).lean();
    
    if (!template) {
      return NextResponse.json(
        {
          success: false,
          error: "Interview template not found",
        },
        { status: 404 }
      );
    }
    
    // Create a new candidate response
    const candidateResponse = new CandidateResponse({
      interviewId: templateId,
      jobPosition: template.jobPosition,
      userName: userName,
      userEmail: userEmail,
      conversation: [],
      status: "pending",
    });
    
    await candidateResponse.save();
    
    console.log('✅ Created new candidate response:', candidateResponse._id);
    console.log('📋 For interview template:', templateId);
    console.log('👤 Candidate:', userName, userEmail);
    
    return NextResponse.json({
      success: true,
      data: {
        _id: candidateResponse._id,
        interviewId: templateId,
        jobPosition: template.jobPosition,
        userName: candidateResponse.userName,
        userEmail: candidateResponse.userEmail,
        status: candidateResponse.status,
        // Return template data for the interview
        template: {
          jobDescription: template.jobDescription,
          duration: template.duration,
          interviewTypes: template.interviewTypes,
          experienceLevel: template.experienceLevel,
          numberOfQuestions: template.numberOfQuestions,
          questions: template.questions,
          interviewData: template.interviewData,
        }
      },
      message: "Candidate response created successfully",
    });
  } catch (error) {
    console.error("Error creating candidate response:", error);
    
    // Handle Mongoose validation errors
    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create candidate response",
      },
      { status: 500 }
    );
  }
}