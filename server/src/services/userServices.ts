import { IUser, User } from "../db/models/user";
import bcrypt from 'bcrypt';
import { logger } from "../utils";

export class UserService {

    // Create a new user with hashed password
    async createUser(data: Partial<IUser>): Promise<IUser> {
        // const user = new User(data);
        // await user.save();
        // return user;

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.password!, salt);
        const user = new User({
            ...data,
            password: hashedPassword
        });
        await user.save();
        logger.info(`User created: ${user.email}`);
        return user;
    }

    // Get user by ID
    async getUserById(id: string): Promise<IUser | null> {
        return await User.findById(id);
    }

    // Get user by email
    async getUserByEmail(email: string): Promise<IUser | null> {
        return await User.findOne({ email }).select('+password');
    }

    // Update user details
    async updateUser(id: string, data: Partial<IUser>): Promise<IUser | null> {
        try {
            const user = await User.findByIdAndUpdate(id, data, { new: true });
            logger.log(`User updated: ${user?.email}`);
            return user;
        } catch (error) {
            logger.error(`Error updating user: ${error}`);
            return null;
        }
    }

    // Delete user by ID
    async deleteUser(id: string): Promise<IUser | null> {
        try {
            const user = await User.findByIdAndDelete(id);
            logger.log(`User Deleted: ${user?.id}`);
            return user;
        } catch (error) {
            logger.error(`user deleting failed: ${error}`);
            return null;
        }
    }

    // Compare plaintext password with hashed password
    async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }
}