// account.js
// Profile / Account tab: current plant stats + past plant journey history.

import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";

import { sharedStyles } from "../../components/constants";

export default function AccountScreen({
  petName,
  totalPoints,
  logCount,
  plantHistory,
}) {
  // Handles resetting state session references and moving back to the landing gate
  const handleLogout = () => {
    // If you add AsyncStorage or Context tokens later, clear them here:
    // e.g., await AsyncStorage.removeItem("userToken");

    // Redirect cleanly to your root index file or login entry route
    router.replace("/(auth)"); // Or wherever your landing file resides, e.g., "/"
  };

  return (
    <ScrollView>
      {/* Profile header */}
      <View style={sharedStyles.logsHeader}>
        <View style={{ alignItems: "center" }}>
          <View style={s.avatar}>
            <Text style={{ fontSize: 28 }}>🌿</Text>
          </View>
          <Text style={s.profileName}>{petName}</Text>
          <Text style={s.profileSubLabel}>CURRENT PLANT</Text>
        </View>
        <View style={[sharedStyles.statsGrid, { marginTop: 14 }]}>
          <View style={sharedStyles.statBox}>
            <Text style={sharedStyles.statBoxLabel}>CURRENT 🍃</Text>
            <Text style={sharedStyles.statBoxValue}>
              {totalPoints.toLocaleString()}
            </Text>
          </View>
          <View style={sharedStyles.statBox}>
            <Text style={sharedStyles.statBoxLabel}>ACTIONS</Text>
            <Text style={sharedStyles.statBoxValue}>{logCount}</Text>
          </View>
        </View>
      </View>

      {/* Past journeys */}
      <View style={{ padding: 16 }}>
        <Text style={s.sectionTitle}>🏆 Past Plant Journeys</Text>

        {plantHistory.length === 0 ? (
          <View style={{ alignItems: "center", paddingVertical: 32 }}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>🌱</Text>
            <Text
              style={{ color: "#9ca3af", fontSize: 13, textAlign: "center" }}
            >
              Complete a full journey to see history here!
            </Text>
          </View>
        ) : (
          plantHistory.map((h, i) => (
            <View key={i} style={s.historyCard}>
              {/* Card header */}
              <View style={s.historyCardHeader}>
                <View style={{ flex: 1 }}>
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
                <View style={s.badge}>
                  <Text style={s.badgeText}>ECO GUARDIAN 🏆</Text>
                </View>
              </View>

              {/* Stats row */}
              <View style={s.historyStats}>
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

        {/* Logout Section Area Container */}
        <TouchableOpacity
          style={s.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Text style={s.logoutButtonText}>Log Out Account</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 3,
    borderColor: "rgba(149,213,178,0.4)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  profileName: {
    fontSize: 20,
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

  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#1a3a2a",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },

  historyCard: {
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: "#d4edda",
    marginBottom: 10,
  },
  historyCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
    gap: 8,
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

  badge: {
    backgroundColor: "#fbbf24",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    flexShrink: 0,
  },
  badgeText: {
    color: "#78350f",
    fontSize: 10,
    fontWeight: "800",
  },

  historyStats: {
    flexDirection: "row",
    gap: 8,
  },
  historyStatBox: {
    flex: 1,
    backgroundColor: "#f0faf0",
    borderRadius: 10,
    padding: 10,
  },
  historyStatLabel: {
    fontSize: 10,
    color: "#52b788",
    fontWeight: "700",
    textTransform: "uppercase",
  },
  historyStatValue: {
    fontSize: 17,
    fontWeight: "900",
    color: "#1a3a2a",
    marginTop: 2,
  },
  logoutButton: {
    backgroundColor: "rgba(239, 68, 68, 0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(239, 68, 68, 0.25)",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    marginBottom: 16,
  },
  logoutButtonText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "700",
  },
});
