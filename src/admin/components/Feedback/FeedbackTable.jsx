import React from 'react';
import { format } from 'date-fns';

const FeedbackTable = ({ feedbacks, loading, selectedDate }) => {
    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <span key={index} className={`text-lg ${index < rating ? 'text-yellow-400' : 'text-gray-200'}`}>
                ★
            </span>
        ));
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Date & Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Contact
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rating
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Comment
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center">
                                    <div className="flex justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    </div>
                                </td>
                            </tr>
                        ) : feedbacks.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                    No feedback found {selectedDate ? 'for this date' : ''}
                                </td>
                            </tr>
                        ) : (
                            feedbacks.map((feedback) => (
                                <tr key={feedback.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {feedback.createdAt?.seconds
                                            ? format(new Date(feedback.createdAt.seconds * 1000), 'dd/MM/yyyy HH:mm')
                                            : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {feedback.name || 'Anonymous'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">
                                            {feedback.contactEmail && <div>📧 {feedback.contactEmail}</div>}
                                            {feedback.contactPhone && <div>📞 {feedback.contactPhone}</div>}
                                            {!feedback.contactEmail && !feedback.contactPhone && <span className="text-gray-400">-</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex">
                                            {renderStars(feedback.rating)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-gray-700 max-w-xs truncate" title={feedback.comment}>
                                            {feedback.comment || '-'}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FeedbackTable;
