import React from 'react';
import { Calendar, X } from 'lucide-react';

const FeedbackFilter = ({ selectedDate, setSelectedDate, handleClearFilter }) => {
    return (
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200">
            <Calendar className="w-5 h-5 text-gray-500" />
            <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="outline-none text-gray-700 bg-transparent"
            />
            {selectedDate && (
                <button
                    onClick={handleClearFilter}
                    className="p-1 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                    title="Clear filter"
                >
                    <X className="w-4 h-4" />
                </button>
            )}
        </div>
    );
};

export default FeedbackFilter;
