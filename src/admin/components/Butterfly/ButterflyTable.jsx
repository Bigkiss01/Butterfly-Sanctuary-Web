import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

const ButterflyTable = ({ butterflies, onEdit, onDelete }) => {
    if (butterflies.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500">
                <p className="text-lg">No butterflies found</p>
                <p className="text-sm mt-2">Click "Add New Butterfly" to create your first butterfly species</p>
            </div>
        );
    }

    const renderStars = (rarity) => {
        return '★'.repeat(rarity) + '☆'.repeat(5 - rarity);
    };

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Preview
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Scientific Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Rarity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {butterflies.map((butterfly) => (
                        <tr key={butterfly.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                    {butterfly.mainImage ? (
                                        <img
                                            src={butterfly.mainImage}
                                            alt={butterfly.name?.en}
                                            className="h-16 w-16 object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="h-16 w-16 flex items-center justify-center bg-gray-100 rounded-lg text-3xl">
                                            {butterfly.emoji}
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm font-medium text-gray-900">
                                    {butterfly.name?.en || 'N/A'}
                                </div>
                                {butterfly.name?.th && (
                                    <div className="text-sm text-gray-500">
                                        {butterfly.name.th}
                                    </div>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 italic">
                                    {butterfly.scientificName?.en || 'N/A'}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-yellow-500 text-lg">
                                    {renderStars(butterfly.rarity || 0)}
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => onEdit(butterfly)}
                                        className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => onDelete(butterfly)}
                                        className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ButterflyTable;
