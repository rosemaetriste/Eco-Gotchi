// account.js
// Profile / Account tab: current plant stats + past plant journey history.

import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { router } from "expo-router";

export default function AccountScreen({
  petName,
  totalPoints = 0,
  logCount = 0,
  plantHistory = [],
}) {
  const handleLogout = () => {
    router.replace("/(auth)");
  };

  const handleUpdateProfile = () => {
    Alert.alert("Update Profile", "This feature will be added soon.");
  };

  const handleAccountSettings = () => {
    Alert.alert("Account Settings", "This feature will be added soon.");
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.card}>
        <View style={s.header}>
          <View style={s.avatarRing}>
            <Text style={s.avatarEmoji}>🌿</Text>
          </View>
          <Text style={s.profileName}>{petName || "EcoGuardian"}</Text>
          <Text style={s.profileSub}>Current Plant</Text>
        </View>

        <View style={s.bodyPad}>
          <View style={s.statsRow}>
            <View style={[s.statPill, { marginRight: 10 }]}>
              <Text style={s.statIcon}>🪴</Text>
              <View style={s.statTextGroup}>
                <Text style={s.statLabel}>Ecopoints 🍃</Text>
                <Text style={s.statVal}>{totalPoints.toLocaleString()}</Text>
              </View>
            </View>
            <View style={s.statPill}>
              <Text style={s.statIcon}>⭐</Text>
              <View style={s.statTextGroup}>
                <Text style={s.statLabel}>Rank</Text>
                <Text style={s.statVal}>Seedling</Text>
              </View>
            </View>
          </View>

          <View style={s.achievementsCard}>
            <Text style={s.sectionTitle}>🏅 Pet Achievements</Text>
            <View style={s.achievementsGrid}>
              <View style={[s.achBox, { marginRight: 10 }]}>
                <Text style={s.achIcon}>🍃</Text>
                <Text style={s.achLabel}>Ecopoints</Text>
                <Text style={s.achVal}>{totalPoints.toLocaleString()}</Text>
              </View>
              <View style={s.achBox}>
                <Text style={s.achIcon}>❤️</Text>
                <Text style={s.achLabel}>Pet Health</Text>
                <Text style={s.achVal}>92%</Text>
              </View>
            </View>
          </View>

          <View style={s.badgeRow}>
            <View style={[s.badge, s.badgeYellow]}>
              <Text style={s.badgeText}>ECO GUARDIAN 🏆</Text>
            </View>
            <View style={[s.badge, s.badgeGreen]}>
              <Text style={s.badgeText}>SEEDLING 🌱</Text>
            </View>
          </View>

          <Text style={s.sectionTitle}>🏆 Past Plant Journeys</Text>

          {plantHistory.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyIcon}>🌱</Text>
              <Text style={s.emptyText}>
                Complete a full journey to see history here!
              </Text>
            </View>
          ) : (
            plantHistory.map((h, index) => (
              <View key={index} style={s.historyCard}>
                <View style={s.historyCardHeader}>
                  <View style={s.historyTitleWrap}>
                    <Text style={s.historyName}>
                      {h.emoji || "🌻"} {h.name}
                    </Text>
                    <Text style={s.historyDate}>
                      Completed {new Date(h.at).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                  <View style={[s.badge, s.badgeYellow]}> 
                    <Text style={s.badgeText}>ECO GUARDIAN 🏆</Text>
                  </View>
                </View>
                <View style={s.historyStats}>
                  <View style={[s.historyStatBox, { marginRight: 8 }]}>
                    <Text style={s.historyStatLabel}>Total 🍃</Text>
                    <Text style={s.historyStatVal}>
                      {(h.pts || 0).toLocaleString()}
                    </Text>
                  </View>
                  <View style={s.historyStatBox}>
                    <Text style={s.historyStatLabel}>Actions</Text>
                    <Text style={s.historyStatVal}>{h.actions || 0}</Text>
                  </View>
                </View>
              </View>
            ))
          )}

          <TouchableOpacity
            style={[s.btn, s.btnOutline]}
            onPress={handleUpdateProfile}
            activeOpacity={0.8}
          >
            <Text style={s.btnText}>Update Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.btn, s.btnGreen]}
            onPress={handleAccountSettings}
            activeOpacity={0.8}
          >
            <Text style={[s.btnText, s.btnGreenText]}>Account Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.btn, s.btnLogout]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={[s.btnText, s.btnLogoutText]}>Log Out Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e9f5ee",
  },
  content: {
    padding: 16,
    paddingTop: 30,
  },
  card: {
    marginTop: 8,
    backgroundColor: "#d8f3dc",
    borderRadius: 24,
    overflow: "hidden",
  },
  header: {
    backgroundColor: "#1a3a2a",
    paddingTop: 28,
    paddingBottom: 36,
    paddingHorizontal: 20,
    alignItems: "center",
    position: "relative",
  },
  avatarRing: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 3.5,
    borderColor: "rgba(149,213,178,0.5)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarEmoji: {
    fontSize: 48,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "900",
    color: "#fff",
    marginBottom: 4,
  },
  profileSub: {
    fontSize: 10,
    color: "#95d5b2",
    fontWeight: "800",
    letterSpacing: 2.5,
    textTransform: "uppercase",
  },
  bodyPad: {
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    marginBottom: 14,
  },
  statPill: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#b7e4c7",
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
  },
  statIcon: {
    fontSize: 22,
  },
  statTextGroup: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: "#52b788",
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  statVal: {
    fontSize: 17,
    fontWeight: "900",
    color: "#1a3a2a",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "900",
    color: "#1a3a2a",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 10,
  },
  achievementsCard: {
    backgroundColor: "rgba(255,255,255,0.78)",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#d4edda",
    padding: 14,
    marginBottom: 14,
  },
  achievementsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  achBox: {
    flex: 1,
    backgroundColor: "#f0faf0",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#d4edda",
  },
  achIcon: {
    fontSize: 30,
    marginBottom: 6,
  },
  achLabel: {
    fontSize: 10,
    color: "#52b788",
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  achVal: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1a3a2a",
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 14,
  },
  badge: {
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 13,
  },
  badgeYellow: {
    backgroundColor: "#fbbf24",
  },
  badgeGreen: {
    backgroundColor: "#86efac",
  },
  badgeText: {
    color: "#78350f",
    fontSize: 11,
    fontWeight: "800",
  },
  emptyState: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 6,
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 13,
    textAlign: "center",
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
  },
  historyTitleWrap: {
    flex: 1,
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
  historyStats: {
    flexDirection: "row",
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
    fontWeight: "800",
    textTransform: "uppercase",
  },
  historyStatVal: {
    fontSize: 17,
    fontWeight: "900",
    color: "#1a3a2a",
    marginTop: 2,
  },
  btn: {
    width: "100%",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },
  btnOutline: {
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1.5,
    borderColor: "rgba(82,183,136,0.4)",
  },
  btnGreen: {
    backgroundColor: "#52b788",
  },
  btnLogout: {
    backgroundColor: "rgba(239,68,68,0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(239,68,68,0.25)",
  },
  btnText: {
    fontSize: 14,
    fontWeight: "800",
    fontFamily: "System",
  },
  btnGreenText: {
    color: "#fff",
  },
  btnLogoutText: {
    color: "#ef4444",
  },
});
