require('dotenv').config();
const admin = require('firebase-admin');
const cfg = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
};
console.log('projectId=', cfg.projectId);
console.log('clientEmail=', cfg.clientEmail);
console.log('keyLen=', cfg.privateKey ? cfg.privateKey.length : 0);
console.log('dburl=', process.env.FIREBASE_DATABASE_URL);
try {
  const app = admin.initializeApp({ credential: admin.credential.cert(cfg), databaseURL: process.env.FIREBASE_DATABASE_URL });
  console.log('init success', app.name);
  const fs = admin.firestore();
  console.log('firestore OK', typeof fs.collection);
} catch (e) {
  console.error('init failed', e && e.message);
}
