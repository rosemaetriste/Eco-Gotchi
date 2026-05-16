// // shared.js — constants, helpers, and shared components

// import React, { useState, useEffect } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
// import Svg, { Path, Rect, Ellipse, Circle, G, SvgText } from 'react-native-svg';

// // ─── Constants ────────────────────────────────────────────────────────────────

// export const STAGES = [
//   { name: 'Sprout',    maxPoints: 2000,  color: '#a8d5a2', textColor: '#2d6a4f' },
//   { name: 'Seedling',  maxPoints: 5000,  color: '#5db85d', textColor: '#fff'    },
//   { name: 'Budding',   maxPoints: 10000, color: '#f9a8d4', textColor: '#831843' },
//   { name: 'Flowering', maxPoints: 10000, color: '#fbbf24', textColor: '#78350f' },
//   { name: 'Maturing',  maxPoints: null,  color: '#2d6a4f', textColor: '#fff'    },
// ];

// export const TRANSPORT_ACTIONS = [
//   { id: 'bike',     label: 'Biked instead of driving',     co2_per_km: 0.21  },
//   { id: 'walk',     label: 'Walked instead of driving',    co2_per_km: 0.21  },
//   { id: 'jeepney',  label: 'Rode Jeepney instead of car',  co2_per_km: 0.11  },
//   { id: 'bus',      label: 'Rode Bus instead of car',      co2_per_km: 0.147 },
//   { id: 'lrt_mrt',  label: 'Took LRT/MRT instead of car', co2_per_km: 0.041 },
//   { id: 'tricycle', label: 'Took Tricycle instead of car', co2_per_km: 0.19  },
//   { id: 'carpool',  label: 'Carpooled (4 passengers)',     co2_per_km: 0.21  },
// ];

// export const MISSIONS_POOL = [
//   { id: 'm1', text: 'Walk or bike at least 2 km today',       points: 30,  target: 2 },
//   { id: 'm2', text: 'Take public transport for your commute', points: 50,  target: 1 },
//   { id: 'm3', text: 'Carpool to your destination',            points: 40,  target: 1 },
//   { id: 'm4', text: 'Avoid private car trips entirely today', points: 100, target: 3 },
//   { id: 'm5', text: 'Log 3 eco-friendly transport actions',   points: 80,  target: 3 },
// ];

// export const NEW_SEED_OPTIONS = [
//   { id: 'oak',    label: 'Oak Tree Seed',      emoji: '🌰', desc: 'Slow but mighty. Massive CO₂ savings.' },
//   { id: 'bamboo', label: 'Bamboo Shoot',        emoji: '🎋', desc: 'Fast grower. Bonus for daily streaks.' },
//   { id: 'cactus', label: 'Desert Cactus',       emoji: '🌵', desc: 'Resilient. Hearts deplete slower.' },
//   { id: 'cherry', label: 'Cherry Blossom Seed', emoji: '🌸', desc: 'Beautiful bloomer. Double points on weekends.' },
// ];

// export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// // Heart recovery: 24 hours in seconds
// export const HEART_RECOVERY_SECONDS = 24 * 60 * 60;

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// export function makeRandomMissions() {
//   return [...MISSIONS_POOL]
//     .sort(() => Math.random() - 0.5)
//     .slice(0, 3)
//     .map(m => ({ ...m, completed: false, progress: 0 }));
// }

// export function getStageProgress(pts) {
//   let cum = 0;
//   for (let i = 0; i < STAGES.length - 1; i++) {
//     const next = cum + STAGES[i].maxPoints;
//     if (pts < next) return { current: pts - cum, max: STAGES[i].maxPoints, stageIdx: i };
//     cum = next;
//   }
//   return {
//     current: STAGES[STAGES.length - 1].maxPoints,
//     max: STAGES[STAGES.length - 1].maxPoints,
//     stageIdx: STAGES.length - 1,
//   };
// }

// export function getWeekDates() {
//   const today = new Date();
//   const day = today.getDay();
//   return Array.from({ length: 7 }, (_, i) => {
//     const d = new Date(today);
//     d.setDate(today.getDate() - day + i);
//     return d;
//   });
// }

// export function sameDay(a, b) {
//   return (
//     a.getFullYear() === b.getFullYear() &&
//     a.getMonth() === b.getMonth() &&
//     a.getDate() === b.getDate()
//   );
// }

