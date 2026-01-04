import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import TimeRangeSelector from './components/Dashboard/TimeRangeSelector';
import SummaryCards from './components/Dashboard/SummaryCards';
import ChartsSection from './components/Dashboard/ChartsSection';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('today'); // 'today', '7days', '30days'
    const [stats, setStats] = useState({
        total: 0,
        averageRating: 0,
        ratingDistribution: [0, 0, 0, 0, 0], // 1 to 5 stars
    });
    const [trendData, setTrendData] = useState({
        labels: [],
        averages: [],
        counts: [],
    });

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const now = new Date();
                let startDate;
                let days = 1;

                switch (timeRange) {
                    case '7days':
                        days = 7;
                        startDate = subDays(startOfDay(now), 6); // Last 7 days including today
                        break;
                    case '30days':
                        days = 30;
                        startDate = subDays(startOfDay(now), 29); // Last 30 days including today
                        break;
                    case 'today':
                    default:
                        startDate = startOfDay(now);
                        break;
                }

                const endDate = endOfDay(now);

                const q = query(
                    collection(db, 'feedback'),
                    where('createdAt', '>=', Timestamp.fromDate(startDate)),
                    where('createdAt', '<=', Timestamp.fromDate(endDate))
                );

                const querySnapshot = await getDocs(q);

                let totalRating = 0;
                const distribution = [0, 0, 0, 0, 0];
                const dailyData = {};

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    const rating = data.rating || 0;
                    const timestamp = data.createdAt?.seconds * 1000;

                    if (rating >= 1 && rating <= 5) {
                        distribution[rating - 1]++;
                        totalRating += rating;

                        // Group by date for trend analysis
                        if (timestamp) {
                            const dateKey = format(new Date(timestamp), 'yyyy-MM-dd');
                            if (!dailyData[dateKey]) {
                                dailyData[dateKey] = { totalRating: 0, count: 0 };
                            }
                            dailyData[dateKey].totalRating += rating;
                            dailyData[dateKey].count++;
                        }
                    }
                });

                const count = querySnapshot.size;

                // Prepare trend data
                const labels = [];
                const averages = [];
                const counts = [];

                for (let i = days - 1; i >= 0; i--) {
                    const date = subDays(now, i);
                    const dateKey = format(date, 'yyyy-MM-dd');
                    const displayLabel = timeRange === 'today'
                        ? format(date, 'HH:mm')
                        : format(date, 'dd/MM');

                    labels.push(displayLabel);

                    const dayData = dailyData[dateKey];
                    if (dayData && dayData.count > 0) {
                        averages.push((dayData.totalRating / dayData.count).toFixed(2));
                        counts.push(dayData.count);
                    } else {
                        averages.push(0);
                        counts.push(0);
                    }
                }

                setStats({
                    total: count,
                    averageRating: count > 0 ? (totalRating / count).toFixed(2) : 0,
                    ratingDistribution: distribution,
                });

                setTrendData({
                    labels,
                    averages,
                    counts,
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [timeRange]);

    const distributionChartData = {
        labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
        datasets: [
            {
                label: 'Number of Ratings',
                data: stats.ratingDistribution,
                backgroundColor: [
                    'rgba(239, 68, 68, 0.6)',
                    'rgba(249, 115, 22, 0.6)',
                    'rgba(234, 179, 8, 0.6)',
                    'rgba(168, 85, 247, 0.6)',
                    'rgba(34, 197, 94, 0.6)',
                ],
                borderColor: [
                    'rgb(239, 68, 68)',
                    'rgb(249, 115, 22)',
                    'rgb(234, 179, 8)',
                    'rgb(168, 85, 247)',
                    'rgb(34, 197, 94)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const trendChartData = {
        labels: trendData.labels,
        datasets: [
            {
                label: 'Average Rating',
                data: trendData.averages,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.3,
                fill: true,
            },
        ],
    };

    const distributionChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            title: {
                display: true,
                text: "Rating Distribution",
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1,
                },
            },
        },
    };

    const trendChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
            },
            title: {
                display: true,
                text: "Rating Trend Over Time",
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 5,
                ticks: {
                    stepSize: 0.5,
                },
            },
        },
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    const rangeLabel =
        timeRange === 'today' ? 'Today' :
            timeRange === '7days' ? 'Last 7 Days' :
                'Last 30 Days';

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => navigate('/admin/importer')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <span>📥</span> Import Sorted Data
                    </button>
                    <TimeRangeSelector timeRange={timeRange} setTimeRange={setTimeRange} />
                </div>
            </div>

            <SummaryCards stats={stats} rangeLabel={rangeLabel} />

            <ChartsSection
                distributionChartData={distributionChartData}
                trendChartData={trendChartData}
                distributionChartOptions={distributionChartOptions}
                trendChartOptions={trendChartOptions}
            />
        </div>
    );
};

export default AdminDashboard;
