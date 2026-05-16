import React, { createContext, useContext, useReducer, ReactNode } from "react";

// Define structures for TypeScript
export interface Log {
  id: string;
  label: string;
  distance: number;
  co2Saved: number;
  points: number;
  timestamp: string;
}

export interface AppState {
  petName: string;
  totalPoints: number;
  todayPoints: number;
  lives: number;
  isDead: boolean;
  isMaxed: boolean;
  logs: Log[];
}

type Action = { type: "ADD_POINTS"; pts: number };

const initialState: AppState = {
  petName: "EcoPet",
  totalPoints: 0,
  todayPoints: 0,
  lives: 5,
  isDead: false,
  isMaxed: false,
  logs: [],
};

const AppStateContext = createContext<
  { appState: AppState; dispatch: React.Dispatch<Action> } | undefined
>(undefined);

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "ADD_POINTS": {
      const newPts = state.totalPoints + action.pts;
      const isNowMaxed = newPts >= 20000;

      const mockLog: Log = {
        id: Math.random().toString(),
        label: "Manual Eco Log Entry",
        distance: 5.0,
        co2Saved: 1.05,
        points: action.pts,
        timestamp: new Date().toISOString(),
      };

      return {
        ...state,
        totalPoints: newPts,
        todayPoints: state.todayPoints + action.pts,
        isMaxed: isNowMaxed,
        logs: [mockLog, ...state.logs],
      };
    }
    default:
      return state;
  }
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <AppStateContext.Provider value={{ appState: state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context)
    throw new Error("useAppState must be used within an AppStateProvider");
  return context;
}
