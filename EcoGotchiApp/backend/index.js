const express = require("express");
const cors = require("cors");
const axios = require("axios");
const admin = require("firebase-admin");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const carbonApiKey = process.env.CARBON_INTERFACE_API_KEY;
const firebaseCollection = process.env.FIREBASE_COLLECTION || "ecogotchi_logs";

const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
    : undefined,
};

let firestore = null;
if (
  firebaseConfig.projectId &&
  firebaseConfig.clientEmail &&
  firebaseConfig.privateKey
) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
  firestore = admin.firestore();
} else {
  console.warn(
    "Firebase is not fully configured. Logs will not be persisted until environment variables are added.",
  );
}

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log("==========");
  console.log(req.method);
  console.log(req.url);
  console.log(req.body);
  console.log("==========");
  next();
});

// Configure Nodemailer transporter using your .env credentials
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const TRANSPORT_ACTIONS = [
  { id: "bike", label: "Biked instead of driving", rate: 0.085 },
  { id: "walk", label: "Walked instead of using a car", rate: 0.05 },
  { id: "jeepney", label: "Jeepney ride", rate: 0.15 },
  { id: "bus", label: "Bus ride", rate: 0.1 },
  { id: "lrt_mrt", label: "LRT / MRT ride", rate: 0.08 },
  { id: "tricycle", label: "Tricycle ride", rate: 0.12 },
  { id: "carpool", label: "Carpool with friends", rate: 0.09 },
];

const estimateCo2Fallback = (distance, rate) =>
  Number((distance * (rate || 0.12)).toFixed(3));

// In-memory OTP storage (email -> { otp, timestamp })
const otpStore = {};
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

const cleanExpiredOtps = () => {
  const now = Date.now();
  for (const email in otpStore) {
    if (now - otpStore[email].timestamp > OTP_EXPIRY_MS) {
      delete otpStore[email];
    }
  }
};

const buildCarbonEstimatePayload = (transportId, distance) => ({
  type: "vehicle",
  distance_unit: "km",
  distance_value: Number(distance),
  vehicle_model_id:
    process.env.CARBON_DEFAULT_VEHICLE_MODEL_ID || "toyota_prius_2015",
});

const users = [];

// Firebase Admin SDK - Users collection reference
let usersCollection = null;
if (firestore) {
  usersCollection = firestore.collection("Users");
}

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  
  // Try to find user in Firebase Firestore first
  if (usersCollection) {
    try {
      const querySnapshot = await usersCollection
        .where("email", "==", email)
        .where("password", "==", password)
        .limit(1)
        .get();
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const userData = doc.data();
        return res.json({
          user: { id: doc.id, email: userData.email, name: userData.name },
          token: "firebase-token",
        });
      }
    } catch (error) {
      console.error("Firebase login query error:", error);
    }
  }
  
  // Fallback to in-memory users (for demo/testing)
  const user = users.find(
    (item) => item.email === email && item.password === password,
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  res.json({
    user: { id: user.id, email: user.email, name: user.name },
    token: "demo-token",
  });
});

app.post("/api/auth/signup", async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required." });
  }

  // Check if user exists in Firebase Firestore first
  if (usersCollection) {
    try {
      const querySnapshot = await usersCollection
        .where("email", "==", email)
        .limit(1)
        .get();
      
      if (!querySnapshot.empty) {
        return res.status(409).json({ error: "Email already in use." });
      }
      
      // Save new user to Firebase Firestore "Users" collection
      const docRef = await usersCollection.add({
        email,
        password,
        name,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      const newUser = { id: docRef.id, email, name };
      return res.status(201).json({ user: newUser, token: "firebase-token" });
    } catch (error) {
      console.error("Firebase signup error:", error);
      return res.status(500).json({ error: "Unable to create account in database." });
    }
  }

  // Fallback to in-memory storage (for demo/testing without Firebase)
  const exists = users.some((item) => item.email === email);
  if (exists) {
    return res.status(409).json({ error: "Email already in use." });
  }

  const id = users.length + 1;
  const user = { id, email, password, name };
  users.push(user);

  res.status(201).json({ user: { id, email, name }, token: "demo-token" });
});

// Live Operational OTP Email Route with Built-in Error Fallback
app.post("/api/send-otp", async (req, res) => {
  console.log("\n==================================================");
  console.log("📨 [ROUTE HIT] /api/send-otp was triggered!");
  console.log("📦 [RAW DATA] Received body:", req.body);
  console.log("==================================================");

  let { email } = req.body;

  // Safety Fallback: If app forgets or fails to send the input text, force send it to your project account
  if (!email || email.trim() === "") {
    console.log(
      "⚠️ [WARNING] App sent an empty email field! Defaulting to project mail.",
    );
    email = process.env.EMAIL_USER;
  }

  const mockOtp = Math.floor(100000 + Math.random() * 900000);
  console.log(`🔥 [OTP GENERATED] PIN for ${email} is: ${mockOtp}`);

  // Store OTP in memory for verification
  otpStore[email.trim()] = { otp: mockOtp.toString(), timestamp: Date.now() };
  console.log(`💾 [OTP STORED] OTP for ${email} stored in memory`);

  const mailOptions = {
    from: `"Eco-Gotchi Support" <${process.env.EMAIL_USER}>`,
    to: email.trim(),
    subject: "Your Eco-Gotchi Reset Password OTP",
    html: `
      <div style="font-family: sans-serif; padding: 20px; color: #422F21;">
        <h2>Eco-Gotchi Password Reset</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password. Use the verification code below to proceed:</p>
        <div style="background-color: #FAFFF8; border: 2px dashed #4EC882; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 4px; margin: 20px 0; border-radius: 10px;">
          ${mockOtp}
        </div>
        <p style="font-size: 12px; color: #7A5C4A;">If you did not make this request, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ [SUCCESS] Real email successfully sent to ${email}`);

    return res.status(200).json({
      message: "OTP sent successfully!",
      email: email,
    });
  } catch (error) {
    console.error("❌ [NODEMAILER ERROR] Failed to send email:", error.message);
    return res.status(500).json({
      message: "Failed to dispatch email via Nodemailer.",
    });
  }
});