// export function formatDuration(totalSeconds) {
//   const h = Math.floor(totalSeconds / 3600);
//   const m = Math.floor((totalSeconds % 3600) / 60);
//   const s = totalSeconds % 60;
//   return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
// }

// // ─── Plant SVGs ───────────────────────────────────────────────────────────────

// export function DeadPlantSVG() {
//   return (
//     <Svg width={90} height={130} viewBox="0 0 90 130">
//       <Path d="M22 95 Q24 120 45 122 Q66 120 68 95 Z" fill="#8b7355" />
//       <Path d="M55 95 Q63 97 68 95 Q67 114 58 120 Q50 122 50 95 Z" fill="rgba(0,0,0,0.12)" />
//       <Rect x={18} y={89} width={54} height={11} rx={5.5} fill="#6b5a3e" />
//       <Ellipse cx={45} cy={89} rx={25} ry={5} fill="#4a3728" />
//       <Path d="M32 100 L35 112" stroke="#4a3728" strokeWidth={1.5} strokeLinecap="round" />
//       <Path d="M55 102 L52 118" stroke="#4a3728" strokeWidth={1.2} strokeLinecap="round" />
//       <Ellipse cx={45} cy={89} rx={23} ry={4} fill="#5c4033" />
//       <Path d="M38 88 L43 91 L48 87" stroke="#3a2519" strokeWidth={1.5} strokeLinecap="round" fill="none" />
//       <Path d="M43 88 Q44 80 43 72 Q42 64 38 56 Q36 50 30 46" stroke="#7c6540" strokeWidth={3.5} strokeLinecap="round" fill="none" />
//       <Path d="M38 56 Q18 58 14 70 Q28 62 40 56 Z" fill="#8b7355" fillOpacity={0.8} />
//       <Path d="M43 68 Q55 72 58 84 Q48 72 42 68 Z" fill="#8b7355" fillOpacity={0.8} />
//       <Path d="M30 46 Q24 40 22 34 Q28 38 32 44 Z" fill="#7c6540" fillOpacity={0.7} />
//     </Svg>
//   );
// }

// export function PlantSVG({ stageIdx }) {
//   if (stageIdx === 0) return (
//     <Svg width={90} height={130} viewBox="0 0 90 130">
//       <Path d="M22 95 Q24 120 45 122 Q66 120 68 95 Z" fill="#c07b54" />
//       <Path d="M55 95 Q63 97 68 95 Q67 114 58 120 Q50 122 50 95 Z" fill="rgba(0,0,0,0.08)" />
//       <Rect x={18} y={89} width={54} height={11} rx={5.5} fill="#a0634a" />
//       <Ellipse cx={45} cy={89} rx={25} ry={5} fill="#7c4b2a" />
//       <Path d="M28 106 Q30 117 33 121" stroke="rgba(255,255,255,0.18)" strokeWidth={3} strokeLinecap="round" />
//       <Path d="M43 88 Q41 76 45 62" stroke="#52b788" strokeWidth={4} strokeLinecap="round" />
//       <Path d="M45 72 Q56 60 58 50 Q46 58 43 70 Z" fill="#52b788" />
//       <Path d="M45 72 Q54 61 58 50" stroke="#2d6a4f" strokeWidth={1} fill="none" strokeOpacity={0.5} />
//     </Svg>
//   );

//   if (stageIdx === 1) return (
//     <Svg width={90} height={130} viewBox="0 0 90 130">
//       <Path d="M22 95 Q24 120 45 122 Q66 120 68 95 Z" fill="#c07b54" />
//       <Path d="M55 95 Q63 97 68 95 Q67 114 58 120 Q50 122 50 95 Z" fill="rgba(0,0,0,0.08)" />
//       <Rect x={18} y={89} width={54} height={11} rx={5.5} fill="#a0634a" />
//       <Ellipse cx={45} cy={89} rx={25} ry={5} fill="#7c4b2a" />
//       <Path d="M28 106 Q30 117 33 121" stroke="rgba(255,255,255,0.18)" strokeWidth={3} strokeLinecap="round" />
//       <Path d="M43 88 Q40 70 45 48" stroke="#40916c" strokeWidth={4.5} strokeLinecap="round" />
//       <Path d="M43 68 Q28 55 26 40 Q40 50 45 66 Z" fill="#52b788" />
//       <Path d="M43 68 Q30 55 26 40" stroke="#2d6a4f" strokeWidth={1.2} fill="none" strokeOpacity={0.5} />
//       <Path d="M45 62 Q62 50 64 36 Q50 46 44 60 Z" fill="#74c69d" />
//       <Path d="M45 62 Q62 50 64 36" stroke="#2d6a4f" strokeWidth={1.2} fill="none" strokeOpacity={0.5} />
//     </Svg>
//   );

