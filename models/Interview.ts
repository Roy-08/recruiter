/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { Schema, Document, Model } from "mongoose";

export interface IQuestion {
  id: string;
  question: string;
  type: string;
  difficulty: "easy" | "medium" | "hard";
  expectedAnswer?: string;
  timeLimit?: number; // in seconds
}

export interface IInterview extends Document {
  jobPosition: string;
  jobDescription: string;
  duration: string;
  interviewTypes: string[];
  experienceLevel: string;
  numberOfQuestions: string;
  questions: IQuestion[];
  status: "draft" | "scheduled" | "completed" | "cancelled" | "pending";
  userName?: string;
  userEmail?: string;
  rating?: number;
  feedback?: any;
  recommended?: boolean;
  completedAt?: Date;
  interviewData?: {
    questionList?: IQuestion[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const QuestionSchema: Schema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["technical", "behavioral", "experience", "problemSolving", "leadership"],
    },
    difficulty: {
      type: String,
      required: true,
      enum: ["easy", "medium", "hard"],
    },
    expectedAnswer: {
      type: String,
      default: "",
    },
    timeLimit: {
      type: Number,
      default: 120, // 2 minutes default
    },
  },
  { _id: false }
);

const InterviewSchema: Schema<IInterview> = new Schema(
  {
    jobPosition: {
      type: String,
      required: [true, "Job position is required"],
      trim: true,
      maxlength: [100, "Job position cannot exceed 100 characters"],
    },
    jobDescription: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
      maxlength: [5000, "Job description cannot exceed 5000 characters"],
    },
    duration: {
      type: String,
      required: [true, "Interview duration is required"],
      enum: ["15", "30", "45", "60", "90", "120"],
    },
    interviewTypes: {
      type: [String],
      required: [true, "At least one interview type is required"],
      validate: {
        validator: function (v: string[]) {
          return v && v.length > 0;
        },
        message: "At least one interview type must be selected",
      },
      enum: ["technical", "behavioral", "experience", "problemSolving", "leadership"],
    },
    experienceLevel: {
      type: String,
      required: [true, "Experience level is required"],
      enum: ["entry", "mid", "senior", "lead"],
    },
    numberOfQuestions: {
      type: String,
      required: [true, "Number of questions is required"],
      validate: {
        validator: function (v: string) {
          const num = parseInt(v);
          return num >= 1 && num <= 50;
        },
        message: "Number of questions must be between 1 and 50",
      },
    },
    questions: {
      type: [QuestionSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["draft", "scheduled", "completed", "cancelled", "pending"],
      default: "draft",
    },
    userName: {
      type: String,
      trim: true,
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
    },
    feedback: {
      type: Schema.Types.Mixed,
    },
    recommended: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    interviewData: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in development
const Interview: Model<IInterview> =
  mongoose.models.Interview || mongoose.model<IInterview>("Interview", InterviewSchema);

export default Interview;