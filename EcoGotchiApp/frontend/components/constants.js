// constants.js
// Shared constants, helpers, plant SVGs, and reusable UI components.
// Import from this file in home.js, logs.js, progress.js, account.js, and App.js.

import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
} from "react-native";
import Svg, {
  Path,
  Rect,
  Ellipse,
  Circle,
  Text as SvgText,
} from "react-native-svg";

// ─── Data constants ───────────────────────────────────────────────────────────

export const STAGES = [
  { name: "Sprout", max: 2000, color: "#a8d5a2", tc: "#2d6a4f" },
  { name: "Seedling", max: 5000, color: "#5db85d", tc: "#fff" },
  { name: "Budding", max: 10000, color: "#f9a8d4", tc: "#831843" },
  { name: "Flowering", max: 20000, color: "#fbbf24", tc: "#78350f" },
  { name: "Maturing", max: 30000, color: "#2d6a4f", tc: "#fff" },
];

export const MAX_PTS = 100000; // Eco Points cap at 100,000

export const TRANSPORT_ACTIONS = [
  { id: "bike", label: "Biked instead of driving", rate: 0.21 },
  { id: "walk", label: "Walked instead of driving", rate: 0.21 },
  { id: "jeepney", label: "Rode Jeepney instead of car", rate: 0.11 },
  { id: "bus", label: "Rode Bus instead of car", rate: 0.147 },
  { id: "lrt_mrt", label: "Took LRT/MRT instead of car", rate: 0.041 },
  { id: "tricycle", label: "Took Tricycle instead of car", rate: 0.19 },
  { id: "carpool", label: "Carpooled (4 passengers)", rate: 0.21 },
];

export const MISSIONS_POOL = [
  { id: "m1", text: "Walk or bike at least 2 km today", points: 30, target: 2 },
  {
    id: "m2",
    text: "Take public transport for your commute",
    points: 50,
    target: 1,
  },
  { id: "m3", text: "Carpool to your destination", points: 40, target: 1 },
  {
    id: "m4",
    text: "Avoid private car trips entirely today",
    points: 100,
    target: 3,
  },
  {
    id: "m5",
    text: "Log 3 eco-friendly transport actions",
    points: 80,
    target: 3,
  },
];

export const SEEDS = [
  {
    id: "oak",
    label: "Oak Tree Seed",
    emoji: "🌰",
    desc: "Slow but mighty. Massive CO₂ savings.",
  },
  {
    id: "bamboo",
    label: "Bamboo Shoot",
    emoji: "🎋",
    desc: "Fast grower. Bonus for daily streaks.",
  },
  {
    id: "cactus",
    label: "Desert Cactus",
    emoji: "🌵",
    desc: "Resilient. Hearts deplete slower.",
  },
  {
    id: "cherry",
    label: "Cherry Blossom Seed",
    emoji: "🌸",
    desc: "Beautiful bloomer. Double points on weekends.",
  },
];

export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const HEART_MS = 24 * 60 * 60 * 1000; // 24 h in ms

// ─── Pure helpers ─────────────────────────────────────────────────────────────

export function makeMissions() {
  return [...MISSIONS_POOL]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((m) => ({ ...m, completed: false, progress: 0 }));
}

export function getStageProgress(pts) {
  let cum = 0;
  for (let i = 0; i < STAGES.length - 1; i++) {
    const next = cum + STAGES[i].max;
    if (pts < next) return { current: pts - cum, max: STAGES[i].max, idx: i };
    cum += STAGES[i].max;
  }
  const last = STAGES[STAGES.length - 1];
  return {
    current: Math.min(pts - cum, last.max),
    max: last.max,
    idx: STAGES.length - 1,
  };
}

export function fmtDuration(ms) {
  if (ms <= 0) return "Ready to recover!";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

export function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getWeekDates() {
  const today = new Date();
  const day = today.getDay();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - day + i);
    return d;
  });
}

// ─── Plant SVGs ───────────────────────────────────────────────────────────────

