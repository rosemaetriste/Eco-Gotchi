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
import { fmtDuration, HEART_MS } from "../../components/constants";

// ─── Achievement tiers ────────────────────────────────────────────────────────
// completedJourneys = plantHistory.length (number of journeys finished so far).
// Each history entry was saved AFTER a journey ended, so index 0 = first ever completion.
const ACHIEVEMENT_TIERS = [
  { minReplants: 0, badge: "🌱 Eco Sprout",           rank: "Eco Sprout"           },
  { minReplants: 1, badge: "🌿 Green Guardian",        rank: "Green Guardian"       },
  { minReplants: 2, badge: "🌸 Bloom Master",          rank: "Bloom Master"         },
  { minReplants: 3, badge: "🌻 Eco Veteran",           rank: "Eco Veteran"          },
  { minReplants: 4, badge: "🌳 Legendary Cultivator",  rank: "Legendary Cultivator" },
];

// Returns the highest tier reached for a given number of completed journeys.
function getCurrentTier(completedJourneys) {
  let tier = ACHIEVEMENT_TIERS[0];
  for (const t of ACHIEVEMENT_TIERS) {
    if (completedJourneys >= t.minReplants) tier = t;
  }
  return tier;
}

// Each past journey was the N-th completion.
// plantHistory is newest-first, so index 0 = most recent, last index = first ever.
// The first entry in history (last index) earned tier 0, second-last earned tier 1, etc.
function getTierForHistoryEntry(plantHistory, entryIndex) {
  // entryIndex is the position in the array as displayed (we display newest first)
  // The Nth entry displayed corresponds to the Nth most recent completion.
  // total completed = plantHistory.length; this entry was the (plantHistory.length - entryIndex)th completion.
  const completionNumber = plantHistory.length - 1 - entryIndex; // 0-based completion index
  return getCurrentTier(completionNumber);
}

