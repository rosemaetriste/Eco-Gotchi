require('dotenv').config();
const admin = require('firebase-admin');
const cfg = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
};
const app = admin.initializeApp({ credential: admin.credential.cert(cfg), databaseURL: process.env.FIREBASE_DATABASE_URL });
const db = admin.firestore();
(async () => {
  try {
    const docRef = await db.collection('ecogotchi_logs').add({ test: true, createdAt: admin.firestore.FieldValue.serverTimestamp() });
    console.log('saved', docRef.id);
  } catch (e) {
    console.error('fail', e.message);
    console.error(e);
  }
  process.exit(0);
})();
