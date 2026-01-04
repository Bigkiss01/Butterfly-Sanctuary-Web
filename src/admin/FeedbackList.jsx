import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { format } from 'date-fns';
import * as XLSX from 'xlsx';
import FeedbackFilter from './components/Feedback/FeedbackFilter';
import ExportButtons from './components/Feedback/ExportButtons';
import FeedbackTable from './components/Feedback/FeedbackTable';

const FeedbackList = () => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState('');

    const fetchFeedbacks = async (dateFilter = null) => {
        setLoading(true);
        try {
            let q;
            const feedbacksRef = collection(db, 'feedback');

            if (dateFilter) {
                const startOfDay = new Date(dateFilter);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(dateFilter);
                endOfDay.setHours(23, 59, 59, 999);

                q = query(
                    feedbacksRef,
                    where('createdAt', '>=', Timestamp.fromDate(startOfDay)),
                    where('createdAt', '<=', Timestamp.fromDate(endOfDay)),
                    orderBy('createdAt', 'desc')
                );
            } else {
                q = query(feedbacksRef, orderBy('createdAt', 'desc'));
            }

            const querySnapshot = await getDocs(q);
            const feedbackData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setFeedbacks(feedbackData);
        } catch (error) {
            console.error("Error fetching feedbacks:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedbacks(selectedDate);
    }, [selectedDate]);

    const handleClearFilter = () => {
        setSelectedDate('');
    };

    const handleExportCSV = () => {
        // Prepare CSV data
        const headers = ['Date', 'Time', 'Name', 'Rating', 'Comment', 'Email', 'Phone'];
        const rows = feedbacks.map(feedback => [
            feedback.createdAt?.seconds
                ? format(new Date(feedback.createdAt.seconds * 1000), 'dd/MM/yyyy')
                : 'N/A',
            feedback.createdAt?.seconds
                ? format(new Date(feedback.createdAt.seconds * 1000), 'HH:mm')
                : 'N/A',
            feedback.name || 'Anonymous',
            feedback.rating || 0,
            `"${(feedback.comment || '-').replace(/"/g, '""')}"`, // Escape quotes
            feedback.contactEmail || '-',
            feedback.contactPhone || '-'
        ]);

        // Create CSV content
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `feedback_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportExcel = () => {
        // Prepare data for Excel
        const excelData = feedbacks.map(feedback => ({
            'Date': feedback.createdAt?.seconds
                ? format(new Date(feedback.createdAt.seconds * 1000), 'dd/MM/yyyy')
                : 'N/A',
            'Time': feedback.createdAt?.seconds
                ? format(new Date(feedback.createdAt.seconds * 1000), 'HH:mm')
                : 'N/A',
            'Name': feedback.name || 'Anonymous',
            'Rating': feedback.rating || 0,
            'Comment': feedback.comment || '-',
            'Email': feedback.contactEmail || '-',
            'Phone': feedback.contactPhone || '-'
        }));

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Set column widths
        ws['!cols'] = [
            { wch: 12 },  // Date
            { wch: 8 },   // Time
            { wch: 20 },  // Name
            { wch: 8 },   // Rating
            { wch: 50 },  // Comment
            { wch: 25 },  // Email
            { wch: 15 }   // Phone
        ];

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Feedback');

        // Generate file
        const fileName = `feedback_${format(new Date(), 'yyyyMMdd_HHmmss')}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-800">All Feedback</h2>

                <div className="flex items-center gap-2">
                    <FeedbackFilter
                        selectedDate={selectedDate}
                        setSelectedDate={setSelectedDate}
                        handleClearFilter={handleClearFilter}
                    />

                    <ExportButtons
                        feedbacks={feedbacks}
                        handleExportCSV={handleExportCSV}
                        handleExportExcel={handleExportExcel}
                    />
                </div>
            </div>

            <FeedbackTable
                feedbacks={feedbacks}
                loading={loading}
                selectedDate={selectedDate}
            />
        </div>
    );
};

export default FeedbackList;
