import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// IMPORTANT: Make sure serviceAccountKey.json is in your .gitignore file
import serviceAccount from './serviceAccountKey.json' assert { type: 'json' };

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

const samples = [
  {
    name: 'Lila P.',
    rating: 5,
    comment: 'ปีกสวยมาก บรรยากาศสงบ ชอบโซนผีเสื้อกลางคืนที่สุด!',
    language: 'th',
    metadata: { source: 'seed-script-admin' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    name: 'Marco R.',
    rating: 4,
    comment: 'Great staff and informative displays. Could use more seating areas.',
    language: 'en',
    metadata: { source: 'seed-script-admin' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    name: 'Sakura',
    rating: 5,
    comment: '色鮮やかな蝶が多くて感動しました。お土産コーナーもおすすめです。',
    language: 'ja',
    metadata: { source: 'seed-script-admin' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

const seed = async () => {
  const feedbackCollection = db.collection('feedback');
  console.log('Starting to seed feedback...');
  
  for (const entry of samples) {
    // The Admin SDK handles date conversion automatically
    const docData = {
      ...entry,
      createdAt: new Date(entry.createdAt),
    };
    const docRef = await feedbackCollection.add(docData);
    console.log(`Added document with ID: ${docRef.id} for ${entry.name}`);
  }

  console.log('Firestore seed completed successfully.');
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