// Verify OTP endpoint
app.post("/api/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Email and OTP are required." });
  }

  cleanExpiredOtps();

  const trimmedEmail = email.trim();
  const stored = otpStore[trimmedEmail];

  if (!stored) {
    return res
      .status(400)
      .json({
        error: "No OTP found for this email. Please request a new one.",
      });
  }

  if (stored.otp !== otp.toString()) {
    console.warn(
      `❌ [VERIFY FAILED] Invalid OTP for ${trimmedEmail}. Expected ${stored.otp}, got ${otp}`,
    );
    return res.status(401).json({ error: "Invalid OTP. Please try again." });
  }

  // OTP is valid — clear it from storage
  delete otpStore[trimmedEmail];
  console.log(
    `✅ [OTP VERIFIED] OTP for ${trimmedEmail} verified successfully`,
  );

  return res.json({
    message: "OTP verified successfully!",
    email: trimmedEmail,
  });
});

// Reset password endpoint
app.post("/api/reset-password", (req, res) => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res
      .status(400)
      .json({ error: "Email and new password are required." });
  }

  if (newPassword.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters." });
  }

  const trimmedEmail = email.trim();
  const user = users.find((u) => u.email === trimmedEmail);

  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  user.password = newPassword;
  console.log(`✅ [PASSWORD RESET] Password updated for ${trimmedEmail}`);

  return res.json({
    message: "Password reset successfully!",
    user: { id: user.id, email: user.email, name: user.name },
  });
});

app.get("/api/pet", (req, res) => {
  res.json({ name: "Luna", mood: "Blooming", level: 5, progress: 78 });
});

app.post("/api/estimate-carbon", async (req, res) => {
  const { transportId, distance } = req.body;
  const amount = Number(distance);

  if (!transportId || !amount || Number.isNaN(amount) || amount <= 0) {
    return res
      .status(400)
      .json({ error: "transportId and positive distance are required." });
  }

  const action =
    TRANSPORT_ACTIONS.find((item) => item.id === transportId) ||
    TRANSPORT_ACTIONS[0];

  try {
    if (!carbonApiKey) {
      throw new Error("Missing Carbon Interface API key.");
    }

    const estimateResponse = await axios.post(
      "https://www.carboninterface.com/v1/estimates",
      buildCarbonEstimatePayload(transportId, amount),
      {
        headers: {
          Authorization: `Bearer ${carbonApiKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    const carbonData = estimateResponse.data?.data?.attributes || {};
    const co2 =
      Number(carbonData.carbon_kg) || estimateCo2Fallback(amount, action.rate);
    const points = Math.round(co2 * 100 + amount * 2);

    return res.json({
      co2,
      points,
      distance: amount,
      label: action.label,
      carbonEstimate: carbonData,
    });
  } catch (error) {
    console.error(
      "Carbon Interface request failed:",
      error.response?.data || error.message || error,
    );
    const co2 = estimateCo2Fallback(amount, action.rate);
    const points = Math.round(co2 * 100 + amount * 2);

    return res.json({
      co2,
      points,
      distance: amount,
      label: action.label,
      warning: "Carbon Interface estimate unavailable. Using local fallback.",
      error: error.response?.data || error.message,
    });
  }
});

app.post("/api/logs", async (req, res) => {
  if (!firestore) {
    return res
      .status(500)
      .json({ error: "Firebase is not configured. Logs cannot be persisted." });
  }

  const {
    userId = "demo-user",
    transportId,
    label,
    distance,
    co2,
    points,
  } = req.body;

  if (!label || !distance || !co2) {
    return res.status(400).json({ error: "Missing required log fields." });
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
    console.error("Firebase log save failed:", error);
    return res.status(500).json({ error: "Unable to save log to Firebase." });
  }
});

app.get("/api/logs", async (req, res) => {
  if (!firestore) {
    return res.status(500).json({ error: "Firebase is not configured." });
  }

  const userId = req.query.userId || "demo-user";

  try {
    let query = firestore
      .collection(firebaseCollection)
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .limit(100);
    const snapshot = await query.get();
    const logs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return res.json({ logs });
  } catch (error) {
    console.error("Failed to load logs:", error);
    return res.status(500).json({ error: "Unable to load logs." });
  }
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Eco-Gotchi backend running on network port ${port}`);
});
