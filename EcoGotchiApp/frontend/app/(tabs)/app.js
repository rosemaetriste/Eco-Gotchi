// // App.js — Root entry point (React Native)
// // Manages global state with useReducer; composes HomeScreen, LogsScreen, and tab navigation.

// import React, { useReducer, useRef } from 'react';
// import {
//   View, Text, TouchableOpacity, SafeAreaView,
//   StyleSheet, StatusBar,
// } from 'react-native';

// import HomeScreen from './home';
// import LogsScreen from './logs';
// import {
//   STAGES, HEART_RECOVERY_SECONDS, makeRandomMissions, getStageProgress,
// } from './shared';

// // ─── Initial State ────────────────────────────────────────────────────────────

// function initialState() {
//   return {
//     petName: "Pet's Name",
//     totalPoints: 0,
//     todayPoints: 0,
//     lives: 5,
//     logs: [],
//     missions: makeRandomMissions(),
//     isDead: false,
//     isMaxed: false,
//     lostHeartRecoverAt: null, // timestamp when first heart started recovering
//     retiredPlants: [],        // array of { name, totalPoints, totalLogs, retiredAt }
//   };
// }

// // ─── Reducer ──────────────────────────────────────────────────────────────────

// function reducer(state, action) {
//   switch (action.type) {

//     case 'SET_PET_NAME':
//       return { ...state, petName: action.name };

//     case 'ADD_POINTS': {
//       const next = state.totalPoints + action.pts;
//       const prevIdx = getStageProgress(state.totalPoints).stageIdx;
//       const nextIdx = getStageProgress(next).stageIdx;
//       const isMaxed = nextIdx === STAGES.length - 1 && prevIdx < STAGES.length - 1;
//       return {
//         ...state,
//         totalPoints: next,
//         todayPoints: state.todayPoints + action.pts,
//         isMaxed: state.isMaxed || isMaxed,
//       };
//     }

//     case 'NEW_LOG': {
//       const next = state.totalPoints + action.totalPts;
//       const prevIdx = getStageProgress(state.totalPoints).stageIdx;
//       const nextIdx = getStageProgress(next).stageIdx;
//       const isMaxed = nextIdx === STAGES.length - 1 && prevIdx < STAGES.length - 1;
//       return {
//         ...state,
//         logs: [action.log, ...state.logs],
//         missions: action.updatedMissions,
//         totalPoints: next,
//         todayPoints: state.todayPoints + action.totalPts,
//         isMaxed: state.isMaxed || isMaxed,
//       };
//     }

//     case 'COMPLETE_MISSION': {
//       const next = state.totalPoints + action.pts;
//       const prevIdx = getStageProgress(state.totalPoints).stageIdx;
//       const nextIdx = getStageProgress(next).stageIdx;
//       const isMaxed = nextIdx === STAGES.length - 1 && prevIdx < STAGES.length - 1;
//       return {
//         ...state,
//         missions: state.missions.map(m => m.id === action.id ? { ...m, completed: true } : m),
//         totalPoints: next,
//         todayPoints: state.todayPoints + action.pts,
//         isMaxed: state.isMaxed || isMaxed,
//       };
//     }

//     case 'LOSE_HEART': {
//       const newLives = Math.max(0, state.lives - 1);
//       const isDead = newLives === 0;
//       // Set recovery start timestamp only when going from 5 to first loss
//       const lostHeartRecoverAt = state.lostHeartRecoverAt ?? (newLives < 5 ? Date.now() : null);
//       return { ...state, lives: newLives, isDead, lostHeartRecoverAt };
//     }

//     case 'RECOVER_HEART': {
//       // Called by a timer in production — restores 1 heart, shifts recovery timestamp
//       if (state.lives >= 5) return state;
//       const newLives = Math.min(5, state.lives + 1);
//       const lostHeartRecoverAt = newLives < 5
//         ? state.lostHeartRecoverAt + HEART_RECOVERY_SECONDS * 1000
//         : null;
//       return { ...state, lives: newLives, lostHeartRecoverAt };
//     }

