import React, { useState } from 'react';
import { X, FileText, Calendar } from 'lucide-react';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../../firebase';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

const ReportModal = ({ isOpen, onClose }) => {
    const [reportType, setReportType] = useState('daily');
    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        setLoading(true);
        try {
            let start, end;
            const date = new Date(selectedDate);
            let dateRangeStr = '';

            switch (reportType) {
                case 'daily':
                    start = new Date(date);
                    start.setHours(0, 0, 0, 0);
                    end = new Date(date);
                    end.setHours(23, 59, 59, 999);
                    dateRangeStr = format(date, 'dd/MM/yyyy');
                    break;
                case 'weekly':
                    start = startOfWeek(date, { weekStartsOn: 1 });
                    end = endOfWeek(date, { weekStartsOn: 1 });
                    dateRangeStr = `${format(start, 'dd/MM/yyyy')} - ${format(end, 'dd/MM/yyyy')}`;
                    break;
                case 'monthly':
                    start = startOfMonth(date);
                    end = endOfMonth(date);
                    dateRangeStr = format(date, 'MMMM yyyy');
                    break;
                case 'yearly':
                    start = startOfYear(date);
                    end = endOfYear(date);
                    dateRangeStr = format(date, 'yyyy');
                    break;
                default:
                    return;
            }

            const feedbacksRef = collection(db, 'feedback');
            const q = query(
                feedbacksRef,
                where('createdAt', '>=', Timestamp.fromDate(start)),
                where('createdAt', '<=', Timestamp.fromDate(end)),
                orderBy('createdAt', 'desc')
            );

            const snapshot = await getDocs(q);
            const feedbacks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

            if (!window.jspdf) {
                alert("PDF library not loaded. Please refresh the page.");
                return;
            }
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.width;
            const period = reportType.charAt(0).toUpperCase() + reportType.slice(1);

            // Helper for centering text
            const centerText = (text, y, size = 12, style = 'normal') => {
                doc.setFontSize(size);
                doc.setFont('helvetica', style);
                const textWidth = doc.getStringUnitWidth(text) * size / doc.internal.scaleFactor;
                const x = (pageWidth - textWidth) / 2;
                doc.text(text, x, y);
            };

            // --- Header ---
            doc.setFillColor(41, 128, 185); // Blue header
            doc.rect(0, 0, pageWidth, 40, 'F');

            doc.setTextColor(255, 255, 255);
            centerText('Butterfly Sanctuary - Feedback Report', 15, 22, 'bold');
            centerText(`${period} Report`, 25, 16, 'normal');

            doc.setFontSize(10);
            doc.text(`Generated: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 15, 35);
            doc.text(`Range: ${dateRangeStr}`, pageWidth - 15, 35, { align: 'right' });

            // --- Summary Statistics ---
            const totalFeedback = feedbacks.length;
            const avgRating = totalFeedback > 0
                ? (feedbacks.reduce((acc, curr) => acc + (curr.rating || 0), 0) / totalFeedback).toFixed(1)
                : '0.0';

            doc.setTextColor(0, 0, 0);

            // Draw Summary Box
            const startY = 50;
            doc.setDrawColor(200, 200, 200);
            doc.setFillColor(245, 247, 250);
            doc.roundedRect(15, startY, pageWidth - 30, 35, 3, 3, 'FD');

            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Summary Overview', 20, startY + 10);

            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Total Feedback: ${totalFeedback}`, 20, startY + 25);
            doc.text(`Average Rating: ${avgRating} / 5.0`, 80, startY + 25);

            // --- Feedback Table ---
            const tableRows = feedbacks.map(f => [
                f.createdAt?.seconds ? format(new Date(f.createdAt.seconds * 1000), 'dd/MM/yyyy HH:mm') : 'N/A',
                f.name || 'Anonymous',
                f.rating || '-',
                f.comment || '-'
            ]);

            if (doc.autoTable) {
                doc.autoTable({
                    startY: startY + 45,
                    head: [['Date', 'Name', 'Rating', 'Comment']],
                    body: tableRows,
                    theme: 'grid',
                    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
                    styles: { fontSize: 9, cellPadding: 3 },
                    columnStyles: {
                        0: { cellWidth: 35 },
                        1: { cellWidth: 35 },
                        2: { cellWidth: 15, halign: 'center' },
                        3: { cellWidth: 'auto' }
                    },
                    didDrawPage: (data) => {
                        // Footer
                        const pageCount = doc.internal.getNumberOfPages();
                        doc.setFontSize(8);
                        doc.setTextColor(150);
                        doc.text(`Page ${pageCount}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });
                    }
                });
            } else {
                console.warn("AutoTable plugin not found");
                doc.text("Table could not be generated (plugin missing)", 20, startY + 50);
            }

            doc.save(`feedback_report_${period.toLowerCase()}_${format(new Date(), 'yyyyMMdd')}.pdf`);
            onClose();
        } catch (error) {
            console.error("Error generating report:", error);
            alert("Failed to generate report. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
                <div className="bg-blue-600 p-4 flex justify-between items-center">
                    <h3 className="text-white font-semibold flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Generate Report
                    </h3>
                    <button onClick={onClose} className="text-blue-100 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['daily', 'weekly', 'monthly', 'yearly'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setReportType(type)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${reportType === type
                                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                                            : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select Date
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type={reportType === 'yearly' ? 'number' : reportType === 'monthly' ? 'month' : 'date'}
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                                min={reportType === 'yearly' ? '2020' : undefined}
                                max={reportType === 'yearly' ? '2030' : undefined}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {reportType === 'weekly' && 'Select any date within the desired week'}
                            {reportType === 'yearly' && 'Enter the year (e.g., 2024)'}
                        </p>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2"
                    >
                        {loading ? 'Generating...' : 'Download PDF Report'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReportModal;
