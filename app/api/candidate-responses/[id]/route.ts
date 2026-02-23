import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import CandidateResponse from "@/models/CandidateResponse";
import mongoose from "mongoose";

// PUT - Update a candidate response with feedback and results
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id: responseId } = await params;
    
    // Validate responseId
    if (!responseId || !mongoose.Types.ObjectId.isValid(responseId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid response ID",
        },
        { status: 400 }
      );
    }
    
    const body = await request.json();
    const { conversation, feedback, rating, status, recommended, completedAt } = body;
    
    // Find and update the candidate response
    const updatedResponse = await CandidateResponse.findByIdAndUpdate(
      responseId,
      {
        $set: {
          conversation: conversation,
          feedback: feedback,
          rating: rating,
          status: status || "completed",
          recommended: recommended || false,
          completedAt: completedAt || new Date(),
        },
      },
      { new: true, runValidators: true }
    );
    
    if (!updatedResponse) {
      return NextResponse.json(
        {
          success: false,
          error: "Candidate response not found",
        },
        { status: 404 }
      );
    }
    
    console.log('✅ Updated candidate response:', responseId);
    console.log('📊 Rating:', rating, '| Status:', status);
    
    return NextResponse.json({
      success: true,
      data: updatedResponse,
      message: "Candidate response updated successfully",
    });
  } catch (error) {
    console.error("Error updating candidate response:", error);
    
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
        error: "Failed to update candidate response",
      },
      { status: 500 }
    );
  }
}

// GET - Fetch a single candidate response
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id: responseId } = await params;
    
    // Validate responseId
    if (!responseId || !mongoose.Types.ObjectId.isValid(responseId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid response ID",
        },
        { status: 400 }
      );
    }
    
    const candidateResponse = await CandidateResponse.findById(responseId)
      .populate('interviewId', 'jobPosition jobDescription questions interviewData');
    
    if (!candidateResponse) {
      return NextResponse.json(
        {
          success: false,
          error: "Candidate response not found",
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: candidateResponse,
    });
  } catch (error) {
    console.error("Error fetching candidate response:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch candidate response",
      },
      { status: 500 }
    );
  }
}