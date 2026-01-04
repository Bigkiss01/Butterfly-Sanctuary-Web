import React from 'react';
import { Users, Star } from 'lucide-react';

const SummaryCards = ({ stats, rangeLabel }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Feedback - {rangeLabel}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <Users className="w-6 h-6 text-blue-600" />
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Average Rating - {rangeLabel}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{stats.averageRating}</p>
                    </div>
                    <div className="bg-yellow-50 p-3 rounded-lg">
                        <Star className="w-6 h-6 text-yellow-600" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryCards;