//   if (stageIdx === 2) return (
//     <Svg width={90} height={130} viewBox="0 0 90 130">
//       <Path d="M22 95 Q24 120 45 122 Q66 120 68 95 Z" fill="#b07048" />
//       <Path d="M55 95 Q63 97 68 95 Q67 114 58 120 Q50 122 50 95 Z" fill="rgba(0,0,0,0.08)" />
//       <Rect x={18} y={89} width={54} height={11} rx={5.5} fill="#8d5836" />
//       <Ellipse cx={45} cy={89} rx={25} ry={5} fill="#6b3f22" />
//       <Path d="M28 106 Q30 117 33 121" stroke="rgba(255,255,255,0.18)" strokeWidth={3} strokeLinecap="round" />
//       <Path d="M43 88 Q39 68 45 42" stroke="#2d6a4f" strokeWidth={5} strokeLinecap="round" />
//       <Path d="M42 72 Q22 56 20 38 Q38 52 44 70 Z" fill="#52b788" />
//       <Path d="M42 72 Q24 57 20 38" stroke="#1b4332" strokeWidth={1.2} fill="none" strokeOpacity={0.45} />
//       <Path d="M46 66 Q66 50 68 32 Q50 46 44 64 Z" fill="#74c69d" />
//       <Path d="M46 66 Q66 50 68 32" stroke="#1b4332" strokeWidth={1.2} fill="none" strokeOpacity={0.45} />
//       <Ellipse cx={45} cy={35} rx={11} ry={14} fill="#d4a5c9" />
//       <Ellipse cx={45} cy={27} rx={7} ry={6} fill="#f9a8d4" />
//       <Path d="M38 32 Q45 22 52 32" stroke="#c084a8" strokeWidth={1} fill="none" />
//     </Svg>
//   );

//   if (stageIdx === 3) return (
//     <Svg width={90} height={130} viewBox="0 0 90 130">
//       <Path d="M22 95 Q24 120 45 122 Q66 120 68 95 Z" fill="#b07048" />
//       <Path d="M55 95 Q63 97 68 95 Q67 114 58 120 Q50 122 50 95 Z" fill="rgba(0,0,0,0.08)" />
//       <Rect x={18} y={89} width={54} height={11} rx={5.5} fill="#8d5836" />
//       <Ellipse cx={45} cy={89} rx={25} ry={5} fill="#6b3f22" />
//       <Path d="M28 106 Q30 117 33 121" stroke="rgba(255,255,255,0.18)" strokeWidth={3} strokeLinecap="round" />
//       <Path d="M43 88 Q39 66 45 40" stroke="#2d6a4f" strokeWidth={5} strokeLinecap="round" />
//       <Path d="M42 75 Q20 58 18 38 Q38 54 44 73 Z" fill="#52b788" />
//       <Path d="M42 75 Q22 59 18 38" stroke="#1b4332" strokeWidth={1.2} fill="none" strokeOpacity={0.45} />
//       <Path d="M46 68 Q68 52 70 30 Q50 46 44 66 Z" fill="#74c69d" />
//       <Path d="M46 68 Q68 52 70 30" stroke="#1b4332" strokeWidth={1.2} fill="none" strokeOpacity={0.45} />
//       <Ellipse cx={45} cy={22} rx={9} ry={14} fill="#fbbf24" fillOpacity={0.9} />
//       <Ellipse cx={32} cy={28} rx={9} ry={14} fill="#fbbf24" fillOpacity={0.85} rotation={-50} originX={32} originY={28} />
//       <Ellipse cx={58} cy={28} rx={9} ry={14} fill="#fbbf24" fillOpacity={0.85} rotation={50} originX={58} originY={28} />
//       <Ellipse cx={27} cy={40} rx={9} ry={14} fill="#fde68a" fillOpacity={0.8} rotation={-80} originX={27} originY={40} />
//       <Ellipse cx={63} cy={40} rx={9} ry={14} fill="#fde68a" fillOpacity={0.8} rotation={80} originX={63} originY={40} />
//       <Circle cx={45} cy={36} r={12} fill="#f59e0b" />
//       <Circle cx={45} cy={36} r={7}  fill="#fbbf24" />
//       <Circle cx={45} cy={36} r={3.5} fill="#d97706" />
//     </Svg>
//   );

