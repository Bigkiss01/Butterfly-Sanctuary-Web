import React, { useState, useEffect } from 'react';
import { addDoc, collection, updateDoc, doc, serverTimestamp, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase';
import { X, Upload, Trash2, Save, Loader, Plus, UserCircle } from 'lucide-react';
import { uploadImage, deleteImage, compressImage, generateUniqueFilename } from '../../../util/storage';
import { createEmptyButterflyData, GRADIENT_OPTIONS, EMOJI_OPTIONS, SUPPORTED_LANGUAGES, LANGUAGE_NAMES } from '../../../util/butterflySchema';

const ButterflyForm = ({ butterfly, onClose }) => {
    const [formData, setFormData] = useState(butterfly ? butterfly : createEmptyButterflyData());
    const [enabledLanguages, setEnabledLanguages] = useState(['en']);
    const [activeLanguage, setActiveLanguage] = useState('en');

    // Main Image State
    const [mainImageFile, setMainImageFile] = useState(null);
    const [mainImagePreview, setMainImagePreview] = useState(butterfly?.mainImage || null);

    // Profile Image State
    const [profileImageFile, setProfileImageFile] = useState(null);
    const [profileImagePreview, setProfileImagePreview] = useState(butterfly?.profileImage || null);

    const [galleryFiles, setGalleryFiles] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [saving, setSaving] = useState(false);

    // Initialize enabled languages from existing data
    useEffect(() => {
        if (butterfly) {
            const langs = ['en']; // EN is always enabled
            SUPPORTED_LANGUAGES.forEach(lang => {
                if (lang !== 'en' && butterfly.name?.[lang]) {
                    langs.push(lang);
                }
            });
            setEnabledLanguages(langs);

            // Fetch gallery images from subcollection
            const fetchGallery = async () => {
                try {
                    const galleryRef = collection(db, 'butterflies', butterfly.id, 'gallery');
                    const snapshot = await getDocs(galleryRef);
                    const images = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setFormData(prev => ({ ...prev, galleryImages: images }));
                } catch (error) {
                    console.error("Error fetching gallery:", error);
                }
            };
            fetchGallery();
        }
    }, [butterfly]);

    const handleLanguageToggle = (lang) => {
        if (lang === 'en') return; // EN is always enabled

        if (enabledLanguages.includes(lang)) {
            setEnabledLanguages(enabledLanguages.filter(l => l !== lang));
            if (activeLanguage === lang) {
                setActiveLanguage('en');
            }
        } else {
            setEnabledLanguages([...enabledLanguages, lang]);
        }
    };

    const handleTextChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: {
                ...prev[field],
                [activeLanguage]: value
            }
        }));
    };

    const handleMainImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setMainImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setMainImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGalleryChange = (e) => {
        const files = Array.from(e.target.files);
        setGalleryFiles(prev => [...prev, ...files]);
    };

    const removeGalleryImage = (index) => {
        setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSave = async () => {
        // Validation
        if (!formData.name.en || !formData.scientificName.en) {
            alert('Please fill in English name and scientific name');
            return;
        }

        // Validate enabled languages
        for (const lang of enabledLanguages) {
            if (lang !== 'en' && (!formData.name[lang] || !formData.scientificName[lang])) {
                alert(`Please fill in name and scientific name for ${LANGUAGE_NAMES[lang]}`);
                return;
            }
        }

        setSaving(true);
        setUploadProgress(0);

        try {
            let mainImageUrl = formData.mainImage;
            let profileImageUrl = formData.profileImage;
            let butterflyId = butterfly?.id;

            // 1. Create/Update Main Document first (to get ID)
            const dataToSave = {
                ...formData,
                updatedAt: serverTimestamp()
            };

            // Remove galleryImages from main doc (stored in subcollection)
            delete dataToSave.galleryImages;

            let progressStep = 0;

            // Upload main image if changed
            if (mainImageFile) {
                const compressed = await compressImage(mainImageFile);
                const filename = generateUniqueFilename('main', mainImageFile.name.split('.').pop());
                const path = `butterflies/${butterflyId || 'temp'}/${filename}`;
                mainImageUrl = await uploadImage(compressed, path, (progress) => {
                    // Approximate progress
                });
                dataToSave.mainImage = mainImageUrl;
            } else {
                dataToSave.mainImage = mainImageUrl;
            }

            // Upload profile image if changed
            if (profileImageFile) {
                const compressed = await compressImage(profileImageFile, 300); // Smaller size for profile
                const filename = generateUniqueFilename('profile', profileImageFile.name.split('.').pop());
                const path = `butterflies/${butterflyId || 'temp'}/${filename}`;
                profileImageUrl = await uploadImage(compressed, path, (progress) => {
                    // Approximate progress
                });
                dataToSave.profileImage = profileImageUrl;
            } else {
                dataToSave.profileImage = profileImageUrl;
            }

            if (butterflyId) {
                await updateDoc(doc(db, 'butterflies', butterflyId), dataToSave);
            } else {
                dataToSave.createdAt = serverTimestamp();
                dataToSave.order = Date.now();
                const docRef = await addDoc(collection(db, 'butterflies'), dataToSave);
                butterflyId = docRef.id;
            }

            // 2. Handle Gallery Images (Subcollection)
            const galleryRef = collection(db, 'butterflies', butterflyId, 'gallery');

            // Add new gallery files
            if (galleryFiles.length > 0) {
                for (let i = 0; i < galleryFiles.length; i++) {
                    const file = galleryFiles[i];
                    const compressed = await compressImage(file);
                    const filename = generateUniqueFilename('gallery', file.name.split('.').pop());
                    const path = `butterflies/${butterflyId}/gallery/${filename}`;

                    const url = await uploadImage(compressed, path, (progress) => {
                        const baseProgress = 30 + (i / galleryFiles.length) * 60;
                        setUploadProgress(baseProgress);
                    });

                    await addDoc(galleryRef, {
                        url,
                        caption: { en: file.name },
                        createdAt: serverTimestamp()
                    });
                }
            }

            // Note: Deleting existing gallery images from subcollection is handled by the delete button directly in the UI
            // We don't need to sync the array here because we are moving to a purely subcollection-based approach.
            // However, for the transition, we might still have some legacy data in the array. 
            // For this implementation, we assume the UI will fetch from subcollection in the future.

            setUploadProgress(100);
            alert(butterfly ? 'Butterfly updated successfully!' : 'Butterfly created successfully!');
            onClose();
        } catch (error) {
            console.error('Error saving butterfly:', error);
            alert('Failed to save butterfly. Please try again.');
        } finally {
            setSaving(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold text-gray-800">
                    {butterfly ? 'Edit Butterfly' : 'Add New Butterfly'}
                </h2>
                <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Form */}
            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
                {/* Language Selection */}
                <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Languages *</h3>
                    <div className="flex flex-wrap gap-2">
                        {SUPPORTED_LANGUAGES.map(lang => (
                            <label key={lang} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={enabledLanguages.includes(lang)}
                                    onChange={() => handleLanguageToggle(lang)}
                                    disabled={lang === 'en'}
                                    className="mr-2"
                                />
                                <span className={lang === 'en' ? 'font-semibold' : ''}>
                                    {LANGUAGE_NAMES[lang]}
                                    {lang === 'en' && ' (Required)'}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Language Tabs */}
                {enabledLanguages.length > 1 && (
                    <div className="mb-6">
                        <div className="flex space-x-2 border-b">
                            {enabledLanguages.map(lang => (
                                <button
                                    key={lang}
                                    onClick={() => setActiveLanguage(lang)}
                                    className={`px-4 py-2 font-medium ${activeLanguage === lang
                                        ? 'border-b-2 border-blue-600 text-blue-600'
                                        : 'text-gray-600 hover:text-gray-800'
                                        }`}
                                >
                                    {LANGUAGE_NAMES[lang]}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Visual Settings Section */}
                <div className="mb-8 bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Visual Settings</h3>

                    {/* Emoji Selector */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Emoji Icon *
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {EMOJI_OPTIONS.map(emoji => (
                                <button
                                    key={emoji}
                                    onClick={() => setFormData({ ...formData, emoji })}
                                    className={`text-3xl p-2 rounded-lg border-2 ${formData.emoji === emoji
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-300 hover:border-gray-400'
                                        }`}
                                    type="button"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Gradient Selector */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Background Gradient *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {GRADIENT_OPTIONS.map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => setFormData({ ...formData, gradient: option.value })}
                                    className={`p-3 rounded-lg border-2 ${formData.gradient === option.value
                                        ? 'border-blue-600'
                                        : 'border-gray-300'
                                        }`}
                                    type="button"
                                >
                                    <div className={`h-12 rounded ${option.preview}`}></div>
                                    <p className="text-xs text-center mt-1">{option.label}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Rarity Selector */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rarity (1-5 Stars) *
                        </label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setFormData({ ...formData, rarity: num })}
                                    className={`px-4 py-2 rounded-lg border-2 ${formData.rarity === num
                                        ? 'border-yellow-500 bg-yellow-50'
                                        : 'border-gray-300'
                                        }`}
                                    type="button"
                                >
                                    {'★'.repeat(num)}{'☆'.repeat(5 - num)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Images Section (Grid) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        {/* Main Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Main Card Image *
                            </label>
                            <div className="flex flex-col gap-2">
                                {mainImagePreview ? (
                                    <img
                                        src={mainImagePreview}
                                        alt="Preview"
                                        className="w-full h-48 object-cover rounded-lg border"
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center border text-gray-400">
                                        No Image
                                    </div>
                                )}
                                <div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleMainImageChange}
                                        className="hidden"
                                        id="mainImage"
                                    />
                                    <label
                                        htmlFor="mainImage"
                                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 w-full justify-center"
                                    >
                                        <Upload className="w-5 h-5 mr-2" />
                                        {mainImagePreview ? 'Change Main Image' : 'Upload Main Image'}
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1 text-center">
                                        Recommended: 1200x1200px, JPG/PNG
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Profile Image Upload (New) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Profile Image (Avatar)
                            </label>
                            <div className="flex flex-col gap-2 items-center">
                                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden relative bg-gray-200">
                                    {profileImagePreview ? (
                                        <img
                                            src={profileImagePreview}
                                            alt="Profile Preview"
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <UserCircle className="w-16 h-16" />
                                        </div>
                                    )}
                                </div>

                                <div className="w-full">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleProfileImageChange}
                                        className="hidden"
                                        id="profileImage"
                                    />
                                    <label
                                        htmlFor="profileImage"
                                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 w-full justify-center"
                                    >
                                        <Upload className="w-5 h-5 mr-2" />
                                        {profileImagePreview ? 'Change Avatar' : 'Upload Avatar'}
                                    </label>
                                    <p className="text-xs text-gray-500 mt-1 text-center">
                                        Recommended: Square, 300x300px
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Basic Information */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Basic Information ({LANGUAGE_NAMES[activeLanguage]})
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Name *
                            </label>
                            <input
                                type="text"
                                value={formData.name[activeLanguage] || ''}
                                onChange={(e) => handleTextChange('name', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., Common Birdwing"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Scientific Name *
                            </label>
                            <input
                                type="text"
                                value={formData.scientificName[activeLanguage] || ''}
                                onChange={(e) => handleTextChange('scientificName', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent italic"
                                placeholder="e.g., Troides helena"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <textarea
                                value={formData.description[activeLanguage] || ''}
                                onChange={(e) => handleTextChange('description', e.target.value)}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Describe this butterfly species..."
                            />
                        </div>
                    </div>
                </div>

                {/* Details Section */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        Details ({LANGUAGE_NAMES[activeLanguage]})
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Habitat
                            </label>
                            <input
                                type="text"
                                value={formData.habitat[activeLanguage] || ''}
                                onChange={(e) => handleTextChange('habitat', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., Tropical rainforests"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Wingspan
                            </label>
                            <input
                                type="text"
                                value={formData.wingspan[activeLanguage] || ''}
                                onChange={(e) => handleTextChange('wingspan', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., 12-15 cm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Lifespan
                            </label>
                            <input
                                type="text"
                                value={formData.lifespan[activeLanguage] || ''}
                                onChange={(e) => handleTextChange('lifespan', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., 3-4 weeks"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Best Viewing Time
                            </label>
                            <input
                                type="text"
                                value={formData.bestTime[activeLanguage] || ''}
                                onChange={(e) => handleTextChange('bestTime', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g., Early morning (7-10 AM)"
                            />
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fun Fact
                        </label>
                        <textarea
                            value={formData.funFact[activeLanguage] || ''}
                            onChange={(e) => handleTextChange('funFact', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Share an interesting fact about this butterfly..."
                        />
                    </div>
                </div>

                {/* Gallery Section */}
                <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Garden Gallery</h3>

                    {/* Existing gallery images */}
                    {formData.galleryImages && formData.galleryImages.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {formData.galleryImages.map((img, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={img.url}
                                        alt={img.caption?.en || 'Gallery'}
                                        className="w-full h-32 object-cover rounded-lg"
                                    />
                                    <button
                                        onClick={async () => {
                                            if (window.confirm('Delete this image?')) {
                                                try {
                                                    if (img.id) {
                                                        // Delete from subcollection
                                                        await deleteDoc(doc(db, 'butterflies', butterfly.id, 'gallery', img.id));
                                                    }
                                                    // For legacy array-based images or just UI update
                                                    setFormData(prev => ({
                                                        ...prev,
                                                        galleryImages: prev.galleryImages.filter((_, i) => i !== index)
                                                    }));
                                                } catch (err) {
                                                    console.error('Error deleting image:', err);
                                                }
                                            }
                                        }}
                                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                                        type="button"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* New gallery images preview */}
                    {galleryFiles.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {galleryFiles.map((file, index) => (
                                <div key={index} className="relative">
                                    <img
                                        src={URL.createObjectURL(file)}
                                        alt={`New ${index}`}
                                        className="w-full h-32 object-cover rounded-lg"
                                    />
                                    <button
                                        onClick={() => removeGalleryImage(index)}
                                        className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                                        type="button"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Upload button */}
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleGalleryChange}
                        className="hidden"
                        id="galleryImages"
                    />
                    <label
                        htmlFor="galleryImages"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Add Gallery Images
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                        Upload multiple images for the garden gallery
                    </p>
                </div>

                {/* Progress Bar */}
                {saving && (
                    <div className="mb-4">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            />
                        </div>
                        <p className="text-sm text-gray-600 mt-1 text-center">
                            {uploadProgress < 100 ? `Uploading... ${Math.round(uploadProgress)}%` : 'Saving...'}
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex justify-end space-x-3 p-6 border-t bg-gray-50">
                <button
                    onClick={onClose}
                    disabled={saving}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
                >
                    {saving ? (
                        <>
                            <Loader className="w-5 h-5 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5 mr-2" />
                            Save Butterfly
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ButterflyForm;
