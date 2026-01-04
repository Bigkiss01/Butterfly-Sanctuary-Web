import { db } from '../firebase';
import { collection, doc, getDoc, setDoc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { uploadImage, compressImage, generateUniqueFilename } from './storage';
import { SUPPORTED_LANGUAGES } from './butterflySchema';

export const seedButterflies = async () => {
    try {
        console.log('Starting seed process...');

        // 1. Fetch the manifest
        const response = await fetch('/import_manifest.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch manifest: ${response.statusText}`);
        }
        const manifest = await response.json();
        console.log(`Loaded manifest with ${manifest.length} species.`);

        const collectionRef = collection(db, 'butterflies');

        for (const speciesData of manifest) {
            console.log(`Processing ${speciesData.id} (${speciesData.scientificName})...`);

            // 2. Check if species exists by ID
            const docRef = doc(collectionRef, speciesData.id);
            const docSnap = await getDoc(docRef);

            let existingData = {};
            if (docSnap.exists()) {
                existingData = docSnap.data();
                console.log(`Found existing species: ${speciesData.id}`);
            } else {
                console.log(`Creating new species: ${speciesData.id}`);
            }

            // 3. Prepare Multilingual Data
            const butterflyData = {
                // Metadata
                updatedAt: serverTimestamp(),
                order: existingData.order || Date.now(),

                // Visuals (Defaults if not present)
                emoji: existingData.emoji || "🦋",
                gradient: existingData.gradient || "from-blue-500 via-purple-500 to-pink-500",
                rarity: speciesData.rarity || 1,

                // Multilingual Fields
                name: {},
                scientificName: {},
                description: {},
                habitat: {},
                wingspan: {},
                lifespan: {},
                bestTime: {},
                funFact: {}
            };

            // Populate multilingual fields
            SUPPORTED_LANGUAGES.forEach(lang => {
                const langData = speciesData[lang] || {};

                butterflyData.name[lang] = langData.name || speciesData.en?.name || '';
                // Scientific name is usually the same, but we allow overrides. 
                // Fallback to top-level scientificName if not in langData
                butterflyData.scientificName[lang] = speciesData.scientificName || '';

                butterflyData.description[lang] = langData.description || '';
                butterflyData.habitat[lang] = langData.habitat || '';
                butterflyData.wingspan[lang] = langData.wingspan || '';
                butterflyData.lifespan[lang] = langData.lifespan || '';
                butterflyData.bestTime[lang] = langData.bestTime || '';
                butterflyData.funFact[lang] = langData.funFact || '';
            });

            // 4. Process Images
            let mainImageUrl = existingData.mainImage || null;

            // Helper to fetch and process image
            const processImage = async (url, type) => {
                try {
                    const imgResponse = await fetch(url);
                    if (!imgResponse.ok) throw new Error(`Failed to fetch image: ${url}`);
                    const blob = await imgResponse.blob();
                    const file = new File([blob], url.split('/').pop(), { type: blob.type });
                    const compressed = await compressImage(file);
                    const filename = generateUniqueFilename(type, file.name.split('.').pop());
                    const path = `butterflies/${speciesData.id}/${type === 'gallery' ? 'gallery/' : ''}${filename}`;
                    return await uploadImage(compressed, path);
                } catch (err) {
                    console.error(`Error processing image ${url}:`, err);
                    return null;
                }
            };

            if (speciesData.images && speciesData.images.length > 0) {
                // Upload Main Image if missing
                if (!mainImageUrl) {
                    console.log(`Uploading main image for ${speciesData.id}...`);
                    // Use the first image as main image
                    const mainImageObj = speciesData.images[0];
                    const uploadedUrl = await processImage(mainImageObj.path, 'main');
                    if (uploadedUrl) {
                        mainImageUrl = uploadedUrl;
                    }
                }
            }

            if (mainImageUrl) {
                butterflyData.mainImage = mainImageUrl;
            }

            // 5. Save Main Document
            if (docSnap.exists()) {
                await updateDoc(docRef, butterflyData);
            } else {
                butterflyData.createdAt = serverTimestamp();
                await setDoc(docRef, butterflyData);
            }

            // 6. Handle Gallery Subcollection
            if (!docSnap.exists() && speciesData.images && speciesData.images.length > 0) {
                console.log(`Uploading ${speciesData.images.length} gallery images...`);
                for (const imgObj of speciesData.images) {
                    const url = await processImage(imgObj.path, 'gallery');
                    if (url) {
                        await addDoc(collection(db, 'butterflies', speciesData.id, 'gallery'), {
                            url,
                            caption: { en: imgObj.originalName }, // Default caption
                            createdAt: serverTimestamp()
                        });
                    }
                }
            } else if (docSnap.exists()) {
                console.log(`Skipping gallery upload for existing species ${speciesData.id} to avoid duplicates.`);
            }
        }

        console.log('Seeding completed successfully!');
        alert('Seeding completed! Please refresh the page.');
    } catch (error) {
        console.error('Error seeding butterflies:', error);
        alert('Error seeding butterflies. Check console.');
    }
};
