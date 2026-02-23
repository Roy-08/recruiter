/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Interview from "@/models/Interview";
import CandidateResponse from "@/models/CandidateResponse";

// GET - Fetch all interviews grouped by position with their candidates
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    console.log('📥 Fetching all interviews and candidate responses...');
    
    // Fetch all interview templates
    const interviews = await Interview.find({}).lean();
    console.log(`✅ Found ${interviews.length} interview templates`);
    
    // Fetch all candidate responses
    const candidateResponses = await CandidateResponse.find({})
      .populate('interviewId', 'jobPosition jobDescription questions')
      .lean();
    console.log(`✅ Found ${candidateResponses.length} candidate responses`);
    
    // Group candidates by job position
    const groupedData: Record<string, any> = {};
    
    // First, create entries for all interview templates
    interviews.forEach((interview: any) => {
      const position = interview.jobPosition || "Untitled Position";
      
      if (!groupedData[position]) {
        groupedData[position] = {
          _id: interview._id,
          jobPosition: position,
          jobDescription: interview.jobDescription,
          questionList: interview.questions || [],
          candidates: [],
        };
      }
    });
    
    // Then, add all candidate responses to their respective positions
    candidateResponses.forEach((response: any) => {
      const position = response.jobPosition || response.interviewId?.jobPosition || "Untitled Position";
      
      // Create position entry if it doesn't exist
      if (!groupedData[position]) {
        groupedData[position] = {
          _id: response.interviewId?._id || response._id,
          jobPosition: position,
          jobDescription: response.interviewId?.jobDescription || "",
          questionList: response.interviewId?.questions || [],
          candidates: [],
        };
      }
      
      // Add candidate to the position
      groupedData[position].candidates.push({
        _id: response._id,
        userName: response.userName,
        userEmail: response.userEmail,
        rating: response.rating || 0,
        status: response.status,
        completedAt: response.completedAt,
        feedback: response.feedback,
        recommended: response.recommended,
      });
    });
    
    // Convert grouped data to array
    const result = Object.values(groupedData);
    
    console.log(`📊 Returning ${result.length} positions with candidates`);
    console.log('📋 Positions:', result.map((r: any) => `${r.jobPosition} (${r.candidates.length} candidates)`));
    
    return NextResponse.json({
      success: true,
      data: result,
      message: `Found ${result.length} positions with ${candidateResponses.length} total candidates`,
    });
  } catch (error) {
    console.error("❌ Error fetching interviews:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch interviews",
      },
      { status: 500 }
    );
  }
}