export function PlantSVG({ stageIdx }) {
  if (stageIdx === 0)
    return (
      <Svg width={90} height={130} viewBox="0 0 90 130">
        <Path d="M22 95 Q24 120 45 122 Q66 120 68 95 Z" fill="#c07b54" />
        <Rect x="18" y="89" width="54" height="11" rx="5.5" fill="#a0634a" />
        <Ellipse cx="45" cy="89" rx="25" ry="5" fill="#7c4b2a" />
        <Path
          d="M43 88 Q41 76 45 62"
          stroke="#52b788"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <Path d="M45 72 Q56 60 58 50 Q46 58 43 70 Z" fill="#52b788" />
      </Svg>
    );
  if (stageIdx === 1)
    return (
      <Svg width={90} height={130} viewBox="0 0 90 130">
        <Path d="M22 95 Q24 120 45 122 Q66 120 68 95 Z" fill="#c07b54" />
        <Rect x="18" y="89" width="54" height="11" rx="5.5" fill="#a0634a" />
        <Ellipse cx="45" cy="89" rx="25" ry="5" fill="#7c4b2a" />
        <Path
          d="M43 88 Q40 70 45 48"
          stroke="#40916c"
          strokeWidth="4.5"
          strokeLinecap="round"
          fill="none"
        />
        <Path d="M43 68 Q28 55 26 40 Q40 50 45 66 Z" fill="#52b788" />
        <Path d="M45 62 Q62 50 64 36 Q50 46 44 60 Z" fill="#74c69d" />
      </Svg>
    );
  if (stageIdx === 2)
    return (
      <Svg width={90} height={130} viewBox="0 0 90 130">
        <Path d="M22 95 Q24 120 45 122 Q66 120 68 95 Z" fill="#b07048" />
        <Rect x="18" y="89" width="54" height="11" rx="5.5" fill="#8d5836" />
        <Ellipse cx="45" cy="89" rx="25" ry="5" fill="#6b3f22" />
        <Path
          d="M43 88 Q39 68 45 42"
          stroke="#2d6a4f"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <Path d="M42 72 Q22 56 20 38 Q38 52 44 70 Z" fill="#52b788" />
        <Path d="M46 66 Q66 50 68 32 Q50 46 44 64 Z" fill="#74c69d" />
        <Ellipse cx="45" cy="35" rx="11" ry="14" fill="#d4a5c9" />
        <Ellipse cx="45" cy="27" rx="7" ry="6" fill="#f9a8d4" />
      </Svg>
    );
  if (stageIdx === 3)
    return (
      <Svg width={90} height={130} viewBox="0 0 90 130">
        <Path d="M22 95 Q24 120 45 122 Q66 120 68 95 Z" fill="#b07048" />
        <Rect x="18" y="89" width="54" height="11" rx="5.5" fill="#8d5836" />
        <Ellipse cx="45" cy="89" rx="25" ry="5" fill="#6b3f22" />
        <Path
          d="M43 88 Q39 66 45 40"
          stroke="#2d6a4f"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        <Path d="M42 75 Q20 58 18 38 Q38 54 44 73 Z" fill="#52b788" />
        <Path d="M46 68 Q68 52 70 30 Q50 46 44 66 Z" fill="#74c69d" />
        <Ellipse cx="45" cy="22" rx="9" ry="14" fill="#fbbf24" opacity="0.9" />
        <Ellipse
          cx="32"
          cy="28"
          rx="9"
          ry="14"
          fill="#fbbf24"
          opacity="0.85"
          rotation="-50"
          originX="32"
          originY="28"
        />
        <Ellipse
          cx="58"
          cy="28"
          rx="9"
          ry="14"
          fill="#fbbf24"
          opacity="0.85"
          rotation="50"
          originX="58"
          originY="28"
        />
        <Circle cx="45" cy="36" r="12" fill="#f59e0b" />
        <Circle cx="45" cy="36" r="7" fill="#fbbf24" />
        <Circle cx="45" cy="36" r="3.5" fill="#d97706" />
      </Svg>
    );
  return (
    <Svg width={90} height={130} viewBox="0 0 90 130">
      <Path d="M22 95 Q24 120 45 122 Q66 120 68 95 Z" fill="#7c3aed" />
      <Rect x="18" y="89" width="54" height="11" rx="5.5" fill="#5b21b6" />
      <Ellipse cx="45" cy="89" rx="25" ry="5" fill="#3b0764" />
      <Path
        d="M43 88 Q38 64 45 36"
        stroke="#1b4332"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />
      <Path d="M41 80 Q16 62 14 38 Q36 56 43 78 Z" fill="#2d6a4f" />
      <Path d="M47 73 Q72 55 74 28 Q52 48 45 71 Z" fill="#40916c" />
      <Path
        d="M42 64 Q20 46 22 24 Q40 40 44 62 Z"
        fill="#52b788"
        opacity="0.85"
      />
      <Path
        d="M46 58 Q68 40 66 18 Q48 36 44 56 Z"
        fill="#74c69d"
        opacity="0.85"
      />
      <Circle cx="45" cy="22" r="16" fill="#1b4332" />
      <Circle cx="30" cy="30" r="12" fill="#2d6a4f" />
      <Circle cx="60" cy="30" r="12" fill="#2d6a4f" />
      <Circle cx="45" cy="14" r="10" fill="#40916c" />
      <Circle cx="45" cy="22" r="4" fill="#95d5b2" />
      <Circle cx="45" cy="22" r="2" fill="#fff" opacity="0.9" />
    </Svg>
  );
}