//   // Maturing (4)
//   return (
//     <Svg width={90} height={130} viewBox="0 0 90 130">
//       <Path d="M22 95 Q24 120 45 122 Q66 120 68 95 Z" fill="#7c3aed" />
//       <Path d="M55 95 Q63 97 68 95 Q67 114 58 120 Q50 122 50 95 Z" fill="rgba(0,0,0,0.1)" />
//       <Rect x={18} y={89} width={54} height={11} rx={5.5} fill="#5b21b6" />
//       <Ellipse cx={45} cy={89} rx={25} ry={5} fill="#3b0764" />
//       <Path d="M28 106 Q30 117 33 121" stroke="rgba(255,255,255,0.2)" strokeWidth={3} strokeLinecap="round" />
//       <Path d="M43 88 Q38 64 45 36" stroke="#1b4332" strokeWidth={6} strokeLinecap="round" />
//       <Path d="M41 80 Q16 62 14 38 Q36 56 43 78 Z" fill="#2d6a4f" />
//       <Path d="M41 80 Q18 63 14 38" stroke="#1b4332" strokeWidth={1.4} fill="none" strokeOpacity={0.5} />
//       <Path d="M47 73 Q72 55 74 28 Q52 48 45 71 Z" fill="#40916c" />
//       <Path d="M47 73 Q72 55 74 28" stroke="#1b4332" strokeWidth={1.4} fill="none" strokeOpacity={0.5} />
//       <Path d="M42 64 Q20 46 22 24 Q40 40 44 62 Z" fill="#52b788" fillOpacity={0.85} />
//       <Path d="M46 58 Q68 40 66 18 Q48 36 44 56 Z" fill="#74c69d" fillOpacity={0.85} />
//       <Circle cx={45} cy={22} r={16} fill="#1b4332" />
//       <Circle cx={30} cy={30} r={12} fill="#2d6a4f" />
//       <Circle cx={60} cy={30} r={12} fill="#2d6a4f" />
//       <Circle cx={45} cy={14} r={10} fill="#40916c" />
//       <Circle cx={38} cy={10} r={7}  fill="#52b788" fillOpacity={0.8} />
//       <Circle cx={52} cy={10} r={7}  fill="#52b788" fillOpacity={0.8} />
//       <Circle cx={45} cy={22} r={4}  fill="#95d5b2" />
//       <Circle cx={45} cy={22} r={2}  fill="#fff" fillOpacity={0.9} />
//     </Svg>
//   );
// }

// // ─── Shared UI Components ─────────────────────────────────────────────────────

// export function Hearts({ lives, lostHeartRecoverAt }) {
//   const [tick, setTick] = useState(0);

//   useEffect(() => {
//     if (lives >= 5) return;
//     const id = setInterval(() => setTick(t => t + 1), 1000);
//     return () => clearInterval(id);
//   }, [lives]);

//   const lostCount = 5 - lives;
//   let remainingSeconds = 0;

//   if (lives < 5 && lostHeartRecoverAt) {
//     // Total remaining = time until all hearts recover
//     // Each heart takes HEART_RECOVERY_SECONDS after the previous one
//     // lostHeartRecoverAt is the timestamp the FIRST heart started recovering
//     const now = Date.now();
//     const firstRecoveryEnd = lostHeartRecoverAt + HEART_RECOVERY_SECONDS * 1000;
//     const allRecoverEnd = lostHeartRecoverAt + HEART_RECOVERY_SECONDS * 1000 * lostCount;
//     remainingSeconds = Math.max(0, Math.ceil((allRecoverEnd - now) / 1000));
//   }

//   return (
//     <View style={sharedStyles.heartsContainer}>
//       <View style={sharedStyles.heartsRow}>
//         {Array.from({ length: 5 }).map((_, i) => (
//           <Text key={i} style={[sharedStyles.heart, i >= lives && sharedStyles.heartLost]}>❤️</Text>
//         ))}
//       </View>
//       {lives < 5 && remainingSeconds > 0 && (
//         <Text style={sharedStyles.heartTimer}>
//           ⏱ Recovers in: {formatDuration(remainingSeconds)}
//         </Text>
//       )}
//     </View>
//   );
// }

