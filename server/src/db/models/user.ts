import mongoose, { Document, Model, Schema } from "mongoose";
import { User as SharedUser } from "@peer-share/shared";

export interface IUser extends Omit<SharedUser, 'id'>, Document {
    name: string;
    email: string;
    username: string;
    password: string;
    createdAt: Date;
}

// Define the User schema
const UserSchema: Schema<IUser> = new Schema({
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    createdAt: { type: Date, default: Date.now }
});

// Export the User model
export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

