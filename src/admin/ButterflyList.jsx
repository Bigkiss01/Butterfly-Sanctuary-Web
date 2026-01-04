import React, { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase';
import { Plus, Loader } from 'lucide-react';
import ButterflyTable from './components/Butterfly/ButterflyTable';
import ButterflyForm from './components/Butterfly/ButterflyForm';
import { deleteImage } from '../util/storage';
import { seedButterflies } from '../util/seedButterflies';

const ButterflyList = () => {
    const [butterflies, setButterflies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingButterfly, setEditingButterfly] = useState(null);

    // Fetch butterflies from Firestore
    const fetchButterflies = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, 'butterflies'), orderBy('order', 'asc'));
            const querySnapshot = await getDocs(q);
            const butterfliesData = [];
            querySnapshot.forEach((doc) => {
                butterfliesData.push({ id: doc.id, ...doc.data() });
            });
            setButterflies(butterfliesData);
        } catch (error) {
            console.error('Error fetching butterflies:', error);
            alert('Failed to load butterflies. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchButterflies();
    }, []);

    // Handle delete butterfly
    const handleDelete = async (butterfly) => {
        if (!window.confirm(`Are you sure you want to delete "${butterfly.name?.en || 'this butterfly'}"?`)) {
            return;
        }

        try {
            // Delete main image if exists
            if (butterfly.mainImage) {
                try {
                    await deleteImage(butterfly.mainImage);
                } catch (err) {
                    console.error('Error deleting main image:', err);
                }
            }

            // Delete gallery images if exist
            if (butterfly.galleryImages && butterfly.galleryImages.length > 0) {
                for (const img of butterfly.galleryImages) {
                    try {
                        await deleteImage(img.url);
                    } catch (err) {
                        console.error('Error deleting gallery image:', err);
                    }
                }
            }

            // Delete Firestore document
            await deleteDoc(doc(db, 'butterflies', butterfly.id));

            alert('Butterfly deleted successfully!');
            fetchButterflies();
        } catch (error) {
            console.error('Error deleting butterfly:', error);
            alert('Failed to delete butterfly. Please try again.');
        }
    };

    // Handle edit
    const handleEdit = (butterfly) => {
        setEditingButterfly(butterfly);
        setShowForm(true);
    };

    // Handle form close
    const handleFormClose = () => {
        setShowForm(false);
        setEditingButterfly(null);
        fetchButterflies();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (showForm) {
        return (
            <ButterflyForm
                butterfly={editingButterfly}
                onClose={handleFormClose}
            />
        );
    }

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Butterfly Management</h2>
                        <p className="text-gray-600 mt-1">Manage butterfly species in your sanctuary</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add New Butterfly
                    </button>
                    <button
                        onClick={seedButterflies}
                        className="ml-4 flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Seed Data
                    </button>
                </div>
            </div>

            <ButterflyTable
                butterflies={butterflies}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
};

export default ButterflyList;
