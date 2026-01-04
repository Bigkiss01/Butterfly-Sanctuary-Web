import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

// Lazy load admin components
const AdminLogin = lazy(() => import('./AdminLogin'));
const AdminLayout = lazy(() => import('./AdminLayout'));
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const FeedbackList = lazy(() => import('./FeedbackList'));
const ButterflyList = lazy(() => import('./ButterflyList'));
const ButterflySorter = lazy(() => import('./ButterflySorter'));


const ProtectedAdminRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();
    const navigate = useNavigate();

    if (loading) {
        return <LoadingSpinner />;
    }

    if (!currentUser) {
        return <Navigate to="/admin" replace />;
    }

    return children;
};

const AdminRoutes = () => {
    console.log('AdminRoutes rendered');
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <Routes>
                <Route path="/" element={<AdminLogin />} />
                <Route
                    element={
                        <ProtectedAdminRoute>
                            <AdminLayout />
                        </ProtectedAdminRoute>
                    }
                >
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="feedback" element={<FeedbackList />} />
                    <Route path="butterflies" element={<ButterflyList />} />
                    <Route path="sorter" element={<ButterflySorter />} />


                </Route>
            </Routes>
        </Suspense>
    );
};

export default AdminRoutes;
