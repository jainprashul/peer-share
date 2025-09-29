import React from 'react'
import { useAppSelector } from '../store/store';
import { Button } from '../components/Button/Button';
import { useNavigate } from 'react-router';

function Layout({ children }: { children: React.ReactNode }) {
    const user = useAppSelector((state) => state.user.currentUser);
    const navigate = useNavigate();
    console.log(user);
    function handleLogin() {
        navigate('/login');
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <h1 className="text-3xl font-bold text-gray-900">PeerShare</h1>
                        <div className="text-sm text-gray-500">{user?.id}
                            <br />
                            {user?.username}
                            <Button onClick={handleLogin}>Logout</Button>
                        </div>
                    </div>
                </div>
            </header >
            <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                {children}
            </main>
        </div >
    )
}

export default Layout