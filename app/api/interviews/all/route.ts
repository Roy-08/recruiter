/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Interview from "@/models/Interview";
import CandidateResponse from "@/models/CandidateResponse";

// GET - Fetch all interviews grouped by position with their candidates
export async function GET() {
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
    
    // Group candidates by interview template ID (not by position name string)
    // This prevents duplicate groups when position names have slight differences
    const groupedData: Record<string, any> = {};
    
    // First, create entries for all interview templates keyed by their _id
    interviews.forEach((interview: any) => {
      const templateId = interview._id.toString();
      
      if (!groupedData[templateId]) {
        groupedData[templateId] = {
          _id: interview._id,
          jobPosition: interview.jobPosition || "Untitled Position",
          jobDescription: interview.jobDescription,
          questionList: interview.questions || [],
          candidates: [],
        };
      }
    });
    
    // Then, add all candidate responses to their respective interview template
    // Use a Set to track unique candidates per template (by email) to prevent duplicates
    const addedCandidates: Record<string, Set<string>> = {};
    
    candidateResponses.forEach((response: any) => {
      // Determine the template ID this response belongs to
      const templateId = response.interviewId?._id?.toString() 
        || response.interviewId?.toString() 
        || null;
      
      if (!templateId) {
        console.log('⚠️ Skipping candidate response with no interviewId:', response._id);
        return;
      }
      
      // Create position entry if it doesn't exist (for orphaned responses)
      if (!groupedData[templateId]) {
        groupedData[templateId] = {
          _id: response.interviewId?._id || response.interviewId,
          jobPosition: response.jobPosition || response.interviewId?.jobPosition || "Untitled Position",
          jobDescription: response.interviewId?.jobDescription || "",
          questionList: response.interviewId?.questions || [],
          candidates: [],
        };
      }
      
      // Initialize the tracking set for this template
      if (!addedCandidates[templateId]) {
        addedCandidates[templateId] = new Set();
      }
      
      // Create a unique key for this candidate per template
      const candidateKey = `${response.userEmail || ''}_${response._id.toString()}`;
      
      // For the same user+template, if there's already a "completed" entry, skip "pending" duplicates
      // If there's a "pending" entry and this one is "completed", replace the pending one
      const existingCandidateIndex = groupedData[templateId].candidates.findIndex(
        (c: any) => c.userEmail === response.userEmail
      );
      
      if (existingCandidateIndex !== -1) {
        const existingCandidate = groupedData[templateId].candidates[existingCandidateIndex];
        
        // If the existing one is "pending" and the new one is "completed", replace it
        if (existingCandidate.status === "pending" && response.status === "completed") {
          groupedData[templateId].candidates[existingCandidateIndex] = {
            _id: response._id,
            userName: response.userName,
            userEmail: response.userEmail,
            rating: response.rating || 0,
            status: response.status,
            completedAt: response.completedAt,
            feedback: response.feedback,
            recommended: response.recommended,
          };
          console.log(`♻️ Replaced pending with completed for ${response.userEmail} in template ${templateId}`);
        }
        // If the existing one is "completed" and the new one is "pending", skip the pending one
        // If both are the same status, keep the first one (or the one with more data)
        return;
      }
      
      // Add candidate to the position
      groupedData[templateId].candidates.push({
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
