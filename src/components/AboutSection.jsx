import React from 'react';
import { Info } from 'lucide-react';

const AboutSection = ({ t, highlightItems, isMobile, onReadMore }) => {
    return (
        <div className="bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-3xl p-4 md:p-8 border-2 border-teal-300/50">
            <div className="flex items-start gap-3 md:gap-4">
                <Info className="w-8 h-8 md:w-12 md:h-12 text-yellow-300 flex-shrink-0" />
                <div className="flex-1">
                    <h3 className="text-xl md:text-3xl font-bold text-white mb-2 md:mb-3">
                        {t('sanctuary.about.title')}
                    </h3>

                    {/* Mobile: Show truncated version */}
                    <div className="md:hidden">
                        <p className="text-white/90 text-sm leading-relaxed mb-3 line-clamp-3">
                            {t('sanctuary.about.body1')}
                        </p>
                        <button
                            onClick={onReadMore}
                            className="text-yellow-300 font-semibold text-sm hover:text-yellow-200 transition-colors flex items-center gap-1"
                        >
                            Read More →
                        </button>
                    </div>

                    {/* Desktop: Show full content */}
                    <div className="hidden md:block">
                        <p className="text-white/90 text-lg leading-relaxed mb-4">
                            {t('sanctuary.about.body1')}
                        </p>
                        <p className="text-white/90 text-lg leading-relaxed mb-4">
                            {t('sanctuary.about.body2')}
                        </p>
                        <div className="bg-white/10 rounded-xl p-5 border border-white/30">
                            <h4 className="text-xl font-bold text-yellow-300 mb-3">
                                {t('sanctuary.about.highlightsTitle')}
                            </h4>
                            <ul className="text-white/90 space-y-2 text-base">
                                {highlightItems.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutSection;
