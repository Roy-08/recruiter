/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICandidateResponse extends Document {
  interviewId: mongoose.Types.ObjectId;
  jobPosition: string;
  userName: string;
  userEmail: string;
  conversation: any[];
  feedback?: any;
  rating?: number;
  recommended?: boolean;
  status: "pending" | "in-progress" | "completed" | "cancelled";
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CandidateResponseSchema: Schema<ICandidateResponse> = new Schema(
  {
    interviewId: {
      type: Schema.Types.ObjectId,
      ref: "Interview",
      required: [true, "Interview ID is required"],
      index: true,
    },
    jobPosition: {
      type: String,
      required: [true, "Job position is required"],
      trim: true,
    },
    userName: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },
    userEmail: {
      type: String,
      required: [true, "User email is required"],
      trim: true,
      lowercase: true,
    },
    conversation: [Schema.Types.Mixed],
    feedback: Schema.Types.Mixed,
    rating: {
      type: Number,
      min: 0,
      max: 10,
    },
    recommended: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
    completedAt: Date,
  },
  {
    timestamps: true,
    strict: false,
  }
);

CandidateResponseSchema.index({ interviewId: 1, createdAt: -1 });
CandidateResponseSchema.index({ userEmail: 1, interviewId: 1 });

const CandidateResponse: Model<ICandidateResponse> =
  mongoose.models.CandidateResponse || 
  mongoose.model<ICandidateResponse>("CandidateResponse", CandidateResponseSchema);

export default CandidateResponse;