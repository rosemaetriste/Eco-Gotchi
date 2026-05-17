const express = require('express');
const cors = require('cors');
const axios = require('axios');
const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const carbonApiKey = process.env.CARBON_INTERFACE_API_KEY;
const firebaseCollection = process.env.FIREBASE_COLLECTION || 'ecogotchi_logs';

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined,
};

let firestore = null;
if (firebaseConfig.projectId && firebaseConfig.clientEmail && firebaseConfig.privateKey) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
  firestore = admin.firestore();
} else {
  console.warn('Firebase is not fully configured. Logs will not be persisted until environment variables are added.');
}

app.use(cors());
app.use(express.json());

const TRANSPORT_ACTIONS = [
  { id: 'bike', label: 'Biked instead of driving', rate: 0.085 },
  { id: 'walk', label: 'Walked instead of using a car', rate: 0.05 },
  { id: 'jeepney', label: 'Jeepney ride', rate: 0.15 },
  { id: 'bus', label: 'Bus ride', rate: 0.10 },
  { id: 'lrt_mrt', label: 'LRT / MRT ride', rate: 0.08 },
  { id: 'tricycle', label: 'Tricycle ride', rate: 0.12 },
  { id: 'carpool', label: 'Carpool with friends', rate: 0.09 },
];

const estimateCo2Fallback = (distance, rate) => Number((distance * (rate || 0.12)).toFixed(3));

const buildCarbonEstimatePayload = (transportId, distance) => ({
  type: 'vehicle',
  distance_unit: 'km',
  distance_value: Number(distance),
  vehicle_model_id: process.env.CARBON_DEFAULT_VEHICLE_MODEL_ID || 'toyota_prius_2015',
});

const users = [
  { id: 1, email: 'user@example.com', password: 'password123', name: 'Eco Guardian' },
];

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find((item) => item.email === email && item.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json({ user: { id: user.id, email: user.email, name: user.name }, token: 'demo-token' });
});

app.post('/api/auth/signup', (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const exists = users.some((item) => item.email === email);
  if (exists) {
    return res.status(409).json({ error: 'Email already in use.' });
  }

  const id = users.length + 1;
  const user = { id, email, password, name };
  users.push(user);

  res.status(201).json({ user: { id, email, name }, token: 'demo-token' });
});

app.get('/api/pet', (req, res) => {
  res.json({ name: 'Luna', mood: 'Blooming', level: 5, progress: 78 });
});

app.post('/api/estimate-carbon', async (req, res) => {
  const { transportId, distance } = req.body;
  const amount = Number(distance);

  if (!transportId || !amount || Number.isNaN(amount) || amount <= 0) {
    return res.status(400).json({ error: 'transportId and positive distance are required.' });
  }

  const action = TRANSPORT_ACTIONS.find((item) => item.id === transportId) || TRANSPORT_ACTIONS[0];

  try {
    if (!carbonApiKey) {
      throw new Error('Missing Carbon Interface API key.');
    }

    const estimateResponse = await axios.post(
      'https://www.carboninterface.com/v1/estimates',
      buildCarbonEstimatePayload(transportId, amount),
      {
        headers: {
          Authorization: `Bearer ${carbonApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const carbonData = estimateResponse.data?.data?.attributes || {};
    const co2 = Number(carbonData.carbon_kg) || estimateCo2Fallback(amount, action.rate);
    const points = Math.round(co2 * 100 + amount * 2);

    return res.json({
      co2,
      points,
      distance: amount,
      label: action.label,
      carbonEstimate: carbonData,
    });
  } catch (error) {
    console.error('Carbon Interface request failed:', error.response?.data || error.message || error);
    const co2 = estimateCo2Fallback(amount, action.rate);
    const points = Math.round(co2 * 100 + amount * 2);

    return res.json({
      co2,
      points,
      distance: amount,
      label: action.label,
      warning: 'Carbon Interface estimate unavailable. Using local fallback.',
      error: error.response?.data || error.message,
    });
  }
});

app.post('/api/logs', async (req, res) => {
  if (!firestore) {
    return res.status(500).json({ error: 'Firebase is not configured. Logs cannot be persisted.' });
  }

  const { userId = 'demo-user', transportId, label, distance, co2, points } = req.body;

  if (!label || !distance || !co2) {
    return res.status(400).json({ error: 'Missing required log fields.' });
  }

  try {
    const docRef = await firestore.collection(firebaseCollection).add({
      userId,
      transportId,
      label,
      distance,
      co2,
      points,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    const savedDoc = await docRef.get();
    return res.status(201).json({ id: docRef.id, ...savedDoc.data() });
  } catch (error) {
    console.error('Firebase log save failed:', error);
    return res.status(500).json({ error: 'Unable to save log to Firebase.' });
  }
});

app.get('/api/logs', async (req, res) => {
  if (!firestore) {
    return res.status(500).json({ error: 'Firebase is not configured.' });
  }

  const userId = req.query.userId || 'demo-user';

  try {
    let query = firestore.collection(firebaseCollection).where('userId', '==', userId).orderBy('createdAt', 'desc').limit(100);
    const snapshot = await query.get();
    const logs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json({ logs });
  } catch (error) {
    console.error('Failed to load logs:', error);
    return res.status(500).json({ error: 'Unable to load logs.' });
  }
});

app.listen(port, () => {
  console.log(`Eco-Gotchi backend running on http://localhost:${port}`);
});
