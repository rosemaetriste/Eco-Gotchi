// home.js
// Main Pet tab. Also owns the EcoModal (centered), DeadScreen, and MaxAchievementScreen
// since those flow states are triggered from game logic that lives in App.js.
import React, { useState, useRef, useEffect, useCallback } from "react";
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
  Platform,
} from "react-native";

import {
  STAGES,
  SEEDS,
  TRANSPORT_ACTIONS,
  HEART_MS,
  getStageProgress,
  fmtDuration,
  sameDay,
  PlantSVG,
  DeadPlantSVG,
  Hearts,
  ProgressBar,
  MissionCard,
  LogItem,
  Card,
  SectionHeader,
  sharedStyles,
} from "../../components/constants";

// ─── Eco Action Modal (centered on screen) ────────────────────────────────────

export function EcoModal({ visible, onClose, onSubmit }) {
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

    // Fallback block to prevent reading rate of undefined if selectedIdx is corrupt
    const action = TRANSPORT_ACTIONS?.[selectedIdx] ||
      TRANSPORT_ACTIONS?.[0] || { rate: 0 };
    const co2 = d * (action.rate || 0);
    const pts = Math.round(co2 * 100 + d * 2);
    setResult({ co2, points: pts, distance: d });
    setLoading(false);
  };

  const handleLog = () => {
    if (!result) return;
    const action = TRANSPORT_ACTIONS?.[selectedIdx] ||
      TRANSPORT_ACTIONS?.[0] || { label: "Unknown Action" };
    onSubmit({
      label: action.label,
      distance: result.distance,
      co2: result.co2,
      points: result.points,
    });
    handleClose();
  };

  // Safe reference mapping for label UI
  const currentActionLabel =
    TRANSPORT_ACTIONS?.[selectedIdx]?.label ||
    TRANSPORT_ACTIONS?.[0]?.label ||
    "Select Transport";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      {/* Full-screen dimmed backdrop — tap outside to close */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={s.modalOverlay}>
          {/* Modal card — centered, tap inside does NOT close */}
          <TouchableWithoutFeedback>
            <View style={s.modalCard}>
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
                onPress={() => setShowPicker((p) => !p)}
                style={s.selectBtn}
              >
                <Text style={s.selectBtnText}>{currentActionLabel}</Text>
                <Text style={{ color: "#52b788", fontSize: 12 }}>▼</Text>
              </TouchableOpacity>

              {showPicker && (
                <View style={s.pickerDropdown}>
                  {(TRANSPORT_ACTIONS || []).map((a, i) => (
                    <TouchableOpacity
                      key={a?.id || i}
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
                        {a?.label || "Unknown Type"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Distance input */}
              <Text style={[s.inputLabel, { marginTop: showPicker ? 4 : 10 }]}>
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
                      {(result.co2 || 0).toFixed(3)} kg
                    </Text>
                  </Text>
                  <Text style={s.resultPts}>
                    Points earned: +{result.points || 0} 🍃
                  </Text>
                </View>
              )}

              {/* Action button */}
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

export function DeadScreen({ onRestart }) {
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

export function MaxAchievementScreen({
  petName,
  totalPoints,
  logCount,
  onChooseSeed,
}) {
  const [chosen, setChosen] = useState(null);

  return (
    <ScrollView
      style={s.maxScreen}
      contentContainerStyle={{
        alignItems: "center",
        paddingBottom: 60,
        paddingHorizontal: 18,
      }}
    >
      <Text
        style={{
          fontSize: 28,
          letterSpacing: 6,
          marginBottom: 12,
          marginTop: 8,
        }}
      >
        ⭐⭐⭐
      </Text>
      <Text style={s.maxTitle}>🎉 Achievement Unlocked!</Text>
      <Text style={s.maxSub}>
        <Text style={{ fontWeight: "900" }}>{petName || "Your Plant"}</Text> has
        fully matured!
      </Text>
      <Text style={s.maxDesc}>You've completed the full growth journey 🌍</Text>

      {/* Trophy */}
      <View style={s.trophyBox}>
        <Text style={{ fontSize: 52, marginBottom: 8 }}>🏆</Text>
        <Text style={s.trophyTitle}>ECO GUARDIAN</Text>
        <Text style={s.trophySub}>
          Raised {petName || "Your Plant"} from Sprout to full Maturity
        </Text>
      </View>

      {/* Stats */}
      <View
        style={[
          sharedStyles?.statsGrid || {},
          { width: "100%", marginBottom: 16 },
        ]}
      >
        <View style={s.maxStatBox}>
          <Text style={s.maxStatLabel}>TOTAL 🍃</Text>
          <Text style={s.maxStatValue}>
            {(totalPoints || 0).toLocaleString()}
          </Text>
        </View>
        <View style={s.maxStatBox}>
          <Text style={s.maxStatLabel}>ACTIONS</Text>
          <Text style={s.maxStatValue}>{logCount || 0}</Text>
        </View>
      </View>

      <Text style={s.maxNote}>
        Journey saved to your Profile. Choose your next seed:
      </Text>

      <View style={{ width: "100%", gap: 10 }}>
        {(SEEDS || []).map((seed) => {
          const isSel = chosen === seed?.id;
          return (
            <TouchableOpacity
              key={seed?.id}
              onPress={() => setChosen(seed?.id)}
              style={[s.seedOption, isSel && s.seedOptionActive]}
            >
              <Text style={{ fontSize: 28 }}>{seed?.emoji || "🌱"}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.seedLabel}>{seed?.label || "Unknown Seed"}</Text>
                <Text style={s.seedDesc}>
                  {seed?.desc || "No description available."}
                </Text>
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

// ─── Home Screen (Pet tab content) ───────────────────────────────────────────

export default function HomeScreen({
  totalPoints = 0,
  todayPoints = 0,
  lives = 5,
  lostAt,
  now,
  logs = [],
  missions = [],
  petName = "Luna",
  editingName,
  draftName,
  bounceAnim,
  floatAnim,
  onLoseHeart,
  onCompleteMission,
  onStartEditName,
  onCommitName,
  onDraftNameChange,
  onViewAllLogs,
  onLogEcoAction, // Callback interface trigger mapping pass
  stageIdx = 0,
  current = 0,
  max = 100,
}) {
  const [modalVisible, setModalVisible] = useState(false);

  const todayLogs = (logs || []).filter(
    (l) => l && l.ts && sameDay(new Date(l.ts), new Date()),
  );
  const missionsCompleted = (missions || []).filter(
    (m) => m && m.completed,
  ).length;

  const currentStage = STAGES?.[stageIdx] ||
    STAGES?.[0] || { name: "Seedling", color: "#52b788", tc: "#ffffff" };

  const handleModalSubmit = (actionData) => {
    if (onLogEcoAction) {
      onLogEcoAction(actionData);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 140 }} // Spacing allocation so content doesn't hide behind the sticky button
        showsVerticalScrollIndicator={false}
      >
        {/* Hearts + name row */}
        <View style={{ padding: 16, paddingBottom: 0 }}>
          <View
            style={{
              flex: 2,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 8,
            }}
          >
            <Hearts lives={lives} lostAt={lostAt} now={now} />
            <TouchableOpacity onPress={onLoseHeart} style={s.testBtn}>
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
                  onChangeText={onDraftNameChange}
                  onSubmitEditing={onCommitName}
                  style={s.nameInput}
                />
                <TouchableOpacity
                  onPress={onCommitName}
                  style={s.nameConfirmBtn}
                >
                  <Text style={{ color: "#fff", fontWeight: "800" }}>✓</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={onStartEditName}
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
                transform: [
                  { translateY: floatAnim || 0 },
                  { scale: bounceAnim || 1 },
                ],
              }}
            >
              <PlantSVG stageIdx={stageIdx} />
            </Animated.View>
          </View>
          <View style={[s.stageBadge, { backgroundColor: currentStage.color }]}>
            <Text style={[s.stageBadgeText, { color: currentStage.tc }]}>
              {currentStage.name}
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
            {(missions || []).map((m) => (
              <MissionCard
                key={m?.id}
                mission={m}
                onComplete={onCompleteMission}
              />
            ))}
          </View>
        </Card>

        {/* Eco Actions Today */}
        <Card style={{ margin: 14, marginBottom: 0 }}>
          <SectionHeader
            label="🌍 Eco Actions Today"
            right={
              <TouchableOpacity onPress={onViewAllLogs}>
                <Text
                  style={{ fontSize: 12, color: "#52b788", fontWeight: "700" }}
                >
                  View all →
                </Text>
              </TouchableOpacity>
            }
          />
          <View style={s.todayPtsBox}>
            <Text style={s.todayPtsNum}>
              {(todayPoints || 0).toLocaleString()} 🍃
            </Text>
            <Text style={s.todayPtsLabel}>Earned Today!</Text>
          </View>
          {todayLogs.length === 0 ? (
            <Text style={s.emptyText}>
              No eco actions yet. Start logging! 🌱
            </Text>
          ) : (
            <View style={sharedStyles?.logsContainer || {}}>
              {todayLogs.slice(0, 3).map((log, i, arr) => (
                <LogItem
                  key={log?.id || i}
                  log={log}
                  last={i === arr.length - 1}
                />
              ))}
            </View>
          )}
          {todayLogs.length > 3 && (
            <TouchableOpacity onPress={onViewAllLogs} style={s.moreTodayBtn}>
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
              ❤️ {5 - lives} heart(s) lost · Complete missions daily to recover!
            </Text>
          </View>
        )}
      </ScrollView>

      {/* True Absolute Floating Sticky Action Trigger Component */}
      <TouchableOpacity
        style={s.floatingActionButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.85}
      >
        <Text style={s.floatingActionButtonIcon}>🌱</Text>
        <Text style={s.floatingActionButtonText}>New Eco-Action</Text>
      </TouchableOpacity>

      {/* Functional Eco Actions Input Modal */}
      <EcoModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleModalSubmit}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  // Detached Floating Button Styling Configurations
  floatingActionButton: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 20 : 15, // Clean alignment above your primary screen tab item height
    right: 20,
    flexDirection: "row",
    backgroundColor: "#1a3a2a",
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 999,
  },
  floatingActionButtonIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  floatingActionButtonText: {
    color: "#95d5b2",
    fontSize: 14,
    fontWeight: "800",
  },

  // Modal — centered
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: "#f0faf0",
    borderRadius: 24,
    padding: 22,
    width: "100%",
    maxWidth: 420,
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
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
    marginBottom: 6,
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

  // Today eco
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

  // Dead screen
  deadScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#1a1a1a",
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

  // Max achievement screen
  maxScreen: {
    flex: 1,
    backgroundColor: "#064e3b",
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
});