//     case 'RESTART':
//       return initialState();

//     case 'NEW_SEED': {
//       // Retire the current plant to profile history, reset for new journey
//       const retired = {
//         name: state.petName,
//         totalPoints: state.totalPoints,
//         totalLogs: state.logs.length,
//         retiredAt: Date.now(),
//       };
//       return {
//         ...initialState(),
//         retiredPlants: [...state.retiredPlants, retired],
//       };
//     }

//     default:
//       return state;
//   }
// }

// // ─── Profile Tab ──────────────────────────────────────────────────────────────

// function ProfileTab({ appState }) {
//   const { petName, totalPoints, logs, retiredPlants } = appState;

//   return (
//     <View style={profileStyles.container}>
//       <View style={profileStyles.header}>
//         <Text style={profileStyles.headerTitle}>👤 Profile</Text>
//       </View>

//       {/* Current plant summary */}
//       <View style={profileStyles.currentCard}>
//         <Text style={profileStyles.currentLabel}>Current Plant</Text>
//         <Text style={profileStyles.currentName}>{petName}</Text>
//         <View style={profileStyles.currentStats}>
//           <View style={profileStyles.currentStat}>
//             <Text style={profileStyles.currentStatVal}>{totalPoints.toLocaleString()}</Text>
//             <Text style={profileStyles.currentStatLbl}>Eco Points</Text>
//           </View>
//           <View style={profileStyles.divider} />
//           <View style={profileStyles.currentStat}>
//             <Text style={profileStyles.currentStatVal}>{logs.length}</Text>
//             <Text style={profileStyles.currentStatLbl}>Actions Logged</Text>
//           </View>
//         </View>
//       </View>

//       {/* Retired plants */}
//       <Text style={profileStyles.sectionTitle}>🌱 Previous Plants</Text>
//       {retiredPlants.length === 0 ? (
//         <View style={profileStyles.emptyWrap}>
//           <Text style={profileStyles.emptyEmoji}>🪴</Text>
//           <Text style={profileStyles.emptyText}>Your retired plants will appear here after reaching full Maturity.</Text>
//         </View>
//       ) : (
//         retiredPlants.slice().reverse().map((p, i) => (
//           <View key={i} style={profileStyles.retiredCard}>
//             <View style={profileStyles.retiredLeft}>
//               <Text style={profileStyles.retiredName}>{p.name}</Text>
//               <Text style={profileStyles.retiredDate}>
//                 Retired: {new Date(p.retiredAt).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
//               </Text>
//             </View>
//             <View style={profileStyles.retiredRight}>
//               <Text style={profileStyles.retiredPoints}>{p.totalPoints.toLocaleString()} 🍃</Text>
//               <Text style={profileStyles.retiredLogs}>{p.totalLogs} actions</Text>
//             </View>
//           </View>
//         ))
//       )}
//     </View>
//   );
// }

// const profileStyles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#f0faf0' },
//   header: { backgroundColor: '#1a3a2a', padding: 20, paddingBottom: 18 },
//   headerTitle: { fontSize: 20, fontWeight: '900', color: '#fff' },

//   currentCard: {
//     margin: 14, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 16, padding: 18,
//     borderWidth: 1.5, borderColor: '#b2d8b2',
//   },
//   currentLabel: { fontSize: 11, fontWeight: '800', color: '#52b788', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
//   currentName: { fontSize: 22, fontWeight: '900', color: '#1a3a2a', marginBottom: 14 },
//   currentStats: { flexDirection: 'row', alignItems: 'center' },
//   currentStat: { flex: 1, alignItems: 'center' },
//   currentStatVal: { fontSize: 22, fontWeight: '900', color: '#52b788' },
//   currentStatLbl: { fontSize: 11, color: '#6b7280', fontWeight: '600', marginTop: 2 },
//   divider: { width: 1, height: 36, backgroundColor: '#d4edda' },

//   sectionTitle: { fontSize: 13, fontWeight: '800', color: '#1a3a2a', textTransform: 'uppercase', letterSpacing: 1, marginHorizontal: 14, marginBottom: 10 },

