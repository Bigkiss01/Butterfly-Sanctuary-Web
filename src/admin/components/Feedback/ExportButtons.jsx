import React, { useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import ReportModal from './ReportModal';

const ExportButtons = ({ feedbacks, handleExportCSV, handleExportExcel }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                    title="Generate PDF Report"
                >
                    <FileText className="w-5 h-5" />
                    <span className="hidden sm:inline">Report</span>
                </button>

                <div className="h-6 w-px bg-gray-300 mx-1"></div>

                <button
                    onClick={handleExportCSV}
                    disabled={feedbacks.length === 0}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors disabled:cursor-not-allowed shadow-sm"
                    title="Export to CSV"
                >
                    <Download className="w-5 h-5" />
                    <span className="hidden sm:inline">CSV</span>
                </button>

                <button
                    onClick={handleExportExcel}
                    disabled={feedbacks.length === 0}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors disabled:cursor-not-allowed shadow-sm"
                    title="Export to Excel"
                >
                    <FileSpreadsheet className="w-5 h-5" />
                    <span className="hidden sm:inline">Excel</span>
                </button>
            </div>

            <ReportModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
};

export default ExportButtons;
