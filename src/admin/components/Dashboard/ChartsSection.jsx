import React from 'react';
import { Bar, Line } from 'react-chartjs-2';
import { TrendingUp } from 'lucide-react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

const ChartsSection = ({ distributionChartData, trendChartData, distributionChartOptions, trendChartOptions }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Rating Distribution Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-6">
                    <TrendingUp className="w-5 h-5 text-gray-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800">Rating Analysis</h3>
                </div>
                <div className="h-80">
                    <Bar data={distributionChartData} options={distributionChartOptions} />
                </div>
            </div>

            {/* Trend Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-6">
                    <TrendingUp className="w-5 h-5 text-gray-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800">Rating Trend</h3>
                </div>
                <div className="h-80">
                    <Line data={trendChartData} options={trendChartOptions} />
                </div>
            </div>
        </div>
    );
};

export default ChartsSection;
