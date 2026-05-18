// app/(tabs)/App.js
// Root component. Owns all game state and logic, renders the tab bar,
// and routes to the four tab screens plus Dead / Achievement overlays.

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ── Tab screens ──────────────────────────────────────────────────────────────
import HomeScreen, { EcoModal, DeadScreen, MaxAchievementScreen } from "./home";
import LogsScreen from "./logs";
import ProgressScreen from "./progress";
import AccountScreen from "./profile";

// ── Shared logic ─────────────────────────────────────────────────────────────
import {
  STAGES,
  MAX_PTS,
  SEEDS,
  HEART_MS,
  makeMissions,
  getStageProgress,
  sameDay,
} from "../../components/constants";

import { fetchLogsForUser, saveLogToFirestore } from "../../firebase";

// ─── Tab navigation config ────────────────────────────────────────────────────
const TABS = [
  { key: "pet", icon: "🌿", label: "PET" },
  { key: "logs", icon: "📋", label: "LOGS" },
  { key: "progress", icon: "⭐", label: "PROGRESS" },
  { key: "profile", icon: "👤", label: "PROFILE" },
];

export default function App() {
  // ── Game state ──────────────────────────────────────────────────────────────
  const [totalPoints, setTotalPoints] = useState(0);
  const [todayPoints, setTodayPoints] = useState(0);
  const [lives, setLives] = useState(5);
  const [lostAt, setLostAt] = useState([]);
  const [logs, setLogs] = useState([]);
  const [missions, setMissions] = useState(makeMissions);
  const [petName, setPetName] = useState("My Eco Plant");
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [plantHistory, setPlantHistory] = useState([]);

  // ── UI state ────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("pet");
  const [isDead, setIsDead] = useState(false);
  const [isMaxed, setIsMaxed] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpText, setLevelUpText] = useState("");
  const [now, setNow] = useState(Date.now());

  // ── Animation refs ──────────────────────────────────────────────────────────
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const toastAnim = useRef(new Animated.Value(0)).current;
  const floatLoop = useRef(null);

  const missionsRef = useRef(missions);
  missionsRef.current = missions;

  const { idx: stageIdx, current, max } = getStageProgress(totalPoints);

  const startFloat = useCallback(() => {
    floatAnim.setValue(0);
    floatLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -8,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    );
    floatLoop.current.start();
  }, [floatAnim]);

  useEffect(() => {
    startFloat();
    return () => floatLoop.current && floatLoop.current.stop();
  }, [startFloat]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    async function loadSavedLogs() {
      try {
        const savedLogs = await fetchLogsForUser("demo-user");
        if (!savedLogs || savedLogs.length === 0) return;

        setLogs(savedLogs);
        setTotalPoints(
          savedLogs.reduce((sum, log) => sum + (log.points || 0), 0),
        );
        setTodayPoints(
          savedLogs
            .filter((log) => sameDay(new Date(log.ts), new Date()))
            .reduce((sum, log) => sum + (log.points || 0), 0),
        );
      } catch (error) {
        console.warn("Unable to load saved logs from Firebase:", error);
      }
    }

    loadSavedLogs();
  }, []);

  useEffect(() => {
    if (lostAt.length === 0) return;
    if (now - lostAt[0] >= HEART_MS) {
      setLostAt((prev) => prev.slice(1));
      setLives((prev) => Math.min(5, prev + 1));
    }
  }, [now, lostAt]);

  const applyPoints = useCallback((pts) => {
    if (pts <= 0) return;
    setTodayPoints((p) => p + pts);
    setTotalPoints((prev) => prev + pts);
  }, []);

  const handleLogEcoAction = useCallback(
    (actionData) => {
      const newLog = {
        id: Date.now().toString(),
        label: actionData.label,
        distance: actionData.distance,
        co2: actionData.co2,
        points: actionData.points,
        ts: Date.now(),
        userId: "demo-user",
      };
      setLogs((prev) => [newLog, ...prev]);
      applyPoints(actionData.points);
      saveLogToFirestore(newLog).catch((error) => {
        console.warn("Failed to persist log to Firebase:", error);
      });
    },
    [applyPoints],
  );

  const handleLoseHeart = useCallback(() => {
    setLives((prev) => {
      const nextLives = Math.max(0, prev - 1);
      if (nextLives === 0) {
        setIsDead(true);
      }
      return nextLives;
    });
    setLostAt((prev) => [...prev, Date.now()]);
  }, []);

  const completeMission = useCallback(
    (id) => {
      const m = missions.find((ms) => ms.id === id && !ms.completed);
      if (!m) return;
      setMissions((prev) =>
        prev.map((ms) => (ms.id === id ? { ...ms, completed: true } : ms)),
      );
      applyPoints(m.points);
    },
    [missions, applyPoints],
  );

  const handleCommitName = useCallback(() => {
    if (draftName.trim()) setPetName(draftName.trim());
    setEditingName(false);
  }, [draftName]);

  const handleRestart = useCallback(() => {
    setTotalPoints(0);
    setTodayPoints(0);
    setLives(5);
    setLostAt([]);
    setLogs([]);
    setMissions(makeMissions());
    setIsDead(false);
    setIsMaxed(false);
  }, []);

  const handleChooseSeed = useCallback(
    (seedId) => {
      const selectedSeed = SEEDS.find((s) => s.id === seedId);
      setPlantHistory((prev) => [
        ...prev,
        {
          name: petName,
          points: totalPoints,
          date: new Date().toLocaleDateString(),
        },
      ]);
      setPetName(`New ${selectedSeed?.label || "Plant"}`);
      handleRestart();
    },
    [petName, totalPoints, handleRestart],
  );

  // ── Overlays Override Check ──
  if (isDead) return <DeadScreen onRestart={handleRestart} />;
  if (isMaxed)
    return (
      <MaxAchievementScreen
        petName={petName}
        totalPoints={totalPoints}
        logCount={logs.length}
        onChooseSeed={handleChooseSeed}
      />
    );

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#c8f0d0" />

      {/* ── Screen Wrapper View ── */}
      <View style={{ flex: 1 }}>
        {activeTab === "pet" && (
          <HomeScreen
            totalPoints={totalPoints}
            todayPoints={todayPoints}
            lives={lives}
            lostAt={lostAt}
            now={now}
            logs={logs}
            missions={missions}
            petName={petName}
            editingName={editingName}
            draftName={draftName}
            bounceAnim={bounceAnim}
            floatAnim={floatAnim}
            stageIdx={stageIdx}
            current={current}
            max={max}
            onLoseHeart={handleLoseHeart}
            onCompleteMission={completeMission}
            onStartEditName={() => {
              setDraftName(petName);
              setEditingName(true);
            }}
            onCommitName={handleCommitName}
            onDraftNameChange={setDraftName}
            onViewAllLogs={() => setActiveTab("logs")}
            onLogEcoAction={handleLogEcoAction}
          />
        )}
        {activeTab === "logs" && (
          <LogsScreen logs={logs} totalPoints={totalPoints} />
        )}
        {activeTab === "progress" && (
          <ProgressScreen totalPoints={totalPoints} />
        )}
        {activeTab === "profile" && (
          <AccountScreen
            petName={petName}
            totalPoints={totalPoints}
            logCount={logs.length}
            plantHistory={plantHistory}
          />
        )}
      </View>

      {/* ── Simple Bottom Tab Navigation View ── */}
      <SafeAreaView edges={["bottom"]} style={s.navBarWrapper}>
        <View style={s.navBar}>
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={s.navItem}
              >
                <Text style={{ fontSize: 22, opacity: active ? 1 : 0.6 }}>
                  {tab.icon}
                </Text>
                <Text
                  style={[
                    s.navLabel,
                    active && { color: "#1a3a2a", fontWeight: "900" },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#c8f0d0" },
  navBarWrapper: {
    backgroundColor: "rgba(240, 252, 240, 0.98)",
    borderTopWidth: 1,
    borderTopColor: "rgba(82, 183, 136, 0.2)",
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 4 : 12,
  },
  navItem: { alignItems: "center", gap: 3, minWidth: 65 },
  navLabel: { fontSize: 9, fontWeight: "700", color: "#8ca393" },
});
