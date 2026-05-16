import mongoose, { Schema, type Document, type Model } from "mongoose";
import { USER_ROLES, type UserRole } from "@loanforge/shared";

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, required: true, enum: USER_ROLES },
    name: { type: String, trim: true },
  },
  { timestamps: true },
);

export const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>("User", userSchema);