export function DeadPlantSVG() {
  return (
    <Svg width={90} height={130} viewBox="0 0 90 130">
      <Path d="M22 95 Q24 120 45 122 Q66 120 68 95 Z" fill="#8b7355" />
      <Path
        d="M55 95 Q63 97 68 95 Q67 114 58 120 Q50 122 50 95 Z"
        fill="rgba(0,0,0,0.12)"
      />
      <Rect x="18" y="89" width="54" height="11" rx="5.5" fill="#6b5a3e" />
      <Ellipse cx="45" cy="89" rx="25" ry="5" fill="#4a3728" />
      <Path
        d="M43 88 Q44 80 43 72 Q42 64 38 56 Q36 50 30 46"
        stroke="#7c6540"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <Path
        d="M38 56 Q18 58 14 70 Q28 62 40 56 Z"
        fill="#8b7355"
        opacity="0.8"
      />
      <Path
        d="M43 68 Q55 72 58 84 Q48 72 42 68 Z"
        fill="#8b7355"
        opacity="0.8"
      />
      <Path
        d="M30 46 Q24 40 22 34 Q28 38 32 44 Z"
        fill="#7c6540"
        opacity="0.7"
      />
      <SvgText
        x="36"
        y="36"
        fontSize="16"
        fill="#6b5a3e"
        opacity="0.4"
        fontFamily="sans-serif"
      >
        ✕
      </SvgText>
    </Svg>
  );
}

// ─── Shared UI components ─────────────────────────────────────────────────────

/**
 * Hearts row + single countdown timer.
 * Fixed to prevent "Cannot read properties of undefined (reading 'length')" crashes.
 */
export function Hearts({ lives = 5, lostAt = [], now = Date.now() }) {
  // Ensure lostAt is treated as an array to prevent .length exceptions
  const safeLostAt = Array.isArray(lostAt) ? lostAt : [];
  const safeLives = typeof lives === "number" ? lives : 5;

  const nextTs = safeLostAt.length > 0 ? safeLostAt[0] : null;
  const rem = nextTs !== null ? HEART_MS - (now - nextTs) : null;

  return (
    <View>
      <View style={{ flexDirection: "row", gap: 3, marginBottom: 4 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Text key={i} style={{ fontSize: 18, opacity: i < safeLives ? 1 : 0.28 }}>
            ❤️
          </Text>
        ))}
      </View>
      {rem !== null && rem > 0 && (
        <View style={sharedStyles.heartTimer}>
          <Text style={{ fontSize: 11 }}>🕐</Text>
          <Text style={sharedStyles.heartTimerText}>
            A Heart recovers in {fmtDuration(rem)}
          </Text>
        </View>
      )}
    </View>
  );
}

