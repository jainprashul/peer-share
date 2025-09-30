import axios from "axios";
const api = axios.create({
    baseURL: "/api",
    // withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use(config => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export function saveToken(token: string): void {
    localStorage.setItem('authToken', token);
}

export function getToken() {
    return localStorage.getItem('authToken');
}

export function removeToken() {
    localStorage.removeItem('authToken');
}

export default api;