import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheckCircle,FiClock,FiCode,FiTrendingUp,FiFolder,FiList,FiPlus,FiRefreshCw,FiAlertCircle,FiArrowRight,FiCalendar,FiTarget,} from "react-icons/fi";
import { CartesianGrid,Line,LineChart,ResponsiveContainer,Tooltip,XAxis,YAxis,} from "recharts";
import api from "../../services/api";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import { useTheme } from "../../context/ThemeContext";
import { useNotifications } from "../../context/NotificationContext";
import "./Dashboard.css";
const COMPLETED_STATUSES = ["done", "completed", "complete"];
const ACTIVE_STATUSES = ["in progress", "in_progress", "active"];
function normalizeList(response) {
  const body = response?.data;
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.content)) return body.content;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.items)) return body.items;
  return [];
}
function getStatus(item) {
  return String(item?.status || "To Do").trim();
}
function isCompleted(item) {
  return COMPLETED_STATUSES.includes(getStatus(item).toLowerCase());
}
function isActive(item) {
  return ACTIVE_STATUSES.includes(getStatus(item).toLowerCase());
}
function getPriority(item) {
  const priority = String(item?.priority || "Medium").toLowerCase();
  if (priority === "high" || priority === "urgent") return "High";
  if (priority === "low") return "Low";
  return "Medium";
}
function getProjectName(task, projects) {
  const project = task?.project;
  if (typeof project === "string" && project.trim()) {
    return project;
  }
  if (project && typeof project === "object") {
    return project.name || project.title || "Project";
  }
  const projectId = task?.projectId ?? project?.id;
  const match = projects.find(
    (item) => String(item.id) === String(projectId)
  );
  return match?.name || "General";
}
function getUser() {
  try {
     return JSON.parse(sessionStorage.getItem("devflow-user") || "{}");
  } catch {
    return {};
  }
}
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}
function getFocusMinutes(session) {
  const status = String(session?.status || "").toLowerCase();
  if (status === "cancelled" || status === "canceled") return 0;
  const duration = Number(session?.durationMinutes || 0);
  const elapsed = Number(session?.elapsedMinutes || 0);
  return Math.max(0, elapsed || (isCompleted(session) ? duration : 0));
}
function buildWeeklyData(sessions) {
  const days = [];
  const today = new Date();
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
     nextDate.setDate(date.getDate() + 1);
    const minutes = sessions.reduce((total, session) => {
      const rawDate =
        session.completedAt ||
        session.startedAt ||
        session.createdAt;
      if (!rawDate) return total;
      const sessionDate = new Date(rawDate);
      if (
        Number.isNaN(sessionDate.getTime()) ||
        sessionDate < date ||
        sessionDate >= nextDate
      ) {
        return total;
      }
       return total + getFocusMinutes(session);
    }, 0);
    days.push({
      day: date.toLocaleDateString("en-US", { weekday: "short" }),
      hours: Math.round((minutes / 60) * 10) / 10,
    });
  }
  return days;
}
function Dashboard() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { addNotification } = useNotifications();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingTaskId, setUpdatingTaskId] = useState(null);
  const [updateMessage, setUpdateMessage] = useState("");
  const dueReminderShown = useRef(false);
  const welcomeToastShown = useRef(false);
  const user = useMemo(() => getUser(), []);
  const displayName = user.fullName || user.name || "Developer";
  const firstName = displayName.trim().split(/\s+/)[0] || "Developer";
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const results = await Promise.allSettled([
        api.get("/tasks"),
        api.get("/projects"),
        api.get("/focus-sessions"),
      ]);
      const [taskResult, projectResult, sessionResult] = results;
      if (taskResult.status === "rejected") {
        throw taskResult.reason;
      }
      setTasks(normalizeList(taskResult.value));
      setProjects(
        projectResult.status === "fulfilled"
          ? normalizeList(projectResult.value)
          : []
      );
      setSessions(
        sessionResult.status === "fulfilled"
          ? normalizeList(sessionResult.value)
          : []
      );
       const optionalFailures = [];

      if (projectResult.status === "rejected") {
        optionalFailures.push("projects");
      }
      if (sessionResult.status === "rejected") {
        optionalFailures.push("focus sessions");
      }
      if (optionalFailures.length) {
        setError(
          `Tasks loaded, but ${optionalFailures.join(
            " and "
          )} could not be loaded. Check that those backend endpoints are available.`
        );
      }
    } catch (err) {
      console.error("Dashboard loading failed:", err);
      setError(
        err?.response?.data?.message ||
          "Could not load dashboard data. Check that the backend is running and you are logged in."
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);
  useEffect(() => {
    if (welcomeToastShown.current) return;
    welcomeToastShown.current = true;
    addNotification(
      "Welcome to DevFlow",
      "Your dashboard is open. Task reminders will appear here.",
      "info"
    );
  }, [addNotification]);
  useEffect(() => {
    if (loading || dueReminderShown.current) return;
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
    const dueTasks = tasks.filter((task) => {
      if (isCompleted(task) || !task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      if (Number.isNaN(dueDate.getTime())) return false;
      return dueDate < startOfTomorrow;
    });
    dueReminderShown.current = true;
    if (dueTasks.length > 0) {
      const overdueCount = dueTasks.filter((task) => {
              const dueDate = new Date(task.dueDate);
        return dueDate < startOfToday;
      }).length;
      const todayCount = dueTasks.length - overdueCount;
      const parts = [];
      if (overdueCount > 0) {
        parts.push(`${overdueCount} overdue`);
        }
      if (todayCount > 0) {
        parts.push(`${todayCount} due today`);
      }
       addNotification(
        "Task reminder",
        `${parts.join(" and ")}. Check your Tasks to focus on panel.`,
        overdueCount > 0 ? "warning" : "reminder"
      );
    }
  }, [loading, tasks, addNotification]);
  const completedTasks = tasks.filter(isCompleted).length;
  const pendingTasks = tasks.length - completedTasks;
  const activeProjects = projects.filter(
    (project) =>
      !["completed", "complete", "archived"].includes(
        String(project.status || "").toLowerCase()
      )
  ).length;
  const totalFocusMinutes = sessions.reduce(
    (total, session) => total + getFocusMinutes(session),
    0
  );
  const focusHours = Math.round((totalFocusMinutes / 60) * 10) / 10;
  const completionRate = tasks.length
    ? Math.round((completedTasks / tasks.length) * 100)
    : 0;
  const weeklyData = useMemo(
    () => buildWeeklyData(sessions),
    [sessions]
  );
  const todayTasks = useMemo(() => {
    const today = new Date();
    const todayKey = today.toDateString();
    return tasks
      .filter((task) => !isCompleted(task))
      .filter((task) => {
        if (!task.dueDate) return true;
              const dueDate = new Date(task.dueDate);
        if (Number.isNaN(dueDate.getTime())) return true;
        return (
          dueDate.toDateString() === todayKey ||
          dueDate < new Date(todayKey)
        );
      })
      .sort((a, b) => {
        const priorityRank = { High: 0, Medium: 1, Low: 2 };
        return (
          priorityRank[getPriority(a)] -
          priorityRank[getPriority(b)]
        );
      })
      .slice(0, 5);
  }, [tasks]);
  const recentProjects = useMemo(
    () => projects.slice(0, 4),
    [projects]
  );
   const toggleTask = async (task) => {
    const taskId = task.id;
    if (taskId == null || updatingTaskId !== null) return;
    const nextStatus = isCompleted(task) ? "To Do" : "Completed";
    setUpdatingTaskId(taskId);
    setUpdateMessage("");
    try {
      await api.put(`/tasks/${taskId}`, {
        ...task,
        status: nextStatus,
      });
      setTasks((current) =>
        current.map((item) =>
          String(item.id) === String(taskId)
            ? { ...item, status: nextStatus }
            : item
        )
      );
      setUpdateMessage("Task status updated.");
      addNotification(
        nextStatus === "Completed" ? "Task completed" : "Task reopened",
        `“${task.title || "Untitled task"}” was ${nextStatus === "Completed" ? "marked as completed" : "moved back to To Do"}.`,
        nextStatus === "Completed" ? "success" : "info"
      );
    } catch (err) {
      console.error("Could not update task:", err);
      setUpdateMessage(
        err?.response?.data?.message ||
          "Could not update this task. Please try again."
      );
    } finally {
      setUpdatingTaskId(null);
    }
  };
   const formatDate = (value) => {
    if (!value) return "No due date";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "No due date";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };
 const formatProjectProgress = (project) => {
    const progress = Number(project.progress ?? 0);
    return Math.min(100, Math.max(0, progress));
  };
  return (
    <div className={`dashboard-page theme-${theme}`}>
      <Navbar />
      <div className={`dashboard-layout theme-shell theme-${theme}`}>
        <Sidebar />
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">YOUR WORKSPACE</span>
            <h1>Developer Dashboard</h1>
            <p>Your tasks, projects, and productivity at a glance.</p>
          </div>
        </header>
        <section className="dashboard-welcome">
          <div>
            <span className="welcome-label">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              }).toUpperCase()}
            </span>
            <h2>{getGreeting()}, {firstName}!</h2>
            <p>
              Keep moving forward, one task and one line of code at a time.
            </p>
            <button
              type="button"
              className="dashboard-primary-action"
              onClick={() => navigate("/tasks")}
            >
              <FiPlus /> View and manage tasks
            </button>
          </div>
          <div className="welcome-decoration">
            <FiCode />
          </div>
        </section>
         {error && (
          <div className="dashboard-alert" role="alert">
            <FiAlertCircle />
            <span>{error}</span>
            <button type="button" onClick={loadDashboard}>
              <FiRefreshCw /> Retry
            </button>
          </div>
        )}
        {updateMessage && (
          <p className="dashboard-update-message" role="status">
            {updateMessage}
          </p>
        )}
        <section className="dashboard-stats">
          <article className="dashboard-stat-card">
            <div className="stat-card-top">
              <span className="stat-icon stat-purple">
                <FiCheckCircle />
              </span>
              <span className="stat-trend">Completion</span>
            </div>
            <span className="stat-label">Completed tasks</span>
            <strong className="stat-value">
              {loading ? "—" : completedTasks}
              <span>/{loading ? "—" : tasks.length}</span>
            </strong>
            <div
              className="stat-progress"
              aria-label={`${completionRate}% of tasks completed`}
            >
              <span style={{ width: `${completionRate}%` }} />
            </div>
            <span className="stat-helper">
              {loading ? "Loading tasks..." : `${completionRate}% completed`}
            </span>
          </article>
          <article className="dashboard-stat-card">
            <div className="stat-card-top">
              <span className="stat-icon stat-blue">
                <FiFolder />
              </span>
              <span className="stat-trend">Workspace</span>
            </div>
            <span className="stat-label">Active projects</span>
            <strong className="stat-value">
              {loading ? "—" : activeProjects}
            </strong>
            <span className="stat-helper">
              {loading ? "Loading projects..." : `${projects.length} total projects`}
            </span>
          </article>
         <article className="dashboard-stat-card">
            <div className="stat-card-top">
              <span className="stat-icon stat-orange">
                <FiClock />
              </span>
              <span className="stat-trend">Focus time</span>
            </div>
            <span className="stat-label">Recorded focus hours</span>
            <strong className="stat-value">{loading ? "—" : focusHours}
              <span>h</span>
            </strong>
            <span className="stat-helper">
              Based on available focus-session records
            </span>
          </article>
          <article className="dashboard-stat-card">
            <div className="stat-card-top">
              <span className="stat-icon stat-green">
                <FiList />
              </span>
              <span className="stat-trend">To do</span>
            </div>
            <span className="stat-label">Remaining tasks</span>
            <strong className="stat-value">
              {loading ? "—" : pendingTasks}
            </strong>
            <span className="stat-helper">
              Tasks not marked completed
            </span>
          </article>
        </section>
        <section className="dashboard-content-grid">
          <article className="dashboard-panel productivity-panel">
            <div className="panel-heading">
              <div>
                <h2>Focus activity</h2>
                <p>Recorded focus time over the last seven days</p>
              </div>
              <span className="panel-period">Last 7 days</span>
            </div>
             <div className="productivity-chart">
              {loading ? (
                <div className="dashboard-empty-state">
                  Loading focus activity...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={weeklyData}
                    margin={{ top: 15, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      stroke="var(--chart-grid)"
                      strokeDasharray="4 4"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "var(--muted)", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: "var(--muted)", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals
                    />
                    <Tooltip
                      contentStyle={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: "10px",
                        color: "var(--text)",
                      }}
                      formatter={(value) => [`${value} hours`, "Focus time"]}
                    />
                    <Line
                     type="monotone"
                      dataKey="hours"
                      name="Focus time"
                      stroke="var(--accent)"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "var(--accent)" }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </article>
            <article className="dashboard-panel tasks-panel">
            <div className="panel-heading">
              <div>
                <h2>Tasks to focus on</h2>
                <p>Overdue and due-today tasks first</p>
              </div>
              <button
                type="button"
                className="dashboard-text-action"
                onClick={() => navigate("/tasks")}
              >
                All tasks <FiArrowRight />
              </button>
            </div>
            {loading ? (
              <div className="dashboard-empty-state">Loading tasks...</div>
            ) : todayTasks.length === 0 ? (
              <div className="dashboard-empty-state">
                <FiCheckCircle />
                <strong>You're all caught up!</strong>
                <span>No overdue or due-today tasks to show.</span>
              </div>
            ) : (
              <div className="task-list">
                {todayTasks.map((task) => (
                  <label
                    className={`dashboard-task ${
                      isCompleted(task) ? "task-done" : ""
                    }`}
                    key={task.id}
                  >
                    <input
                      type="checkbox"
                      checked={isCompleted(task)}
                      disabled={updatingTaskId !== null}
                      onChange={() => toggleTask(task)}
                    />
                    <span className="task-checkbox" />
                    <span className="task-information">
                      <strong>{task.title || "Untitled task"}</strong>
                      <span>
                        {getProjectName(task, projects)} ·{" "}
                        <FiCalendar className="task-date-icon" />{" "}
                        {formatDate(task.dueDate)}
                      </span>
                    </span>
                    <span
                      className={`task-priority priority-${getPriority(
                        task
                      ).toLowerCase()}`}
                    >
                      {getPriority(task)}
                    </span>
                  </label>
                ))}
              </div>
            )}
             <p className="task-demo-note">
              Task changes are saved through the backend.
            </p>
          </article>
        </section>
          <section className="dashboard-panel dashboard-projects-panel">
          <div className="panel-heading">
            <div>
              <h2>Project progress</h2>
              <p>Track the progress recorded for your projects</p>
            </div>
            <button
              type="button"
              className="dashboard-text-action"
              onClick={() => navigate("/projects")}
            >
              All projects <FiArrowRight />
            </button>
          </div>
          {loading ? (
            <div className="dashboard-empty-state">Loading projects...</div>
          ) : recentProjects.length === 0 ? (
            <div className="dashboard-empty-state">
              <FiFolder />
              <strong>No projects found</strong>
              <span>Create a project to see its progress here.</span>
              <button
                type="button"
                className="dashboard-inline-button"
                onClick={() => navigate("/projects")}
              >
                Open projects
              </button>
            </div>
          ) : (
            <div className="dashboard-project-list">
              {recentProjects.map((project) => {
                const progress = formatProjectProgress(project);
                return (
                  <article className="dashboard-project-item" key={project.id}>
                    <div className="project-item-heading">
                      <span className="project-item-icon">
                        <FiCode />
                      </span>
                      <div className="project-item-title">
                        <strong>{project.name || "Untitled project"}</strong>
                        <span>
                          {project.technology || project.status || "Project"}
                        </span>
                      </div>
                      <strong className="project-progress-number">
                        {progress}%
                      </strong>
                    </div>
                    <div
                      className="project-progress-track"
                      aria-label={`${progress}% complete`}
                    >
                      <span style={{ width: `${progress}%` }} />
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
           <section className="dashboard-quick-actions">
          <div>
            <span className="quick-actions-icon"><FiTarget /></span>
            <div>
              <strong>Make your next move</strong>
              <p>Choose an area of your workspace to continue.</p>
            </div>
          </div>
          <div className="quick-action-buttons">
            <button type="button" onClick={() => navigate("/tasks")}>
              <FiPlus /> Tasks
            </button>
            <button type="button" onClick={() => navigate("/projects")}>
              <FiFolder /> Projects
            </button>
            <button type="button" onClick={() => navigate("/analytics")}>
              <FiTrendingUp /> Analytics
            </button>
          </div>
        </section>
        <div className="dashboard-refresh-row">
          <span>Dashboard data comes from your connected backend.</span>
          <button type="button" onClick={loadDashboard} disabled={loading}>
            <FiRefreshCw className={loading ? "refresh-spinning" : ""} />
            {loading ? "Refreshing..." : "Refresh data"}
          </button>
        </div>
      </main>
      </div>
    </div>
  );
}
export default Dashboard;      