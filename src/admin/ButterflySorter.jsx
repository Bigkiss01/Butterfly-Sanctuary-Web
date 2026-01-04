import React, { useState, useEffect, useRef } from 'react';
import { collection, getDocs, addDoc, serverTimestamp, setDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Save, Plus, Download, FolderInput, RefreshCw, Upload, Trash2, RotateCcw } from 'lucide-react';

const ButterflySorter = () => {
    // State now stores objects: { id: string, src: string, name: string, file?: File }
    const [species, setSpecies] = useState([]);
    const [buckets, setBuckets] = useState({}); // { speciesId: [ImageObject, ...] }
    const [newSpeciesName, setNewSpeciesName] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);

    // Load images and existing species
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Load existing species from Firestore
                const querySnapshot = await getDocs(collection(db, 'butterflies'));
                const speciesList = [];
                querySnapshot.forEach((doc) => {
                    speciesList.push({ id: doc.id, name: doc.data().name?.en || 'Unknown' });
                });
                setSpecies(speciesList);

                let loadedFromPersistence = false;

                // 2. Try loading SAVED state from Firestore first (Server Authority)
                try {
                    const docRef = doc(db, 'system_states', 'butterfly_sorter');
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const savedData = docSnap.data();
                        if (savedData.buckets) {
                            console.log("Loaded sorting state from Firestore");
                            setBuckets(savedData.buckets);
                            loadedFromPersistence = true;
                        }
                    }
                } catch (e) {
                    console.error("Error checking server state:", e);
                }

                // 3. Fallback to LocalStorage if Server state failed or didn't exist
                if (!loadedFromPersistence) {
                    const savedBuckets = localStorage.getItem('butterfly_sorter_buckets');
                    if (savedBuckets) {
                        try {
                            const parsedBuckets = JSON.parse(savedBuckets);
                            setBuckets(parsedBuckets);
                            loadedFromPersistence = true;
                        } catch (e) {
                            console.error("Error parsing local buckets", e);
                        }
                    }
                }

                // 4. If no saved state at all, load initial default data
                if (!loadedFromPersistence) {
                    const initialBuckets = {};
                    speciesList.forEach(s => initialBuckets[s.id] = []);
                    initialBuckets['unsorted'] = [];

                    // Try to load server images if available
                    try {
                        const imgResponse = await fetch('/images_list.json');
                        if (imgResponse.ok) {
                            const imgList = await imgResponse.json();
                            // Convert string filenames to objects
                            initialBuckets['unsorted'] = imgList.map(name => ({
                                id: name,
                                name: name,
                                src: `/temp_images/${name}`,
                                isLocal: false
                            }));
                        }
                    } catch (e) {
                        console.log("No server images found or failed to load.");
                    }
                    setBuckets(initialBuckets);
                }

            } catch (error) {
                console.error("Error loading data:", error);
                alert("Error loading initial data.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Save to LocalStorage whenever buckets change
    useEffect(() => {
        if (Object.keys(buckets).length > 0) {
            // Filter out local images (Blob URLs) as they can't be saved to localStorage effectively
            // and won't be valid on refresh anyway.
            const bucketsToSave = {};
            Object.keys(buckets).forEach(key => {
                bucketsToSave[key] = buckets[key].filter(img => !img.isLocal);
            });
            localStorage.setItem('butterfly_sorter_buckets', JSON.stringify(bucketsToSave));
        }
    }, [buckets]);

    const handleResetData = () => {
        if (!window.confirm("Are you sure you want to reset all sorting data? This will clear your progress.")) return;
        localStorage.removeItem('butterfly_sorter_buckets');
        window.location.reload();
    };

    const handleFolderSelect = (event) => {
        const files = Array.from(event.target.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));

        if (imageFiles.length === 0) {
            alert("No images found in the selected folder.");
            return;
        }

        const newImages = imageFiles.map(file => ({
            id: `local_${Date.now()}_${file.name}`,
            name: file.name,
            src: URL.createObjectURL(file),
            file: file,
            isLocal: true
        }));

        setBuckets(prev => ({
            ...prev,
            unsorted: [...(prev.unsorted || []), ...newImages]
        }));
    };

    const handleDeleteImage = (imageId, bucketId) => {
        if (!window.confirm("Are you sure you want to remove this image from the sorter?")) return;

        setBuckets(prev => {
            const newBuckets = { ...prev };
            newBuckets[bucketId] = newBuckets[bucketId].filter(img => img.id !== imageId);
            return newBuckets;
        });
    };

    const handleClearUnsorted = () => {
        if (!window.confirm("Are you sure you want to delete all UNSORTED images?")) return;

        setBuckets(prev => ({
            ...prev,
            unsorted: []
        }));
    };

    const handleDragStart = (e, imageId, sourceBucket) => {
        e.dataTransfer.setData('imageId', imageId);
        e.dataTransfer.setData('sourceBucket', sourceBucket);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDrop = (e, targetBucketId) => {
        e.preventDefault();
        const imageId = e.dataTransfer.getData('imageId');
        const sourceBucket = e.dataTransfer.getData('sourceBucket');

        if (sourceBucket === targetBucketId) return;

        setBuckets(prev => {
            const newBuckets = { ...prev };
            const sourceList = newBuckets[sourceBucket] || [];

            // Find the image object
            const imageObj = sourceList.find(img => img.id === imageId);
            if (!imageObj) return prev;

            // Remove from source
            newBuckets[sourceBucket] = sourceList.filter(img => img.id !== imageId);

            // Add to target
            if (!newBuckets[targetBucketId]) newBuckets[targetBucketId] = [];
            newBuckets[targetBucketId].push(imageObj);

            return newBuckets;
        });
    };

    const handleCreateSpecies = async () => {
        if (!newSpeciesName.trim()) return;

        const tempId = `new_${Date.now()}`;
        const newSpecies = { id: tempId, name: newSpeciesName, isNew: true };

        setSpecies(prev => [...prev, newSpecies]);
        setBuckets(prev => ({ ...prev, [tempId]: [] }));
        setNewSpeciesName('');
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Prepare data for saving
            // We want to save the buckets structure.
            // WARNING: Local blob images cannot be saved to server easily without uploading them first.
            // For now, we will filter them out or just save metadata if possible.
            // The current requirement implies just saving the sorting *Map*.

            const bucketsToSave = {};
            let localFilesCount = 0;

            Object.keys(buckets).forEach(key => {
                bucketsToSave[key] = buckets[key].filter(img => {
                    if (img.isLocal) localFilesCount++;
                    return !img.isLocal;
                });
            });

            if (localFilesCount > 0) {
                if (!window.confirm(`You have ${localFilesCount} local images that have not been uploaded to the server properly. These will NOT be saved to the database. Continue?`)) {
                    setSaving(false);
                    return;
                }
            }

            // Save to Firestore 'system_states/butterfly_sorter'
            await setDoc(doc(db, 'system_states', 'butterfly_sorter'), {
                buckets: bucketsToSave,
                updatedAt: serverTimestamp(),
                updatedBy: 'admin' // Could add auth user info here if available
            });

            alert("Sorting state saved successfully!");

        } catch (error) {
            console.error("Error saving sorting state:", error);
            alert("Failed to save sorting state. Check console for details.");
        } finally {
            setSaving(false);
        }
    };

    const handleDownloadMapping = () => {
        // Simplify the mapping for export (just filenames/IDs)
        const exportBuckets = {};
        Object.keys(buckets).forEach(key => {
            exportBuckets[key] = buckets[key].map(img => img.name);
        });

        const mapping = {
            timestamp: Date.now(),
            buckets: exportBuckets,
            species: species
        };

        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mapping, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "butterfly_sorting_map.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    if (loading) return <div className="p-10 text-center">Loading Sorter...</div>;

    return (
        <div className="p-6 bg-gray-100 min-h-screen flex flex-col h-screen">
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Butterfly Image Sorter</h1>
                    <p className="text-sm text-gray-600">Drag images to their species folders. Download the map when done.</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newSpeciesName}
                            onChange={(e) => setNewSpeciesName(e.target.value)}
                            placeholder="New Species Name"
                            className="border rounded px-3 py-2"
                        />
                        <button
                            onClick={handleCreateSpecies}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-1" /> Add Species
                        </button>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`px-4 py-2 rounded flex items-center text-white ${saving ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFolderSelect}
                        webkitdirectory=""
                        directory=""
                        multiple
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center"
                    >
                        <Upload className="w-4 h-4 mr-2" /> Upload Folder
                    </button>



                    <button
                        onClick={handleDownloadMapping}
                        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center font-bold"
                    >
                        <Download className="w-4 h-4 mr-2" /> Download Mapping
                    </button>

                    <button
                        onClick={handleResetData}
                        className="text-gray-500 hover:text-gray-700 p-2 rounded hover:bg-gray-100"
                        title="Reset Data (Clear Saved State)"
                    >
                        <RotateCcw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Unsorted Source */}
                <div className="w-1/3 bg-white rounded-lg shadow flex flex-col">
                    <div className="p-4 border-b bg-gray-50 font-bold flex justify-between">
                        <span>Unsorted Images ({buckets['unsorted']?.length || 0})</span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleClearUnsorted}
                                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                title="Clear All Unsorted"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                            <FolderInput className="w-5 h-5 text-gray-500" />
                        </div>
                    </div>
                    <div
                        className="flex-1 overflow-y-auto p-4 grid grid-cols-3 gap-2 content-start"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'unsorted')}
                    >
                        {buckets['unsorted']?.map(img => (
                            <div
                                key={img.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, img.id, 'unsorted')}
                                className="aspect-square relative group cursor-move"
                            >
                                <img
                                    src={img.src}
                                    alt={img.name}
                                    className="w-full h-full object-cover rounded border hover:border-blue-500"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs text-center p-1 transition-opacity">
                                    <span className="mb-2 truncate w-full px-1">{img.name}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteImage(img.id, 'unsorted');
                                        }}
                                        className="bg-red-600 p-1.5 rounded-full hover:bg-red-700 transition-colors"
                                        title="Delete Image"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Species Buckets */}
                <div className="flex-1 bg-white rounded-lg shadow flex flex-col">
                    <div className="p-4 border-b bg-gray-50 font-bold">
                        Species Folders
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 lg:grid-cols-3 gap-4 content-start">
                        {species.map(s => (
                            <div
                                key={s.id}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, s.id)}
                                className={`border-2 border-dashed rounded-lg p-4 min-h-[200px] flex flex-col ${buckets[s.id]?.length > 0 ? 'border-blue-300 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}
                            >
                                <div className="font-bold mb-2 flex justify-between items-center">
                                    <span className={s.isNew ? "text-green-600" : "text-gray-800"}>
                                        {s.name} {s.isNew && '(New)'}
                                    </span>
                                    <span className="bg-white px-2 py-1 rounded text-xs shadow">
                                        {buckets[s.id]?.length || 0}
                                    </span>
                                </div>
                                <div className="flex-1 grid grid-cols-4 gap-1 content-start">
                                    {buckets[s.id]?.map(img => (
                                        <div
                                            key={img.id}
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, img.id, s.id)}
                                            className="aspect-square relative group cursor-move"
                                        >
                                            <img
                                                src={img.src}
                                                alt={img.name}
                                                className="w-full h-full object-cover rounded"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteImage(img.id, s.id);
                                                    }}
                                                    className="bg-red-600 p-1 rounded-full hover:bg-red-700 text-white"
                                                    title="Delete Image"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ButterflySorter;
