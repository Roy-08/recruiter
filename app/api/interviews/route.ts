import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Interview from "@/models/Interview";

// GET - Fetch all interviews
export async function GET() {
  try {
    await connectDB();
    
    const interviews = await Interview.find({})
      .sort({ createdAt: -1 })
      .lean();
    
    return NextResponse.json({
      success: true,
      data: interviews,
      count: interviews.length,
    });
  } catch (error) {
    console.error("Error fetching interviews:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch interviews",
      },
      { status: 500 }
    );
  }
}

// POST - Create a new interview
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      "jobPosition",
      "jobDescription",
      "duration",
      "interviewTypes",
      "experienceLevel",
      "numberOfQuestions",
    ];
    
    const missingFields = requiredFields.filter((field) => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }
    
    // Validate interviewTypes is not empty
    if (!Array.isArray(body.interviewTypes) || body.interviewTypes.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "At least one interview type must be selected",
        },
        { status: 400 }
      );
    }
    
    // Create new interview
    const interview = await Interview.create({
      jobPosition: body.jobPosition,
      jobDescription: body.jobDescription,
      duration: body.duration,
      interviewTypes: body.interviewTypes,
      experienceLevel: body.experienceLevel,
      numberOfQuestions: body.numberOfQuestions,
      questions: body.questions || [],
      status: body.status || "draft",
    });
    
    return NextResponse.json(
      {
        success: true,
        data: interview,
        message: "Interview created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating interview:", error);
    
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
        error: "Failed to create interview",
      },
      { status: 500 }
    );
  }
}