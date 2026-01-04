import { storage } from '../firebase';

/**
 * Convert an image to Base64 string (simulating upload)
 * @param {File|Blob} file - The image file to convert
 * @param {string} path - Ignored (kept for compatibility)
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<string>} - Base64 string of the image
 */
export const uploadImage = (file, path, onProgress = null) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
                const progress = (event.loaded / event.total) * 100;
                onProgress(progress);
            }
        };

        reader.onload = () => {
            if (onProgress) onProgress(100);
            resolve(reader.result);
        };

        reader.onerror = (error) => reject(error);

        reader.readAsDataURL(file);
    });
};

/**
 * Delete an image (No-op for Base64 storage)
 * @param {string} url - Ignored
 * @returns {Promise<void>}
 */
export const deleteImage = async (url) => {
    // No operation needed as image data is stored in the document itself
    // When the document is updated/deleted, the image data goes with it
    return Promise.resolve();
};

/**
 * Compress and resize image before conversion
 * Optimized for Firestore 1MB limit
 * @param {File} file - The image file
 * @param {number} maxWidth - Maximum width (reduced for Base64)
 * @param {number} maxHeight - Maximum height (reduced for Base64)
 * @param {number} quality - Quality (0-1)
 * @returns {Promise<Blob>} - Compressed image blob
 */
export const compressImage = (file, maxWidth = 600, maxHeight = 600, quality = 0.6) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Calculate new dimensions
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error('Canvas to Blob failed'));
                        }
                    },
                    'image/jpeg', // Force JPEG for better compression
                    quality
                );
            };

            img.onerror = (error) => reject(error);
        };

        reader.onerror = (error) => reject(error);
    });
};

/**
 * Generate unique filename (kept for compatibility)
 * @param {string} prefix - Filename prefix
 * @param {string} extension - File extension
 * @returns {string} - Unique filename
 */
export const generateUniqueFilename = (prefix, extension) => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return `${prefix}_${timestamp}_${random}.${extension}`;
};
