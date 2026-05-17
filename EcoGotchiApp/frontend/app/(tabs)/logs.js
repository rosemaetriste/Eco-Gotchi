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

function FullHistoryPage({ logs, totalPoints, onBack }) {
  return (
    <ScrollView contentContainerStyle={{ paddingTop: 20, paddingBottom: 30 }}>
      {/* Header */}
      <View style={sharedStyles.logsHeader}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <TouchableOpacity onPress={onBack} style={sharedStyles.backBtn}>
            <Text style={sharedStyles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={sharedStyles.logsHeaderTitle}>📜 Full Eco History</Text>
        </View>
        <View style={sharedStyles.statsGrid}>
          <View style={sharedStyles.statBox}>
            <Text style={sharedStyles.statBoxLabel}>ALL-TIME POINTS</Text>
            <Text style={sharedStyles.statBoxValue}>
              {totalPoints.toLocaleString()} 🍃
            </Text>
          </View>
          <View style={sharedStyles.statBox}>
            <Text style={sharedStyles.statBoxLabel}>TOTAL LOGS</Text>
            <Text style={sharedStyles.statBoxValue}>{logs.length} actions</Text>
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
          <View style={sharedStyles.logsContainer}>
            {logs.map((log, i) => (
              <View
                key={log.id}
                style={[
                  s.fullLogItem,
                  i < logs.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: "#e8f5e9",
                  },
                ]}
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
                  <Text style={sharedStyles.logMeta}>
                    {log.distance} km · {log.co2.toFixed(3)} kg CO₂ saved
                  </Text>
                </View>
                <Text style={sharedStyles.logPts}>+{log.points} 🍃</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// ─── Logs Tab (default export) ────────────────────────────────────────────────

export default function LogsScreen({ logs, totalPoints }) {
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
    <ScrollView stickyHeaderIndices={[1]} contentContainerStyle={{ paddingTop: 20, paddingBottom: 30 }}>
      {/* Dark green header */}
      <View style={sharedStyles.logsHeader}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 4,
          }}
        >
          <Text style={sharedStyles.logsHeaderSubLabel}>
            This Week's Eco Points
          </Text>
          <TouchableOpacity
            onPress={() => setShowFullHistory(true)}
            style={sharedStyles.backBtn}
          >
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
              {totalPoints.toLocaleString()}
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
              +{dayLogs.reduce((sum, l) => sum + l.points, 0)} 🍃
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
  // Day tab strip
  dayTabsContainer: {
    backgroundColor: "rgba(255,255,255,0.92)",
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

  // Day summary header
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

  // Full history log item
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
});
