import api, { removeToken, saveToken } from "../api/axios";

class AuthService {
    // Login with email and password
    async login(email: string, password: string): Promise<boolean> {
        const res = await api.post('/auth/login', { email, password });
        if (res.data?.token) {
            saveToken(res.data.token);
            return true;
        }
        return Promise.reject(new Error('Login failed'));
    }

    // Register with email, username, and password
    async register(name: string, username: string, email: string, password: string): Promise<boolean> {
        const res = await api.post('/auth/register', { name, username, email, password });
        if (res.data?.token) {
            saveToken(res.data.token);
            return true;
        }
        return Promise.reject(new Error('Registration failed'));
    }

    // Register with Google OAuth
    async registerWithGoogle(): Promise<boolean> {
        window.location.href = `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5173/api"}/auth/google`;
        return true;
    }

    // Get user profile
    async getProfile() {
        const res = await api.get('/auth/profile');
        return res.data;
    }

    // Logout user
    async logout(): Promise<void> {
        removeToken();
        window.location.href = '/login'; // Redirect to login page
    }
}

export const authServices = new AuthService();