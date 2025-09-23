import mongoose, { Document, Model, mongo, Schema } from "mongoose";
import { User as SharedUser } from "@peer-share/shared";

export interface Iuser extends Omit<SharedUser, 'id'>, Document {
    email: string;
    password: string;
    createdAt: Date;
}

// Define the User schema
const UserSchema: Schema<Iuser> = new Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Export the User model
export const User: Model<Iuser> = mongoose.model<Iuser>('User', UserSchema);

