import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// All keys come from Vite env vars so builds fail fast when a value is missing.
const baseFirebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingKeys = Object.entries(baseFirebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length) {
  throw new Error(`Firebase configuration is incomplete. Missing: ${missingKeys.join(', ')}`);
}

const firebaseConfig = {
  ...baseFirebaseConfig,
  ...(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    ? { measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID }
    : {}),
};

const app = initializeApp(firebaseConfig);
const analytics =
  typeof window !== 'undefined' && import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    ? getAnalytics(app)
    : null;
const db = getFirestore(app);

const MAX_NAME_LENGTH = 80;
const MAX_COMMENT_LENGTH = 600;

const sanitizeText = (value = '', maxLength = 255) =>
  value
    .replace(/[<>\u0000-\u001F]/g, '')
    .trim()
    .slice(0, maxLength);

export const saveFeedback = async ({ name, rating, comment, language, context = {} }) => {
  const normalizedRating = Number.isFinite(rating) ? Math.min(Math.max(Math.round(rating), 1), 5) : 0;

  if (!normalizedRating) {
    throw new Error('Rating is required before submitting feedback.');
  }

  const metadata = {};
  if (context.userAgent) {
    metadata.userAgent = sanitizeText(context.userAgent, 200);
  }
  if (context.timezone) {
    metadata.timezone = sanitizeText(context.timezone, 80);
  }

  const payload = {
    name: sanitizeText(name, MAX_NAME_LENGTH) || 'Guest',
    rating: normalizedRating,
    comment: sanitizeText(comment, MAX_COMMENT_LENGTH),
    language: sanitizeText(language, 10) || 'en',
    createdAt: serverTimestamp(),
    ...(Object.keys(metadata).length ? { metadata } : {}),
  };

  await addDoc(collection(db, 'feedback'), payload);
};

export { app, db, analytics };
export default db;
