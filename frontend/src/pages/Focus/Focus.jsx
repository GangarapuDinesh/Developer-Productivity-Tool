import { useCallback, useEffect, useRef, useState } from "react";
import { FiActivity,FiCheckCircle,FiClock,FiPause,FiPlay,FiRotateCcw,FiTarget,FiCoffee,} from "react-icons/fi";
import Navbar from "../../components/Navbar/Navbar";
import Sidebar from "../../components/Sidebar/Sidebar";
import focusSessionService from "../../services/focusSessionService";
import { useTheme } from "../../context/ThemeContext";
import "./Focus.css";
const modes = {
  Focus: 25 * 60,
  "Short Break": 5 * 60,
  "Long Break": 15 * 60,
};
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
}
function formatCompletedTime(value) {
  if (!value) return "Recently completed";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recently completed";
  }
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}
function Focus() {
  const { theme } = useTheme();
  const currentTheme = ["light", "dark", "eye"].includes(theme)
    ? theme
    : "light";
  const [mode, setMode] = useState("Focus");
  const [secondsLeft, setSecondsLeft] = useState(modes.Focus);
  const [isRunning, setIsRunning] = useState(false);
  const [finished, setFinished] = useState(false);
  const [taskName, setTaskName] = useState("");
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const completionHandledRef = useRef(null);
  const loadSessions = useCallback(async () => {
    try {
      const data = await focusSessionService.getAllSessions();
      setSessions(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Unable to load focus sessions:", err);
      setError("Could not load focus history. Check the backend and your login.");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);
  useEffect(() => {
    if (!isRunning) return undefined;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [isRunning]);
  useEffect(() => {
    if (!isRunning || secondsLeft !== 0) return;
    setIsRunning(false);
    setFinished(true);
    if (mode !== "Focus") {
      setNotice("Break completed. You're ready for the next session!");
      return;
    }
    const sessionId = activeSessionId;
    if (sessionId == null || completionHandledRef.current === sessionId) {
      return;
    }
    completionHandledRef.current = sessionId;
    const completeSession = async () => {
      try {
        await focusSessionService.updateSessionStatus(
          sessionId,
          "COMPLETED"
        );
        setNotice("Focus session completed! Well done.");
        setError("");
      } catch (err) {
        console.error("Unable to complete focus session:", err);
        setError("The timer finished, but the completed session could not be saved.");
      } finally {
        setActiveSessionId(null);
        await loadSessions();
      }
    };
    completeSession();
  }, [
    isRunning,
    secondsLeft,
    mode,
    activeSessionId,
    loadSessions,
  ]);
  const startTimer = async () => {
    if (isRunning || secondsLeft <= 0 || saving) return;
    setError("");
    setNotice("");
    if (mode !== "Focus") {
      setFinished(false);
      setIsRunning(true);
      return;
    }
    if (activeSessionId !== null) {
      setFinished(false);
      setIsRunning(true);
      return;
    }
    try {
      setSaving(true);
      const session = await focusSessionService.createSession({
        title: taskName.trim() || "General focus",
        durationMinutes: 25,
      });
      setActiveSessionId(session.id);
      completionHandledRef.current = null;
      setFinished(false);
      setIsRunning(true);
      setNotice("Focus session started. Stay in the zone!");
      await loadSessions();
    } catch (err) {
      console.error("Unable to start focus session:", err);
      setError(err.response?.data?.message || "Could not start the focus session. Check your backend and login.");
    } finally {
      setSaving(false);
    }
  };
  const pauseTimer = () => {
    setIsRunning(false);
    setNotice("Timer paused. Resume when you're ready.");
  };
  const resetTimer = async () => {
    setIsRunning(false);
    setFinished(false);
    setError("");
    setNotice("");
    const sessionId = activeSessionId;
    setSecondsLeft(modes[mode]);
    setActiveSessionId(null);
    completionHandledRef.current = null;
    if (sessionId !== null) {
      try {
        await focusSessionService.deleteSession(sessionId);
        setNotice("Timer reset and unfinished session removed.");
        await loadSessions();
      } catch (err) {
        console.error("Unable to remove unfinished session:", err);
        setError("The timer was reset, but the unfinished session could not be removed from the database.");
      }
    }
  };
  const changeMode = (nextMode) => {
    if (activeSessionId !== null) {
      setError("Finish or reset your current focus session before changing modes.");
      return;
    }
    setIsRunning(false);
    setMode(nextMode);
    setSecondsLeft(modes[nextMode]);
    setFinished(false);
    setError("");
    setNotice("");
  };
  const completedFocusSessions = sessions.filter(
    (session) => session.status === "COMPLETED"
  );
  const completedSessions = completedFocusSessions.length;
  const totalFocusMinutes = completedFocusSessions.reduce(
    (total, session) => total + Number(session.durationMinutes || 0),
    0
  );
  const nextMilestone =
    completedSessions === 0
      ? 4
      : completedSessions % 4 === 0
        ? 4
        : 4 - (completedSessions % 4);
  const startNextSession = () => {
    if (mode === "Focus") {
      const nextMode = (completedSessions + 1) % 4 === 0
          ? "Long Break"
          : "Short Break";
      changeMode(nextMode);
    } else {
      changeMode("Focus");
    }
  };
  const totalDuration = modes[mode];
  const progress = totalDuration > 0
      ? ((totalDuration - secondsLeft) / totalDuration) * 100
      : 0;
  const sessionHistory = [...completedFocusSessions]
    .sort((a, b) => {
      return (
        new Date(b.completedAt || b.startedAt || 0).getTime() -
        new Date(a.completedAt || a.startedAt || 0).getTime()
      );
    })
    .slice(0, 5);
  return (
    <>
      <Navbar />
      <div className={`focus-layout theme-${currentTheme}`}>
        <Sidebar />
        <main className="focus-main">
          <header className="focus-header">
            <div>
              <span className="focus-eyebrow">
                PRODUCTIVITY WORKSPACE
              </span>
              <h1>Focus Sessions</h1>
              <p>
                Work with intention, take breaks, and make every session
                count.
              </p>
            </div>
            <div className="focus-header-badge">
              <FiActivity />
              <span>
                {isRunning
                  ? "Session active"
                  : finished
                    ? "Session completed"
                    : "Ready to focus"}
              </span>
            </div>
          </header>
          {error && (
            <div className="focus-message focus-error" role="alert">
              {error}
            </div>
          )}
          {notice && (
            <div className="focus-message focus-success" role="status">
              {notice}
            </div>
          )}
          <section className="focus-overview">
            <article className="focus-stat-card">
              <div className="focus-stat-icon">
                <FiCheckCircle />
              </div>
              <div>
                <span>Completed Sessions</span>
                <strong>{completedSessions}</strong>
              </div>
            </article>
            <article className="focus-stat-card">
              <div className="focus-stat-icon focus-stat-purple">
                <FiClock />
              </div>
              <div>
                <span>Focus Minutes</span>
                <strong>{totalFocusMinutes}</strong>
              </div>
            </article>
            <article className="focus-stat-card">
              <div className="focus-stat-icon focus-stat-orange">
                <FiTarget />
              </div>
              <div>
                <span>Next Milestone</span>
                <strong>{nextMilestone} sessions</strong>
              </div>
            </article>
          </section>
          <section className="focus-content">
            <div className="focus-timer-card">
              <div className="focus-mode-tabs">
                {Object.keys(modes).map((item) => (
                  <button
                    type="button"
                    key={item}
                    className={mode === item ? "active" : ""}
                    onClick={() => changeMode(item)}
                    disabled={saving}
                  >
                    {item === "Focus" ? <FiTarget /> : <FiCoffee />}
                    {item}
                  </button>
                ))}
              </div>
              <div className="focus-timer-area">
                <div
                  className={`focus-timer-ring ${
                    mode !== "Focus" ? "focus-break-ring" : ""
                  }`}
                  style={{
                    "--focus-progress": `${progress}%`,
                  }}
                >
                  <div className="focus-timer-inner">
                    <span className="focus-timer-label">
                      {finished ? "SESSION COMPLETE" : mode.toUpperCase()}
                    </span>
                    <strong>{formatTime(secondsLeft)}</strong>
                    <span className="focus-timer-status">
                      {finished
                        ? "Well done!"
                        : isRunning
                          ? "Stay in the zone"
                          : "Ready when you are"}
                    </span>
                  </div>
                </div>
                <div className="focus-timer-controls">
                  {isRunning ? (
                    <button
                      type="button"
                      className="focus-main-control"
                      onClick={pauseTimer}
                    >
                      <FiPause />
                      Pause
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="focus-main-control"
                      onClick={startTimer}
                      disabled={secondsLeft === 0 || saving}
                    >
                      <FiPlay />
                      {saving ? "Starting..." : "Start"}
                    </button>
                  )}
                  <button
                    type="button"
                    className="focus-reset-control"
                    onClick={resetTimer}
                    disabled={saving}
                    title="Reset timer"
                  >
                    <FiRotateCcw />
                    Reset
                  </button>
                </div>
                {finished && (
                  <div className="focus-finished-message">
                    <FiCheckCircle />
                    <span>
                      {mode === "Focus"
                        ? "Focus session completed. Take a well-earned break!"
                        : "Break completed. You're ready to focus again!"}
                    </span>
                    <button type="button" onClick={startNextSession}>
                      {mode === "Focus" ? "Start Break" : "Back to Focus"}
                    </button>
                  </div>
                )}
              </div>
              <div className="focus-session-note">
                <FiClock />
                <span>
                  {mode === "Focus"
                    ? "25 minutes of focused work"
                    : mode === "Short Break"
                      ? "5 minutes to recharge"
                      : "15 minutes to rest and reset"}
                </span>
              </div>
            </div>
            <aside className="focus-side-panel">
              <section className="focus-task-card">
                <div className="focus-section-heading">
                  <div>
                    <span className="focus-eyebrow">YOUR WORK</span>
                    <h2>Current Task</h2>
                  </div>
                  <FiTarget />
                </div>
                <label htmlFor="focus-task-name">
                  What are you working on?
                </label>
                <input
                  id="focus-task-name"
                  type="text"
                  value={taskName}
                  onChange={(event) => setTaskName(event.target.value)}
                  placeholder="e.g. Build the login page"
                  maxLength={120}
                  disabled={
                    isRunning ||
                    activeSessionId !== null ||
                    saving
                  }
                />
                <div className="focus-task-tip">
                  <FiCheckCircle />
                  <p>
                    Choose one clear task and give it your full attention
                    until the timer ends.
                  </p>
                </div>
              </section>
              <section className="focus-guide-card">
                <div className="focus-section-heading">
                  <div>
                    <span className="focus-eyebrow">QUICK GUIDE</span>
                    <h2>How it works</h2>
                  </div>
                  <FiActivity />
                </div>
                <div className="focus-guide-step">
                  <span>01</span>
                  <div>
                    <strong>Focus</strong>
                    <p>Work for 25 minutes without distractions.</p>
                  </div>
                </div>
                <div className="focus-guide-step">
                  <span>02</span>
                  <div>
                    <strong>Take a break</strong>
                    <p>Rest for 5 minutes after a focus session.</p>
                  </div>
                </div>
                <div className="focus-guide-step">
                  <span>03</span>
                  <div>
                    <strong>Repeat</strong>
                    <p>
                      After four completed focus sessions, take a longer
                      break.
                    </p>
                  </div>
                </div>
              </section>
            </aside>
          </section>
          <section className="focus-history-card">
            <div className="focus-section-heading">
              <div>
                <span className="focus-eyebrow">RECENT ACTIVITY</span>
                <h2>Completed Focus Sessions</h2>
              </div>
              <span className="focus-history-count">
                {sessionHistory.length} recent
              </span>
            </div>
            {loading ? (
              <div className="focus-history-empty">
                <FiClock />
                <p>Loading your saved focus sessions...</p>
              </div>
            ) : sessionHistory.length === 0 ? (
              <div className="focus-history-empty">
                <FiClock />
                <p>Your completed focus sessions will appear here.</p>
              </div>
            ) : (
              <div className="focus-history-list">
                {sessionHistory.map((session) => (
                  <div
                    className="focus-history-item"
                    key={session.id}
                  >
                    <div className="focus-history-icon">
                      <FiCheckCircle />
                    </div>
                    <div className="focus-history-task">
                      <strong>{session.title}</strong>
                      <span>
                        Completed at{" "}
                        {formatCompletedTime(session.completedAt)}
                      </span>
                    </div>
                    <span className="focus-history-duration">
                      {session.durationMinutes} min
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </>
  );
}
export default Focus;