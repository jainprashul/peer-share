import { Request, Response } from "express";
import { UserService } from "../services/userServices";
import { generateToken } from "../utils";
import passport from "passport";
import { IUser } from "../db/models/user";

const userService = new UserService();

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, username, email, password } = req.body;
        const userExists = await await userService.getUserByEmail(email); // Check if user already exists
        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
        } else {
            const newUser = await userService.createUser({ name, username, email, password }); // Create user with hashed password
            const token = generateToken(newUser); // Generate JWT token for the new user
            res.status(201).json({ newUser, token }); // Return user and token
        }
    } catch (err) {
        res.status(500).json({ message: 'Registration Failed', error: err }); // Handle errors
    }
}

// Login route to authenticate user and return JWT token
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;
        const user = await userService.getUserByEmail(email); // Find user by email
        if (!user) {
            res.status(401).json({ message: 'Invalid credentials' });
            return;
        }

        //compare password
        const isMatch = await userService.comparePassword(password, user.password!);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid Password' });
            return;
        }

        const token = generateToken(user);
        res.json({ user, token });

    } catch (err) {
        res.status(500).json({ message: "Login Failed ", error: err });
    }
}

export const profile = (req: Request, res: Response) => {
    res.json(req.user);
}




//authMiddleware

export function jwtAuthenticate(req: Request, res: Response, next: Function) {
    passport.authenticate('jwt', { session: false }, (err: Error | null, user: IUser, info: any) => {
        if (err) return next(err);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });
        req.user = user;
        next();
    })(req, res, next);
}