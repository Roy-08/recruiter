import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Interview from "@/models/Interview";
import CandidateResponse from "@/models/CandidateResponse";
import mongoose from "mongoose";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch a single interview or candidate response by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid ID format",
        },
        { status: 400 }
      );
    }
    
    // First, try to find it as a CandidateResponse
    const candidateResponse = await CandidateResponse.findById(id)
      .populate('interviewId', 'jobPosition jobDescription questions interviewData')
      .lean();
    
    if (candidateResponse) {
      return NextResponse.json({
        success: true,
        data: candidateResponse,
        type: 'candidate_response',
      });
    }
    
    // If not found as CandidateResponse, try as Interview template
    const interview = await Interview.findById(id).lean();
    
    if (interview) {
      return NextResponse.json({
        success: true,
        data: interview,
        type: 'interview_template',
      });
    }
    
    // Not found in either collection
    return NextResponse.json(
      {
        success: false,
        error: "Interview or candidate response not found",
      },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error fetching data:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch data",
      },
      { status: 500 }
    );
  }
}

// PUT - Update an interview template by ID
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    
    const { id } = await params;
    const body = await request.json();
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid interview ID",
        },
        { status: 400 }
      );
    }
    
    // Find and update the interview template
    const interview = await Interview.findByIdAndUpdate(
      id,
      {
        ...body,
        updatedAt: new Date(),
      },
      {
        new: true,
        runValidators: true,
      }
    ).lean();
    
    if (!interview) {
      return NextResponse.json(
        {
          success: false,
          error: "Interview not found",
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      data: interview,
      message: "Interview updated successfully",
    });
  } catch (error) {
    console.error("Error updating interview:", error);
    
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
        error: "Failed to update interview",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete an interview template by ID
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid interview ID",
        },
        { status: 400 }
      );
    }
    
    const interview = await Interview.findByIdAndDelete(id).lean();
    
    if (!interview) {
      return NextResponse.json(
        {
          success: false,
          error: "Interview not found",
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Interview deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting interview:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete interview",
      },
      { status: 500 }
    );
  }
}