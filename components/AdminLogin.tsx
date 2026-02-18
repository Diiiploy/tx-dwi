
import React, { useState } from 'react';
import { View } from '../types';
import { IconArrowLeft } from './icons';

interface AdminLoginProps {
    setView: (view: View) => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ setView }) => {
    const [username, setUsername] = useState('admin');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Simulate network request
        setTimeout(() => {
            // Hardcoded credentials for the demo
            if (username === 'admin' && password === 'password') {
                // Bypass MFA step as requested
                setView(View.AdminDashboard);
            } else {
                setError('Invalid username or password. Please try again.');
            }
            setIsLoading(false);
        }, 500);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full p-8 bg-white shadow-2xl rounded-xl border border-gray-200 relative">
                 <button 
                    onClick={() => setView(View.RoleSelector)}
                    className="absolute top-4 left-4 flex items-center gap-1 text-sm text-blue-600 hover:underline"
                >
                    <IconArrowLeft className="w-4 h-4" /> Back
                </button>
                
                <div className="text-center mb-8 mt-8">
                    <h2 className="text-2xl font-bold text-gray-900">Admin Portal Login</h2>
                    <p className="text-sm text-gray-500 mt-2">Enter credentials for direct dashboard access.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            autoComplete="username"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                            placeholder="admin"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="password"className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="text-sm">
                                <button
                                    type="button"
                                    onClick={() => alert('Password reset flow placeholder.')}
                                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                        </div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
                            placeholder="password"
                        />
                    </div>
                    
                    {error && (
                        <div className="p-3 bg-red-100 border border-red-200 text-red-700 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400 transition-colors"
                        >
                            {isLoading ? 'Authenticating...' : 'Sign In'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
