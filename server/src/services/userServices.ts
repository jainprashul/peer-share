import { Iuser, User } from "../db/models/user";
import bcrypt from 'bcrypt';

export class UserService {

    async createUser(data: Partial<Iuser>): Promise<Iuser> {
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
        return user;
    }

    async getUserById(id: string): Promise<Iuser | null> {
        return User.findById(id);
    }

    async getUserByEmail(email: string): Promise<Iuser | null> {
        return User.findOne({ email });
    }

    async updateUser(id: string, data: Partial<Iuser>): Promise<Iuser | null> {
        return User.findByIdAndUpdate(id, data, { new: true });
    }

    async deleteUser(id: string): Promise<Iuser | null> {
        return User.findByIdAndDelete(id);
    }

    async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(password, hashedPassword);
    }
}