// Firestore schema documentation for butterflies collection

/*
Collection: butterflies
Document Structure:

{
  id: string (auto-generated),
  
  // Visual Elements
  emoji: string,                    // Emoji icon (e.g., "🦋")
  gradient: string,                 // Tailwind gradient classes
  rarity: number,                   // 1-5 stars
  rarity: number,                   // 1-5 stars
  mainImage: string | null,         // Base64 string (max 800x800)
  profileImage: string | null,      // Small avatar image (added)
  
  // Gallery Images
  galleryImages: [
    {
      url: string,                  // Base64 string
      caption: {
        en: string,
        th: string,
        zh: string,
        ru: string,
        ja: string,
        ko: string,
        ar: string
      }
    }
  ],
  
  // Multi-language Text Fields
  name: {
    en: string (required),
    th: string (optional),
    zh: string (optional),
    ru: string (optional),
    ja: string (optional),
    ko: string (optional),
    ar: string (optional)
  },
  
  scientificName: {
    en: string (required),
    th: string (optional),
    // ... same structure
  },
  
  description: {
    en: string (required),
    // ... same structure
  },
  
  habitat: {
    en: string,
    // ... same structure
  },
  
  wingspan: {
    en: string,
    // ... same structure
  },
  
  lifespan: {
    en: string,
    // ... same structure
  },
  
  bestTime: {
    en: string,
    // ... same structure
  },
  
  funFact: {
    en: string,
    // ... same structure
  },
  
  // Metadata
  createdAt: Timestamp,
  updatedAt: Timestamp,
  createdBy: string (uid),
  order: number (for sorting)
}

Firebase Storage Structure:
/butterflies/{butterflyId}/main-image.{ext}
/butterflies/{butterflyId}/gallery/{imageId}.{ext}
*/

export const SUPPORTED_LANGUAGES = ['en', 'th', 'zh', 'ru', 'ja', 'ko', 'ar'];

export const LANGUAGE_NAMES = {
  en: 'English',
  th: 'ไทย',
  zh: '中文',
  ru: 'Русский',
  ja: '日本語',
  ko: '한국어',
  ar: 'العربية'
};

export const GRADIENT_OPTIONS = [
  { value: 'from-yellow-500 via-amber-500 to-orange-600', label: 'Golden Yellow', preview: 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-600' },
  { value: 'from-orange-500 via-amber-500 to-yellow-600', label: 'Orange Amber', preview: 'bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-600' },
  { value: 'from-slate-700 via-gray-600 to-zinc-800', label: 'Dark Gray', preview: 'bg-gradient-to-r from-slate-700 via-gray-600 to-zinc-800' },
  { value: 'from-emerald-600 via-green-500 to-lime-500', label: 'Green Lime', preview: 'bg-gradient-to-r from-emerald-600 via-green-500 to-lime-500' },
  { value: 'from-orange-600 via-red-500 to-pink-600', label: 'Orange Pink', preview: 'bg-gradient-to-r from-orange-600 via-red-500 to-pink-600' },
  { value: 'from-amber-900 via-brown-800 to-stone-900', label: 'Brown', preview: 'bg-gradient-to-r from-amber-900 via-brown-800 to-stone-900' },
  { value: 'from-yellow-200 via-amber-100 to-orange-200', label: 'Light Yellow', preview: 'bg-gradient-to-r from-yellow-200 via-amber-100 to-orange-200' },
  { value: 'from-amber-700 via-orange-800 to-brown-700', label: 'Dark Orange', preview: 'bg-gradient-to-r from-amber-700 via-orange-800 to-brown-700' },
  { value: 'from-blue-500 via-indigo-500 to-purple-500', label: 'Blue Purple', preview: 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500' },
  { value: 'from-pink-500 via-rose-500 to-red-500', label: 'Pink Red', preview: 'bg-gradient-to-r from-pink-500 via-rose-500 to-red-500' }
];

export const EMOJI_OPTIONS = ['🦋', '🌸', '✨', '💫', '🌺', '🔥', '👑', '🧡', '🖤', '💚', '🤎', '🤍', '🟤', '💜', '🩵'];

export const createEmptyButterflyData = () => ({
  emoji: '🦋',
  gradient: GRADIENT_OPTIONS[0].value,
  rarity: 3,
  mainImage: null,
  profileImage: null,
  galleryImages: [],
  name: { en: '' },
  scientificName: { en: '' },
  description: { en: '' },
  habitat: { en: '' },
  wingspan: { en: '' },
  lifespan: { en: '' },
  bestTime: { en: '' },
  funFact: { en: '' },
  order: 0
});
