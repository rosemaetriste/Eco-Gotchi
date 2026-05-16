/**
 * EcoPlantPet - React Native
 *
 * Single-file React Native app. All screens, functions, UI, and flows
 * are fully preserved from the original web version.
 *
 * Dependencies (add to package.json):
 *   react-native                (core)
 *   @react-native-async-storage/async-storage  (optional persistence)
 *   react-native-svg            (for plant SVGs)
 *
 * This file uses only React Native core APIs + react-native-svg.
 * Install SVG: npx expo install react-native-svg   (Expo)
 *              OR  npm install react-native-svg && npx pod-install  (bare RN)
 */

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  TextInput,
  Modal,
  Animated,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Platform,
  Dimensions,
  FlatList,
  Alert,
} from "react-native";
import Svg, {
  Path,
  Rect,
  Ellipse,
  Circle,
  G,
  Text as SvgText,
} from "react-native-svg";

// ─── Constants ────────────────────────────────────────────────────────────────

const { width: SCREEN_W } = Dimensions.get("window");

const STAGES = [
  { name: "Sprout", max: 2000, color: "#a8d5a2", tc: "#2d6a4f" },
  { name: "Seedling", max: 5000, color: "#5db85d", tc: "#fff" },
  { name: "Budding", max: 10000, color: "#f9a8d4", tc: "#831843" },
  { name: "Flowering", max: 20000, color: "#fbbf24", tc: "#78350f" },
  { name: "Maturing", max: 30000, color: "#2d6a4f", tc: "#fff" },
];

const MAX_PTS = 67000; // sum of all stage maxes

const TRANSPORT_ACTIONS = [
  { id: "bike", label: "Biked instead of driving", rate: 0.21 },
  { id: "walk", label: "Walked instead of driving", rate: 0.21 },
  { id: "jeepney", label: "Rode Jeepney instead of car", rate: 0.11 },
  { id: "bus", label: "Rode Bus instead of car", rate: 0.147 },
  { id: "lrt_mrt", label: "Took LRT/MRT instead of car", rate: 0.041 },
  { id: "tricycle", label: "Took Tricycle instead of car", rate: 0.19 },
  { id: "carpool", label: "Carpooled (4 passengers)", rate: 0.21 },
];

