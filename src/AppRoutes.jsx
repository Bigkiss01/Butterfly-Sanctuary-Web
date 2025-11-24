import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ButterflyApp from '../index.jsx';
import ScanHandler from './components/ScanHandler';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<ButterflyApp />} />
            <Route path="/scan/:id" element={<ScanHandler />} />
            {/* Fallback route */}
            <Route path="*" element={<ButterflyApp />} />
        </Routes>
    );
};

export default AppRoutes;
