import React, { useState } from 'react';
import { authServices } from '../../../services/AuthServices';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const success = await authServices.login(email, password);
            if (success) {
                window.location.href = '/'; // Redirect to home page on successful login
            }
        } catch (error) {
            console.error('Login failed:', error);
            alert('Login failed. Please check your credentials and try again.');
        };
    };

    const handleGoogleLogin = () => {
        window.location.href = '/api/auth/google';
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
                <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
                    Sign in to your account
                </h2>

                <form className="space-y-5" onSubmit={handleLogin}>
                    {/* Email */}
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        className="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white shadow-md transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                    >
                        Sign In
                    </button>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center">
                    <div className="h-px flex-1 bg-gray-300" />
                    <span className="px-2 text-sm text-gray-500">or</span>
                    <div className="h-px flex-1 bg-gray-300" />
                </div>

                {/* Google login */}
                <button
                    onClick={handleGoogleLogin}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                >
                    <img
                        src="https://www.svgrepo.com/show/355037/google.svg"
                        alt="Google"
                        className="h-5 w-5"
                    />
                    Continue with Google
                </button>

                {/* Extra links */}
                <p className="mt-6 text-center text-sm text-gray-600">
                    Don’t have an account?{" "}
                    <a href="/register" className="font-medium text-indigo-600 hover:underline">
                        Sign up
                    </a>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;