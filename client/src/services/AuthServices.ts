import api, { removeToken, saveToken } from "../api/axios";

class AuthService {
    // Login with email and password
    async login(email: string, password: string): Promise<boolean> {
        try {
            const res = await api.post('/auth/login', { email, password });
            if (res.data?.token) {
                saveToken(res.data.token);
                return true;
            }
            return false;
        } catch (e) {
            console.error('Login error:', e);
            throw new Error('Login failed');
        }
    }

    // Register with email, username, and password
    async register(name: string, username: string, email: string, password: string): Promise<boolean> {
        try {
            const res = await api.post('/auth/register', { name, username, email, password });
            if (res.data?.token) {
                saveToken(res.data.token);
                return true;
            }
            return false;
        } catch (e) {
            console.error('Registration error:', e);
            throw new Error('Registration failed');
        }
    }

    // Register with Google OAuth
    async registerWithGoogle(): Promise<boolean> {
        window.location.href = `/auth/google`;
        return true;
    }

    // Get user profile
    async getProfile() {
        try {
            const res = await api.get('/auth/profile');
            return res.data;
        } catch (e) {
            console.error('Profile fetch error:', e);
            throw new Error('Profile fetch failed');
        }
    }

    // Logout user
    async logout(): Promise<void> {
        removeToken();
        window.location.href = '/login'; // Redirect to login page
    }
}

export const authServices = new AuthService();