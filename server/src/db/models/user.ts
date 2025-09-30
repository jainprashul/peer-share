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
    _id: { type: String, default: () => "user_" + new mongoose.Types.ObjectId().toString(), alias: 'id' },
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    createdAt: { type: Date, default: Date.now }
}, {
    toJSON: {
        transform: (_, ret: { [key: string]: any }) => {
            delete ret.password;
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;

        }
    }
});


// Export the User model
export const User: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