const MISSIONS_POOL = [
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

const SEEDS = [
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

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HEART_MS = 24 * 60 * 60 * 1000; // 24 hours in ms

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeMissions() {
  return [...MISSIONS_POOL]
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((m) => ({ ...m, completed: false, progress: 0 }));
}

function getStageProgress(pts) {
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

function fmtDuration(ms) {
  if (ms <= 0) return "Ready to recover!";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${sec}s`;
  return `${sec}s`;
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getWeekDates() {
  const today = new Date();
  const day = today.getDay();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - day + i);
    return d;
  });
}

// ─── Plant SVG Components ─────────────────────────────────────────────────────

function PlantSVG({ stageIdx }) {
  const size = { width: 90, height: 130 };

  if (stageIdx === 0)
    return (
      <Svg width={size.width} height={size.height} viewBox="0 0 90 130">
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
      <Svg width={size.width} height={size.height} viewBox="0 0 90 130">
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
      <Svg width={size.width} height={size.height} viewBox="0 0 90 130">
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
      <Svg width={size.width} height={size.height} viewBox="0 0 90 130">
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

  // stageIdx === 4 (Maturing)
  return (
    <Svg width={size.width} height={size.height} viewBox="0 0 90 130">
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

function DeadPlantSVG() {
  return (
    <Svg width="90" height="130" viewBox="0 0 90 130">
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

// ─── Shared UI Components ─────────────────────────────────────────────────────

function Hearts({ lives, lostAt, now }) {
  return (
    <View>
      <View style={{ flexDirection: "row", gap: 3, marginBottom: 4 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Text key={i} style={{ fontSize: 18, opacity: i < lives ? 1 : 0.28 }}>
            ❤️
          </Text>
        ))}
      </View>
      {lostAt.slice(0, 5 - lives).map((ts, idx) => {
        const rem = HEART_MS - (now - ts);
        return (
          <View key={idx} style={s.heartTimer}>
            <Text style={{ fontSize: 11 }}>🕐</Text>
            <Text style={s.heartTimerText}>
              Heart {idx + 1} recovers in {fmtDuration(rem)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function ProgressBar({ current, max, stageIdx }) {
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
        <Text style={s.progressLabel}>
          Growth Stage: {STAGES[stageIdx].name}
        </Text>
        <Text style={s.progressNums}>
          {current.toLocaleString()} / {max.toLocaleString()}
        </Text>
      </View>
      <View style={s.progressTrack}>
        <Animated.View
          style={[
            s.progressFill,
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
        <Text style={s.nextStageText}>Next: {STAGES[stageIdx + 1].name}</Text>
      ) : (
        <Text style={[s.nextStageText, { color: "#fbbf24" }]}>
          ⭐ Fully Matured — Achievement incoming!
        </Text>
      )}
    </View>
  );
}

function MissionCard({ mission, onComplete }) {
  return (
    <View style={[s.missionCard, mission.completed && s.missionCardDone]}>
      <View style={{ flex: 1 }}>
        <Text style={[s.missionText, mission.completed && s.missionTextDone]}>
          {mission.text}
        </Text>
        <Text style={s.missionPts}>+{mission.points} 🍃 pts</Text>
      </View>
      {mission.completed ? (
        <Text style={{ fontSize: 20, marginLeft: 8 }}>✅</Text>
      ) : (
        <TouchableOpacity
          onPress={() => onComplete(mission.id)}
          style={s.missionBtn}
        >
          <Text style={s.missionBtnText}>Done ✓</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function LogItem({ log, last }) {
  return (
    <View style={[s.logItem, !last && s.logItemBorder]}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={s.logLabel} numberOfLines={1}>
          {log.label}
        </Text>
        <Text style={s.logMeta}>
          {log.distance} km · {log.co2.toFixed(3)} kg CO₂ saved
        </Text>
      </View>
      <Text style={s.logPts}>+{log.points} 🍃</Text>
    </View>
  );
}

function Card({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}

function SectionHeader({ label, right }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
      }}
    >
      <Text style={s.sectionHeader}>{label}</Text>
      {right}
    </View>
  );
}

// ─── Logs Tab ─────────────────────────────────────────────────────────────────

function FullHistoryPage({ logs, totalPoints, onBack }) {
  return (
    <ScrollView>
      <View style={s.logsHeader}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <TouchableOpacity onPress={onBack} style={s.backBtn}>
            <Text style={s.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={s.logsHeaderTitle}>📜 Full Eco History</Text>
        </View>
        <View style={s.statsGrid}>
          <View style={s.statBox}>
            <Text style={s.statBoxLabel}>ALL-TIME POINTS</Text>
            <Text style={s.statBoxValue}>
              {totalPoints.toLocaleString()} 🍃
            </Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statBoxLabel}>TOTAL LOGS</Text>
            <Text style={s.statBoxValue}>{logs.length} actions</Text>
          </View>
        </View>
      </View>

      <View style={{ padding: 14 }}>
        {logs.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>🌱</Text>
            <Text style={{ color: "#9ca3af", fontSize: 14 }}>
              No eco actions logged yet.
            </Text>
          </View>
        ) : (
          <View style={s.logsContainer}>
            {logs.map((log, i) => (
              <View
                key={log.id}
                style={[s.fullLogItem, i < logs.length - 1 && s.logItemBorder]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={s.fullLogLabel}>{log.label}</Text>
                  <Text style={s.fullLogDate}>
                    {new Date(log.ts).toLocaleDateString("en-PH", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                  <Text style={s.logMeta}>
                    {log.distance} km · {log.co2.toFixed(3)} kg CO₂ saved
                  </Text>
                </View>
                <Text style={s.logPts}>+{log.points} 🍃</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function LogsView({ logs, totalPoints }) {
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const [showFullHistory, setShowFullHistory] = useState(false);

  if (showFullHistory) {
    return (
      <FullHistoryPage
        logs={logs}
        totalPoints={totalPoints}
        onBack={() => setShowFullHistory(false)}
      />
    );
  }

  const weekDates = getWeekDates();
  const weeklyPts = logs
    .filter((l) => weekDates.some((wd) => sameDay(new Date(l.ts), wd)))
    .reduce((sum, l) => sum + l.points, 0);
  const dayLogs = logs.filter((l) =>
    sameDay(new Date(l.ts), weekDates[selectedDay]),
  );

  return (
    <ScrollView stickyHeaderIndices={[1]}>
      {/* Header */}
      <View style={s.logsHeader}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 4,
          }}
        >
          <Text style={s.logsHeaderSubLabel}>This Week's Eco Points</Text>
          <TouchableOpacity
            onPress={() => setShowFullHistory(true)}
            style={s.backBtn}
          >
            <Text style={s.backBtnText}>View all →</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.weeklyPts}>{weeklyPts.toLocaleString()} 🍃</Text>
        <View style={s.statsGrid}>
          <View style={s.statBox}>
            <Text style={s.statBoxLabel}>ALL-TIME 🍃</Text>
            <Text style={s.statBoxValue}>{totalPoints.toLocaleString()}</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statBoxLabel}>TOTAL LOGS</Text>
            <Text style={s.statBoxValue}>{logs.length} actions</Text>
          </View>
        </View>
      </View>

      {/* Day tab strip - sticky */}
      <View style={s.dayTabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {DAYS.map((d, i) => {
            const date = weekDates[i];
            const hasLogs = logs.some((l) => sameDay(new Date(l.ts), date));
            const isToday = sameDay(date, new Date());
            const sel = selectedDay === i;
            return (
              <TouchableOpacity
                key={d}
                onPress={() => setSelectedDay(i)}
                style={[s.dayTab, sel && s.dayTabActive]}
              >
                <Text style={[s.dayTabDay, sel && { color: "#1a3a2a" }]}>
                  {d}
                </Text>
                <Text
                  style={[
                    s.dayTabNum,
                    sel
                      ? { color: "#52b788" }
                      : isToday
                        ? { color: "#1a3a2a" }
                        : { color: "#6b7280" },
                  ]}
                >
                  {date.getDate()}
                </Text>
                <View
                  style={[
                    s.dayTabDot,
                    hasLogs && { backgroundColor: "#52b788" },
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Day content */}
      <View style={{ padding: 14 }}>
        {dayLogs.length > 0 && (
          <View style={s.dayHeader}>
            <Text style={s.dayHeaderLabel}>
              {DAYS[selectedDay]},{" "}
              {weekDates[selectedDay].toLocaleDateString("en-PH", {
                month: "short",
                day: "numeric",
              })}
            </Text>
            <Text style={s.dayHeaderPts}>
              +{dayLogs.reduce((s, l) => s + l.points, 0)} 🍃
            </Text>
          </View>
        )}
        {dayLogs.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 36 }}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>🌿</Text>
            <Text style={{ color: "#9ca3af", fontSize: 14 }}>
              No eco actions logged on this day.
            </Text>
          </View>
        ) : (
          <View style={s.logsContainer}>
            {dayLogs.map((log, i) => (
              <LogItem key={log.id} log={log} last={i === dayLogs.length - 1} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// ─── Eco Action Modal ─────────────────────────────────────────────────────────

function EcoModal({ visible, onClose, onSubmit }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [distance, setDistance] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const reset = () => {
    setSelectedIdx(0);
    setDistance("");
    setResult(null);
    setError("");
    setLoading(false);
    setShowPicker(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const calculate = async () => {
    const d = parseFloat(distance);
    if (!d || d <= 0) {
      setError("Please enter a valid distance.");
      return;
    }
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    const action = TRANSPORT_ACTIONS[selectedIdx];
    const co2 = d * action.rate;
    const pts = Math.round(co2 * 100 + d * 2);
    setResult({ co2, points: pts, distance: d });
    setLoading(false);
  };

  const handleLog = () => {
    if (!result) return;
    onSubmit({
      label: TRANSPORT_ACTIONS[selectedIdx].label,
      distance: result.distance,
      co2: result.co2,
      points: result.points,
    });
    handleClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={s.modalOverlay}>
          <TouchableWithoutFeedback>
            <View style={s.modalSheet}>
              {/* Header */}
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>🌍 Log Eco Action</Text>
                <TouchableOpacity onPress={handleClose}>
                  <Text style={{ fontSize: 22, color: "#6b7280" }}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Transport selector */}
              <Text style={s.inputLabel}>Transport Type (PH)</Text>
              <TouchableOpacity
                onPress={() => setShowPicker(!showPicker)}
                style={s.selectBtn}
              >
                <Text style={s.selectBtnText}>
                  {TRANSPORT_ACTIONS[selectedIdx].label}
                </Text>
                <Text style={{ color: "#52b788" }}>▼</Text>
              </TouchableOpacity>
              {showPicker && (
                <View style={s.pickerDropdown}>
                  {TRANSPORT_ACTIONS.map((a, i) => (
                    <TouchableOpacity
                      key={a.id}
                      onPress={() => {
                        setSelectedIdx(i);
                        setShowPicker(false);
                        setResult(null);
                      }}
                      style={[
                        s.pickerItem,
                        i === selectedIdx && s.pickerItemActive,
                      ]}
                    >
                      <Text
                        style={[
                          s.pickerItemText,
                          i === selectedIdx && {
                            color: "#1a3a2a",
                            fontWeight: "800",
                          },
                        ]}
                      >
                        {a.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Distance input */}
              <Text style={[s.inputLabel, { marginTop: 10 }]}>
                Distance (km)
              </Text>
              <TextInput
                style={s.distanceInput}
                keyboardType="decimal-pad"
                placeholder="e.g. 5.5"
                placeholderTextColor="#9ca3af"
                value={distance}
                onChangeText={(t) => {
                  setDistance(t);
                  setResult(null);
                }}
              />
              {!!error && <Text style={s.errorText}>{error}</Text>}

              {/* Result box */}
              {result && (
                <View style={s.resultBox}>
                  <Text style={s.resultTitle}>
                    🧮 Carbon Interface Estimate (PH)
                  </Text>
                  <Text style={s.resultLine}>
                    CO₂ saved:{" "}
                    <Text style={{ fontWeight: "800" }}>
                      {result.co2.toFixed(3)} kg
                    </Text>
                  </Text>
                  <Text style={s.resultPts}>
                    Points earned: +{result.points} 🍃
                  </Text>
                </View>
              )}

              {/* Buttons */}
              {!result ? (
                <TouchableOpacity
                  onPress={calculate}
                  disabled={loading}
                  style={[s.calcBtn, loading && { backgroundColor: "#95d5b2" }]}
                >
                  <Text style={s.calcBtnText}>
                    {loading
                      ? "Calculating CO₂ savings... 🌿"
                      : "Calculate CO₂ Savings"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={handleLog} style={s.logBtn}>
                  <Text style={s.logBtnText}>✅ Log This Action</Text>
                </TouchableOpacity>
              )}
              <Text style={s.modalFooter}>
                Powered by Carbon Interface · Scope: PH Transportation
              </Text>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

// ─── Dead Screen ──────────────────────────────────────────────────────────────

function DeadScreen({ onRestart }) {
  const floatAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <View style={s.deadScreen}>
      <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
        <DeadPlantSVG />
      </Animated.View>
      <Text style={s.deadTitle}>Your plant has withered... 💀</Text>
      <Text style={s.deadSub}>
        You missed too many missions and lost all 5 hearts.
      </Text>
      <Text style={s.deadHint}>But every ending is a new beginning 🌱</Text>
      <View style={s.tipsBox}>
        <Text style={s.tipsHeader}>💡 Tips for next time</Text>
        <Text style={s.tipItem}>
          ✔ Complete at least 1 mission daily to keep hearts
        </Text>
        <Text style={s.tipItem}>
          ✔ Log eco-actions regularly for steady growth
        </Text>
        <Text style={s.tipItem}>
          ✔ Hearts recover 1 per 24 hrs when you stay active
        </Text>
      </View>
      <TouchableOpacity onPress={onRestart} style={s.restartBtn}>
        <Text style={s.restartBtnText}>🌱 Plant a New Seed</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Max Achievement Screen ───────────────────────────────────────────────────

function MaxAchievementScreen({
  petName,
  totalPoints,
  logCount,
  onChooseSeed,
}) {
  const [chosen, setChosen] = useState(null);

  return (
    <ScrollView
      style={s.maxScreen}
      contentContainerStyle={{ alignItems: "center", paddingBottom: 60 }}
    >
      <Text style={{ fontSize: 28, letterSpacing: 6, marginBottom: 12 }}>
        ⭐⭐⭐
      </Text>
      <Text style={s.maxTitle}>🎉 Achievement Unlocked!</Text>
      <Text style={s.maxSub}>
        <Text style={{ fontWeight: "900" }}>{petName}</Text> has fully matured!
      </Text>
      <Text style={s.maxDesc}>You've completed the full growth journey 🌍</Text>

      <View style={s.trophyBox}>
        <Text style={{ fontSize: 52, marginBottom: 8 }}>🏆</Text>
        <Text style={s.trophyTitle}>ECO GUARDIAN</Text>
        <Text style={s.trophySub}>
          Raised {petName} from Sprout to full Maturity
        </Text>
      </View>

      <View style={s.statsGrid}>
        <View style={s.maxStatBox}>
          <Text style={s.maxStatLabel}>TOTAL 🍃</Text>
          <Text style={s.maxStatValue}>{totalPoints.toLocaleString()}</Text>
        </View>
        <View style={s.maxStatBox}>
          <Text style={s.maxStatLabel}>ACTIONS</Text>
          <Text style={s.maxStatValue}>{logCount}</Text>
        </View>
      </View>

      <Text style={s.maxNote}>
        Journey saved to your Profile. Choose your next seed:
      </Text>

      <View style={{ width: "100%", gap: 10 }}>
        {SEEDS.map((seed) => {
          const isSel = chosen === seed.id;
          return (
            <TouchableOpacity
              key={seed.id}
              onPress={() => setChosen(seed.id)}
              style={[s.seedOption, isSel && s.seedOptionActive]}
            >
              <Text style={{ fontSize: 28 }}>{seed.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.seedLabel}>{seed.label}</Text>
                <Text style={s.seedDesc}>{seed.desc}</Text>
              </View>
              {isSel && <Text style={{ fontSize: 18 }}>✅</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      {chosen && (
        <TouchableOpacity
          onPress={() => onChooseSeed(chosen)}
          style={s.startJourneyBtn}
        >
          <Text style={s.startJourneyText}>🚀 Start New Journey!</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileView({ petName, totalPoints, logCount, plantHistory }) {
  return (
    <ScrollView>
      <View style={s.logsHeader}>
        <View style={{ alignItems: "center" }}>
          <View style={s.profileAvatar}>
            <Text style={{ fontSize: 28 }}>🌿</Text>
          </View>
          <Text style={s.profileName}>{petName}</Text>
          <Text style={s.profileSubLabel}>CURRENT PLANT</Text>
        </View>
        <View style={[s.statsGrid, { marginTop: 14 }]}>
          <View style={s.statBox}>
            <Text style={s.statBoxLabel}>CURRENT 🍃</Text>
            <Text style={s.statBoxValue}>{totalPoints.toLocaleString()}</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statBoxLabel}>ACTIONS</Text>
            <Text style={s.statBoxValue}>{logCount}</Text>
          </View>
        </View>
      </View>

      <View style={{ padding: 16 }}>
        <Text style={s.pastJourneysHeader}>🏆 Past Plant Journeys</Text>
        {plantHistory.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 32 }}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>🌱</Text>
            <Text style={{ color: "#9ca3af", fontSize: 13 }}>
              Complete a full journey to see history here!
            </Text>
          </View>
        ) : (
          plantHistory.map((h, i) => (
            <View key={i} style={s.historyCard}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 10,
                }}
              >
                <View>
                  <Text style={s.historyName}>
                    {h.emoji} {h.name}
                  </Text>
                  <Text style={s.historyDate}>
                    Completed{" "}
                    {new Date(h.at).toLocaleDateString("en-PH", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </Text>
                </View>
                <View style={s.guardianBadge}>
                  <Text style={s.guardianBadgeText}>ECO GUARDIAN 🏆</Text>
                </View>
              </View>
              <View style={s.statsGrid}>
                <View style={s.historyStatBox}>
                  <Text style={s.historyStatLabel}>TOTAL 🍃</Text>
                  <Text style={s.historyStatValue}>
                    {h.pts.toLocaleString()}
                  </Text>
                </View>
                <View style={s.historyStatBox}>
                  <Text style={s.historyStatLabel}>ACTIONS</Text>
                  <Text style={s.historyStatValue}>{h.actions}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

// ─── Progress Tab ─────────────────────────────────────────────────────────────

function ProgressView({ totalPoints }) {
  const { idx, current, max } = getStageProgress(totalPoints);
  const toNext =
    idx < STAGES.length - 1
      ? `${(max - current).toLocaleString()} pts`
      : `${(STAGES[idx].max - current).toLocaleString()} pts`;

  return (
    <ScrollView style={{ padding: 14 }}>
      <View style={[s.logsHeader, { borderRadius: 20, marginBottom: 14 }]}>
        <Text style={s.logsHeaderSubLabel}>Overall Progress</Text>
        <Text style={[s.weeklyPts, { marginBottom: 14 }]}>
          {totalPoints.toLocaleString()} 🍃
        </Text>
        <View style={s.statsGrid}>
          <View style={s.statBox}>
            <Text style={s.statBoxLabel}>STAGE</Text>
            <Text style={s.statBoxValue}>{STAGES[idx].name}</Text>
          </View>
          <View style={s.statBox}>
            <Text style={s.statBoxLabel}>TO NEXT</Text>
            <Text style={s.statBoxValue}>{toNext}</Text>
          </View>
        </View>
      </View>

      {STAGES.map((st, i) => {
        const active = i === idx;
        const done = i < idx;
        return (
          <View
            key={st.name}
            style={[
              s.stageLadderItem,
              active && s.stageLadderItemActive,
              done && s.stageLadderItemDone,
            ]}
          >
            <View
              style={[
                s.stageIcon,
                done && { backgroundColor: "#52b788", borderColor: "#2d6a4f" },
                active && { backgroundColor: st.color, borderColor: st.color },
              ]}
            >
              <Text style={{ fontSize: 16 }}>
                {done ? "✅" : active ? "🌱" : "○"}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  s.stageName,
                  active && { color: "#1a3a2a" },
                  done && { color: "#52b788" },
                ]}
              >
                {st.name}
              </Text>
              <Text style={s.stageMax}>
                {st.max ? `${st.max.toLocaleString()} pts` : "Final stage"}
              </Text>
            </View>
            {done && (
              <Text
                style={{ fontSize: 12, color: "#52b788", fontWeight: "800" }}
              >
                Done!
              </Text>
            )}
            {active && (
              <Text
                style={{ fontSize: 12, color: "#1a3a2a", fontWeight: "800" }}
              >
                Current
              </Text>
            )}
          </View>
        );
      })}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function EcoPlantPet() {
  const [totalPoints, setTotalPoints] = useState(0);
  const [todayPoints, setTodayPoints] = useState(0);
  const [lives, setLives] = useState(5);
  const [lostAt, setLostAt] = useState([]);
  const [logs, setLogs] = useState([]);
  const [missions, setMissions] = useState(makeMissions);
  const [petName, setPetName] = useState("My Eco Plant");
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState("");
  const [activeTab, setActiveTab] = useState("pet");
  const [isDead, setIsDead] = useState(false);
  const [isMaxed, setIsMaxed] = useState(false);
  const [plantHistory, setPlantHistory] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpText, setLevelUpText] = useState("");
  const [now, setNow] = useState(Date.now());

  const missionsRef = useRef(missions);
  missionsRef.current = missions;

  const bounceAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const toastAnim = useRef(new Animated.Value(0)).current;
  const floatLoop = useRef(null);

  // Float loop for plant
  useEffect(() => {
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
    return () => floatLoop.current && floatLoop.current.stop();
  }, []);

  // 1-second ticker
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Auto-recover hearts
  useEffect(() => {
    if (lostAt.length === 0) return;
    const oldest = lostAt[0];
    if (now - oldest >= HEART_MS) {
      setLostAt((prev) => prev.slice(1));
      setLives((prev) => Math.min(5, prev + 1));
    }
  }, [now, lostAt]);

  const { idx: stageIdx, current, max } = getStageProgress(totalPoints);

  const plantBounce = useCallback(() => {
    if (floatLoop.current) floatLoop.current.stop();
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 1.18,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 0.93,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(bounceAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
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
    });
  }, []);

  const showToast = useCallback((text) => {
    setLevelUpText(text);
    setShowLevelUp(true);
    toastAnim.setValue(0);
    Animated.sequence([
      Animated.spring(toastAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 8,
      }),
      Animated.delay(2500),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => setShowLevelUp(false));
  }, []);

  const applyPoints = useCallback(
    (pts) => {
      if (pts <= 0) return;
      plantBounce();
      setTodayPoints((p) => p + pts);
      setTotalPoints((prev) => {
        const prevIdx = getStageProgress(prev).idx;
        const next = prev + pts;
        const newIdx = getStageProgress(next).idx;
        if (newIdx > prevIdx) {
          setTimeout(
            () => showToast(`🎉 Stage Up! Now: ${STAGES[newIdx].name}!`),
            100,
          );
        }
        if (next >= MAX_PTS && prev < MAX_PTS) {
          setTimeout(() => setIsMaxed(true), 1500);
        }
        return next;
      });
    },
    [plantBounce, showToast],
  );

  const handleNewLog = useCallback(
    (action) => {
      const log = {
        id: Date.now(),
        label: action.label,
        distance: action.distance,
        co2: action.co2,
        points: action.points,
        ts: Date.now(),
      };
      setLogs((prev) => [log, ...prev]);

      let bonus = 0;
      const updated = missionsRef.current.map((m) => {
        if (!m.completed) {
          const np = m.progress + 1;
          if (np >= m.target) {
            bonus += m.points;
            return { ...m, progress: np, completed: true };
          }
          return { ...m, progress: np };
        }
        return m;
      });
      setMissions(updated);
      applyPoints(action.points + bonus);
    },
    [applyPoints],
  );

  const completeMission = useCallback(
    (id) => {
      const m = missionsRef.current.find((ms) => ms.id === id && !ms.completed);
      if (!m) return;
      setMissions((prev) =>
        prev.map((ms) => (ms.id === id ? { ...ms, completed: true } : ms)),
      );
      applyPoints(m.points);
    },
    [applyPoints],
  );

  const loseHeart = useCallback(() => {
    setLives((prev) => {
      const next = Math.max(0, prev - 1);
      if (next === 0) setTimeout(() => setIsDead(true), 300);
      return next;
    });
    setLostAt((prev) => [...prev, Date.now()]);
  }, []);

  const handleRestart = () => {
    setTotalPoints(0);
    setTodayPoints(0);
    setLives(5);
    setLostAt([]);
    setLogs([]);
    setMissions(makeMissions());
    setIsDead(false);
    setActiveTab("pet");
  };

  const handleChooseSeed = (seedId) => {
    const seed = SEEDS.find((s) => s.id === seedId);
    setPlantHistory((prev) => [
      {
        name: petName,
        pts: totalPoints,
        actions: logs.length,
        at: Date.now(),
        emoji: seed?.emoji || "🌱",
      },
      ...prev,
    ]);
    setTotalPoints(0);
    setTodayPoints(0);
    setLives(5);
    setLostAt([]);
    setLogs([]);
    setMissions(makeMissions());
    setIsMaxed(false);
    setActiveTab("pet");
  };

  const missionsCompleted = missions.filter((m) => m.completed).length;
  const todayLogs = logs.filter((l) => sameDay(new Date(l.ts), new Date()));

  if (isDead)
    return (
      <SafeAreaView style={s.deadBg}>
        <StatusBar barStyle="light-content" />
        <DeadScreen onRestart={handleRestart} />
      </SafeAreaView>
    );

  if (isMaxed)
    return (
      <SafeAreaView style={s.maxBg}>
        <StatusBar barStyle="light-content" />
        <MaxAchievementScreen
          petName={petName}
          totalPoints={totalPoints}
          logCount={logs.length}
          onChooseSeed={handleChooseSeed}
        />
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#c8f0d0" />

      {/* Level Up Toast */}
      {showLevelUp && (
        <Animated.View
          style={[
            s.toast,
            {
              opacity: toastAnim,
              transform: [
                {
                  scale: toastAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={s.toastText}>{levelUpText}</Text>
        </Animated.View>
      )}

      {/* ── PET TAB ── */}
      {activeTab === "pet" && (
        <ScrollView style={s.petScroll} showsVerticalScrollIndicator={false}>
          {/* Hearts + name */}
          <View style={{ padding: 16, paddingBottom: 0 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 8,
              }}
            >
              <Hearts lives={lives} lostAt={lostAt} now={now} />
              <TouchableOpacity onPress={loseHeart} style={s.testBtn}>
                <Text style={s.testBtnText}>-❤️ test</Text>
              </TouchableOpacity>
            </View>

            {/* Pet name */}
            <View style={{ alignItems: "center", marginBottom: 4 }}>
              {editingName ? (
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <TextInput
                    autoFocus
                    value={draftName}
                    maxLength={20}
                    onChangeText={setDraftName}
                    onSubmitEditing={() => {
                      if (draftName.trim()) setPetName(draftName.trim());
                      setEditingName(false);
                    }}
                    style={s.nameInput}
                  />
                  <TouchableOpacity
                    onPress={() => {
                      if (draftName.trim()) setPetName(draftName.trim());
                      setEditingName(false);
                    }}
                    style={s.nameConfirmBtn}
                  >
                    <Text style={{ color: "#fff", fontWeight: "800" }}>✓</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    setDraftName(petName);
                    setEditingName(true);
                  }}
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                >
                  <Text style={s.petNameText}>{petName}</Text>
                  <Text style={{ fontSize: 14 }}>✏️</Text>
                </TouchableOpacity>
              )}
              <Text style={s.tapEditHint}>tap name to edit</Text>
            </View>
          </View>

          {/* Plant visual */}
          <View style={{ alignItems: "center", paddingVertical: 8 }}>
            <View style={s.plantCircle}>
              <Animated.View
                style={{
                  transform: [{ translateY: floatAnim }, { scale: bounceAnim }],
                }}
              >
                <PlantSVG stageIdx={stageIdx} />
              </Animated.View>
            </View>
            <View
              style={[
                s.stageBadge,
                { backgroundColor: STAGES[stageIdx].color },
              ]}
            >
              <Text style={[s.stageBadgeText, { color: STAGES[stageIdx].tc }]}>
                {STAGES[stageIdx].name}
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          <Card style={{ margin: 14, marginBottom: 0 }}>
            <ProgressBar current={current} max={max} stageIdx={stageIdx} />
          </Card>

          {/* Daily Missions */}
          <Card style={{ margin: 14, marginBottom: 0 }}>
            <SectionHeader
              label="🎯 Daily Missions"
              right={
                <Text
                  style={{ fontSize: 12, fontWeight: "700", color: "#52b788" }}
                >
                  {missionsCompleted} / 3
                </Text>
              }
            />
            <View style={{ gap: 8 }}>
              {missions.map((m) => (
                <MissionCard
                  key={m.id}
                  mission={m}
                  onComplete={completeMission}
                />
              ))}
            </View>
          </Card>

          {/* Eco Actions Today */}
          <Card style={{ margin: 14, marginBottom: 0 }}>
            <SectionHeader
              label="🌍 Eco Actions Today"
              right={
                <TouchableOpacity onPress={() => setActiveTab("logs")}>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#52b788",
                      fontWeight: "700",
                    }}
                  >
                    View all →
                  </Text>
                </TouchableOpacity>
              }
            />
            <View style={s.todayPtsBox}>
              <Text style={s.todayPtsNum}>
                {todayPoints.toLocaleString()} 🍃
              </Text>
              <Text style={s.todayPtsLabel}>Earned Today!</Text>
            </View>
            {todayLogs.length === 0 ? (
              <Text style={s.emptyText}>
                No eco actions yet. Start logging! 🌱
              </Text>
            ) : (
              <View style={s.logsContainer}>
                {todayLogs.slice(0, 3).map((log, i, arr) => (
                  <LogItem key={log.id} log={log} last={i === arr.length - 1} />
                ))}
              </View>
            )}
            {todayLogs.length > 3 && (
              <TouchableOpacity
                onPress={() => setActiveTab("logs")}
                style={s.moreTodayBtn}
              >
                <Text style={s.moreTodayText}>
                  + {todayLogs.length - 3} more today
                </Text>
              </TouchableOpacity>
            )}
          </Card>

          {/* Heart warning */}
          {lives < 5 && (
            <View style={s.heartWarning}>
              <Text style={s.heartWarningText}>
                ❤️ {5 - lives} heart(s) lost · Complete missions daily to
                recover!
              </Text>
            </View>
          )}

          <View style={{ height: 30 }} />
        </ScrollView>
      )}

      {/* ── LOGS TAB ── */}
      {activeTab === "logs" && (
        <LogsView logs={logs} totalPoints={totalPoints} />
      )}

      {/* ── PROGRESS TAB ── */}
      {activeTab === "progress" && <ProgressView totalPoints={totalPoints} />}

      {/* ── PROFILE TAB ── */}
      {activeTab === "profile" && (
        <ProfileView
          petName={petName}
          totalPoints={totalPoints}
          logCount={logs.length}
          plantHistory={plantHistory}
        />
      )}

      {/* ── Bottom nav + FAB ── */}
      <View style={s.bottomNav}>
        <View style={s.fabRow}>
          <TouchableOpacity onPress={() => setShowModal(true)} style={s.fab}>
            <Text style={s.fabText}>🌱 New Eco-Action</Text>
          </TouchableOpacity>
        </View>
        <View style={s.navBar}>
          {[
            ["🌿", "pet", "PET"],
            ["📋", "logs", "LOGS"],
            ["⭐", "progress", "PROGRESS"],
            ["👤", "profile", "PROFILE"],
          ].map(([icon, key, label]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setActiveTab(key)}
              style={s.navItem}
            >
              <Text style={{ fontSize: 22 }}>{icon}</Text>
              <Text
                style={[s.navLabel, activeTab === key && { color: "#1a3a2a" }]}
              >
                {label}
              </Text>
              <View
                style={[
                  s.navIndicator,
                  activeTab === key && { backgroundColor: "#52b788" },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Eco Action Modal */}
      <EcoModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleNewLog}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#c8f0d0",
  },
  petScroll: {
    flex: 1,
  },

  // Toast
  toast: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    backgroundColor: "#1a3a2a",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 40,
    zIndex: 999,
    elevation: 10,
  },
  toastText: {
    color: "#95d5b2",
    fontSize: 13,
    fontWeight: "800",
  },

  // Hearts
  heartTimer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(254,226,226,0.7)",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 3,
    alignSelf: "flex-start",
  },
  heartTimerText: {
    fontSize: 10,
    color: "#b91c1c",
    fontWeight: "800",
  },

  // Test button
  testBtn: {
    backgroundColor: "rgba(239,68,68,0.12)",
    borderWidth: 1,
    borderColor: "#fca5a5",
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  testBtnText: {
    fontSize: 10,
    color: "#b91c1c",
    fontWeight: "700",
  },

  // Pet name
  nameInput: {
    fontSize: 17,
    fontWeight: "800",
    color: "#1a3a2a",
    borderBottomWidth: 2.5,
    borderColor: "#52b788",
    backgroundColor: "transparent",
    textAlign: "center",
    width: 170,
    paddingVertical: 2,
  },
  nameConfirmBtn: {
    backgroundColor: "#52b788",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  petNameText: {
    fontSize: 19,
    fontWeight: "900",
    color: "#1a3a2a",
  },
  tapEditHint: {
    fontSize: 9,
    color: "#52b788",
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 2,
  },

  // Plant circle
  plantCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.42)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(82,183,136,0.22)",
  },
  stageBadge: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 2,
    marginTop: -6,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stageBadgeText: {
    fontSize: 11,
    fontWeight: "800",
  },

  // Progress bar
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

  // Card
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

  // Mission
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

  // Log item
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

  // Today's eco
  todayPtsBox: {
    backgroundColor: "#1a3a2a",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    marginBottom: 10,
  },
  todayPtsNum: {
    fontSize: 28,
    fontWeight: "900",
    color: "#95d5b2",
  },
  todayPtsLabel: {
    fontSize: 13,
    color: "#52b788",
    fontWeight: "700",
  },
  emptyText: {
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 13,
    paddingVertical: 6,
  },
  moreTodayBtn: {
    marginTop: 8,
    padding: 7,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#b2d8b2",
    alignItems: "center",
  },
  moreTodayText: {
    color: "#52b788",
    fontSize: 12,
    fontWeight: "700",
  },

  // Heart warning
  heartWarning: {
    margin: 14,
    marginTop: 10,
    backgroundColor: "rgba(254,226,226,0.7)",
    borderRadius: 14,
    padding: 10,
    borderWidth: 1.5,
    borderColor: "#fca5a5",
  },
  heartWarningText: {
    fontSize: 12,
    color: "#b91c1c",
    fontWeight: "700",
  },

  // Bottom nav
  bottomNav: {
    backgroundColor: "transparent",
  },
  fabRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingRight: 16,
    paddingBottom: 8,
  },
  fab: {
    backgroundColor: "#1a3a2a",
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    elevation: 6,
    shadowColor: "#1a3a2a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
  },
  fabText: {
    color: "#95d5b2",
    fontSize: 14,
    fontWeight: "800",
  },
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "rgba(240,250,240,0.97)",
    borderTopWidth: 1,
    borderTopColor: "#d4edda",
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 20 : 12,
  },
  navItem: {
    alignItems: "center",
    gap: 2,
    minWidth: 60,
  },
  navLabel: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#9ca3af",
  },
  navIndicator: {
    width: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: "transparent",
    marginTop: 1,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: "#f0faf0",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 22,
    paddingBottom: Platform.OS === "ios" ? 40 : 32,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 17,
    color: "#1a3a2a",
    fontWeight: "800",
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: "#52b788",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 5,
  },
  selectBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#b2d8b2",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 4,
  },
  selectBtnText: {
    fontSize: 13,
    color: "#1a3a2a",
    fontWeight: "600",
    flex: 1,
  },
  pickerDropdown: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#b2d8b2",
    marginBottom: 8,
    overflow: "hidden",
  },
  pickerItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e8f5e9",
  },
  pickerItemActive: {
    backgroundColor: "rgba(82,183,136,0.1)",
  },
  pickerItemText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  distanceInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#b2d8b2",
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1a3a2a",
    marginBottom: 4,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 11,
    marginBottom: 6,
  },
  resultBox: {
    backgroundColor: "#d4edda",
    borderRadius: 14,
    padding: 14,
    marginTop: 6,
    marginBottom: 10,
  },
  resultTitle: {
    fontSize: 12,
    color: "#2d6a4f",
    fontWeight: "700",
    marginBottom: 4,
  },
  resultLine: {
    fontSize: 13,
    color: "#374151",
    marginBottom: 3,
  },
  resultPts: {
    fontSize: 16,
    color: "#1a3a2a",
    fontWeight: "900",
  },
  calcBtn: {
    backgroundColor: "#52b788",
    borderRadius: 14,
    padding: 13,
    alignItems: "center",
    marginTop: 6,
  },
  calcBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  logBtn: {
    backgroundColor: "#1a3a2a",
    borderRadius: 14,
    padding: 13,
    alignItems: "center",
    marginTop: 8,
  },
  logBtnText: {
    color: "#95d5b2",
    fontSize: 14,
    fontWeight: "800",
  },
  modalFooter: {
    textAlign: "center",
    fontSize: 10,
    color: "#9ca3af",
    marginTop: 10,
  },

  // Logs tab
  logsHeader: {
    background: "transparent",
    backgroundColor: "#1a3a2a",
    padding: 22,
  },
  logsHeaderTitle: {
    fontSize: 17,
    color: "#fff",
    fontWeight: "900",
  },
  logsHeaderSubLabel: {
    fontSize: 11,
    color: "#95d5b2",
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  weeklyPts: {
    fontSize: 36,
    fontWeight: "900",
    color: "#fff",
    lineHeight: 42,
    marginBottom: 0,
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
  dayTabsContainer: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderBottomWidth: 1,
    borderBottomColor: "#d4edda",
  },
  dayTab: {
    minWidth: 48,
    paddingVertical: 10,
    paddingHorizontal: 4,
    alignItems: "center",
    gap: 2,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  dayTabActive: {
    borderBottomColor: "#52b788",
  },
  dayTabDay: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: "#9ca3af",
  },
  dayTabNum: {
    fontSize: 12,
    fontWeight: "700",
  },
  dayTabDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "transparent",
  },
  dayHeader: {
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 14,
    padding: 10,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayHeaderLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1a3a2a",
  },
  dayHeaderPts: {
    fontSize: 14,
    fontWeight: "800",
    color: "#52b788",
  },

  // Back btn
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

  // Full history
  fullLogItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 11,
    gap: 10,
  },
  fullLogLabel: {
    fontSize: 13,
    color: "#1a3a2a",
    fontWeight: "700",
  },
  fullLogDate: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },

  // Dead screen
  deadBg: {
    flex: 1,
    backgroundColor: "#2d2d2d",
  },
  deadScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  deadTitle: {
    color: "#d1d5db",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  deadSub: {
    color: "#9ca3af",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 6,
  },
  deadHint: {
    color: "#6b7280",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 22,
  },
  tipsBox: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 22,
    width: "100%",
  },
  tipsHeader: {
    fontSize: 12,
    fontWeight: "800",
    color: "#95d5b2",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
  },
  tipItem: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 5,
  },
  restartBtn: {
    backgroundColor: "#52b788",
    borderRadius: 28,
    paddingHorizontal: 36,
    paddingVertical: 14,
    elevation: 4,
    shadowColor: "#52b788",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  restartBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
  },

  // Max screen
  maxBg: {
    flex: 1,
    backgroundColor: "#064e3b",
  },
  maxScreen: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 32,
  },
  maxTitle: {
    color: "#95d5b2",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 6,
  },
  maxSub: {
    color: "#d1fae5",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 4,
  },
  maxDesc: {
    color: "#6ee7b7",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 18,
  },
  trophyBox: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 14,
    width: "100%",
  },
  trophyTitle: {
    fontSize: 15,
    fontWeight: "900",
    color: "#fbbf24",
    marginBottom: 4,
  },
  trophySub: {
    fontSize: 12,
    color: "#95d5b2",
    textAlign: "center",
  },
  maxStatBox: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 14,
    padding: 12,
    alignItems: "center",
  },
  maxStatLabel: {
    fontSize: 10,
    color: "#95d5b2",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  maxStatValue: {
    fontSize: 20,
    fontWeight: "900",
    color: "#fff",
    marginTop: 4,
  },
  maxNote: {
    color: "#d1fae5",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 14,
  },
  seedOption: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.15)",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  seedOptionActive: {
    backgroundColor: "rgba(82,183,136,0.3)",
    borderColor: "#52b788",
  },
  seedLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#d1fae5",
  },
  seedDesc: {
    fontSize: 12,
    color: "#95d5b2",
    marginTop: 2,
  },
  startJourneyBtn: {
    marginTop: 20,
    backgroundColor: "#fbbf24",
    borderRadius: 28,
    paddingHorizontal: 36,
    paddingVertical: 14,
    elevation: 4,
    shadowColor: "#fbbf24",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    marginBottom: 20,
  },
  startJourneyText: {
    color: "#1a3a2a",
    fontSize: 15,
    fontWeight: "900",
  },

  // Profile
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 3,
    borderColor: "rgba(149,213,178,0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  profileName: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "900",
  },
  profileSubLabel: {
    fontSize: 9,
    color: "#95d5b2",
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 4,
  },
  pastJourneysHeader: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1a3a2a",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  historyCard: {
    backgroundColor: "rgba(255,255,255,0.75)",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#d4edda",
    marginBottom: 10,
  },
  historyName: {
    fontSize: 15,
    fontWeight: "900",
    color: "#1a3a2a",
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 11,
    color: "#9ca3af",
  },
  guardianBadge: {
    backgroundColor: "#fbbf24",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  guardianBadgeText: {
    color: "#78350f",
    fontSize: 10,
    fontWeight: "800",
  },
  historyStatBox: {
    flex: 1,
    backgroundColor: "#f0faf0",
    borderRadius: 10,
    padding: 8,
  },
  historyStatLabel: {
    fontSize: 10,
    color: "#52b788",
    fontWeight: "700",
  },
  historyStatValue: {
    fontSize: 16,
    fontWeight: "900",
    color: "#1a3a2a",
  },

  // Progress / stage ladder
  stageLadderItem: {
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: "#d4edda",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stageLadderItemActive: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderColor: "#52b788",
  },
  stageLadderItemDone: {
    borderColor: "#95d5b2",
  },
  stageIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#e8f5e9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#d4edda",
  },
  stageName: {
    fontSize: 14,
    fontWeight: "800",
    color: "#9ca3af",
  },
  stageMax: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 1,
  },
});