// export function ProgressBar({ current, max, stageIdx }) {
//   const pct = Math.min((current / max) * 100, 100);
//   return (
//     <View>
//       <View style={sharedStyles.progressLabelRow}>
//         <Text style={sharedStyles.progressLabel}>Growth Stage: {STAGES[stageIdx].name}</Text>
//         <Text style={sharedStyles.progressLabel}>{current.toLocaleString()} / {max.toLocaleString()}</Text>
//       </View>
//       <View style={sharedStyles.progressTrack}>
//         <View style={[sharedStyles.progressFill, { width: `${pct}%` }]} />
//       </View>
//       {stageIdx < STAGES.length - 1 && (
//         <Text style={sharedStyles.progressNext}>Next: {STAGES[stageIdx + 1].name}</Text>
//       )}
//     </View>
//   );
// }

// export function MissionCard({ mission, onComplete }) {
//   return (
//     <View style={[sharedStyles.missionCard, mission.completed && sharedStyles.missionCardDone]}>
//       <View style={{ flex: 1 }}>
//         <Text style={[sharedStyles.missionText, mission.completed && sharedStyles.missionTextDone]}>
//           {mission.text}
//         </Text>
//         <Text style={sharedStyles.missionPoints}>+{mission.points} 🍃 pts</Text>
//       </View>
//       {mission.completed
//         ? <Text style={{ fontSize: 20, marginLeft: 8 }}>✅</Text>
//         : (
//           <TouchableOpacity onPress={() => onComplete(mission.id)} style={sharedStyles.missionBtn}>
//             <Text style={sharedStyles.missionBtnText}>Done ✓</Text>
//           </TouchableOpacity>
//         )
//       }
//     </View>
//   );
// }

// export function LogItem({ log, last }) {
//   return (
//     <View style={[sharedStyles.logItem, !last && sharedStyles.logItemBorder]}>
//       <View style={{ flex: 1, minWidth: 0 }}>
//         <Text style={sharedStyles.logLabel} numberOfLines={1}>{log.label}</Text>
//         <Text style={sharedStyles.logMeta}>{log.distance} km · {log.co2Saved.toFixed(3)} kg CO₂ saved</Text>
//       </View>
//       <Text style={sharedStyles.logPoints}>+{log.points} 🍃</Text>
//     </View>
//   );
// }

// // ─── Shared Styles ────────────────────────────────────────────────────────────

// export const sharedStyles = StyleSheet.create({
//   // Hearts
//   heartsContainer: { alignItems: 'flex-end' },
//   heartsRow: { flexDirection: 'row', gap: 3 },
//   heart: { fontSize: 18 },
//   heartLost: { opacity: 0.28, tintColor: '#ccc' },
//   heartTimer: { fontSize: 11, color: '#b91c1c', fontWeight: '700', marginTop: 4, textAlign: 'right' },

//   // Progress bar
//   progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
//   progressLabel: { fontSize: 11, fontWeight: '700', color: '#5a7c5a', textTransform: 'uppercase', letterSpacing: 0.5 },
//   progressTrack: { backgroundColor: '#d4edda', borderRadius: 20, height: 18, overflow: 'hidden', borderWidth: 2, borderColor: '#b2d8b2' },
//   progressFill: { height: '100%', backgroundColor: '#52b788', borderRadius: 20, minWidth: 4 },
//   progressNext: { marginTop: 5, fontSize: 11, color: '#9ca3af', textAlign: 'right' },

//   // Mission card
//   missionCard: {
//     backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 12, padding: 12,
//     flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
//     borderWidth: 1.5, borderColor: '#d4edda', marginBottom: 0,
//   },
//   missionCardDone: { backgroundColor: 'rgba(212,237,218,0.55)', borderColor: '#52b788' },
//   missionText: { fontSize: 13, fontWeight: '600', color: '#374151' },
//   missionTextDone: { color: '#2d6a4f', textDecorationLine: 'line-through', opacity: 0.75 },
//   missionPoints: { fontSize: 11, color: '#6b7280', marginTop: 2 },
//   missionBtn: { backgroundColor: '#52b788', borderRadius: 8, paddingVertical: 5, paddingHorizontal: 10, marginLeft: 10 },
//   missionBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

//   // Log item
//   logItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 9 },
//   logItemBorder: { borderBottomWidth: 1, borderBottomColor: '#e8f5e9' },
//   logLabel: { fontSize: 13, color: '#374151', fontWeight: '600' },
//   logMeta: { fontSize: 11, color: '#9ca3af', marginTop: 1 },
//   logPoints: { fontSize: 13, fontWeight: '800', color: '#52b788', marginLeft: 8 },
// });