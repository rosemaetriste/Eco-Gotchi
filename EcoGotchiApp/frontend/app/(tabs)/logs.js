// logs.js
// Logs tab: weekly day-picker, day log list, full history page.

import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";

import {
  DAYS,
  sameDay,
  getWeekDates,
  LogItem,
  sharedStyles,
} from "../../components/constants";

// ─── Full History Page ────────────────────────────────────────────────────────
// Each pet is a clickable tab. Selecting a tab shows only that pet's logs.
// "Current" tab is always first (most recent). Past pets follow oldest → newest.

function FullHistoryPage({ logs, totalPoints, allTimeTotalPoints, plantHistory, petName, onBack }) {
  // Build tab list: current plant first, then past plants oldest → newest
  const pastGroups = [...(plantHistory || [])].reverse(); // oldest first

  const tabs = [
    {
      key:       "current",
      name:      petName || "Current",
      emoji:     "🌱",
      pts:       totalPoints,
      logs:      logs,
      at:        null,
      isCurrent: true,
    },
    ...pastGroups.map((h, i) => ({
      key:       "past-" + i,
      name:      h.name  || "Plant",
      emoji:     h.emoji || "🌻",
      pts:       h.pts   || 0,
      logs:      Array.isArray(h.logs) ? h.logs : [],
      at:        h.at,
      isCurrent: false,
    })),
  ];

  const [activeTab, setActiveTab] = useState(0);
  const selected = tabs[activeTab];

  const allTimePts   = allTimeTotalPoints > 0 ? allTimeTotalPoints : totalPoints;
  const allTimeCount = tabs.reduce((sum, t) => sum + t.logs.length, 0);

  return (
    <View style={{ flex: 1 }}>
      {/* ── Dark green header ── */}
      <View style={sharedStyles.logsHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <TouchableOpacity onPress={onBack} style={sharedStyles.backBtn}>
            <Text style={sharedStyles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={sharedStyles.logsHeaderTitle}>📜 Full Eco History</Text>
        </View>
        <View style={sharedStyles.statsGrid}>
          <View style={sharedStyles.statBox}>
            <Text style={sharedStyles.statBoxLabel}>ALL-TIME 🍃</Text>
            <Text style={sharedStyles.statBoxValue}>{allTimePts.toLocaleString()}</Text>
          </View>
          <View style={sharedStyles.statBox}>
            <Text style={sharedStyles.statBoxLabel}>TOTAL LOGS</Text>
            <Text style={sharedStyles.statBoxValue}>{allTimeCount} actions</Text>
          </View>
        </View>
      </View>

      {/* ── Pet tab strip ── */}
      <View style={s.petTabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.petTabsScroll}>
          {tabs.map((tab, i) => {
            const isActive = activeTab === i;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(i)}
                style={[s.petTab, isActive && s.petTabActive]}
              >
                <Text style={s.petTabEmoji}>{tab.emoji}</Text>
                <Text style={[s.petTabName, isActive && s.petTabNameActive]} numberOfLines={1}>
                  {tab.name}
                </Text>
                {tab.isCurrent && <View style={s.currentDot} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Selected tab info bar ── */}
      <View style={s.tabInfoBar}>
        <View style={{ flex: 1 }}>
          <Text style={s.tabInfoName}>{selected.emoji} {selected.name}</Text>
          <Text style={s.tabInfoMeta}>
            {selected.isCurrent
              ? `Current journey · ${selected.pts.toLocaleString()} 🍃`
              : `Completed ${new Date(selected.at).toLocaleDateString("en-PH", {
                  month: "short", day: "numeric", year: "numeric",
                })} · ${selected.pts.toLocaleString()} 🍃`
            }
          </Text>
        </View>
        <View style={s.tabLogCount}>
          <Text style={s.tabLogCountText}>{selected.logs.length} logs</Text>
        </View>
      </View>

      {/* ── Log list for selected tab ── */}
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 30 }}>
        {selected.logs.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 40 }}>
            <Text style={{ fontSize: 40, marginBottom: 8 }}>🌿</Text>
            <Text style={{ color: "#9ca3af", fontSize: 14 }}>
              {selected.isCurrent
                ? "No eco actions logged yet. Start logging! 🌱"
                : "No logs were saved for this journey."}
            </Text>
          </View>
        ) : (
          <View style={sharedStyles.logsContainer}>
            {selected.logs.map((log, i) => (
              <View
                key={log.id || i}
                style={[
                  s.fullLogItem,
                  i < selected.logs.length - 1 && { borderBottomWidth: 1, borderBottomColor: "#e8f5e9" },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={s.fullLogLabel}>{log.label}</Text>
                  <Text style={s.fullLogDate}>
                    {new Date(log.ts).toLocaleDateString("en-PH", {
                      weekday: "short", month: "short", day: "numeric", year: "numeric",
                    })}
                  </Text>
                  <Text style={sharedStyles.logMeta}>
                    {log.distance} km · {(log.co2 || 0).toFixed(3)} kg CO₂ saved
                  </Text>
                </View>
                <Text style={sharedStyles.logPts}>+{log.points} 🍃</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Logs Tab (default export) ────────────────────────────────────────────────

export default function LogsScreen({ logs, totalPoints, plantHistory, petName, allTimeTotalPoints }) {
  const [selectedDay,     setSelectedDay]     = useState(new Date().getDay());
  const [showFullHistory, setShowFullHistory] = useState(false);

  if (showFullHistory) {
    return (
      <FullHistoryPage
        logs={logs}
        totalPoints={totalPoints}
        allTimeTotalPoints={allTimeTotalPoints}
        plantHistory={plantHistory}
        petName={petName}
        onBack={() => setShowFullHistory(false)}
      />
    );
  }

  const weekDates = getWeekDates();
  const weeklyPts = logs
    .filter((l) => weekDates.some((wd) => sameDay(new Date(l.ts), wd)))
    .reduce((sum, l) => sum + l.points, 0);
  const dayLogs = logs.filter((l) =>
    sameDay(new Date(l.ts), weekDates[selectedDay])
  );

  return (
    <ScrollView stickyHeaderIndices={[1]} contentContainerStyle={{ paddingTop: 20, paddingBottom: 30 }}>
      {/* Dark green header */}
      <View style={sharedStyles.logsHeader}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <Text style={sharedStyles.logsHeaderSubLabel}>This Week's Eco Points</Text>
          <TouchableOpacity onPress={() => setShowFullHistory(true)} style={sharedStyles.backBtn}>
            <Text style={sharedStyles.backBtnText}>View all →</Text>
          </TouchableOpacity>
        </View>
        <Text style={[sharedStyles.weeklyPts, { marginBottom: 14 }]}>
          {weeklyPts.toLocaleString()} 🍃
        </Text>
        <View style={sharedStyles.statsGrid}>
          <View style={sharedStyles.statBox}>
            <Text style={sharedStyles.statBoxLabel}>ALL-TIME 🍃</Text>
            <Text style={sharedStyles.statBoxValue}>
              {(allTimeTotalPoints > 0 ? allTimeTotalPoints : totalPoints).toLocaleString()}
            </Text>
          </View>
          <View style={sharedStyles.statBox}>
            <Text style={sharedStyles.statBoxLabel}>TOTAL LOGS</Text>
            <Text style={sharedStyles.statBoxValue}>{logs.length} actions</Text>
          </View>
        </View>
      </View>

      {/* Day tab strip — sticky */}
      <View style={s.dayTabsContainer}>
        <View style={s.dayTabsRow}>
          {DAYS.map((d, i) => {
            const date    = weekDates[i];
            const hasLogs = logs.some((l) => sameDay(new Date(l.ts), date));
            const isToday = sameDay(date, new Date());
            const sel     = selectedDay === i;
            return (
              <TouchableOpacity
                key={d}
                onPress={() => setSelectedDay(i)}
                style={[s.dayTab, sel && s.dayTabActive]}
              >
                <Text style={[s.dayTabDay, sel && { color: "#1a3a2a" }]}>{d}</Text>
                <Text style={[
                  s.dayTabNum,
                  sel ? { color: "#52b788" } : isToday ? { color: "#1a3a2a" } : { color: "#6b7280" },
                ]}>
                  {date.getDate()}
                </Text>
                <View style={[s.dayTabDot, hasLogs && { backgroundColor: "#52b788" }]} />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Day content */}
      <View style={{ padding: 14 }}>
        {dayLogs.length > 0 && (
          <View style={s.dayHeader}>
            <Text style={s.dayHeaderLabel}>
              {DAYS[selectedDay]},{" "}
              {weekDates[selectedDay].toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
            </Text>
            <Text style={s.dayHeaderPts}>
              +{dayLogs.reduce((sum, l) => sum + l.points, 0)} 🍃
            </Text>
          </View>
        )}

        {dayLogs.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 36 }}>
            <Text style={{ fontSize: 36, marginBottom: 8 }}>🌿</Text>
            <Text style={{ color: "#9ca3af", fontSize: 14 }}>No eco actions logged on this day.</Text>
          </View>
        ) : (
          <View style={sharedStyles.logsContainer}>
            {dayLogs.map((log, i) => (
              <LogItem key={log.id} log={log} last={i === dayLogs.length - 1} />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // ── Pet tabs (full history view) ──────────────────────────────────────────

  petTabsContainer: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderBottomWidth: 1,
    borderBottomColor: "#d4edda",
  },
  petTabsScroll: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
    flexDirection: "row",
  },
  petTab: {
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: "#d4edda",
    backgroundColor: "rgba(255,255,255,0.6)",
    minWidth: 72,
    position: "relative",
  },
  petTabActive: {
    backgroundColor: "#1a3a2a",
    borderColor: "#1a3a2a",
  },
  petTabEmoji: {
    fontSize: 18,
    marginBottom: 2,
  },
  petTabName: {
    fontSize: 10,
    fontWeight: "700",
    color: "#52b788",
    textAlign: "center",
    maxWidth: 70,
  },
  petTabNameActive: {
    color: "#95d5b2",
  },
  currentDot: {
    position: "absolute",
    top: 4,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#52b788",
  },

  tabInfoBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e8f5e9",
    gap: 10,
  },
  tabInfoName: {
    fontSize: 14,
    fontWeight: "900",
    color: "#1a3a2a",
  },
  tabInfoMeta: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 1,
  },
  tabLogCount: {
    backgroundColor: "rgba(82,183,136,0.15)",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tabLogCountText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2d6a4f",
  },

  // ── Day tab strip (weekly view) ───────────────────────────────────────────

  dayTabsContainer: {
    backgroundColor: "rgba(255,255,255,0.92)",
    borderBottomWidth: 1,
    borderBottomColor: "#d4edda",
  },
  dayTabsRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
  },
  dayTab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 2,
    alignItems: "center",
    gap: 2,
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  dayTabActive:  { borderBottomColor: "#52b788" },
  dayTabDay: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: "#9ca3af",
  },
  dayTabNum: { fontSize: 12, fontWeight: "700" },
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
  dayHeaderLabel: { fontSize: 13, fontWeight: "700", color: "#1a3a2a" },
  dayHeaderPts:   { fontSize: 14, fontWeight: "800", color: "#52b788" },

  fullLogItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 11,
    gap: 10,
  },
  fullLogLabel: { fontSize: 13, color: "#1a3a2a", fontWeight: "700" },
  fullLogDate:  { fontSize: 11, color: "#6b7280", marginTop: 2 },
});