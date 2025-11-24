import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles } from 'lucide-react';

const ScanHandler = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        // Simulate processing the scan
        const timer = setTimeout(() => {
            // In a real app, you might validate the ID here
            // For now, we'll just redirect to the home page with the butterfly ID selected
            // You might need to update your main App to handle a query param or state for this
            navigate(`/?butterfly=${id}`);
        }, 2000);

        return () => clearTimeout(timer);
    }, [id, navigate]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-900 via-purple-800 to-fuchsia-900 flex items-center justify-center p-4">
            <div className="text-center">
                <Sparkles className="w-16 h-16 text-yellow-300 mx-auto mb-6 animate-spin" />
                <h2 className="text-3xl font-bold text-white mb-4">{t('scan.processing', 'Processing Scan...')}</h2>
                <p className="text-yellow-100 text-xl">{t('scan.wait', 'Discovering butterfly details...')}</p>
            </div>
        </div>
    );
};

export default ScanHandler;
