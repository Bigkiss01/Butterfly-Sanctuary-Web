import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy load components
const ButterflyApp = lazy(() => import('../index.jsx'));
const ScanHandler = lazy(() => import('./components/ScanHandler'));
const AdminRoutes = lazy(() => import('./admin/AdminRoutes'));

const AppRoutes = () => {
    console.log('AppRoutes rendered');
    return (
        <Suspense fallback={<LoadingSpinner />}>
            <Routes>
                <Route path="/" element={<ButterflyApp />} />
                <Route path="/scan/:id" element={<ScanHandler />} />
                <Route path="/admin/*" element={<AdminRoutes />} />
                {/* Fallback route */}
                <Route path="*" element={<ButterflyApp />} />
            </Routes>
        </Suspense>
    );
};

export default AppRoutes;
