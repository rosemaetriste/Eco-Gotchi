// logs.js — All logs-related UI components for EcoPlantPet

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export function getWeekDates() {
  const today = new Date();
  const day = today.getDay();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - day + i);
    return d;
  });
}

export function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}

// ─── Single log row ───────────────────────────────────────────────────────────

export function LogItem({ log, last }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", justifyContent:"space-between",
      padding:"9px 0", borderBottom: last ? "none" : "1px solid #e8f5e9",
    }}>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ margin:0, fontSize:13, color:"#374151", fontWeight:600,
          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
          {log.label}
        </p>
        <p style={{ margin:0, fontSize:11, color:"#9ca3af" }}>
          {log.distance} km · {log.co2Saved.toFixed(3)} kg CO₂ saved
        </p>
      </div>
      <span style={{ fontSize:13, fontWeight:800, color:"#52b788",
        whiteSpace:"nowrap", marginLeft:8 }}>
        +{log.points} 🍃
      </span>
    </div>
  );
}

// ─── Full history page ────────────────────────────────────────────────────────

export function FullHistoryPage({ logs, totalPoints, onBack }) {
  return (
    <div style={{ paddingBottom:140 }}>
      <div style={{ background:"linear-gradient(135deg,#1a3a2a,#2d6a4f)", padding:"20px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
          <button onClick={onBack} style={{
            background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)",
            borderRadius:20, padding:"5px 14px", fontSize:12, fontWeight:800,
            color:"#d1fae5", cursor:"pointer", fontFamily:"inherit",
          }}>← Back</button>
          <h2 style={{ margin:0, fontSize:17, color:"#fff", fontWeight:900 }}>📜 Full Eco History</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:12, padding:"10px 14px" }}>
            <p style={{ margin:0, fontSize:11, color:"#95d5b2", fontWeight:700 }}>ALL-TIME POINTS</p>
            <p style={{ margin:"2px 0 0", fontSize:20, fontWeight:900, color:"#fff" }}>
              {totalPoints.toLocaleString()} 🍃
            </p>
          </div>
          <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:12, padding:"10px 14px" }}>
            <p style={{ margin:0, fontSize:11, color:"#95d5b2", fontWeight:700 }}>TOTAL LOGS</p>
            <p style={{ margin:"2px 0 0", fontSize:20, fontWeight:900, color:"#fff" }}>
              {logs.length} actions
            </p>
          </div>
        </div>
      </div>

      <div style={{ padding:"14px" }}>
        {logs.length === 0 ? (
          <div style={{ textAlign:"center", padding:"40px 0" }}>
            <p style={{ fontSize:40, margin:"0 0 8px" }}>🌱</p>
            <p style={{ color:"#9ca3af", fontSize:14 }}>No eco actions logged yet.</p>
          </div>
        ) : (
          <div style={{ background:"rgba(255,255,255,0.75)", borderRadius:16, padding:"4px 16px" }}>
            {logs.map((log, i) => (
              <div key={log.id} style={{
                display:"flex", alignItems:"flex-start", justifyContent:"space-between",
                padding:"11px 0",
                borderBottom: i < logs.length - 1 ? "1px solid #e8f5e9" : "none",
                gap:10,
              }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ margin:0, fontSize:13, color:"#1a3a2a", fontWeight:700 }}>
                    {log.label}
                  </p>
                  <p style={{ margin:"2px 0 0", fontSize:11, color:"#6b7280" }}>
                    {new Date(log.timestamp).toLocaleDateString("en-PH", {
                      weekday:"short", month:"short", day:"numeric", year:"numeric",
                    })}
                  </p>
                  <p style={{ margin:"1px 0 0", fontSize:11, color:"#9ca3af" }}>
                    {log.distance} km · {log.co2Saved.toFixed(3)} kg CO₂ saved
                  </p>
                </div>
                <span style={{ fontSize:14, fontWeight:800, color:"#52b788",
                  whiteSpace:"nowrap", marginTop:2 }}>
                  +{log.points} 🍃
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Weekly logs view (main Logs tab) ────────────────────────────────────────

export function LogsView({ logs, totalPoints }) {
  const [selectedDay, setSelectedDay] = React.useState(new Date().getDay());
  const [showFullHistory, setShowFullHistory] = React.useState(false);

  if (showFullHistory) {
    return (
      <FullHistoryPage
        logs={logs}
        totalPoints={totalPoints}
        onBack={() => setShowFullHistory(false)}
      />
    );
  }

  const weekDates    = getWeekDates();
  const weeklyPoints = logs
    .filter(l => weekDates.some(wd => sameDay(new Date(l.timestamp), wd)))
    .reduce((s, l) => s + l.points, 0);

  const dayLogs = logs.filter(l =>
    sameDay(new Date(l.timestamp), weekDates[selectedDay])
  );

  return (
    <div style={{ paddingBottom:140 }}>
      {/* Header */}
      <div style={{ background:"linear-gradient(135deg,#1a3a2a,#2d6a4f)", padding:"24px 18px 20px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
          <p style={{ margin:0, fontSize:11, color:"#95d5b2", fontWeight:800,
            letterSpacing:2, textTransform:"uppercase" }}>
            This Week's Eco Points
          </p>
          <button onClick={() => setShowFullHistory(true)} style={{
            background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)",
            borderRadius:20, padding:"4px 12px", fontSize:11, fontWeight:800,
            color:"#d1fae5", cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap",
          }}>View all →</button>
        </div>
        <p style={{ margin:"0 0 16px", fontSize:38, fontWeight:900, color:"#fff", lineHeight:1 }}>
          {weeklyPoints.toLocaleString()} <span style={{ fontSize:22 }}>🍃</span>
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:12, padding:"10px 14px" }}>
            <p style={{ margin:0, fontSize:11, color:"#95d5b2", fontWeight:700 }}>ALL-TIME POINTS</p>
            <p style={{ margin:"2px 0 0", fontSize:20, fontWeight:900, color:"#fff" }}>
              {totalPoints.toLocaleString()} 🍃
            </p>
          </div>
          <div style={{ background:"rgba(255,255,255,0.1)", borderRadius:12, padding:"10px 14px" }}>
            <p style={{ margin:0, fontSize:11, color:"#95d5b2", fontWeight:700 }}>TOTAL LOGS</p>
            <p style={{ margin:"2px 0 0", fontSize:20, fontWeight:900, color:"#fff" }}>
              {logs.length} actions
            </p>
          </div>
        </div>
      </div>

      {/* Day tab strip */}
      <div style={{ background:"rgba(255,255,255,0.85)", borderBottom:"1px solid #d4edda", padding:"0 4px" }}>
        <div style={{ display:"flex", overflowX:"auto" }}>
          {DAYS.map((d, i) => {
            const date      = weekDates[i];
            const hasLogs   = logs.some(l => sameDay(new Date(l.timestamp), date));
            const isToday   = sameDay(date, new Date());
            const isSelected = selectedDay === i;
            return (
              <button key={d} onClick={() => setSelectedDay(i)} style={{
                flex:"0 0 auto", minWidth:46, padding:"10px 4px 8px",
                background:"none", border:"none", cursor:"pointer",
                display:"flex", flexDirection:"column", alignItems:"center", gap:2,
                fontFamily:"inherit",
                borderBottom: isSelected ? "3px solid #52b788" : "3px solid transparent",
                transition:"all 0.2s",
              }}>
                <span style={{ fontSize:10, fontWeight:800, letterSpacing:0.5,
                  textTransform:"uppercase", color: isSelected ? "#1a3a2a" : "#9ca3af" }}>
                  {d}
                </span>
                <span style={{ fontSize:12, fontWeight:700,
                  color: isSelected ? "#52b788" : isToday ? "#1a3a2a" : "#6b7280" }}>
                  {date.getDate()}
                </span>
                <div style={{ width:5, height:5, borderRadius:"50%",
                  background: hasLogs ? "#52b788" : "transparent" }}/>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day content */}
      <div style={{ padding:"14px" }}>
        {dayLogs.length > 0 && (
          <div style={{
            background:"rgba(255,255,255,0.7)", borderRadius:14, padding:"10px 16px",
            marginBottom:12, display:"flex", justifyContent:"space-between", alignItems:"center",
          }}>
            <span style={{ fontSize:13, fontWeight:700, color:"#1a3a2a" }}>
              {DAYS[selectedDay]},{" "}
              {weekDates[selectedDay].toLocaleDateString("en-PH",{ month:"short", day:"numeric" })}
            </span>
            <span style={{ fontSize:14, fontWeight:800, color:"#52b788" }}>
              +{dayLogs.reduce((s, l) => s + l.points, 0)} 🍃
            </span>
          </div>
        )}

        {dayLogs.length === 0 ? (
          <div style={{ textAlign:"center", padding:"36px 0" }}>
            <p style={{ fontSize:36, margin:"0 0 8px" }}>🌿</p>
            <p style={{ color:"#9ca3af", fontSize:14, margin:0 }}>
              No eco actions logged on this day.
            </p>
          </div>
        ) : (
          <div style={{ background:"rgba(255,255,255,0.75)", borderRadius:16, padding:"4px 16px" }}>
            {dayLogs.map((log, i) => (
              <LogItem key={log.id} log={log} last={i === dayLogs.length - 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}