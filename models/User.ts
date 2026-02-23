import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    image: String,
    provider: {
      type: String,
      default: "google",
    },
  },
  { timestamps: true }
);

const User = models.User || model("User", UserSchema);

export default User;
