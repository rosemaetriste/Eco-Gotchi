// progress.js
// Progress tab: overall stats banner + stage-by-stage ladder.

import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";

import { STAGES, getStageProgress, sharedStyles } from "../../components/constants";

export default function ProgressScreen({ totalPoints }) {
  const { idx, current, max } = getStageProgress(totalPoints);

  const toNext =
    idx < STAGES.length - 1
      ? `${(max - current).toLocaleString()} pts`
      : `${(STAGES[idx].max - current).toLocaleString()} pts`;

  return (
    <ScrollView contentContainerStyle={{ padding: 14, paddingTop: 24, paddingBottom: 30 }}>
      {/* Overall banner */}
      <View style={s.banner}>
        <Text style={s.bannerSubLabel}>Overall Progress</Text>
        <Text style={s.bannerTotal}>{totalPoints.toLocaleString()} 🍃</Text>
        <View style={sharedStyles.statsGrid}>
          <View style={sharedStyles.statBox}>
            <Text style={sharedStyles.statBoxLabel}>STAGE</Text>
            <Text style={sharedStyles.statBoxValue}>{STAGES[idx].name}</Text>
          </View>
          <View style={sharedStyles.statBox}>
            <Text style={sharedStyles.statBoxLabel}>TO NEXT</Text>
            <Text style={sharedStyles.statBoxValue}>{toNext}</Text>
          </View>
        </View>
      </View>

      {/* Stage ladder */}
      {STAGES.map((st, i) => {
        const active = i === idx;
        const done = i < idx;
        return (
          <View
            key={st.name}
            style={[
              s.ladderItem,
              active && s.ladderItemActive,
              done && s.ladderItemDone,
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

            {done && <Text style={s.doneLabel}>Done!</Text>}
            {active && <Text style={s.activeLabel}>Current</Text>}
          </View>
        );
      })}
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  banner: {
    backgroundColor: "#1a3a2a",
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
  },
  bannerSubLabel: {
    fontSize: 11,
    color: "#95d5b2",
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  bannerTotal: {
    fontSize: 30,
    fontWeight: "900",
    color: "#fff",
    lineHeight: 36,
    marginBottom: 14,
  },

  // Ladder
  ladderItem: {
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
  ladderItemActive: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderColor: "#52b788",
  },
  ladderItemDone: {
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
    flexShrink: 0,
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
  doneLabel: {
    fontSize: 12,
    color: "#52b788",
    fontWeight: "800",
  },
  activeLabel: {
    fontSize: 12,
    color: "#1a3a2a",
    fontWeight: "800",
  },
});
