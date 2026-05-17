import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDN6MbqID2NmjTo55H4vXxNoO6FYEZEgyM",
  authDomain: "ecogotchiapp.firebaseapp.com",
  projectId: "ecogotchiapp",
  storageBucket: "ecogotchiapp.firebasestorage.app",
  messagingSenderId: "862335707596",
  appId: "1:862335707596:web:66f64711e0b3e24a7b5569",
  measurementId: "G-VKNCR7HLHX",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const logsCollection = collection(db, "ecogotchi_logs");

export async function saveLogToFirestore(log) {
  if (!log || !log.label) {
    throw new Error("Invalid log payload.");
  }

  const payload = {
    userId: log.userId || "demo-user",
    label: log.label,
    transportId: log.transportId || "unknown",
    distance: log.distance || 0,
    co2: log.co2 || 0,
    points: log.points || 0,
    ts: log.ts ? new Date(log.ts) : new Date(),
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(logsCollection, payload);
  return { id: docRef.id, ...payload };
}

export async function fetchLogsForUser(userId = "demo-user") {
  const q = query(logsCollection, orderBy("ts", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        ts: data.ts?.toMillis ? data.ts.toMillis() : data.ts || Date.now(),
      };
    })
    .filter((log) => log.userId === userId);
}
