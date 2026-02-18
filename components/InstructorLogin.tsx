import React, { useState } from 'react';
import { View } from '../types';
import { IconArrowLeft } from './icons';

interface InstructorLoginProps {
    setView: (view: View) => void;
    onLogin: (code: string) => boolean;
}

const InstructorLogin: React.FC<InstructorLoginProps> = ({ setView, onLogin }) => {
    const [code, setCode] = useState('INST-2026');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Simulate a quick check
        setTimeout(() => {
            const success = onLogin(code);
            if (!success) {
                setError('Invalid session code. Please check the code and try again.');
            }
            setIsLoading(false);
        }, 300);
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
                    <h2 className="text-2xl font-bold text-gray-900">Instructor Login</h2>
                     <p className="text-center text-gray-600 mt-2">Enter the unique code for your live session.</p>
                </div>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="session-code" className="block text-sm font-medium text-gray-700">
                            Session Code
                        </label>
                        <input
                            id="session-code"
                            name="session-code"
                            type="text"
                            autoComplete="off"
                            required
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900 text-center tracking-widest font-mono"
                            placeholder="XXXX-XXXX"
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
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:bg-purple-300"
                        >
                            {isLoading ? 'Verifying...' : 'Join Session'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default InstructorLogin;