export default function AccountScreen({
  petName,
  userEmail,
  totalPoints = 0,
  allTimeTotalPoints = 0,
  logCount = 0,
  plantHistory = [],
  lives = 5,
  lostAt = [],
  now = Date.now(),
  onLogout,
}) {
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }
    router.replace("/(auth)");
  };

  const handleUpdateProfile = () => {
    Alert.alert("Update Profile", "This feature will be added soon.");
  };

  const handleAccountSettings = () => {
    Alert.alert("Account Settings", "This feature will be added soon.");
  };

  // Heart recovery — single countdown for the next heart to restore
  const nextRecoveryTs = Array.isArray(lostAt) && lostAt.length > 0 ? lostAt[0] : null;
  const recoveryRem    = nextRecoveryTs !== null ? HEART_MS - (now - nextRecoveryTs) : null;

  const completedJourneys = plantHistory.length;
  const currentTier       = getCurrentTier(completedJourneys);

  // All-time eco points across all journeys
  const displayAllTime = allTimeTotalPoints > 0 ? allTimeTotalPoints : totalPoints;

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <View style={s.card}>
        {/* ── Profile header ── */}
        <View style={s.header}>
          <View style={s.avatarRing}>
            <Text style={s.avatarEmoji}>🌿</Text>
          </View>
          <Text style={s.profileName}>{petName || "EcoGuardian"}</Text>
          <Text style={s.profileSub}>Current Plant</Text>
          <Text style={s.profileEmail}>{userEmail ? `Email: ${userEmail}` : "Email: demo-user"}</Text>
        </View>

        <View style={s.bodyPad}>
          {/* ── Stats row: All-time Ecopoints + Current Rank ── */}
          <View style={s.statsRow}>
            <View style={[s.statPill, { marginRight: 10 }]}>
              <Text style={s.statIcon}>🪴</Text>
              <View style={s.statTextGroup}>
                <Text style={s.statLabel}>All-time 🍃</Text>
                <Text style={s.statVal}>{displayAllTime.toLocaleString()}</Text>
              </View>
            </View>
            <View style={s.statPill}>
              <Text style={s.statIcon}>⭐</Text>
              <View style={s.statTextGroup}>
                <Text style={s.statLabel}>Rank</Text>
                <Text style={s.statVal} numberOfLines={1} adjustsFontSizeToFit>
                  {currentTier.rank}
                </Text>
              </View>
            </View>
          </View>

          {/* ── Pet Achievements card ── */}
          <View style={s.achievementsCard}>
            <Text style={s.sectionTitle}>🏅 Pet Achievements</Text>
            <View style={s.achievementsGrid}>
              {/* Current seed eco-points (this journey only, no total needed) */}
              <View style={[s.achBox, { marginRight: 10 }]}>
                <Text style={s.achIcon}>🍃</Text>
                <Text style={s.achLabel}>Ecopoints</Text>
                {/* Shows the current journey's earned points only */}
                <Text style={s.achVal}>{totalPoints.toLocaleString()}</Text>
              </View>

              {/* Pet Health — hearts + single recovery timer */}
              <View style={s.achBox}>
                <View style={s.heartsRow}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Text key={i} style={{ fontSize: 15, opacity: i < lives ? 1 : 0.25 }}>
                      ❤️
                    </Text>
                  ))}
                </View>
                <Text style={s.achLabel}>Pet Health</Text>
                {recoveryRem !== null && recoveryRem > 0 && (
                  <View style={s.recoveryPill}>
                    <Text style={s.recoveryText}>🕐 {fmtDuration(recoveryRem)}</Text>
                  </View>
                )}
                {lives === 5 && (
                  <Text style={s.fullHealthText}>Full Health ✅</Text>
                )}
              </View>
            </View>
          </View>

          {/* ── Current rank badge ── */}
          <View style={s.badgeRow}>
            <View style={[s.badge, s.badgeYellow]}>
              <Text style={s.badgeText}>{currentTier.badge} 🏆</Text>
            </View>
          </View>

          {/* ── Past Plant Journeys ── */}
          <Text style={s.sectionTitle}>🌿 Past Plant Journeys</Text>

          {plantHistory.length === 0 ? (
            <View style={s.emptyState}>
              <Text style={s.emptyIcon}>🌱</Text>
              <Text style={s.emptyText}>
                Complete a full journey to see history here!
              </Text>
            </View>
          ) : (
            plantHistory.map((h, index) => {
              // Each entry's achievement tier is based on which completion it was.
              // plantHistory is newest-first; last element = 1st ever completion.
              const tier = getTierForHistoryEntry(plantHistory, index);
              return (
                <View key={index} style={s.historyCard}>
                  <View style={s.historyCardHeader}>
                    <View style={s.historyTitleWrap}>
                      <Text style={s.historyName}>
                        {h.emoji || "🌻"} {h.name}
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
                    {/* Real earned achievement badge for this journey */}
                    <View style={[s.badge, s.badgeYellow]}>
                      <Text style={s.badgeText}>{tier.badge}</Text>
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
              );
            })
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
  avatarEmoji: { fontSize: 48 },
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
  profileEmail: {
    fontSize: 12,
    color: "#e8f5ee",
    marginTop: 6,
    textAlign: "center",
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
  statIcon: { fontSize: 22 },
  statTextGroup: { flex: 1 },
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
  achIcon: { fontSize: 30, marginBottom: 6 },
  achLabel: {
    fontSize: 10,
    color: "#52b788",
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 6,
  },
  achVal: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1a3a2a",
    marginTop: 2,
  },

  // Hearts
  heartsRow: {
    flexDirection: "row",
    gap: 2,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  recoveryPill: {
    marginTop: 6,
    backgroundColor: "rgba(254,226,226,0.85)",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  recoveryText: {
    fontSize: 9,
    color: "#b91c1c",
    fontWeight: "800",
    textAlign: "center",
  },
  fullHealthText: {
    fontSize: 10,
    color: "#52b788",
    fontWeight: "700",
    marginTop: 5,
  },

  // Badge row (current rank)
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 14,
    gap: 8,
  },
  badge: {
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 13,
  },
  badgeYellow: { backgroundColor: "#fbbf24" },
  badgeText: { color: "#78350f", fontSize: 11, fontWeight: "800" },

  // Past journeys
  emptyState: { paddingVertical: 20, alignItems: "center" },
  emptyIcon:  { fontSize: 32, marginBottom: 6 },
  emptyText:  { color: "#9ca3af", fontSize: 13, textAlign: "center" },
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
  historyTitleWrap: { flex: 1 },
  historyName: {
    fontSize: 15,
    fontWeight: "900",
    color: "#1a3a2a",
    marginBottom: 2,
  },
  historyDate: { fontSize: 11, color: "#9ca3af" },
  historyStats: { flexDirection: "row" },
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

  // Buttons
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
  btnGreen:   { backgroundColor: "#52b788" },
  btnLogout:  {
    backgroundColor: "rgba(239,68,68,0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(239,68,68,0.25)",
  },
  btnText:      { fontSize: 14, fontWeight: "800", fontFamily: "System" },
  btnGreenText: { color: "#fff" },
  btnLogoutText:{ color: "#ef4444" },
});