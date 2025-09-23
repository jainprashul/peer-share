import { Request, Response } from 'express';

export class UserController {
    private userService;

    constructor(userService: any) {
        this.userService = userService;
    }

    createUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const userData = await this.userService.createUser(req.body);
            res.status(201).json(userData);
        } catch (error) {
            res.status(500).json({ error: 'Failed to create user' });
        }
    }

    getUserById = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await this.userService.getUserById(req.params.id);
            if (user) {
                res.status(200).json(user);
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to retrieve user' });
        }
    }

    getUserByEmail = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await this.userService.getUserByEmail(req.params.email);
            if (user) {
                res.status(200).json(user);
            }
            else {
                res.status(404).json({ error: 'User not found' });
            }
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to retrieve user by email' });
        }
    }

    updateUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const updatedUser = await this.userService.updateUser(req.params.id, req.body);
            if (updatedUser) {
                res.status(200).json(updatedUser);
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to update user' });
        }
    }

    deleteUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const deletedUser = await this.userService.deleteUser(req.params.id);
            if (deletedUser) {
                res.status(200).json({ message: 'User deleted successfully' });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete user' });
        }
    }
}