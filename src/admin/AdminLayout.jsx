import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, MessageSquare, LogOut, Sparkles } from 'lucide-react';

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/admin');
        } catch (error) {
            console.error('Failed to log out', error);
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <header className="bg-white shadow-sm z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center">
                            <h1 className="text-xl font-bold text-gray-800">Butterfly Admin</h1>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-md text-sm font-medium"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Container */}
            <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-8">
                {/* Sidebar Navigation */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <nav className="bg-white rounded-lg shadow-sm p-4 space-y-2 sticky top-24">
                        <Link
                            to="/admin/dashboard"
                            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive('/admin/dashboard')
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <LayoutDashboard className="w-5 h-5 mr-3" />
                            Dashboard
                        </Link>
                        <Link
                            to="/admin/feedback"
                            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive('/admin/feedback')
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <MessageSquare className="w-5 h-5 mr-3" />
                            Feedback List
                        </Link>
                        <Link
                            to="/admin/butterflies"
                            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive('/admin/butterflies')
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <Sparkles className="w-5 h-5 mr-3" />
                            Butterfly Management
                        </Link>
                        <Link
                            to="/admin/sorter"
                            className={`flex items-center px-4 py-3 rounded-lg transition-colors ${isActive('/admin/sorter')
                                ? 'bg-blue-50 text-blue-700 font-medium'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <span className="text-xl mr-3">🦋</span>
                            Batch Sorter
                        </Link>

                    </nav>
                </aside>

                {/* Page Content */}
                <main className="flex-1 min-w-0">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