//   emptyWrap: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 32 },
//   emptyEmoji: { fontSize: 40, marginBottom: 10 },
//   emptyText: { color: '#9ca3af', fontSize: 14, textAlign: 'center', lineHeight: 20 },

//   retiredCard: {
//     marginHorizontal: 14, marginBottom: 10,
//     backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 14, padding: 14,
//     flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
//     borderWidth: 1, borderColor: '#d4edda',
//   },
//   retiredLeft: { flex: 1 },
//   retiredName: { fontSize: 15, fontWeight: '800', color: '#1a3a2a' },
//   retiredDate: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
//   retiredRight: { alignItems: 'flex-end' },
//   retiredPoints: { fontSize: 15, fontWeight: '800', color: '#52b788' },
//   retiredLogs: { fontSize: 11, color: '#6b7280', marginTop: 2 },
// });

// // ─── Root App ─────────────────────────────────────────────────────────────────

// const NAV_TABS = [
//   { key: 'PET',      icon: '🌿', label: 'PET'      },
//   { key: 'LOGS',     icon: '📋', label: 'LOGS'     },
//   { key: 'PROGRESS', icon: '⭐', label: 'PROGRESS' },
//   { key: 'PROFILE',  icon: '👤', label: 'PROFILE'  },
// ];

// export default function App() {
//   const [state, dispatch] = useReducer(reducer, undefined, initialState);
//   const [activeTab, setActiveTab] = useState('PET');

//   return (
//     <SafeAreaView style={appStyles.safe}>
//       <StatusBar barStyle="dark-content" backgroundColor="#c8f0d0" />

//       {/* Main content */}
//       <View style={appStyles.content}>
//         {activeTab === 'PET' && (
//           <HomeScreen appState={state} dispatch={dispatch} setActiveTab={setActiveTab} />
//         )}
//         {activeTab === 'LOGS' && (
//           <LogsScreen appState={state} />
//         )}
//         {activeTab === 'PROGRESS' && (
//           // Placeholder — wire up your progress/achievements screen here
//           <View style={appStyles.placeholder}>
//             <Text style={appStyles.placeholderText}>⭐ Progress coming soon</Text>
//           </View>
//         )}
//         {activeTab === 'PROFILE' && (
//           <ProfileTab appState={state} />
//         )}
//       </View>

//       {/* Bottom navigation */}
//       <View style={appStyles.nav}>
//         {NAV_TABS.map(tab => (
//           <TouchableOpacity
//             key={tab.key}
//             onPress={() => setActiveTab(tab.key)}
//             style={appStyles.navBtn}>
//             <Text style={appStyles.navIcon}>{tab.icon}</Text>
//             <Text style={[appStyles.navLabel, activeTab === tab.key && appStyles.navLabelActive]}>
//               {tab.label}
//             </Text>
//             {activeTab === tab.key && <View style={appStyles.navIndicator} />}
//           </TouchableOpacity>
//         ))}
//       </View>
//     </SafeAreaView>
//   );
// }

// function useState(init) {
//   return React.useState(init);
// }

// const appStyles = StyleSheet.create({
//   safe: { flex: 1, backgroundColor: '#c8f0d0' },
//   content: { flex: 1 },
//   nav: {
//     flexDirection: 'row', backgroundColor: 'rgba(240,250,240,0.97)',
//     borderTopWidth: 1, borderTopColor: '#d4edda',
//     paddingTop: 10, paddingBottom: 20,
//   },
//   navBtn: { flex: 1, alignItems: 'center', gap: 2 },
//   navIcon: { fontSize: 22 },
//   navLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 1, color: '#9ca3af', textTransform: 'uppercase' },
//   navLabelActive: { color: '#1a3a2a' },
//   navIndicator: { width: 18, height: 3, backgroundColor: '#52b788', borderRadius: 2, marginTop: 1 },

//   placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
//   placeholderText: { fontSize: 18, color: '#52b788', fontWeight: '700' },
// });