export function ProgressBar({ current, max, stageIdx }) {
  const pct = Math.min((current / max) * 100, 100);
  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: pct,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [pct]);

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <Text style={sharedStyles.progressLabel}>
          Growth Stage: {STAGES[stageIdx]?.name || "Sprout"}
        </Text>
        <Text style={sharedStyles.progressNums}>
          {(current || 0).toLocaleString()} / {(max || 100).toLocaleString()}
        </Text>
      </View>
      <View style={sharedStyles.progressTrack}>
        <Animated.View
          style={[
            sharedStyles.progressFill,
            {
              width: animWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>
      {stageIdx < STAGES.length - 1 ? (
        <Text style={sharedStyles.nextStageText}>
          Next: {STAGES[stageIdx + 1]?.name}
        </Text>
      ) : (
        <Text style={[sharedStyles.nextStageText, { color: "#fbbf24" }]}>
          ⭐ Fully Matured — Achievement incoming!
        </Text>
      )}
    </View>
  );
}

export function MissionCard({ mission, onComplete }) {
  if (!mission) return null;
  return (
    <View
      style={[
        sharedStyles.missionCard,
        mission.completed && sharedStyles.missionCardDone,
      ]}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={[
            sharedStyles.missionText,
            mission.completed && sharedStyles.missionTextDone,
          ]}
        >
          {mission.text}
        </Text>
        <Text style={sharedStyles.missionPts}>+{mission.points} 🍃 pts</Text>
      </View>
      {mission.completed ? (
        <Text style={{ fontSize: 20, marginLeft: 8 }}>✅</Text>
      ) : (
        <TouchableOpacity
          onPress={() => onComplete && onComplete(mission.id)}
          style={sharedStyles.missionBtn}
        >
          <Text style={sharedStyles.missionBtnText}>Done ✓</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function LogItem({ log, last }) {
  if (!log) return null;
  return (
    <View style={[sharedStyles.logItem, !last && sharedStyles.logItemBorder]}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={sharedStyles.logLabel} numberOfLines={1}>
          {log.label}
        </Text>
        <Text style={sharedStyles.logMeta}>
          {log.distance} km · {(log.co2 || 0).toFixed(3)} kg CO₂ saved
        </Text>
      </View>
      <Text style={sharedStyles.logPts}>+{log.points} 🍃</Text>
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[sharedStyles.card, style]}>{children}</View>;
}

export function SectionHeader({ label, right }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
      }}
    >
      <Text style={sharedStyles.sectionHeader}>{label}</Text>
      {right}
    </View>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

export const sharedStyles = StyleSheet.create({
  heartTimer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(254,226,226,0.8)",
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 3,
    alignSelf: "flex-start",
    marginTop: 2,
  },
  heartTimerText: {
    fontSize: 11,
    color: "#b91c1c",
    fontWeight: "800",
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#5a7c5a",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  progressNums: {
    fontSize: 12,
    color: "#5a7c5a",
    fontWeight: "700",
  },
  progressTrack: {
    backgroundColor: "#d4edda",
    borderRadius: 20,
    height: 18,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#b2d8b2",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#52b788",
    borderRadius: 20,
  },
  nextStageText: {
    marginTop: 5,
    fontSize: 11,
    color: "#9ca3af",
    textAlign: "right",
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 16,
    padding: 12,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1a3a2a",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  missionCard: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: "#d4edda",
  },
  missionCardDone: {
    backgroundColor: "rgba(212,237,218,0.55)",
    borderColor: "#52b788",
  },
  missionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  missionTextDone: {
    color: "#2d6a4f",
    textDecorationLine: "line-through",
    opacity: 0.75,
  },
  missionPts: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },
  missionBtn: {
    backgroundColor: "#52b788",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginLeft: 10,
  },
  missionBtnText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  logItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 9,
  },
  logItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#e8f5e9",
  },
  logLabel: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
  },
  logMeta: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 1,
  },
  logPts: {
    fontSize: 13,
    fontWeight: "800",
    color: "#52b788",
    marginLeft: 8,
  },
  logsContainer: {
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  logsHeader: {
    backgroundColor: "#1a3a2a",
    padding: 22,
  },
  logsHeaderSubLabel: {
    fontSize: 11,
    color: "#95d5b2",
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  logsHeaderTitle: {
    fontSize: 17,
    color: "#fff",
    fontWeight: "900",
  },
  weeklyPts: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
    lineHeight: 42,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 10,
  },
  statBoxLabel: {
    fontSize: 11,
    color: "#95d5b2",
    fontWeight: "700",
  },
  statBoxValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#fff",
    marginTop: 2,
  },
  backBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  backBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#d1fae5",
  },
});