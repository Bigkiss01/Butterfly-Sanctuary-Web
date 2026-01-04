import React from 'react';
import { Calendar } from 'lucide-react';

const TimeRangeSelector = ({ timeRange, setTimeRange }) => {
    return (
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
            <Calendar className="w-5 h-5 text-gray-500 ml-2" />
            <button
                onClick={() => setTimeRange('today')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeRange === 'today'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
            >
                Today
            </button>
            <button
                onClick={() => setTimeRange('7days')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeRange === '7days'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
            >
                7 Days
            </button>
            <button
                onClick={() => setTimeRange('30days')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeRange === '30days'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
            >
                30 Days
            </button>
        </div>
    );
};

export default TimeRangeSelector;
