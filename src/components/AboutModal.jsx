import React from 'react';
import { Info } from 'lucide-react';

const AboutModal = ({ t, highlightItems, onClose }) => {
    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[100]"
            onClick={onClose}
        >
            <div
                className="bg-gradient-to-br from-teal-900 to-cyan-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 border-4 border-white/30 relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-red-500 text-white w-10 h-10 rounded-full font-bold hover:bg-red-600 transition-all text-xl"
                >
                    ✕
                </button>

                <div className="flex items-start gap-3 mb-4">
                    <Info className="w-10 h-10 text-yellow-300 flex-shrink-0" />
                    <h3 className="text-2xl font-bold text-white">
                        {t('sanctuary.about.title')}
                    </h3>
                </div>

                <div className="space-y-4">
                    <p className="text-white/90 text-base leading-relaxed">
                        {t('sanctuary.about.body1')}
                    </p>
                    <p className="text-white/90 text-base leading-relaxed">
                        {t('sanctuary.about.body2')}
                    </p>

                    <div className="bg-white/10 rounded-xl p-4 border border-white/30 mt-4">
                        <h4 className="text-lg font-bold text-yellow-300 mb-3">
                            {t('sanctuary.about.highlightsTitle')}
                        </h4>
                        <ul className="text-white/90 space-y-2 text-sm">
                            {highlightItems.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutModal;
